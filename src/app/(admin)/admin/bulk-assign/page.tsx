import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getScope, scopeLine } from '@/lib/scope';
import { scopeWhere } from '@/lib/labels';
import { loadPublishedCourses, reachable } from '@/components/admin/people/data';
import { BulkAssign } from '@/components/admin/people/BulkAssign';
import '@/components/admin/people/people.css';

export default async function BulkAssignPage() {
  await requireAdmin();
  const scope = await getScope();

  const [everyone, groups, courses, published] = await Promise.all([
    // Group assignments reach members in every country, so the preview needs them all.
    db.user.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, name: true, country: true, groups: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    db.group.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, name: true, icon: true } }),
    db.course.findMany({
      where: { status: { not: 'ARCHIVED' }, ...scopeWhere(scope) },
      select: { id: true, title: true, status: true, country: true, reference: true, categories: { select: { name: true } } },
      orderBy: { title: 'asc' },
    }),
    loadPublishedCourses(),
  ]);

  // Who can already open each course, so the preview only counts real changes.
  const access: Record<string, string[]> = {};
  for (const u of everyone) for (const { course } of reachable(published, u)) (access[course.id] ??= []).push(u.id);

  const inScope = new Set(everyone.filter((u) => scope === 'All' || u.country === scope).map((u) => u.id));

  return (
    <BulkAssign
      scopeLine={scopeLine(scope)}
      users={everyone.map((u) => ({ id: u.id, name: u.name, country: u.country, groupIds: u.groups.map((g) => g.id), groups: u.groups.map((g) => g.name).join(', '), inScope: inScope.has(u.id) }))}
      groups={groups}
      courses={courses.map((c) => ({ id: c.id, title: c.title, status: c.status, country: c.country, reference: c.reference, category: c.categories.map((k) => k.name).join(' · ') }))}
      access={access}
    />
  );
}
