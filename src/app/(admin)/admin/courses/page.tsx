import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { scopeWhere } from '@/lib/labels';
import { ago } from '@/lib/format';
import { CourseList, type CourseRow } from '@/components/admin/courses/CourseList';

export const metadata: Metadata = { title: 'Course library' };

export default async function CoursesPage() {
  await requireAdmin();
  const scope = await getScope();
  const [courses, categories] = await Promise.all([
    db.course.findMany({
      where: scopeWhere(scope),
      orderBy: { updatedAt: 'desc' },
      include: {
        categories: { select: { name: true }, orderBy: { order: 'asc' } },
        _count: { select: { modules: true, groups: true, users: true } },
      },
    }),
    db.category.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
  ]);

  const rows: CourseRow[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    categories: c.categories.map((k) => k.name),
    country: c.country,
    modules: c._count.modules,
    groups: c._count.groups,
    users: c._count.users,
    status: c.status,
    updated: ago(c.updatedAt),
  }));

  return (
    <CourseList
      rows={rows}
      categories={categories}
      scopeLine={scopeLine(scope)}
      defaultCountry={scope === 'All' ? 'Both' : scope}
    />
  );
}
