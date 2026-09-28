'use server';

import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { canAccessCourse } from '@/lib/access';
import { db } from '@/lib/db';

/** Client pings dwell every PING seconds while the tab is visible. */
const PING = 10;
const SLACK = 3;

const Input = z.object({
  moduleId: z.string().min(1).max(64),
  seconds: z.number().int().min(0).max(3600),
  confirm: z.boolean().optional(),
});

/**
 * Adds visible-tab seconds to the module's dwell time and optionally sets the
 * "Jeg har vært gjennom alle slidene" confirmation. The client is not trusted: each
 * increment is capped by the real time since the progress row was last written
 * (Progress.updatedAt) and by the ping interval, so parallel tabs or a tampered
 * client cannot add time faster than the clock.
 */
export async function syncModule(input: z.input<typeof Input>): Promise<{ ok: true; dwellSeconds: number; confirmed: boolean } | { ok: false; error: string }> {
  const user = await requireUser();
  const { moduleId, seconds, confirm } = Input.parse(input);
  const p = await db.progress.findUnique({
    where: { userId_moduleId: { userId: user.id, moduleId } },
    include: { module: { select: { courseId: true, minSeconds: true } } },
  });
  // A row with seenAt exists only once the (unlocked) module was opened.
  if (!p?.seenAt || !(await canAccessCourse(user, p.module.courseId))) return { ok: false, error: 'Modulen er ikke åpnet.' };

  const elapsed = Math.floor((Date.now() - p.updatedAt.getTime()) / 1000);
  const add = Math.max(0, Math.min(seconds, elapsed + SLACK, PING + SLACK));
  const dwellSeconds = p.dwellSeconds + add;
  let confirmed = p.confirmedAllSlides;
  if (confirm === false) confirmed = false;
  if (confirm === true && dwellSeconds >= p.module.minSeconds) confirmed = true;

  if (add > 0 || confirmed !== p.confirmedAllSlides) {
    await db.progress.update({ where: { id: p.id }, data: { dwellSeconds, confirmedAllSlides: confirmed } });
  }
  return { ok: true, dwellSeconds, confirmed };
}
