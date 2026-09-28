'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Country, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { NEWS_CATEGORIES } from '@/lib/labels';
import type { ActionResult, SaveStoryInput } from '@/components/admin/news/types';

const id = z.string().min(1).max(40);
const text = (max = 5000) => z.string().max(max);
const imageId = z.string().max(40).optional();

const blockSchema = z.discriminatedUnion('kind', [
  z.object({ id, kind: z.literal('heading'), text: text(300), fat: text(300).optional() }),
  z.object({ id, kind: z.literal('paragraph'), text: text() }),
  z.object({ id, kind: z.literal('image'), imageId, src: text(500).optional(), caption: text(300).optional(), hint: text(200).optional() }),
  z.object({ id, kind: z.literal('imagetext'), imageId, src: text(500).optional(), text: text(), side: z.enum(['left', 'right']), hint: text(200).optional() }),
  z.object({ id, kind: z.literal('quote'), text: text(1000), who: text(200).optional() }),
  z.object({ id, kind: z.literal('list'), items: text() }),
  z.object({ id, kind: z.literal('button'), label: text(100), url: text(1000) }),
  z.object({ id, kind: z.literal('divider') }),
  z.object({ id, kind: z.literal('course'), courseId: z.string().max(40) }),
]);

const storySchema = z.object({
  id: id.nullable(),
  intent: z.enum(['draft', 'publish', 'schedule']),
  title: z.string().trim().min(1, 'Give the story a title').max(200),
  lead: z.string().trim().max(1000),
  category: z.enum(NEWS_CATEGORIES as [string, ...string[]]),
  authorName: z.string().trim().max(120),
  country: z.enum(['Both', 'Denmark', 'Norway']),
  pinned: z.boolean(),
  groupIds: z.array(id).max(100),
  hero: z.object({ imageId: z.string().max(40).nullable(), x: z.number().min(0).max(100), y: z.number().min(0).max(100), scale: z.number().min(1).max(3) }),
  publishAt: z.string().datetime({ offset: true }).nullable(),
  blocks: z.array(blockSchema).max(200),
});

function revalidateNews() {
  revalidatePath('/admin/news', 'layout');
  // Learner dashboard + reader.
  revalidatePath('/', 'layout');
}

/** Only one pinned story per audience: pinning unpins others that reach the same country. */
async function unpinOthers(tx: Prisma.TransactionClient, keepId: string, country: Country) {
  const overlap: Prisma.NewsStoryWhereInput = country === 'Both' ? {} : { country: { in: [country, 'Both'] } };
  await tx.newsStory.updateMany({ where: { id: { not: keepId }, pinned: true, ...overlap }, data: { pinned: false } });
}

export async function saveStory(input: SaveStoryInput): Promise<ActionResult<{ id: string; message: string }>> {
  const admin = await requireAdmin();
  const parsed = storySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid story' };
  const d = parsed.data;

  const existing = d.id ? await db.newsStory.findUnique({ where: { id: d.id }, select: { status: true, publishAt: true } }) : null;
  if (d.id && !existing) return { ok: false, error: 'Story not found' };
  const wasPublished = existing?.status === 'PUBLISHED';

  let status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  let publishAt: Date | null;
  let message: string;
  if (d.intent === 'schedule') {
    publishAt = d.publishAt ? new Date(d.publishAt) : null;
    if (!publishAt || publishAt.getTime() <= Date.now()) return { ok: false, error: 'Pick a publish time in the future' };
    status = 'SCHEDULED';
    message = 'Story scheduled';
  } else if (d.intent === 'publish') {
    status = 'PUBLISHED';
    publishAt = wasPublished && existing?.publishAt ? existing.publishAt : new Date();
    message = wasPublished ? 'Story updated' : 'Story published';
  } else {
    status = 'DRAFT';
    publishAt = wasPublished ? existing?.publishAt ?? null : null;
    message = wasPublished ? 'Story unpublished — saved as a draft' : 'Saved as a draft';
  }

  const groups = await db.group.findMany({ where: { id: { in: d.groupIds } }, select: { id: true } });
  const data = {
    title: d.title,
    lead: d.lead || d.title,
    category: d.category,
    authorName: d.authorName,
    country: d.country,
    pinned: d.pinned,
    status,
    publishAt,
    heroId: d.hero.imageId,
    heroX: d.hero.x,
    heroY: d.hero.y,
    heroScale: d.hero.scale,
    blocks: d.blocks as Prisma.InputJsonValue,
  };

  const story = await db.$transaction(async (tx) => {
    const s = d.id
      ? await tx.newsStory.update({ where: { id: d.id }, data: { ...data, groups: { set: groups } } })
      : await tx.newsStory.create({ data: { ...data, groups: { connect: groups } } });
    if (s.pinned) await unpinOthers(tx, s.id, s.country);
    return s;
  });

  await audit(admin.id, `news.${status.toLowerCase()}`, { type: 'NewsStory', id: story.id }, { title: story.title });
  revalidateNews();
  return { ok: true, id: story.id, message };
}

export async function togglePin(storyId: string): Promise<ActionResult<{ pinned: boolean }>> {
  await requireAdmin();
  const s = await db.newsStory.findUnique({ where: { id: z.string().parse(storyId) } });
  if (!s) return { ok: false, error: 'Story not found' };
  await db.$transaction(async (tx) => {
    await tx.newsStory.update({ where: { id: s.id }, data: { pinned: !s.pinned } });
    if (!s.pinned) await unpinOthers(tx, s.id, s.country);
  });
  revalidateNews();
  return { ok: true, pinned: !s.pinned };
}

export async function duplicateStory(storyId: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const s = await db.newsStory.findUnique({ where: { id: z.string().parse(storyId) }, include: { groups: { select: { id: true } } } });
  if (!s) return { ok: false, error: 'Story not found' };
  const copy = await db.newsStory.create({
    data: {
      title: s.title + ' (kopi)', lead: s.lead, category: s.category, authorName: s.authorName, country: s.country,
      status: 'DRAFT', pinned: false, heroId: s.heroId, heroX: s.heroX, heroY: s.heroY, heroScale: s.heroScale,
      blocks: s.blocks as Prisma.InputJsonValue, groups: { connect: s.groups },
    },
  });
  revalidateNews();
  return { ok: true, id: copy.id };
}

export async function deleteStory(storyId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const s = await db.newsStory.findUnique({ where: { id: z.string().parse(storyId) }, select: { id: true, title: true } });
  if (!s) return { ok: false, error: 'Story not found' };
  await db.newsStory.delete({ where: { id: s.id } });
  await audit(admin.id, 'news.delete', { type: 'NewsStory', id: s.id }, { title: s.title });
  revalidateNews();
  return { ok: true };
}

/** Learner dashboard banner (stored in Setting "dashboardBanner" as a Crop). */
export async function saveDashboardBanner(crop: { imageId: string | null; x: number; y: number; scale: number }): Promise<ActionResult> {
  await requireAdmin();
  const c = z
    .object({ imageId: z.string().max(40).nullable(), x: z.number().min(0).max(100), y: z.number().min(0).max(100), scale: z.number().min(1).max(3) })
    .parse(crop);
  await db.setting.upsert({ where: { key: 'dashboardBanner' }, create: { key: 'dashboardBanner', value: c }, update: { value: c } });
  revalidateNews();
  return { ok: true };
}
