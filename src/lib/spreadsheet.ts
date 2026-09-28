import 'server-only';
import ExcelJS from 'exceljs';

export type Cell = string | number;
export type Table = { name: string; sheet: string; head: string[]; rows: Cell[][] };

export function csv(t: Table): string {
  const esc = (v: string | number) => {
    // Neutralise spreadsheet formulas in user-provided text.
    const s = typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : String(v);
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // Semicolon + BOM so Excel opens it directly with æøå intact.
  return '﻿' + [t.head, ...t.rows].map((r) => r.map(esc).join(';')).join('\r\n') + '\r\n';
}

export async function xlsx(t: Table): Promise<ArrayBuffer> {
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
