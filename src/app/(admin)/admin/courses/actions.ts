'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { embedUrl, newBlock, BLOCK_KINDS } from '@/lib/blocks';
import { clearRecert, noteModuleChange, recertChanges } from './recert';

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });
const first = (e: z.ZodError) => e.issues[0]?.message ?? 'Invalid input';

function refresh(courseId?: string) {
  revalidatePath('/admin/courses');
  revalidatePath('/admin/categories');
  if (courseId) revalidatePath(`/admin/courses/${courseId}`, 'layout');
}

const country = z.enum(['Both', 'Denmark', 'Norway']);
const id = z.string().min(1).max(64);

// ---------- Courses ----------

const CreateCourse = z.object({
  title: z.string().trim().min(1, 'Give the course a title').max(200),
  description: z.string().trim().max(2000),
  categoryIds: z.array(id).min(1, 'Velg minst én kategori'),
  country,
});

export async function createCourse(input: z.input<typeof CreateCourse>): Promise<Result<{ id: string }>> {
  await requireAdmin();
  const p = CreateCourse.safeParse(input);
  if (!p.success) return fail(first(p.error));
  const course = await db.course.create({
    data: {
      title: p.data.title,
      description: p.data.description || 'No description yet.',
      country: p.data.country,
      categories: { connect: p.data.categoryIds.map((c) => ({ id: c })) },
    },
  });
  refresh();
  return { ok: true, id: course.id };
}

export async function setCourseStatus(courseId: string, status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'): Promise<Result> {
  const admin = await requireAdmin();
  const s = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).safeParse(status);
  if (!s.success) return fail('Unknown status');
  const before = await db.course.findUnique({ where: { id: courseId }, select: { status: true } });
  if (!before) return fail('Course not found');
  await db.course.update({ where: { id: courseId }, data: { status: s.data } });
  // Publishing starts a clean slate; changes are tracked from here on.
  if (s.data !== 'PUBLISHED') await clearRecert(courseId);
  await audit(admin.id, 'course.status', { type: 'course', id: courseId }, { from: before.status, to: s.data });
  refresh(courseId);
  return { ok: true };
}

const Settings = z.object({
  title: z.string().trim().min(1, 'The course needs a title').max(200),
  description: z.string().trim().max(2000),
  country,
  categoryIds: z.array(id).min(1, 'Et kurs må ligge i minst én kategori'),
  thumbnailId: id.nullable(),
  thumbX: z.number().min(0).max(100),
  thumbY: z.number().min(0).max(100),
  thumbScale: z.number().min(1).max(3),
  reference: z.boolean(),
  icon: z.string().trim().max(60).regex(/^[a-z0-9-]*$/, 'Icon names are lowercase Phosphor names, e.g. camera'),
}).partial();

export async function updateCourse(courseId: string, input: z.input<typeof Settings>): Promise<Result> {
  await requireAdmin();
  const p = Settings.safeParse(input);
  if (!p.success) return fail(first(p.error));
  const { categoryIds, ...data } = p.data;
  await db.course.update({
    where: { id: courseId },
    data: { ...data, ...(categoryIds ? { categories: { set: categoryIds.map((c) => ({ id: c })) } } : {}) },
  });
  refresh(courseId);
  return { ok: true };
}

/** The course-level "Quiz pass score": applies to every quiz in the course. Audited. */
export async function setCoursePassPercent(courseId: string, percent: number): Promise<Result> {
  const admin = await requireAdmin();
  const p = z.number().int().min(1, 'Pass score must be 1–100').max(100, 'Pass score must be 1–100').safeParse(percent);
  if (!p.success) return fail(first(p.error));
  const quizzes = await db.quiz.findMany({ where: { module: { courseId } }, select: { passPercent: true } });
  const from = [...new Set(quizzes.map((q) => q.passPercent))];
  if (from.length === 1 && from[0] === p.data) return { ok: true };
  await db.quiz.updateMany({ where: { module: { courseId } }, data: { passPercent: p.data } });
  await audit(admin.id, 'quiz.passmark', { type: 'course', id: courseId }, { from, to: p.data, quizzes: quizzes.length });
  refresh(courseId);
  return { ok: true };
}

