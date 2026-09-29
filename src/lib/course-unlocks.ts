import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from './db';
import { gateModules, gateRows } from './access';
import { gate } from './prerequisites';
import { mailLayout, sendMail } from './email';
import { appUrl } from './tokens';

/** Everyone who has the course by the access rule (before the prerequisite check). */
function holdersOf(course: { id: string; country: 'Denmark' | 'Norway' | 'Both' }): Prisma.UserWhereInput {
  return {
    status: 'ACTIVE',
    passwordHash: { not: null },
    ...(course.country === 'Both' ? {} : { country: course.country }),
    OR: [
      { directCourses: { some: { id: course.id } } },
      { groups: { some: { courses: { some: { id: course.id } } } } },
      { groups: { some: { categories: { some: { courses: { some: { id: course.id } } } } } } },
      { enrolments: { some: { courseId: course.id } } },
    ],
  };
}

/**
 * Sends "Gratulerer! Ved å fullføre kurset «A» har du nå låst opp «B»." once per person and
 * course, when a prerequisite (plus any waiting days) has just unlocked a course.
 * Called right after a learner completes a module (for one person and the course they
 * worked on) and by the daily cron job (everyone; catches unlocks after waiting days).
 */
export async function notifyUnlocks(opts: { userId?: string; afterCourseId?: string } = {}) {
  const courses = await db.course.findMany({
    where: { status: 'PUBLISHED', prerequisiteId: opts.afterCourseId ?? { not: null } },
    select: { id: true, title: true, country: true, prerequisiteId: true, unlockDelayDays: true, prerequisiteSetAt: true, prerequisite: { select: { title: true } } },
  });
  let sent = 0;
  const failed: string[] = [];
  if (!courses.length) return { sent, failed };
  const modules = await gateModules(courses);
  const now = new Date();

  for (const course of courses) {
    const users = await db.user.findMany({
      where: { ...holdersOf(course), ...(opts.userId ? { id: opts.userId } : {}), courseUnlocks: { none: { courseId: course.id } } },
      select: { id: true, name: true, email: true },
    });
    for (const u of users) {
      const g = gate(course, modules, await gateRows(u.id, modules), now);
      if (!g.open || !g.notify) continue;
      const a = course.prerequisite?.title ?? '';
      const url = appUrl(`/courses/${course.id}`);
      const first = u.name.split(' ')[0] || u.name;
      const body = [`Hei ${first},`, `Gratulerer! Ved å fullføre kurset «${a}» har du nå låst opp «${course.title}».`, 'Kurset ligger klart under Mine kurs.'];
      // Record first so a retry never sends it twice.
      await db.courseUnlock.create({ data: { userId: u.id, courseId: course.id } });
      const res = await sendMail({
        to: u.email,
        subject: `Du har låst opp «${course.title}»`,
        text: [...body, `Gå til kurset: ${url}`, 'Hilsen EFKT Academy'].join('\n\n'),
        html: mailLayout({ heading: 'Gratulerer!', body, cta: { label: 'Gå til kurset', url } }),
      });
      if (res.ok) sent++;
      else failed.push(`${u.email}: ${res.error}`);
    }
  }
  return { sent, failed };
}
