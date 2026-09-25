'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseOptions } from '@/lib/blocks';
import { attemptsLeft, loadCourse } from '@/components/learner/server';

const Input = z.object({
  courseId: z.string().min(1).max(64),
  moduleId: z.string().min(1).max(64),
  answers: z.record(z.string(), z.array(z.number().int().min(0).max(50)).max(50)),
});

export type QuizResult = {
  score: number;
  right: number;
  total: number;
  passed: boolean;
  attemptsLeft: number | null;
  /** Per question: right or wrong, plus the correct option indexes when feedback is on. */
  questions: Record<string, { ok: boolean; correct?: number[] }>;
};

/** Grades a quiz attempt on the server and updates the learner's progress. */
export async function submitQuiz(input: z.input<typeof Input>): Promise<{ ok: true; result: QuizResult } | { ok: false; error: string }> {
  const user = await requireUser();
  const { courseId, moduleId, answers } = Input.parse(input);
  const { progress, row } = await loadCourse(user, courseId);
  const item = progress.items.find((i) => i.module.id === moduleId);
  if (!item || !item.module.quiz) return { ok: false, error: 'Fant ikke quizen.' };
  if (item.state === 'locked') return { ok: false, error: 'Modulen er låst.' };
  const p = row.get(moduleId);
  const passedBefore = item.state === 'passed';
  if (!passedBefore && !(p && p.dwellSeconds >= item.module.minSeconds && p.confirmedAllSlides))
    return { ok: false, error: 'Gå gjennom modulen før du tar quizen.' };
  if (!passedBefore && attemptsLeft(item.module.quiz, p?.attempts ?? 0) === 0)
    return { ok: false, error: 'Ingen forsøk igjen — gå gjennom modulen på nytt først.' };

  const quiz = await db.quiz.findUniqueOrThrow({ where: { id: item.module.quiz.id }, include: { questions: { orderBy: { order: 'asc' } } } });
  const graded: QuizResult['questions'] = {};
  let right = 0;
  for (const q of quiz.questions) {
    const opts = parseOptions(q.options);
    const correct = opts.flatMap((o, i) => (o.correct ? [i] : []));
    const chosen = [...new Set(answers[q.id] ?? [])];
    const ok = chosen.length === correct.length && correct.every((i) => chosen.includes(i));
    if (ok) right++;
    graded[q.id] = quiz.showFeedback ? { ok, correct } : { ok };
  }
  const total = quiz.questions.length;
  const score = total ? Math.round((right / total) * 100) : 0;
  const passed = score >= quiz.passPercent;
  const attempts = (p?.attempts ?? 0) + 1;
  const now = new Date();

  await db.$transaction([
    db.quizAttempt.create({ data: { userId: user.id, quizId: quiz.id, score, passed, answers } }),
    db.progress.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId } },
      create: { userId: user.id, moduleId, seenAt: now, attempts, lastScore: score, bestScore: score, passed, passedAt: passed ? now : null },
      update: {
        attempts,
        lastScore: score,
        bestScore: Math.max(score, p?.bestScore ?? 0),
        ...(passed && !p?.passed ? { passed: true, passedAt: now } : {}),
      },
    }),
  ]);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/');
  return {
    ok: true,
    result: { score, right, total, passed, questions: graded, attemptsLeft: passed ? null : attemptsLeft(quiz, attempts) },
  };
}
