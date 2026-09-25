'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession, requireUser, SESSION_COOKIE } from '@/lib/auth';
import { db } from '@/lib/db';
import { hashPassword, passwordOk, verifyPassword } from '@/lib/password';
import { hashToken } from '@/lib/tokens';

type Result = { ok: true } | { ok: false; error: string };

const Profile = z.object({
  name: z.string().trim().min(1, 'Navnet kan ikke være tomt').max(120),
  jobTitle: z.string().trim().max(120),
  phone: z.string().trim().max(40),
  bio: z.string().trim().max(280),
  photoId: z.string().min(1).max(64).nullable(),
});

export async function saveProfile(input: z.input<typeof Profile>): Promise<Result> {
  const user = await requireUser();
  const parsed = Profile.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Ugyldige verdier' };
  const data = parsed.data;
  if (data.photoId && data.photoId !== user.photoId) {
    const file = await db.fileUpload.findUnique({ where: { id: data.photoId }, select: { mimeType: true } });
    if (!file?.mimeType.startsWith('image/')) return { ok: false, error: 'Fant ikke bildet. Last det opp på nytt.' };
  }
  await db.user.update({ where: { id: user.id }, data });
  revalidatePath('/', 'layout');
  return { ok: true };
}

const Password = z.object({ current: z.string().min(1).max(200), next: z.string().min(1).max(200), repeat: z.string().max(200) });

/** Changes the password and signs out every other session of this user. */
export async function changePassword(input: z.input<typeof Password>): Promise<Result> {
  const user = await requireUser();
  const session = await getSession();
  if (session?.impersonatorId) return { ok: false, error: 'Passordet kan ikke endres mens du ser kontoen som en annen bruker.' };
  const parsed = Password.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Skriv inn det nåværende passordet' };
  const { current, next, repeat } = parsed.data;
  if (!passwordOk(next)) return { ok: false, error: 'Det nye passordet oppfyller ikke kravene' };
  if (next !== repeat) return { ok: false, error: 'Passordene er ikke like' };
  const row = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(current, row.passwordHash))) return { ok: false, error: 'Det nåværende passordet er feil' };

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } }),
    db.session.deleteMany({ where: { userId: user.id, ...(token ? { id: { not: hashToken(token) } } : {}) } }),
    db.passwordReset.deleteMany({ where: { userId: user.id, usedAt: null } }),
  ]);
  return { ok: true };
}
