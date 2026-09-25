'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';

type Result = { ok: true } | { ok: false; error: string };

const CategoryInput = z.object({
  name: z.string().trim().min(1, 'Give the category a name').max(80),
  description: z.string().trim().max(500),
  icon: z.string().trim().max(60).regex(/^[a-z0-9-]*$/, 'Icon names are lowercase Phosphor names, e.g. camera'),
  groupIds: z.array(z.string().min(1).max(64)).max(200),
});

function refresh() {
  revalidatePath('/admin/categories');
  revalidatePath('/admin/courses', 'layout');
}

/** Creates (id = null) or updates a category. Group access changes are audited. */
export async function saveCategory(id: string | null, input: z.input<typeof CategoryInput>): Promise<Result> {
  const admin = await requireAdmin();
  const p = CategoryInput.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Invalid input' };
  const { name, description, icon, groupIds } = p.data;
  const clash = await db.category.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, NOT: id ? { id } : undefined } });
  if (clash) return { ok: false, error: `There is already a category called ${clash.name}` };

  const data = { name, description: description || 'No description yet.', icon: icon || 'squares-four', groups: { set: groupIds.map((g) => ({ id: g })) } };
  if (id) {
    const before = await db.category.findUnique({ where: { id }, select: { groups: { select: { id: true, name: true } } } });
    if (!before) return { ok: false, error: 'Category not found' };
    const cat = await db.category.update({ where: { id }, data, include: { groups: { select: { id: true, name: true } } } });
    const was = new Set(before.groups.map((g) => g.id));
    const now = new Set(groupIds);
    const added = cat.groups.filter((g) => !was.has(g.id)).map((g) => g.name);
    const removed = before.groups.filter((g) => !now.has(g.id)).map((g) => g.name);
    if (added.length || removed.length) await audit(admin.id, 'category.groups', { type: 'category', id }, { category: name, added, removed });
  } else {
    const last = await db.category.findFirst({ orderBy: { order: 'desc' }, select: { order: true } });
    const cat = await db.category.create({ data: { ...data, groups: { connect: groupIds.map((g) => ({ id: g })) }, order: (last?.order ?? -1) + 1 } });
    if (groupIds.length) await audit(admin.id, 'category.groups', { type: 'category', id: cat.id }, { category: name, added: groupIds, removed: [] });
  }
  refresh();
  return { ok: true };
}

/** Deletes a category. Courses stay; a course left without any category is refused. */
export async function deleteCategory(id: string): Promise<Result> {
  const admin = await requireAdmin();
  const cat = await db.category.findUnique({ where: { id }, include: { courses: { select: { title: true, _count: { select: { categories: true } } } } } });
  if (!cat) return { ok: false, error: 'Category not found' };
  const orphans = cat.courses.filter((c) => c._count.categories === 1);
  if (orphans.length)
    return { ok: false, error: `Move ${orphans.map((c) => '«' + c.title + '»').join(', ')} to another category first — a course needs at least one.` };
  await db.category.delete({ where: { id } });
  await audit(admin.id, 'category.delete', { type: 'category', id }, { name: cat.name });
  refresh();
  return { ok: true };
}
