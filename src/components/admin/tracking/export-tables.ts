import 'server-only';
import { COUNTRY_SHORT, ROLE_LABEL, type Scope } from '@/lib/labels';
import { BUCKET_NO, STATUS, summarize, trackRows, type Completion, type CourseRecord, type TrackFilters } from './completion-data';

export type Cell = string | number;
export type Table = { name: string; sheet: string; head: string[]; rows: Cell[][] };
export type ExportType = 'course' | 'user' | 'all';

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const scopeSuffix = (scope: Scope) => (scope === 'All' ? 'dk-no' : slug(scope));

/**
 * Builds one export table (Norwegian headers, as in the prototype):
 * - course + courseId: that course per module (follows the table filters)
 * - course: one row per course with completion rate
 * - user + userId: one person's courses
 * - user: one row per person across their courses (follows the table filters)
 * - all: one row per person per course
 * Returns null when the requested course/user is not in the data.
 */
export function buildTable(data: Completion, type: ExportType, opts: { courseId?: string; userId?: string; filters: TrackFilters; scope: Scope }): Table | null {
  const stamp = new Date().toISOString().slice(0, 10);
  const { filters, scope } = opts;
  const rec = (userId: string, courseId: string) => data.records.get(userId)?.get(courseId);

  if (type === 'course' && opts.courseId) {
    const { course, shown } = trackRows(data, { ...filters, courseId: opts.courseId });
    if (!course) return null;
    const head = ['Navn', 'E-post', 'Grupper', 'Land', 'Kurs', 'Kategori', 'Status', 'Fremdrift %', 'Moduler bestått', 'Moduler totalt', 'Siste aktivitet', 'Tilgang']
      .concat(course.modules.map((m, i) => `M${i + 1} ${m.title}`))
      .concat(course.modules.map((_, i) => `M${i + 1} poeng`));
    const rows = shown.map(({ user, rec: r }) => {
      const x = r!;
      return [user.name, user.email, user.groups.join(', '), user.country, course.title, course.categories.join(', '), BUCKET_NO[x.bucket],
        x.pct, x.passed, x.total, day(x.lastActivity), x.via]
        .concat(x.cells.map((c) => STATUS[c.key].no))
        .concat(x.cells.map((c) => (c.score === null ? '' : c.score)));
    });
    return { name: `efkt-academy_${slug(course.title)}_moduler_${stamp}`, sheet: 'Moduler', head, rows };
  }

  if (type === 'course') {
    const head = ['Kurs', 'Kategori', 'Land', 'Kursstatus', 'Moduler', 'Bestått ved %', 'Påmeldte', 'Fullført', 'I gang', 'Ikke startet', 'Fullføringsgrad %', 'Gjennomsnittlig fremdrift %'];
    const rows = data.courses.map((c) => {
      const rs = data.users.map((u) => rec(u.id, c.id)).filter((r): r is CourseRecord => !!r);
      const done = rs.filter((r) => r.bucket === 'Completed').length;
      const going = rs.filter((r) => r.bucket === 'In progress').length;
      return [c.title, c.categories.join(', '), COUNTRY_SHORT[c.country], 'Published', c.modules.length, c.passPercent, rs.length, done, going, rs.length - done - going,
        rs.length ? Math.round((done / rs.length) * 100) : 0, rs.length ? Math.round(rs.reduce((a, r) => a + r.pct, 0) / rs.length) : 0];
    });
    return { name: `efkt-academy_kurs-sammendrag_${scopeSuffix(scope)}_${stamp}`, sheet: 'Kurs', head, rows };
  }

  const perCourseHead = ['Navn', 'E-post', 'Grupper', 'Land', 'Kurs', 'Kategori', 'Kursland', 'Status', 'Fremdrift %', 'Moduler bestått', 'Moduler totalt', 'Bestått ved %', 'Tilgang', 'Siste aktivitet'];
  const perCourse = (users: Completion['users']) =>
    users.flatMap((u) =>
      data.courses.flatMap((c) => {
        const r = rec(u.id, c.id);
        return r ? [[u.name, u.email, u.groups.join(', '), u.country, c.title, c.categories.join(', '), COUNTRY_SHORT[c.country], BUCKET_NO[r.bucket], r.pct, r.passed, r.total, c.passPercent, r.via, day(r.lastActivity)]] : [];
      }),
    );

  if (type === 'user' && opts.userId) {
    const user = data.users.find((u) => u.id === opts.userId);
    if (!user) return null;
    return { name: `efkt-academy_${slug(user.name)}_${stamp}`, sheet: 'Kurs', head: perCourseHead, rows: perCourse([user]) };
  }

  if (type === 'user') {
    const { shown } = trackRows(data, { ...filters, courseId: '' });
    const head = ['Navn', 'E-post', 'Rolle', 'Grupper', 'Land', 'Tildelte kurs', 'Fullført', 'I gang', 'Ikke startet', 'Fremdrift %', 'Fullføringsgrad %', 'Siste aktivitet', 'Sist innlogget'];
    const rows = shown.map(({ user: u }) => {
      const recs = data.courses.map((c) => rec(u.id, c.id)).filter((r): r is CourseRecord => !!r);
      const s = summarize(recs);
      return [u.name, u.email, ROLE_LABEL[u.role], u.groups.join(', '), u.country, recs.length, s.done, s.going, s.notStarted, s.pct,
        recs.length ? Math.round((s.done / recs.length) * 100) : 0, day(s.last), day(u.lastSeenAt)];
    });
    return { name: `efkt-academy_personer-sammendrag_${scopeSuffix(scope)}_${stamp}`, sheet: 'Personer', head, rows };
  }

  return { name: `efkt-academy_alle-kurs_per-person_${scopeSuffix(scope)}_${stamp}`, sheet: 'Per person', head: perCourseHead, rows: perCourse(data.users) };
}
