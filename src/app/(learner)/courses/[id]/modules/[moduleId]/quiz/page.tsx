import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseOptions } from '@/lib/blocks';
import { Quiz } from '@/components/learner/Quiz';
import { neededRight, shuffled } from '@/components/learner/quiz-shared';
import { attemptsLeft, loadCourse } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Quiz' };

export default async function QuizPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUser();
  const { course, progress, row } = await loadCourse(user, id);
  const item = progress.items.find((i) => i.module.id === moduleId);
  if (!item) notFound();
  const player = `/courses/${id}/modules/${moduleId}`;
  if (item.state === 'locked') redirect(`/courses/${id}`);
  if (!item.module.quiz) redirect(player);

  // The gate and the retry limit are enforced here and again when grading.
  const p = row.get(moduleId);
  const passed = item.state === 'passed';
  if (!passed && !(p && p.dwellSeconds >= item.module.minSeconds && p.confirmedAllSlides)) redirect(player);
  if (!passed && attemptsLeft(item.module.quiz, p?.attempts ?? 0) === 0) redirect(`/courses/${id}`);

  const quiz = await db.quiz.findUniqueOrThrow({ where: { id: item.module.quiz.id }, include: { questions: { orderBy: { order: 'asc' } } } });
  // Stable per attempt: the seed changes only when an attempt is recorded.
  const attemptNo = await db.quizAttempt.count({ where: { userId: user.id, quizId: quiz.id } });
  const seed = `${user.id}:${quiz.id}:${attemptNo}`;
  const qs = quiz.questions.map((q) => ({
    id: q.id,
    text: q.text,
    multi: q.multi,
    // Only option text and original index go to the client — never the `correct` flags.
    options: parseOptions(q.options).map((o, i) => ({ i, text: o.text })),
  }));
  const questions = quiz.shuffle
    ? shuffled(qs, seed).map((q) => ({ ...q, options: shuffled(q.options, seed + q.id) }))
    : qs;

  const next = progress.items[item.index + 1];
  return (
    <Quiz
      courseId={course.id}
      courseTitle={course.title}
      moduleId={moduleId}
      moduleTitle={item.module.title}
      passPercent={quiz.passPercent}
      needed={neededRight(questions.length, quiz.passPercent)}
      showFeedback={quiz.showFeedback}
      questions={questions}
      next={next ? { id: next.module.id, title: next.module.title } : null}
    />
  );
}
