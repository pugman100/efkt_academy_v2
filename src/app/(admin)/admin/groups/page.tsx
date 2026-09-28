import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getScope, scopeLine } from '@/lib/scope';
import { scopeWhere } from '@/lib/labels';
import { userScopeWhere } from '@/components/admin/people/data';
import { GroupsView, type GroupCard, type GroupPanelData } from '@/components/admin/people/GroupsView';
import '@/components/admin/people/people.css';

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  await requireAdmin();
  const scope = await getScope();
  const { g: openId } = await searchParams;

  const [groups, users, courses, categories] = await Promise.all([
    db.group.findMany({ orderBy: { createdAt: 'asc' }, include: { users: { select: { id: true } } } }),
    db.user.findMany({
      where: userScopeWhere(scope),
      select: { id: true, name: true, country: true, jobTitle: true, groups: { select: { id: true, name: true } } },
      orderBy: { name: 'asc' },
    }),
    db.course.findMany({
      where: { status: { not: 'ARCHIVED' }, ...scopeWhere(scope) },
      select: { id: true, title: true, status: true, country: true, groups: { select: { id: true } }, categories: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    db.category.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true, groups: { select: { id: true } } } }),
  ]);

  const members = (groupId: string) => users.filter((u) => u.groups.some((g) => g.id === groupId));

  const cards: GroupCard[] = groups.map((g) => {
    const inGroup = members(g.id);
    const grantingCats = new Set(categories.filter((c) => c.groups.some((x) => x.id === g.id)).map((c) => c.id));
    const direct = courses.filter((c) => c.groups.some((x) => x.id === g.id));
    const viaCat = courses
      .filter((c) => !c.groups.some((x) => x.id === g.id))
      .map((c) => ({ c, via: c.categories.filter((k) => grantingCats.has(k.id)).map((k) => k.name) }))
      .filter((x) => x.via.length);
    return {
      id: g.id,
      name: g.name,
      description: g.description,
      icon: g.icon,
      members: inGroup.map((u) => ({ id: u.id, name: u.name, country: u.country })),
      allMemberIds: g.users.map((u) => u.id),
      direct: direct.length,
      viaCategory: viaCat.length,
      courses: [...direct.map((c) => ({ id: c.id, title: c.title, via: 'Direct' })), ...viaCat.map((x) => ({ id: x.c.id, title: x.c.title, via: x.via.join(', ') }))],
    };
  });

  const open = groups.find((g) => g.id === openId);
  const panel: GroupPanelData | null = open
    ? {
        id: open.id,
        name: open.name,
        icon: open.icon,
        members: members(open.id).map((u) => ({
          id: u.id,
          name: u.name,
          country: u.country,
          otherGroups: u.groups.filter((x) => x.id !== open.id).map((x) => x.name).join(', ') || 'No other groups',
        })),
        addable: users.filter((u) => !u.groups.some((x) => x.id === open.id)).map((u) => ({ id: u.id, name: u.name })),
        courses: courses
          .filter((c) => c.groups.some((x) => x.id === open.id))
          .map((c) => ({ id: c.id, title: c.title, category: c.categories.map((k) => k.name).join(' · '), status: c.status })),
        categories: categories.filter((c) => c.groups.some((x) => x.id === open.id)).map((c) => c.name),
      }
    : null;

  return (
    <GroupsView
      scope={scope}
      scopeLine={scopeLine(scope)}
      cards={cards}
      people={users.map((u) => ({ id: u.id, name: u.name, country: u.country }))}
      panel={panel}
    />
  );
}
