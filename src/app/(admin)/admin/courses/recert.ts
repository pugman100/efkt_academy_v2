import 'server-only';
import { db } from '@/lib/db';

// Re-certification. When modules of a PUBLISHED course are added, removed, or have their
// content URL or quiz changed, the course is flagged (`recertFlag`) and the changes are
// listed in the Setting table under `recert:<courseId>` (the schema has no column for it),
// so an admin can decide whether existing completions stand or progress is reset.

export type RecertChange = { moduleId: string; title: string; kind: 'added' | 'removed' | 'changed' };

const key = (courseId: string) => `recert:${courseId}`;

export async function recertChanges(courseId: string): Promise<RecertChange[]> {
  const row = await db.setting.findUnique({ where: { key: key(courseId) } });
  return Array.isArray(row?.value) ? (row.value as RecertChange[]) : [];
}

/** Touches the course's updatedAt and, if it is published, records the module change. */
export async function noteModuleChange(courseId: string, change?: RecertChange) {
  const course = await db.course.update({ where: { id: courseId }, data: { updatedAt: new Date() }, select: { status: true } });
  if (!change || course.status !== 'PUBLISHED') return;
  let next = await recertChanges(courseId);
  const known = next.find((c) => c.moduleId === change.moduleId);
  if (change.kind === 'removed') {
    next = next.filter((c) => c.moduleId !== change.moduleId);
    // A module added and removed again since publishing is no change at all.
    if (known?.kind !== 'added') next.push(change);
  } else if (!known) next.push(change);
  await db.setting.upsert({ where: { key: key(courseId) }, create: { key: key(courseId), value: next }, update: { value: next } });
  await db.course.update({ where: { id: courseId }, data: { recertFlag: next.length > 0 } });
}

export async function clearRecert(courseId: string) {
  await db.setting.deleteMany({ where: { key: key(courseId) } });
  await db.course.update({ where: { id: courseId }, data: { recertFlag: false } });
}
