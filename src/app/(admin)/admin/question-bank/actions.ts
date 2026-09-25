'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parseQuestionCsv } from '@/components/admin/courses/csv';

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const BankInput = z
  .object({
    categoryId: z.string().min(1).max(64).nullable(),
    text: z.string().trim().min(1, 'Write the question first').max(1000),
    multi: z.boolean(),
    options: z
      .array(z.object({ text: z.string().trim().min(1, 'Every option needs text').max(500), correct: z.boolean() }))
      .min(2, 'A question needs at least two options')
      .max(6, 'Six options is the maximum'),
  })
  .refine((q) => q.options.some((o) => o.correct), { message: 'Mark at least one correct answer' });

export async function saveBankQuestion(id: string | null, input: z.input<typeof BankInput>): Promise<Result> {
  await requireAdmin();
  const p = BankInput.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? 'Invalid input' };
  if (id) await db.bankQuestion.update({ where: { id }, data: p.data });
  else await db.bankQuestion.create({ data: p.data });
  revalidatePath('/admin/question-bank');
  return { ok: true };
}

/** Quizzes keep their own copy of the question, so deleting from the bank changes no quiz. */
export async function deleteBankQuestion(id: string): Promise<Result> {
  await requireAdmin();
  await db.bankQuestion.delete({ where: { id } });
  revalidatePath('/admin/question-bank');
  return { ok: true };
}

/** CSV import (format in components/admin/courses/csv.ts). Unknown categories are created. */
export async function importBankCsv(csv: string): Promise<Result<{ imported: number; errors: string[] }>> {
  await requireAdmin();
  if (csv.length > 2_000_000) return { ok: false, error: 'The file is too large (max 2 MB).' };
  const { questions, errors } = parseQuestionCsv(csv);
  if (!questions.length) return { ok: false, error: errors[0] ?? 'The file has no questions.' };

  const cats = await db.category.findMany({ select: { id: true, name: true } });
  const byName = new Map(cats.map((c) => [c.name.toLowerCase(), c.id]));
  let order = (await db.category.findFirst({ orderBy: { order: 'desc' }, select: { order: true } }))?.order ?? 0;
  for (const q of questions) {
    const key = q.category.toLowerCase();
    if (key && !byName.has(key)) {
      const c = await db.category.create({ data: { name: q.category, order: ++order } });
      byName.set(key, c.id);
    }
  }
  await db.bankQuestion.createMany({
    data: questions.map((q) => ({ text: q.text, multi: q.multi, options: q.options, categoryId: byName.get(q.category.toLowerCase()) ?? null })),
  });
  revalidatePath('/admin/question-bank');
  revalidatePath('/admin/categories');
  return { ok: true, imported: questions.length, errors };
}
