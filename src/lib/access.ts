import type { Country, Prisma } from '@prisma/client';
import { db } from './db';

/**
 * Access rule. A learner sees a course if it is Published, matches their country
 * (or is "Both"), and any of:
 *   - the course is assigned to them directly,
 *   - the course is assigned to one of their groups,
 *   - one of the course's categories is assigned to one of their groups,
 *   - the course is self-enrol and they enrolled.
 * Every reason is kept so the admin UI can explain *why* ("via category Foto → Photographers").
 */
export type AccessReason =
  | { kind: 'direct' }
  | { kind: 'group'; group: string }
  | { kind: 'category'; category: string; group: string }
  | { kind: 'enrolled' };

export function reasonLabel(r: AccessReason): string {
  switch (r.kind) {
    case 'direct': return 'Assigned directly';
    case 'group': return `via group ${r.group}`;
    case 'category': return `via category ${r.category} → ${r.group}`;
    case 'enrolled': return 'Self-enrolled';
  }
}

export const COURSE_ACCESS_INCLUDE = {
  categories: { include: { groups: { select: { id: true, name: true } } } },
  groups: { select: { id: true, name: true } },
  users: { select: { id: true } },
  enrolments: { select: { userId: true } },
} satisfies Prisma.CourseInclude;

type CourseForAccess = Prisma.CourseGetPayload<{ include: typeof COURSE_ACCESS_INCLUDE }>;
type UserForAccess = { id: string; country: Country; groups: { id: string; name: string }[] };

export function accessReasons(course: CourseForAccess, user: UserForAccess): AccessReason[] {
  const out: AccessReason[] = [];
  const mine = new Set(user.groups.map((g) => g.id));
  if (course.users.some((u) => u.id === user.id)) out.push({ kind: 'direct' });
  for (const g of course.groups) if (mine.has(g.id)) out.push({ kind: 'group', group: g.name });
  for (const c of course.categories)
    for (const g of c.groups) if (mine.has(g.id)) out.push({ kind: 'category', category: c.name, group: g.name });
  if (course.selfEnrol && course.enrolments.some((e) => e.userId === user.id)) out.push({ kind: 'enrolled' });
  return out;
}

export function countryMatches(content: Country, user: Country): boolean {
  return content === 'Both' || content === user;
}

/** Prisma filter for courses reachable by a user (before the published/country checks). */
export function reachableWhere(user: UserForAccess): Prisma.CourseWhereInput {
  const groupIds = user.groups.map((g) => g.id);
  return {
    OR: [
      { users: { some: { id: user.id } } },
      { groups: { some: { id: { in: groupIds } } } },
      { categories: { some: { groups: { some: { id: { in: groupIds } } } } } },
      { selfEnrol: true, enrolments: { some: { userId: user.id } } },
    ],
  };
}

/** Published courses the user can see, with the reasons, in category order. */
export async function coursesForUser<T extends Prisma.CourseInclude>(user: UserForAccess, include?: T) {
  const courses = await db.course.findMany({
    where: { status: 'PUBLISHED', country: { in: [user.country, 'Both'] }, ...reachableWhere(user) },
    include: { ...COURSE_ACCESS_INCLUDE, ...(include ?? {}) } as typeof COURSE_ACCESS_INCLUDE & T,
    orderBy: { createdAt: 'asc' },
  });
  return courses.map((course) => ({ course, reasons: accessReasons(course as CourseForAccess, user) }));
}

/** Whether a user may open a course (learner side). */
export async function canAccessCourse(user: UserForAccess, courseId: string): Promise<boolean> {
  const n = await db.course.count({
    where: { id: courseId, status: 'PUBLISHED', country: { in: [user.country, 'Both'] }, ...reachableWhere(user) },
  });
  return n > 0;
}
