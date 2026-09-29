import 'server-only';
import type { Country } from '@prisma/client';
import { db } from '@/lib/db';
import { accessReasons, countryMatches, COURSE_ACCESS_INCLUDE, reasonLabel, type AccessReason } from '@/lib/access';
import { courseProgress } from '@/lib/progress';
import { gate } from '@/lib/prerequisites';
import type { Scope } from '@/lib/labels';

/** Prisma where for users inside the admin's country scope. */
export function userScopeWhere(scope: Scope): { country?: Country } {
  return scope === 'All' ? {} : { country: scope };
}

const MODULES = {
  select: { id: true, quiz: { select: { id: true, retries: true, passPercent: true } } },
  orderBy: { order: 'asc' as const },
};

/** Every published course with what the access rule and progress need, loaded once. */
export async function loadPublishedCourses() {
  return db.course.findMany({
    where: { status: 'PUBLISHED' },
    include: { ...COURSE_ACCESS_INCLUDE, modules: MODULES, prerequisite: { select: { modules: { select: { id: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
}
export type PublishedCourse = Awaited<ReturnType<typeof loadPublishedCourses>>[number];

type AccessUser = { id: string; country: Country; groups: { id: string; name: string }[] };

/** In-memory equivalent of `coursesForUser` for many users at once. */
export function reachable(courses: PublishedCourse[], user: AccessUser) {
  const out: { course: PublishedCourse; reasons: AccessReason[] }[] = [];
  for (const course of courses) {
    if (!countryMatches(course.country, user.country)) continue;
    const reasons = accessReasons(course, user);
    if (reasons.length) out.push({ course, reasons });
  }
  return out;
}

export async function loadProgress(userIds: string[]) {
  return db.progress.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, moduleId: true, seenAt: true, passed: true, passedAt: true, attempts: true, bestScore: true, lastScore: true },
  });
}
type ProgressRow = Awaited<ReturnType<typeof loadProgress>>[number];

export type CourseLine = {
  id: string;
  title: string;
  via: string;
  reference: boolean;
  direct: boolean;
  pct: number;
  passed: number;
  total: number;
  started: boolean;
};

/** Courses a user receives (progress-bearing ones first), with the reasons spelled out. */
export function courseLines(courses: PublishedCourse[], user: AccessUser, progress: ProgressRow[]): CourseLine[] {
  const mine = progress.filter((p) => p.userId === user.id);
  const now = new Date();
  // Courses behind an unmet prerequisite aren't visible to the learner yet, so not counted.
  return reachable(courses, user).filter(({ course }) => prerequisiteOpen(course, mine, now)).map(({ course, reasons }) => {
    const p = courseProgress(course.modules, mine);
    return {
      id: course.id,
      title: course.title,
      via: reasons.map(reasonLabel).join(' · '),
      reference: course.reference,
      direct: reasons.some((r) => r.kind === 'direct'),
      pct: p.pct,
      passed: p.passed,
      total: p.total,
      started: p.started,
    };
  });
}

/** The prerequisite rule for a loaded course (its own and its prerequisite's modules are included). */
export function prerequisiteOpen(course: PublishedCourse, rows: ProgressRow[], now = new Date()): boolean {
  if (!course.prerequisiteId) return true;
  const modules = new Map([
    [course.id, course.modules.map((m) => m.id)],
    [course.prerequisiteId, course.prerequisite?.modules.map((m) => m.id) ?? []],
  ]);
  return gate(course, modules, rows, now).open;
}

/** Completion summary over the non-reference courses. */
export function summarise(lines: CourseLine[]) {
  const tracked = lines.filter((l) => !l.reference);
  const done = tracked.filter((l) => l.total > 0 && l.pct === 100).length;
  return { assigned: tracked.length, done, pct: tracked.length ? Math.round((done / tracked.length) * 100) : 0 };
}