export async function deleteCourse(courseId: string): Promise<Result> {
  const admin = await requireAdmin();
  const course = await db.course.findUnique({ where: { id: courseId }, select: { title: true } });
  if (!course) return fail('Course not found');
  await db.course.delete({ where: { id: courseId } });
  await clearRecertSetting(courseId);
  await audit(admin.id, 'course.delete', { type: 'course', id: courseId }, { title: course.title });
  refresh();
  return { ok: true };
}

async function clearRecertSetting(courseId: string) {
  await db.setting.deleteMany({ where: { key: `recert:${courseId}` } });
}

// ---------- Modules ----------

const ModuleInput = z
  .object({
    title: z.string().trim().min(1, 'Give the module a title').max(200),
    source: z.enum(['EMBED', 'BUILT']),
    url: z.string().trim().max(2000),
    withQuiz: z.boolean(),
  })
  .refine((m) => m.source === 'BUILT' || m.url.length > 0, { message: 'Lim inn lenken til innholdet' });

/** Pass score new quizzes start with: the course's current one, else 80. */
async function defaultPass(courseId: string) {
  const q = await db.quiz.findFirst({ where: { module: { courseId } }, select: { passPercent: true } });
  return q?.passPercent ?? 80;
}

export async function addModule(courseId: string, input: z.input<typeof ModuleInput>): Promise<Result<{ id: string }>> {
  await requireAdmin();
  const p = ModuleInput.safeParse(input);
  if (!p.success) return fail(first(p.error));
  const last = await db.module.findFirst({ where: { courseId }, orderBy: { order: 'desc' }, select: { order: true } });
  const m = await db.module.create({
    data: {
      courseId,
      title: p.data.title,
      order: (last?.order ?? -1) + 1,
      source: p.data.source,
      url: p.data.source === 'EMBED' ? embedUrl(p.data.url) : '',
      blocks: p.data.source === 'BUILT' ? [newBlock('heading'), newBlock('paragraph')] : [],
      ...(p.data.withQuiz ? { quiz: { create: { passPercent: await defaultPass(courseId) } } } : {}),
    },
  });
  await noteModuleChange(courseId, { moduleId: m.id, title: m.title, kind: 'added' });
  refresh(courseId);
  return { ok: true, id: m.id };
}

export async function updateModule(moduleId: string, input: z.input<typeof ModuleInput>): Promise<Result> {
  await requireAdmin();
  const p = ModuleInput.safeParse(input);
  if (!p.success) return fail(first(p.error));
  const m = await db.module.findUnique({ where: { id: moduleId }, include: { quiz: { select: { id: true } } } });
  if (!m) return fail('Module not found');
  const url = p.data.source === 'EMBED' ? embedUrl(p.data.url) : '';
  const contentChanged = url !== m.url || p.data.source !== m.source;
  const quizChanged = p.data.withQuiz !== !!m.quiz;
  await db.module.update({
    where: { id: moduleId },
    data: {
      title: p.data.title,
      source: p.data.source,
      url,
      ...(quizChanged
        ? p.data.withQuiz
          ? { quiz: { create: { passPercent: await defaultPass(m.courseId) } } }
          : { quiz: { delete: true } }
        : {}),
    },
  });
  await noteModuleChange(m.courseId, contentChanged || quizChanged ? { moduleId, title: p.data.title, kind: 'changed' } : undefined);
  refresh(m.courseId);
  return { ok: true };
}

export async function deleteModule(moduleId: string): Promise<Result> {
  await requireAdmin();
  const m = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true, title: true } });
  if (!m) return fail('Module not found');
  await db.module.delete({ where: { id: moduleId } });
  await renumber(m.courseId);
  await noteModuleChange(m.courseId, { moduleId, title: m.title, kind: 'removed' });
  refresh(m.courseId);
  return { ok: true };
}

async function renumber(courseId: string, ids?: string[]) {
  const order = ids ?? (await db.module.findMany({ where: { courseId }, orderBy: { order: 'asc' }, select: { id: true } })).map((x) => x.id);
  await db.$transaction(order.map((mid, i) => db.module.update({ where: { id: mid }, data: { order: i } })));
}

