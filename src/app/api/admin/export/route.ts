import ExcelJS from 'exceljs';
import { getSession } from '@/lib/auth';
import { getScope } from '@/lib/scope';
import { loadCompletion, readFilters } from '@/components/admin/tracking/completion-data';
import { buildTable, type ExportType, type Table } from '@/components/admin/tracking/export-tables';

export const dynamic = 'force-dynamic';

function csv(t: Table): string {
  const esc = (v: string | number) => {
    // Neutralise spreadsheet formulas in user-provided text.
    const s = typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // Semicolon + BOM so Excel opens it directly with æøå intact.
  return '﻿' + [t.head, ...t.rows].map((r) => r.map(esc).join(';')).join('\r\n') + '\r\n';
}

async function xlsx(t: Table): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'EFKT Academy';
  wb.created = new Date();
  const ws = wb.addWorksheet(t.sheet, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.addRow(t.head);
  t.rows.forEach((r) => ws.addRow(r));
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF373B54' } };
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: t.head.length } };
  ws.columns.forEach((col, i) => {
    const longest = Math.max(t.head[i].length, ...t.rows.map((r) => String(r[i] ?? '').length));
    col.width = Math.min(48, Math.max(10, longest + 2));
  });
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

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
