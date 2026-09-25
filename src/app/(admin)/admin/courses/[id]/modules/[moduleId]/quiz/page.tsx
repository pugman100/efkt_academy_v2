import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseOptions } from '@/lib/blocks';
import { QuizBuilder } from '@/components/admin/courses/QuizBuilder';

export const metadata: Metadata = { title: 'Quiz builder' };

export default async function QuizPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  await requireAdmin();
  const { id, moduleId } = await params;
  const mod = await db.module.findFirst({
    where: { id: moduleId, courseId: id },
    include: {
      course: { select: { id: true, title: true } },
      quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
    },
  });
  if (!mod) notFound();

  const [bank, sibling] = await Promise.all([
    db.bankQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } }, _count: { select: { uses: true } } },
    }),
    mod.quiz ? null : db.quiz.findFirst({ where: { module: { courseId: id } }, select: { passPercent: true } }),
  ]);
  const q = mod.quiz;

  return (
    <QuizBuilder
      moduleId={mod.id}
      moduleTitle={mod.title}
      course={mod.course}
      initial={{
        passPercent: q?.passPercent ?? sibling?.passPercent ?? 80,
        retries: q?.retries ?? 0,
        shuffle: q?.shuffle ?? true,
        showFeedback: q?.showFeedback ?? true,
        minSeconds: mod.minSeconds,
        questions: (q?.questions ?? []).map((x) => ({ id: x.id, text: x.text, multi: x.multi, options: parseOptions(x.options), bankItemId: x.bankItemId })),
      }}
      bank={bank.map((b) => ({
        id: b.id,
        text: b.text,
        multi: b.multi,
        options: parseOptions(b.options),
        category: b.category?.name ?? 'Uten kategori',
        uses: b._count.uses,
      }))}
    />
  );
}
