import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { getScope, scopeLine } from '@/lib/scope';
import { ago, monthYear } from '@/lib/format';
import { countryMatches } from '@/lib/access';
import { COURSE_STATUS_LABEL } from '@/lib/labels';
import { courseLines, loadProgress, loadPublishedCourses, summarise, userScopeWhere } from '@/components/admin/people/data';
import { UsersView } from '@/components/admin/people/UsersView';
import type { UserDetail, UserRow } from '@/components/admin/people/types';
import '@/components/admin/people/people.css';

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ u?: string }> }) {
  const admin = await requireAdmin();
  const scope = await getScope();
  const { u: openId } = await searchParams;

  const [users, groups, regions, courses] = await Promise.all([
    db.user.findMany({
      where: userScopeWhere(scope),
      include: { groups: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' } }, region: { select: { name: true } } },
      orderBy: [{ createdAt: 'asc' }, { name: 'asc' }],
    }),
    db.group.findMany({ orderBy: { createdAt: 'asc' }, include: { users: { where: userScopeWhere(scope), select: { id: true } } } }),
    db.region.findMany({ orderBy: [{ country: 'asc' }, { order: 'asc' }] }),
    loadPublishedCourses(),
  ]);
  const progress = await loadProgress(users.map((u) => u.id));

  const summaries = new Map(users.map((u) => [u.id, summarise(courseLines(courses, u, progress))]));
  const rows: UserRow[] = users.map((u) => {
    const s = summaries.get(u.id)!;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      groupIds: u.groups.map((g) => g.id),
      groups: u.groups.map((g) => g.name).join(', ') || 'No group',
      country: u.country,
      region: u.region?.name ?? '',
      last: ago(u.lastSeenAt),
      off: u.status !== 'ACTIVE',
      ...s,
    };
  });

  const now = Date.now();
  const stats = [
    { label: 'Users', value: users.length, sub: scopeLine(scope) },
    { label: 'Never signed in', value: users.filter((u) => !u.lastSeenAt).length, sub: 'invitation not accepted' },
    { label: 'Active this week', value: users.filter((u) => u.lastSeenAt && now - u.lastSeenAt.getTime() < WEEK).length, sub: 'opened a course' },
    { label: 'Fully up to date', value: rows.filter((r) => r.assigned > 0 && r.pct === 100).length, sub: 'all assigned courses passed' },
  ];

  const detail = openId ? await loadDetail(openId, admin.id, courses) : null;

  return (
    <UsersView
      scopeLine={scopeLine(scope)}
      stats={stats}
      rows={rows}
      groups={groups.map((g) => ({ id: g.id, name: g.name, icon: g.icon, inScope: g.users.length }))}
      regions={regions.map((r) => ({ id: r.id, name: r.name, country: r.country }))}
      detail={detail}
    />
  );
}

async function loadDetail(id: string, adminId: string, courses: Awaited<ReturnType<typeof loadPublishedCourses>>): Promise<UserDetail | null> {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      groups: { select: { id: true, name: true } },
      directCourses: { select: { id: true, title: true, status: true, country: true } },
      resetTokens: { orderBy: { createdAt: 'desc' }, take: 1, select: { createdAt: true } },
    },
  });
  if (!user) return null;
  const [progress, all] = await Promise.all([
    loadProgress([user.id]),
    db.course.findMany({ where: { status: { not: 'ARCHIVED' } }, select: { id: true, title: true, status: true, country: true }, orderBy: { title: 'asc' } }),
  ]);
  const lines = courseLines(courses, user, progress);
  const visible = new Set(lines.map((l) => l.id));
  const direct = new Set(user.directCourses.map((c) => c.id));
  const active = user.status === 'ACTIVE';
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    jobTitle: user.jobTitle,
    role: user.role,
    country: user.country,
    regionId: user.regionId,
    active,
    groupIds: user.groups.map((g) => g.id),
    last: ago(user.lastSeenAt),
    joined: 'Joined ' + monthYear(user.createdAt),
    // Tracked courses first, reference material last.
    courses: [...lines].sort((a, b) => Number(a.reference) - Number(b.reference)),
    hiddenDirect: user.directCourses
      .filter((c) => !visible.has(c.id))
      .map((c) => ({
        id: c.id,
        title: c.title,
        why: c.status !== 'PUBLISHED' ? `${COURSE_STATUS_LABEL[c.status]} — not visible yet` : `Only for ${c.country}`,
      })),
    assignable: all.filter((c) => !direct.has(c.id) && countryMatches(c.country, user.country)).map((c) => ({ id: c.id, title: c.title, status: c.status })),
    resetSent: user.resetTokens[0] ? ago(user.resetTokens[0].createdAt).toLowerCase() : null,
    isSelf: user.id === adminId,
    canImpersonate: active && user.role !== 'ADMIN' && user.id !== adminId,
  };
}
