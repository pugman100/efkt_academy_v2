import 'server-only';
import type { Scope } from '@/lib/labels';
import { scopeWhere } from '@/lib/labels';
import { parseBlocks } from '@/lib/blocks';
import { db } from '@/lib/db';
import type { CourseOption, GroupOption, StoryData } from '@/components/admin/news/types';

/** Groups (with members inside the admin's country scope) and courses for the story editor. */
export async function loadEditorOptions(scope: Scope): Promise<{ groups: GroupOption[]; courses: CourseOption[] }> {
  const userWhere = scope === 'All' ? {} : { country: scope };
  const [groups, courses] = await Promise.all([
    db.group.findMany({ orderBy: { createdAt: 'asc' }, include: { _count: { select: { users: { where: userWhere } } } } }),
    db.course.findMany({
      where: { ...scopeWhere(scope), status: { not: 'ARCHIVED' } },
      orderBy: { title: 'asc' },
      include: { categories: { select: { name: true } } },
    }),
  ]);
  return {
    groups: groups.map((g) => ({ id: g.id, name: g.name, inScope: g._count.users })),
    courses: courses.map((c) => ({ id: c.id, title: c.title, description: c.description, categories: c.categories.map((k) => k.name).join(' · ') })),
  };
}

export async function loadStory(id: string): Promise<StoryData | null> {
  const s = await db.newsStory.findUnique({ where: { id }, include: { groups: { select: { id: true } } } });
  if (!s) return null;
  return {
    id: s.id,
    title: s.title,
    lead: s.lead,
    category: s.category,
    authorName: s.authorName,
    country: s.country,
    status: s.status,
    pinned: s.pinned,
    groupIds: s.groups.map((g) => g.id),
    hero: { imageId: s.heroId, x: s.heroX, y: s.heroY, scale: s.heroScale },
    publishAt: s.publishAt?.toISOString() ?? null,
    blocks: parseBlocks(s.blocks),
  };
}
