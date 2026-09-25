import 'server-only';
import { notFound } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { canAccessCourse, coursesForUser } from '@/lib/access';
import { courseProgress } from '@/lib/progress';
import { fileUrl } from '@/lib/blocks';
import type { CurrentUser } from '@/lib/auth';

/** Modules in order, with the quiz facts the learner UI needs (never the answers). */
export const LEARNER_MODULES = {
  modules: {
    orderBy: { order: 'asc' },
    include: { quiz: { select: { id: true, retries: true, passPercent: true, _count: { select: { questions: true } } } } },
  },
} satisfies Prisma.CourseInclude;

type LearnerCourse = Prisma.CourseGetPayload<{
  include: typeof LEARNER_MODULES & { categories: true };
}>;
export type LearnerModule = LearnerCourse['modules'][number];

/**
 * Remaining quiz attempts, or null when unlimited. `retries` counts retries after the
 * first attempt ("1 retry" = 2 attempts), matching the admin quiz builder.
 */
export function attemptsLeft(quiz: { retries: number } | null | undefined, attempts: number): number | null {
  if (!quiz || quiz.retries === 0) return null;
  return Math.max(0, quiz.retries + 1 - attempts);
}

export function courseThumb(c: { thumbnailId: string | null; thumbX: number; thumbY: number; thumbScale: number }) {
  return { src: fileUrl(c.thumbnailId), x: c.thumbX, y: c.thumbY, scale: c.thumbScale };
}

/** "Fotograf: Velkommen til EFKT Norge" → thin "Fotograf: Velkommen til EFKT", fat "Norge". */
export function splitLast(text: string) {
  const w = text.split(' ');
  return { thin: w.slice(0, -1).join(' '), fat: w[w.length - 1] ?? '' };
}

/** Primary category = the course's category with the lowest order. */
export function primaryCategory<C extends { order: number }>(cats: C[]): C | null {
  return [...cats].sort((a, b) => a.order - b.order)[0] ?? null;
}

async function progressRows(userId: string, moduleIds: string[]) {
  if (!moduleIds.length) return [];
  return db.progress.findMany({ where: { userId, moduleId: { in: moduleIds } } });
}

/** Every course the learner has, with progress computed. */
export async function myCourses(user: CurrentUser) {
  const list = await coursesForUser(user, LEARNER_MODULES);
  const rows = await progressRows(user.id, list.flatMap(({ course }) => course.modules.map((m) => m.id)));
  return list.map(({ course, reasons }) => ({
    course,
    reasons,
    progress: courseProgress(course.modules, rows),
    category: primaryCategory(course.categories),
  }));
}

/**
 * One course for the learner, 404 unless they may open it. Reference courses never lock.
 */
export async function loadCourse(user: CurrentUser, courseId: string) {
  if (!(await canAccessCourse(user, courseId))) notFound();
  const course = await db.course.findUnique({
    where: { id: courseId },
    include: { ...LEARNER_MODULES, categories: true },
  });
  if (!course) notFound();
  const rows = await progressRows(user.id, course.modules.map((m) => m.id));
  const progress = courseProgress(course.modules, rows);
  if (course.reference) for (const it of progress.items) if (it.state === 'locked') it.state = it.progress?.seenAt ? 'started' : 'available';
  // courseProgress keeps only the fields it needs; the full rows carry dwell/confirmation.
  const row = new Map(rows.map((r) => [r.moduleId, r]));
  return { course, progress, row, category: primaryCategory(course.categories) };
}

/** News the learner may read: live, their country (or both), and their groups when targeted. */
export function visibleNewsWhere(user: CurrentUser): Prisma.NewsStoryWhereInput {
  const now = new Date();
  return {
    country: { in: [user.country, 'Both'] },
    OR: [{ status: 'PUBLISHED' }, { status: 'SCHEDULED', publishAt: { lte: now } }],
    AND: [{ OR: [{ groups: { none: {} } }, { groups: { some: { id: { in: user.groups.map((g) => g.id) } } } }] }],
  };
}

export const NEWS_ORDER: Prisma.NewsStoryOrderByWithRelationInput[] = [
  { pinned: 'desc' },
  { publishAt: { sort: 'desc', nulls: 'last' } },
  { createdAt: 'desc' },
];

export type DashboardSettings = {
  contactIntro: string;
  contactNotes: { icon: string; label: string; value: string; href: string; note: string }[];
  contactFooter: string;
  importantLinks: { label: string; sub: string; url: string; icon: string }[];
};

export async function dashboardSettings(): Promise<DashboardSettings> {
  const row = await db.setting.findUnique({ where: { key: 'dashboard' } });
  const v = (row?.value ?? {}) as Partial<DashboardSettings>;
  return {
    contactIntro: v.contactIntro ?? '',
    contactNotes: Array.isArray(v.contactNotes) ? v.contactNotes : [],
    contactFooter: v.contactFooter ?? '',
    importantLinks: Array.isArray(v.importantLinks) ? v.importantLinks : [],
  };
}

/**
 * Opening a module: sets seenAt, passes a module without a quiz, and — when the quiz
 * retries are used up — starts the module over (attempts, dwell and confirmation reset).
 */
export async function recordOpen(userId: string, m: LearnerModule) {
  const p = await db.progress.findUnique({ where: { userId_moduleId: { userId, moduleId: m.id } } });
  const now = new Date();
  const exhausted = !!p && !p.passed && attemptsLeft(m.quiz, p.attempts) === 0;
  const passNow = !m.quiz && !p?.passed;
  if (p && p.seenAt && !exhausted && !passNow) return;
  await db.progress.upsert({
    where: { userId_moduleId: { userId, moduleId: m.id } },
    create: { userId, moduleId: m.id, seenAt: now, passed: !m.quiz, passedAt: m.quiz ? null : now },
    update: {
      seenAt: p?.seenAt ?? now,
      ...(passNow ? { passed: true, passedAt: now } : {}),
      ...(exhausted ? { attempts: 0, dwellSeconds: 0, confirmedAllSlides: false } : {}),
    },
  });
}

/** Linked-course blocks: title/description, and a link only when the learner has access. */
export async function linkedCourses(user: CurrentUser, blocks: { kind: string; courseId?: string }[]) {
  const ids = [...new Set(blocks.flatMap((b) => (b.kind === 'course' && b.courseId ? [b.courseId] : [])))];
  if (!ids.length) return {};
  const rows = await db.course.findMany({ where: { id: { in: ids } }, select: { id: true, title: true, description: true } });
  const out: Record<string, { id: string; title: string; description: string; href: string | null }> = {};
  for (const r of rows) out[r.id] = { ...r, href: (await canAccessCourse(user, r.id)) ? `/courses/${r.id}` : null };
  return out;
}
