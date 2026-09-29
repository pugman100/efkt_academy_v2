// Course prerequisites: course B stays hidden until the learner has completed course A,
// optionally plus a number of days. Pure rules here; loaders live in access.ts.

const DAY = 24 * 60 * 60 * 1000;

export type GatedCourse = { id: string; prerequisiteId: string | null; unlockDelayDays: number; prerequisiteSetAt: Date | null };
export type GateRow = { moduleId: string; seenAt: Date | null; passed: boolean; passedAt: Date | null };

/** When every module of a course was passed (the last one), or null if not complete. */
export function completedAt(moduleIds: string[], rows: GateRow[]): Date | null {
  if (!moduleIds.length) return null;
  const byId = new Map(rows.map((r) => [r.moduleId, r]));
  let last: Date | null = null;
  for (const id of moduleIds) {
    const r = byId.get(id);
    if (!r?.passed) return null;
    const at = r.passedAt ?? r.seenAt;
    if (at && (!last || at > last)) last = at;
  }
  return last ?? new Date(0);
}

export type Gate =
  | { open: true; notify: false; reason: 'none' | 'started' | 'earlier' }
  | { open: true; notify: true; unlockedAt: Date }
  | { open: false; unlockAt: Date | null };

/**
 * Whether the learner may see a course. `modules` maps a course id to its module ids
 * (needed for the prerequisite and the course itself); `rows` are the learner's progress.
 * - no prerequisite → open
 * - learner already started this course → stays open (nobody loses progress)
 * - prerequisite completed before the prerequisite was switched on → open, no email
 * - otherwise open from completion + delay; `notify` means an unlock email is due.
 */
export function gate(course: GatedCourse, modules: Map<string, string[]>, rows: GateRow[], now = new Date()): Gate {
  if (!course.prerequisiteId) return { open: true, notify: false, reason: 'none' };
  const own = new Set(modules.get(course.id) ?? []);
  if (rows.some((r) => own.has(r.moduleId) && r.seenAt)) return { open: true, notify: false, reason: 'started' };
  const done = completedAt(modules.get(course.prerequisiteId) ?? [], rows);
  if (!done) return { open: false, unlockAt: null };
  if (course.prerequisiteSetAt && done < course.prerequisiteSetAt) return { open: true, notify: false, reason: 'earlier' };
  const unlockAt = new Date(done.getTime() + course.unlockDelayDays * DAY);
  return unlockAt <= now ? { open: true, notify: true, unlockedAt: unlockAt } : { open: false, unlockAt };
}

/** Would setting `prerequisiteId` on `courseId` create a loop (A needs B needs A)? */
export function createsCycle(courseId: string, prerequisiteId: string, parentOf: Map<string, string | null>): boolean {
  let at: string | null = prerequisiteId;
  for (let i = 0; at && i < 1000; i++) {
    if (at === courseId) return true;
    at = parentOf.get(at) ?? null;
  }
  return false;
}
