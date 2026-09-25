import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { scopeWhere } from '@/lib/labels';
import { CategoryCards, type CategoryCard } from '@/components/admin/courses/CategoryCards';

export const metadata: Metadata = { title: 'Course categories' };

export default async function CategoriesPage() {
  await requireAdmin();
  const scope = await getScope();
  const inScope = scope === 'All' ? {} : { country: scope };

  const [categories, groups, courseCount] = await Promise.all([
    db.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: {
        groups: { orderBy: { createdAt: 'asc' }, select: { id: true, name: true, users: { where: { status: 'ACTIVE', ...inScope }, select: { id: true } } } },
        courses: {
          where: scopeWhere(scope),
          orderBy: { title: 'asc' },
          select: { id: true, title: true, status: true, categories: { select: { id: true, name: true } } },
        },
      },
    }),
    db.group.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, name: true, _count: { select: { users: { where: { status: 'ACTIVE', ...inScope } } } } } }),
    db.course.count({ where: scopeWhere(scope) }),
  ]);

  const cards: CategoryCard[] = categories.map((k) => ({
    id: k.id,
    name: k.name,
    description: k.description,
    icon: k.icon,
    groups: k.groups.map((g) => ({ id: g.id, name: g.name })),
    reach: new Set(k.groups.flatMap((g) => g.users.map((u) => u.id))).size,
    courses: k.courses.map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      alsoIn: c.categories.filter((x) => x.id !== k.id).map((x) => x.name),
    })),
  }));

  return (
    <CategoryCards
      cards={cards}
      groups={groups.map((g) => ({ id: g.id, name: g.name, count: g._count.users }))}
      eyebrow={`${scopeLine(scope)} · ${categories.length} categories · ${courseCount} courses`}
    />
  );
}
