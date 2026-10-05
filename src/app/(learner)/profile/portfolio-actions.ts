'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { removeImage, saveImage } from '@/lib/storage';
import { PORTFOLIO_MAX, portfolioPath } from '@/lib/portfolio';

type Result = { ok: true } | { ok: false; error: string };

const id = z.string().min(1).max(64);
// Pixel size measured in the browser after resizing; only used for layout.
const dims = z.object({ width: z.coerce.number().int().min(1).max(20000), height: z.coerce.number().int().min(1).max(20000) });

function refresh(token?: string) {
  revalidatePath('/profile');
  revalidatePath('/admin/users');
  if (token) revalidatePath(portfolioPath(token));
}

async function ownImage(userId: string, imageId: string) {
  if (!id.safeParse(imageId).success) return null;
  return db.portfolioImage.findFirst({ where: { id: imageId, userId } });
}

/** Adds one image (form fields: file, width, height) to the end of the signed-in user's portfolio. */
export async function addPortfolioImage(form: FormData): Promise<Result> {
  const user = await requireUser();
  const file = form.get('file');
  const d = dims.safeParse({ width: form.get('width'), height: form.get('height') });
  if (!(file instanceof File) || file.size === 0 || !d.success) return { ok: false, error: 'Velg et bilde.' };
  const count = await db.portfolioImage.count({ where: { userId: user.id } });
  if (count >= PORTFOLIO_MAX) return { ok: false, error: `Porteføljen har plass til ${PORTFOLIO_MAX} bilder. Slett et bilde først.` };
  let fileId: string;
  try {
    fileId = await saveImage(file);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Opplastingen feilet.' };
  }
  const last = await db.portfolioImage.findFirst({ where: { userId: user.id }, orderBy: { order: 'desc' }, select: { order: true } });
  await db.portfolioImage.create({ data: { userId: user.id, fileId, ...d.data, order: (last?.order ?? -1) + 1 } });
  refresh(user.portfolioToken);
  return { ok: true };
}

/** Swaps the photo in one portfolio slot, keeping its place. */
export async function replacePortfolioImage(imageId: string, form: FormData): Promise<Result> {
  const user = await requireUser();
  const image = await ownImage(user.id, imageId);
  const file = form.get('file');
  const d = dims.safeParse({ width: form.get('width'), height: form.get('height') });
  if (!image) return { ok: false, error: 'Fant ikke bildet.' };
  if (!(file instanceof File) || file.size === 0 || !d.success) return { ok: false, error: 'Velg et bilde.' };
  let fileId: string;
  try {
    fileId = await saveImage(file);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Opplastingen feilet.' };
  }
  await db.portfolioImage.update({ where: { id: image.id }, data: { fileId, ...d.data } });
  await removeImage(image.fileId).catch((e) => console.error('[portfolio] could not remove replaced image', e));
  refresh(user.portfolioToken);
  return { ok: true };
}

export async function deletePortfolioImage(imageId: string): Promise<Result> {
  const user = await requireUser();
  const image = await ownImage(user.id, imageId);
  if (!image) return { ok: false, error: 'Fant ikke bildet.' };
  await db.portfolioImage.delete({ where: { id: image.id } });
  await removeImage(image.fileId).catch((e) => console.error('[portfolio] could not remove deleted image', e));
  refresh(user.portfolioToken);
  return { ok: true };
}

/** Moves an image one place earlier (-1) or later (1). */
export async function movePortfolioImage(imageId: string, dir: -1 | 1): Promise<Result> {
  const user = await requireUser();
  const all = await db.portfolioImage.findMany({ where: { userId: user.id }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], select: { id: true } });
  const i = all.findIndex((x) => x.id === imageId);
  const j = i + (dir === -1 ? -1 : 1);
  if (i < 0 || j < 0 || j >= all.length) return { ok: true };
  [all[i], all[j]] = [all[j]!, all[i]!];
  await db.$transaction(all.map((x, order) => db.portfolioImage.update({ where: { id: x.id }, data: { order } })));
  refresh(user.portfolioToken);
  return { ok: true };
}

/** Issues a new link; the previous link stops working at once. */
export async function newPortfolioLink(): Promise<Result> {
  const user = await requireUser();
  const old = user.portfolioToken;
  await db.user.update({ where: { id: user.id }, data: { portfolioToken: randomBytes(16).toString('hex') } });
  refresh(old);
  return { ok: true };
}
