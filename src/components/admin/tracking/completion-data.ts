import 'server-only';
import type { Country, CourseStatus, Role } from '@prisma/client';
import { db } from '@/lib/db';
import { COURSE_ACCESS_INCLUDE, accessReasons, countryMatches, reasonLabel } from '@/lib/access';
import { courseProgress, type ModuleState } from '@/lib/progress';
import { inScope, type Scope } from '@/lib/labels';

/** Status map from the prototype (`STATUS` in LMS Admin). */
export type CellKey = 'passed' | 'failed' | 'started' | 'none';
export const STATUS: Record<CellKey, { label: string; no: string; icon: string; bg: string; fg: string }> = {
  passed: { label: 'Passed', no: 'Bestått', icon: 'check', bg: 'var(--efkt-mint)', fg: 'var(--efkt-navy)' },
  failed: { label: 'Not passed', no: 'Ikke bestått', icon: 'x', bg: 'var(--efkt-blush)', fg: 'var(--efkt-coral)' },
  started: { label: 'In progress', no: 'I gang', icon: 'dot-outline', bg: 'var(--efkt-sand)', fg: 'var(--efkt-navy)' },
  none: { label: 'Not started', no: 'Ikke startet', icon: 'minus', bg: 'var(--efkt-offwhite)', fg: 'var(--efkt-muted)' },
};

export type Bucket = 'Completed' | 'In progress' | 'Not started';
export const BUCKETS: Bucket[] = ['Completed', 'In progress', 'Not started'];
export const BUCKET_NO: Record<Bucket, string> = { Completed: 'Fullført', 'In progress': 'I gang', 'Not started': 'Ikke startet' };

export type TrackCourse = {
  id: string;
  title: string;
  country: Country;
  status: CourseStatus;
  categories: string[];
  groupCount: number;
  passPercent: number;
  modules: { id: string; title: string }[];
};

export type TrackUser = { id: string; name: string; email: string; role: Role; country: Country; groups: string[]; lastSeenAt: Date | null };

export type Cell = { key: CellKey; score: number | null };

/** One user's standing in one course they have access to. */
export type CourseRecord = {
  cells: Cell[];
  passed: number;
  total: number;
  pct: number;
  key: CellKey;
  bucket: Bucket;
  lastActivity: Date | null;
  via: string;
};

const MODULE_KEY: Record<ModuleState, CellKey> = { passed: 'passed', failed: 'failed', started: 'started', available: 'none', locked: 'none' };

/**
 * Published, non-reference courses in the admin's country scope, the active users in scope
 * who can see at least one of them (the learner access rule), and their real progress.
 */
