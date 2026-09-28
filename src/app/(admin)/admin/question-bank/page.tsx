import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseOptions } from '@/lib/blocks';
import { QuestionBank } from '@/components/admin/courses/QuestionBank';

export const metadata: Metadata = { title: 'Question bank' };

export default async function QuestionBankPage() {
  await requireAdmin();
  const [questions, categories] = await Promise.all([
    db.bankQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } }, _count: { select: { uses: true } } },
    }),
    db.category.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }], select: { id: true, name: true } }),
  ]);

  return (
    <QuestionBank
      categories={categories}
      questions={questions.map((q) => ({
        id: q.id,
        text: q.text,
        multi: q.multi,
        options: parseOptions(q.options),
        categoryId: q.categoryId,
        category: q.category?.name ?? null,
        uses: q._count.uses,
      }))}
    />
  );
}
