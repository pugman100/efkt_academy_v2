// CSV import of quiz questions (question bank and quiz builder share one format).
//
//   category,question,multi,option1,correct1,option2,correct2,...
//
// - The header row is optional (detected when the first cell is "category").
// - `multi` and `correctN` accept yes/no, true/false, 1/0, x (empty = no).
// - 2–6 options per question; at least one must be correct. A single-choice question
//   with several correct answers is imported as multi-choice.
// - Separator is a comma or semicolon (Excel in DK/NO exports semicolons); quote cells
//   containing the separator with double quotes.

export const CSV_HEADER = 'category,question,multi,option1,correct1,option2,correct2,option3,correct3,option4,correct4';
export const CSV_EXAMPLE = `${CSV_HEADER}
Foto,Hvilken hvitbalanse brukes ved blandet lys?,no,Auto,no,Manuell måling med gråkort,yes,Dagslys 5500K,no
Drone,Hva må sjekkes før hver flytur?,yes,Batteri,yes,Luftromsrestriksjoner,yes,Kundens favorittfarge,no`;

export type CsvQuestion = { category: string; text: string; multi: boolean; options: { text: string; correct: boolean }[] };
export type CsvResult = { questions: CsvQuestion[]; errors: string[] };

function splitRows(src: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim()));
}

const truthy = (s: string) => /^(y|yes|ja|j|true|1|x)$/i.test(s.trim());

export function parseQuestionCsv(input: string): CsvResult {
  const src = input.replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
  const rows = splitRows(src, sep);
  if (rows[0] && rows[0][0]?.trim().toLowerCase() === 'category') rows.shift();

  const questions: CsvQuestion[] = [];
  const errors: string[] = [];
  rows.forEach((r, idx) => {
    const line = idx + 1;
    const [category = '', text = '', multi = '', ...rest] = r.map((c) => c.trim());
    const options: CsvQuestion['options'] = [];
    for (let i = 0; i < rest.length; i += 2) if (rest[i]) options.push({ text: rest[i], correct: truthy(rest[i + 1] ?? '') });
    if (!text) return errors.push(`Row ${line}: the question is empty.`);
    if (options.length < 2 || options.length > 6) return errors.push(`Row ${line}: needs 2–6 options (found ${options.length}).`);
    const correct = options.filter((o) => o.correct).length;
    if (!correct) return errors.push(`Row ${line}: no option is marked correct.`);
    questions.push({ category, text, multi: truthy(multi) || correct > 1, options });
  });
  return { questions, errors };
}
