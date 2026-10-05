import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { COUNTRY_SHORT, ROLE_LABEL } from '@/lib/labels';
import { csv, xlsx, type Table } from '@/lib/spreadsheet';
import { appUrl } from '@/lib/tokens';
import { portfolioPath } from '@/lib/portfolio';
import { courseLines, loadProgress, loadPublishedCourses, summarise } from '@/components/admin/people/data';

export const dynamic = 'force-dynamic';

const Body = z.object({ format: z.enum(['csv', 'xlsx']), ids: z.array(z.string().min(1).max(64)).min(1).max(500) });
const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : '');

/** POST /api/admin/users/export { format: 'csv' | 'xlsx', ids: string[] } — the selected users, as in the Users list. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN' || session.impersonatorId) return new Response('Forbidden', { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new Response('Bad request', { status: 400 });
  const { format, ids } = parsed.data;

  const [users, courses] = await Promise.all([
    db.user.findMany({
      where: { id: { in: ids } },
      include: {
        groups: { select: { id: true, name: true }, orderBy: { createdAt: 'asc' } },
        region: { select: { name: true } },
        _count: { select: { portfolio: true } },
      },
      orderBy: { name: 'asc' },
    }),
    loadPublishedCourses(),
  ]);
  const progress = await loadProgress(users.map((u) => u.id));

  const table: Table = {
    name: `efkt-academy_brukere_${new Date().toISOString().slice(0, 10)}`,
    sheet: 'Brukere',
    head: ['Navn', 'E-post', 'Stilling', 'Rolle', 'Status', 'Grupper', 'Land', 'Region', 'Tildelte kurs', 'Fullført', 'Fremdrift %', 'Sist innlogget', 'Opprettet', 'Portefølje (bilder)', 'Portefølje-lenke'],
    rows: users.map((u) => {
      const s = summarise(courseLines(courses, u, progress));
      return [u.name, u.email, u.jobTitle, ROLE_LABEL[u.role], u.status === 'ACTIVE' ? 'Aktiv' : 'Deaktivert', u.groups.map((g) => g.name).join(', '),
        COUNTRY_SHORT[u.country], u.region?.name ?? '', s.assigned, s.done, s.pct, day(u.lastSeenAt), day(u.createdAt),
        u._count.portfolio, appUrl(portfolioPath(u.portfolioToken))];
    }),
  };

  const body = format === 'csv' ? csv(table) : await xlsx(table);
  return new Response(body, {
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv; charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${table.name}.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
}
