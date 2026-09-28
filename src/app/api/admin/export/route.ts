import { getSession } from '@/lib/auth';
import { getScope } from '@/lib/scope';
import { loadCompletion, readFilters } from '@/components/admin/tracking/completion-data';
import { buildTable, type ExportType } from '@/components/admin/tracking/export-tables';
import { csv, xlsx } from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';

/** GET /api/admin/export?format=csv|xlsx&type=course|user|all[&courseId][&userId][&group&status&q] */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'ADMIN' || session.impersonatorId) return new Response('Forbidden', { status: 403 });

  const sp = new URL(req.url).searchParams;
  const format = sp.get('format') === 'xlsx' ? 'xlsx' : sp.get('format') === 'csv' ? 'csv' : null;
  const type = (['course', 'user', 'all'] as const).find((t) => t === sp.get('type')) as ExportType | undefined;
  if (!format || !type) return new Response('Bad request: format=csv|xlsx and type=course|user|all are required', { status: 400 });

  const courseId = sp.get('courseId') ?? undefined;
  const userId = sp.get('userId') ?? undefined;
  // A single person's export covers all their courses regardless of the country switcher.
  const scope = type === 'user' && userId ? 'All' : await getScope();
  const data = await loadCompletion(scope);
  const table = buildTable(data, type, { courseId, userId, scope, filters: readFilters(Object.fromEntries(sp)) });
  if (!table) return new Response('Not found', { status: 404 });

  const body = format === 'csv' ? csv(table) : await xlsx(table);
  const contentType = format === 'csv' ? 'text/csv; charset=utf-8' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${table.name}.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
}