export async function loadCompletion(scope: Scope) {
  const courseRows = await db.course.findMany({
    where: { status: 'PUBLISHED', reference: false },
    include: {
      ...COURSE_ACCESS_INCLUDE,
      modules: { orderBy: { order: 'asc' }, include: { quiz: { select: { id: true, retries: true, passPercent: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  const scopedCourses = courseRows.filter((c) => inScope(c.country, scope) && c.modules.length > 0);

  const userRows = await db.user.findMany({
    where: { status: 'ACTIVE', ...(scope === 'All' ? {} : { country: scope }) },
    include: { groups: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' },
  });

  const moduleIds = scopedCourses.flatMap((c) => c.modules.map((m) => m.id));
  const progress = await db.progress.findMany({ where: { moduleId: { in: moduleIds }, userId: { in: userRows.map((u) => u.id) } } });
  const byUser = new Map<string, typeof progress>();
  for (const p of progress) byUser.set(p.userId, [...(byUser.get(p.userId) ?? []), p]);

  const records = new Map<string, Map<string, CourseRecord>>();
  for (const u of userRows) {
    const mine = byUser.get(u.id) ?? [];
    for (const c of scopedCourses) {
      if (!countryMatches(c.country, u.country)) continue;
      const reasons = accessReasons(c, u);
      if (!reasons.length) continue;
      const ids = new Set(c.modules.map((m) => m.id));
      const rows = mine.filter((p) => ids.has(p.moduleId));
      const cp = courseProgress(c.modules, rows);
      const cells = cp.items.map((i): Cell => {
        const key = MODULE_KEY[i.state];
        const score = key === 'passed' ? i.progress?.bestScore ?? null : key === 'failed' ? i.progress?.lastScore ?? null : null;
        return { key, score };
      });
      const key: CellKey = cp.complete ? 'passed' : cells.some((x) => x.key === 'failed') ? 'failed' : cp.started || cp.passed > 0 ? 'started' : 'none';
      const last = rows.reduce<Date | null>((a, r) => (!a || r.updatedAt > a ? r.updatedAt : a), null);
      const rec: CourseRecord = {
        cells, passed: cp.passed, total: cp.total, pct: cp.pct, key,
        bucket: cp.complete ? 'Completed' : key === 'none' ? 'Not started' : 'In progress',
        lastActivity: last,
        via: reasons.map(reasonLabel).join('; '),
      };
      if (!records.has(u.id)) records.set(u.id, new Map());
      records.get(u.id)!.set(c.id, rec);
    }
  }

  const courses: TrackCourse[] = scopedCourses.map((c) => ({
    id: c.id,
    title: c.title,
    country: c.country,
    status: c.status,
    categories: c.categories.map((k) => k.name),
    groupCount: new Set([...c.groups.map((g) => g.id), ...c.categories.flatMap((k) => k.groups.map((g) => g.id))]).size,
    passPercent: c.modules.find((m) => m.quiz)?.quiz?.passPercent ?? 80,
    modules: c.modules.map((m) => ({ id: m.id, title: m.title })),
  }));
  const users: TrackUser[] = userRows
    .filter((u) => records.has(u.id))
    .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, country: u.country, groups: u.groups.map((g) => g.name), lastSeenAt: u.lastSeenAt }));

  return { courses, users, records };
}

export type Completion = Awaited<ReturnType<typeof loadCompletion>>;

/** A user's roll-up across the given courses. */
export function summarize(recs: CourseRecord[]) {
  const passed = recs.reduce((a, r) => a + r.passed, 0);
  const total = recs.reduce((a, r) => a + r.total, 0);
  const done = recs.filter((r) => r.bucket === 'Completed').length;
  const going = recs.filter((r) => r.bucket === 'In progress').length;
  const bucket: Bucket = recs.length && done === recs.length ? 'Completed' : done + going > 0 ? 'In progress' : 'Not started';
  const last = recs.reduce<Date | null>((a, r) => (r.lastActivity && (!a || r.lastActivity > a) ? r.lastActivity : a), null);
  return { passed, total, pct: total ? Math.round((passed / total) * 100) : 0, done, going, notStarted: recs.length - done - going, bucket, last };
}

export type TrackFilters = { courseId: string; group: string; status: string; q: string };

export function readFilters(sp: Record<string, string | string[] | undefined>): TrackFilters {
  const one = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : '');
  return { courseId: one('course'), group: one('group'), status: one('status'), q: one('q') };
}

/**
 * Rows for the matrix: one course (users × modules) when `courseId` is set, otherwise
 * users × courses. Group, status and search filters apply to both.
 */
export function trackRows(data: Completion, f: TrackFilters) {
  const course = data.courses.find((c) => c.id === f.courseId) ?? null;
  const q = f.q.trim().toLowerCase();
  const all = data.users
    .map((user) => {
      const mine = data.records.get(user.id)!;
      if (course) {
        const rec = mine.get(course.id);
        return rec ? { user, rec, sum: summarize([rec]) } : null;
      }
      const recs = data.courses.map((c) => mine.get(c.id)).filter((r): r is CourseRecord => !!r);
      return { user, rec: null, sum: summarize(recs) };
    })
    .filter((r): r is NonNullable<typeof r> => !!r);
  const shown = all.filter(
    (r) =>
      (!q || r.user.name.toLowerCase().includes(q) || r.user.email.toLowerCase().includes(q)) &&
      (!f.group || r.user.groups.includes(f.group)) &&
      (!f.status || r.sum.bucket === f.status),
  );
  return { course, all, shown };
}
