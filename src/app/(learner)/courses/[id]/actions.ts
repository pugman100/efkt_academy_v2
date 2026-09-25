'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { canAccessCourse } from '@/lib/access';
import { db } from '@/lib/db';

const Id = z.string().min(1).max(64);
type Result = { ok: true } | { ok: false; error: string };

/** Resets one module and every module after it (later modules depend on it). */
export async function resetModule(courseId: string, moduleId: string): Promise<Result> {
  const user = await requireUser();
  const cid = Id.parse(courseId);
  const mid = Id.parse(moduleId);
  if (!(await canAccessCourse(user, cid))) return { ok: false, error: 'Du har ikke tilgang til kurset.' };
  const mod = await db.module.findFirst({ where: { id: mid, courseId: cid }, select: { order: true } });
  if (!mod) return { ok: false, error: 'Fant ikke modulen.' };
  await db.progress.deleteMany({ where: { userId: user.id, module: { courseId: cid, order: { gte: mod.order } } } });
  revalidatePath(`/courses/${cid}`);
  revalidatePath('/');
  return { ok: true };
}

/** Resets all progress in a course. Quiz attempt history is kept for reporting. */
export async function resetCourse(courseId: string): Promise<Result> {
  const user = await requireUser();
  const cid = Id.parse(courseId);
  if (!(await canAccessCourse(user, cid))) return { ok: false, error: 'Du har ikke tilgang til kurset.' };
  await db.progress.deleteMany({ where: { userId: user.id, module: { courseId: cid } } });
  revalidatePath(`/courses/${cid}`);
  revalidatePath('/');
  return { ok: true };
}