export async function moveModule(moduleId: string, dir: -1 | 1): Promise<Result> {
  await requireAdmin();
  const m = await db.module.findUnique({ where: { id: moduleId }, select: { courseId: true } });
  if (!m) return fail('Module not found');
  const ids = (await db.module.findMany({ where: { courseId: m.courseId }, orderBy: { order: 'asc' }, select: { id: true } })).map((x) => x.id);
  const i = ids.indexOf(moduleId);
  const j = i + (dir < 0 ? -1 : 1);
  if (j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await renumber(m.courseId, ids);
  await noteModuleChange(m.courseId);
  refresh(m.courseId);
  return { ok: true };
}

/** Dwell time before the quiz opens. 0 = no review gate. */
export async function setModuleSeconds(moduleId: string, seconds: number): Promise<Result> {
  await requireAdmin();
  const n = seconds <= 0 ? 0 : Math.max(5, Math.min(3600, Math.round(seconds)));
  const m = await db.module.update({ where: { id: moduleId }, data: { minSeconds: n }, select: { courseId: true } });
  refresh(m.courseId);
  return { ok: true };
}

const BlockSchema = z
  .object({ id: z.string().min(1).max(40), kind: z.enum(BLOCK_KINDS.map((b) => b.kind) as [string, ...string[]]) })
  .passthrough();

export async function saveModuleBlocks(moduleId: string, blocks: unknown[]): Promise<Result> {
  await requireAdmin();
  const p = z.array(BlockSchema).max(200).safeParse(blocks);
  if (!p.success) return fail('Some blocks are invalid');
  const m = await db.module.update({ where: { id: moduleId }, data: { blocks: p.data as Prisma.InputJsonValue }, select: { courseId: true } });
  await noteModuleChange(m.courseId);
  refresh(m.courseId);
  return { ok: true };
}

// ---------- Quiz ----------

const Option = z.object({ text: z.string().trim().min(1, 'Every option needs text').max(500), correct: z.boolean() });
const QuestionInput = z
  .object({
    id: z.string().max(64).optional(),
    text: z.string().trim().min(1, 'Every question needs text').max(1000),
    multi: z.boolean(),
    options: z.array(Option).min(2, 'A question needs at least two options').max(6, 'Six options is the maximum'),
    bankItemId: id.nullable().optional(),
  })
  .refine((q) => q.options.some((o) => o.correct), { message: 'Mark at least one correct answer' });

const QuizInput = z.object({
  passPercent: z.number().int().min(1).max(100),
  retries: z.number().int().min(0).max(10),
  shuffle: z.boolean(),
  showFeedback: z.boolean(),
  minSeconds: z.number().int().min(0).max(3600),
  questions: z.array(QuestionInput).max(100),
});

export type QuizDraft = z.input<typeof QuizInput>;

const fingerprint = (qs: { text: string; multi: boolean; options: unknown }[]) =>
  JSON.stringify(qs.map((q) => [q.text, q.multi, q.options]));

/** Saves the quiz of a module. No questions → the module has no quiz. */
export async function saveQuiz(moduleId: string, input: QuizDraft): Promise<Result<{ removed: boolean }>> {
  const admin = await requireAdmin();
  const p = QuizInput.safeParse(input);
  if (!p.success) return fail(first(p.error));
  const d = p.data;
  const m = await db.module.findUnique({
    where: { id: moduleId },
    include: { quiz: { include: { questions: { orderBy: { order: 'asc' } } } } },
  });
  if (!m) return fail('Module not found');
  const old = m.quiz;
  const minSeconds = d.minSeconds <= 0 ? 0 : Math.max(5, d.minSeconds);

  if (!d.questions.length) {
    await db.$transaction([
      db.module.update({ where: { id: moduleId }, data: { minSeconds } }),
      ...(old ? [db.quiz.delete({ where: { id: old.id } })] : []),
    ]);
    if (old) await noteModuleChange(m.courseId, { moduleId, title: m.title, kind: 'changed' });
    refresh(m.courseId);
    return { ok: true, removed: true };
  }

  const settings = { passPercent: d.passPercent, retries: d.retries, shuffle: d.shuffle, showFeedback: d.showFeedback };
  const quiz = old
    ? await db.quiz.update({ where: { id: old.id }, data: settings })
    : await db.quiz.create({ data: { moduleId, ...settings } });
  const keep = new Set(d.questions.map((q) => q.id).filter((x): x is string => !!x && old?.questions.some((o) => o.id === x) === true));
  await db.$transaction([
    db.module.update({ where: { id: moduleId }, data: { minSeconds } }),
    db.question.deleteMany({ where: { quizId: quiz.id, id: { notIn: [...keep] } } }),
    ...d.questions.map((q, order) => {
      const data = { order, text: q.text, multi: q.multi, options: q.options, bankItemId: q.bankItemId ?? null };
      return q.id && keep.has(q.id)
        ? db.question.update({ where: { id: q.id }, data })
        : db.question.create({ data: { ...data, quizId: quiz.id } });
    }),
  ]);

  if (old && old.passPercent !== d.passPercent)
    await audit(admin.id, 'quiz.passmark', { type: 'quiz', id: quiz.id }, { module: m.title, from: old.passPercent, to: d.passPercent });
  const changed = !old || old.passPercent !== d.passPercent || fingerprint(old.questions) !== fingerprint(d.questions);
  await noteModuleChange(m.courseId, changed ? { moduleId, title: m.title, kind: 'changed' } : undefined);
  refresh(m.courseId);
  return { ok: true, removed: false };
}

/** "Lagre i banken": copies a quiz question into the bank under the course's first category. */
export async function saveQuestionToBank(
  courseId: string,
  q: { text: string; multi: boolean; options: { text: string; correct: boolean }[] },
): Promise<Result<{ id: string; category: string }>> {
  await requireAdmin();
  const p = QuestionInput.safeParse(q);
  if (!p.success) return fail(first(p.error));
  const course = await db.course.findUnique({ where: { id: courseId }, select: { categories: { select: { id: true, name: true }, orderBy: { order: 'asc' }, take: 1 } } });
  const cat = course?.categories[0] ?? null;
  const item = await db.bankQuestion.create({
    data: { text: p.data.text, multi: p.data.multi, options: p.data.options, categoryId: cat?.id ?? null },
  });
  revalidatePath('/admin/question-bank');
  return { ok: true, id: item.id, category: cat?.name ?? 'Uten kategori' };
}

// ---------- Assignment (audited) ----------

export async function setCourseGroup(courseId: string, groupId: string, on: boolean): Promise<Result> {
  const admin = await requireAdmin();
  const g = await db.group.findUnique({ where: { id: groupId }, select: { name: true } });
  if (!g) return fail('Group not found');
  await db.course.update({ where: { id: courseId }, data: { groups: on ? { connect: { id: groupId } } : { disconnect: { id: groupId } } } });
  await audit(admin.id, on ? 'course.assign.group' : 'course.unassign.group', { type: 'course', id: courseId }, { group: g.name });
  refresh(courseId);
  return { ok: true };
}

export async function assignCourseUsers(courseId: string, userIds: string[], on: boolean): Promise<Result<{ count: number }>> {
  const admin = await requireAdmin();
  const p = z.array(id).max(1000).safeParse(userIds);
  if (!p.success) return fail('Invalid users');
  const users = await db.user.findMany({ where: { id: { in: p.data } }, select: { id: true, email: true } });
  await db.course.update({
    where: { id: courseId },
    data: { users: on ? { connect: users.map((u) => ({ id: u.id })) } : { disconnect: users.map((u) => ({ id: u.id })) } },
  });
  await audit(admin.id, on ? 'course.assign.users' : 'course.unassign.users', { type: 'course', id: courseId }, { users: users.map((u) => u.email) });
  refresh(courseId);
  return { ok: true, count: users.length };
}

export async function setSelfEnrol(courseId: string, on: boolean): Promise<Result> {
  const admin = await requireAdmin();
  await db.course.update({ where: { id: courseId }, data: { selfEnrol: on } });
  await audit(admin.id, 'course.selfEnrol', { type: 'course', id: courseId }, { selfEnrol: on });
  refresh(courseId);
  return { ok: true };
}

// ---------- Re-certification ----------

export async function resolveRecert(courseId: string, resetProgress: boolean): Promise<Result<{ reset: number }>> {
  const admin = await requireAdmin();
  const changes = await recertChanges(courseId);
  let reset = 0;
  if (resetProgress) {
    const ids = changes.filter((c) => c.kind === 'changed').map((c) => c.moduleId);
    reset = (await db.progress.deleteMany({ where: { moduleId: { in: ids }, module: { courseId } } })).count;
  }
  await clearRecert(courseId);
  await audit(admin.id, resetProgress ? 'course.recert.reset' : 'course.recert.keep', { type: 'course', id: courseId }, { changes, progressRowsReset: reset });
  refresh(courseId);
  return { ok: true, reset };
}
