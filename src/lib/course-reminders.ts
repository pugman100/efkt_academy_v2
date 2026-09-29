import 'server-only';
import { db } from './db';
import { coursesForUser } from './access';
import { courseProgress } from './progress';
import { mailLayout, sendMail } from './email';
import { appUrl } from './tokens';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Reminders for assigned courses a person hasn't started, or started but not finished.
 * Stored in the `Setting` row with key `courseReminders`. Off until an admin turns it on.
 */
export type CourseReminderSettings = {
  enabled: boolean;
  /** Remind when a course hasn't been opened this many days after the person got it. */
  notStartedDays: number;
  /** Remind when a started course has had no progress for this many days. */
  stalledDays: number;
  /** Stop after this many reminders per course (reset when the person makes progress). */
  maxReminders: number;
};
export const COURSE_REMINDER_KEY = 'courseReminders';
const DEFAULTS: CourseReminderSettings = { enabled: false, notStartedDays: 7, stalledDays: 14, maxReminders: 3 };

export async function getCourseReminderSettings(): Promise<CourseReminderSettings> {
  const row = await db.setting.findUnique({ where: { key: COURSE_REMINDER_KEY } });
  return { ...DEFAULTS, ...((row?.value ?? {}) as Partial<CourseReminderSettings>) };
}

export async function saveCourseReminderSettings(patch: Partial<CourseReminderSettings>) {
  const next = { ...(await getCourseReminderSettings()), ...patch };
  await db.setting.upsert({ where: { key: COURSE_REMINDER_KEY }, create: { key: COURSE_REMINDER_KEY, value: next }, update: { value: next } });
  return next;
}

type DueCourse = { courseId: string; title: string; started: boolean; passed: number; total: number };
export type DueReminder = { userId: string; name: string; email: string; courses: DueCourse[] };

/**
 * Who is due a reminder now. Learners and team leads with an active, signed-up account;
 * published, non-reference courses they have and haven't completed.
 * With `record`, first sightings are stored so "not started" can count days from them.
 */
export async function findDueReminders(settings: CourseReminderSettings, opts: { record?: boolean; now?: Date } = {}): Promise<DueReminder[]> {
  const now = opts.now ?? new Date();
  const users = await db.user.findMany({
    where: { status: 'ACTIVE', role: { not: 'ADMIN' }, passwordHash: { not: null } },
    include: { groups: { select: { id: true, name: true } }, courseReminders: true },
  });
  const due: DueReminder[] = [];

  for (const user of users) {
    const list = await coursesForUser(user, { modules: { select: { id: true, quiz: { select: { id: true, retries: true, passPercent: true } } }, orderBy: { order: 'asc' } } });
    const courses = list.map((l) => l.course).filter((c) => !c.reference && c.modules.length > 0);
    if (!courses.length) continue;
    const rows = await db.progress.findMany({ where: { userId: user.id, moduleId: { in: courses.flatMap((c) => c.modules.map((m) => m.id)) } } });
    const seen = new Map(user.courseReminders.map((r) => [r.courseId, r]));
    const mine: DueCourse[] = [];

    for (const course of courses) {
      const p = courseProgress(course.modules, rows);
      if (p.complete) continue;
      let r = seen.get(course.id);
      if (!r) {
        // First time we see this person holding this course: start the clock now.
        r = { userId: user.id, courseId: course.id, firstSeenAt: now, remindersSent: 0, lastRemindedAt: null };
        if (opts.record) await db.courseReminder.create({ data: { userId: user.id, courseId: course.id, firstSeenAt: now } });
      }
      const ids = new Set(course.modules.map((m) => m.id));
      const activity = rows.filter((x) => ids.has(x.moduleId)).reduce<Date | null>((a, x) => (!a || x.updatedAt > a ? x.updatedAt : a), null);
      // Progress since the last reminder starts the count over.
      const sent = r.lastRemindedAt && activity && activity > r.lastRemindedAt ? 0 : r.remindersSent;
      if (sent >= settings.maxReminders) continue;
      const days = p.started ? settings.stalledDays : settings.notStartedDays;
      const since = [p.started ? activity : r.firstSeenAt, r.lastRemindedAt].reduce<Date | null>((a, d) => (d && (!a || d > a) ? d : a), null);
      if (!since || now.getTime() - since.getTime() < days * DAY) continue;
      mine.push({ courseId: course.id, title: course.title, started: p.started, passed: p.passed, total: p.total });
    }
    if (mine.length) due.push({ userId: user.id, name: user.name, email: user.email, courses: mine });
  }
  return due;
}

async function sendCourseReminder(r: DueReminder) {
  const first = r.name.split(' ')[0] || r.name;
  const lines = r.courses.map((c) => (c.started ? `${c.title} — ${c.passed} av ${c.total} moduler fullført` : `${c.title} — ikke startet`));
  const one = r.courses.length === 1;
  const url = appUrl('/');
  const body = [
    `Hei ${first},`,
    one ? 'Du har et kurs i EFKT Academy som venter på deg:' : `Du har ${r.courses.length} kurs i EFKT Academy som venter på deg:`,
    ...lines.map((l) => `• ${l}`),
    r.courses.some((c) => c.started) ? 'Du fortsetter der du slapp — det tar bare noen minutter å komme i gang igjen.' : 'Det tar bare noen minutter å komme i gang.',
  ];
  return sendMail({
    to: r.email,
    subject: one ? `Påminnelse: ${r.courses[0].title}` : 'Påminnelse: du har kurs som venter i EFKT Academy',
    text: [...body, `Gå til kursene: ${url}`, 'Hilsen EFKT Academy'].join('\n\n'),
    html: mailLayout({ heading: 'Kursene dine venter', body, cta: { label: 'Gå til kursene', url } }),
  });
}

/** Called by the daily cron job (and "Send now" in the admin). */
export async function processCourseReminders(opts: { force?: boolean } = {}) {
  const settings = await getCourseReminderSettings();
  if (!settings.enabled && !opts.force) return { enabled: false, people: 0, courses: 0, failed: [] as string[] };
  const due = await findDueReminders(settings, { record: true });
  const failed: string[] = [];
  let courses = 0;
  const now = new Date();
  for (const r of due) {
    const res = await sendCourseReminder(r);
    if (!res.ok) {
      failed.push(`${r.email}: ${res.error}`);
      continue;
    }
    courses += r.courses.length;
    for (const c of r.courses) {
      const row = await db.courseReminder.findUniqueOrThrow({ where: { userId_courseId: { userId: r.userId, courseId: c.courseId } } });
      const activity = await db.progress.findFirst({ where: { userId: r.userId, module: { courseId: c.courseId } }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } });
      const reset = row.lastRemindedAt && activity && activity.updatedAt > row.lastRemindedAt;
      await db.courseReminder.update({
        where: { userId_courseId: { userId: r.userId, courseId: c.courseId } },
        data: { remindersSent: (reset ? 0 : row.remindersSent) + 1, lastRemindedAt: now },
      });
    }
  }
  return { enabled: settings.enabled, people: due.length - failed.length, courses, failed };
}
