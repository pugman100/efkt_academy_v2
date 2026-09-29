import type { Prisma, Role } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope } from '@/lib/scope';
import { ROLE_LABEL, ROLES } from '@/lib/labels';
import { EQUIPMENT_FIELDS } from '@/lib/equipment';
import { xlsx, type Table } from '@/lib/spreadsheet';
import { userScopeWhere } from '@/components/admin/people/data';

export const dynamic = 'force-dynamic';

const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');

/**
 * GET /api/admin/users-export?q=&group=&role=&status=active|off|all
 * XLSX of every user in the segment shown in Admin → Users (same filters, plus the
 * country switcher), with all profile fields.
 */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN' || session.impersonatorId) return new Response('Forbidden', { status: 403 });

  const sp = new URL(req.url).searchParams;
  const q = (sp.get('q') ?? '').trim().slice(0, 200);
  const group = sp.get('group') ?? 'all';
  const role = ROLES.find((r) => r === sp.get('role')) as Role | undefined;
  const status = sp.get('status') ?? 'active';

  const where: Prisma.UserWhereInput = {
    ...userScopeWhere(await getScope()),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}),
    ...(group !== 'all' ? { groups: { some: { id: group } } } : {}),
    ...(role ? { role } : {}),
    ...(status === 'active' ? { status: 'ACTIVE' } : status === 'off' ? { status: 'DEACTIVATED' } : {}),
  };
  const users = await db.user.findMany({
    where,
    include: { groups: { select: { name: true }, orderBy: { createdAt: 'asc' } }, region: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  const table: Table = {
    name: `efkt-brukere-${day(new Date())}`,
    sheet: 'Brukere',
    head: ['Navn', 'E-post', 'Rolle', 'Land', 'Region', 'Grupper', 'Stilling og sted', 'Mobil', 'Kort om deg', ...EQUIPMENT_FIELDS.map((f) => f.label), 'Status', 'Opprettet', 'Sist innlogget'],
    rows: users.map((u) => [
      u.name, u.email, ROLE_LABEL[u.role], u.country, u.region?.name ?? '', u.groups.map((g) => g.name).join(', '),
      u.jobTitle, u.phone, u.bio, ...EQUIPMENT_FIELDS.map((f) => u[f.key]),
      u.status === 'ACTIVE' ? 'Aktiv' : 'Deaktivert', day(u.createdAt), day(u.lastSeenAt),
    ]),
  };

  return new Response(await xlsx(table), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${table.name}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  });
}
