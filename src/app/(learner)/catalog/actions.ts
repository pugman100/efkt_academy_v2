'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

/** Self-enrol in a published, self-enrol course for the learner's country. */
export async function enrol(courseId: string): Promise<{ ok: true; title: string } | { ok: false; error: string }> {
  const user = await requireUser();
  const id = z.string().min(1).max(64).parse(courseId);
  const course = await db.course.findFirst({
    where: { id, status: 'PUBLISHED', selfEnrol: true, country: { in: [user.country, 'Both'] } },
    select: { id: true, title: true },
  });
  if (!course) return { ok: false, error: 'Kurset er ikke åpent for påmelding.' };
  await db.enrolment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    create: { userId: user.id, courseId: course.id },
    update: {},
  });
  revalidatePath('/', 'layout');
  return { ok: true, title: course.title };
}
