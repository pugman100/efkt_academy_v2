'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { processCourseReminders, saveCourseReminderSettings } from '@/lib/course-reminders';

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const Settings = z
  .object({
    enabled: z.boolean(),
    notStartedDays: z.number().int().min(1).max(90),
    stalledDays: z.number().int().min(1).max(90),
    maxReminders: z.number().int().min(1).max(10),
  })
  .partial();

export async function updateCourseReminderSettings(input: z.input<typeof Settings>): Promise<Result> {
  const admin = await requireAdmin();
  const p = Settings.safeParse(input);
  if (!p.success) return { ok: false, error: 'Invalid settings' };
  const next = await saveCourseReminderSettings(p.data);
  await audit(admin.id, 'reminders.settings', { type: 'setting', id: 'courseReminders' }, next);
  revalidatePath('/admin/completion');
  return { ok: true };
}

/** Sends the reminders that are due right now, without waiting for the daily run. */
export async function sendCourseRemindersNow(): Promise<Result<{ people: number; courses: number }>> {
  const admin = await requireAdmin();
  const res = await processCourseReminders({ force: true });
  await audit(admin.id, 'reminders.send', { type: 'setting', id: 'courseReminders' }, { people: res.people, courses: res.courses, failed: res.failed.length });
  revalidatePath('/admin/completion');
  if (res.failed.length && !res.people) return { ok: false, error: `Could not send: ${res.failed[0]}` };
  return { ok: true, people: res.people, courses: res.courses };
}
