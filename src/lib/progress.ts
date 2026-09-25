// Course progress. Modules unlock in order: module N+1 is locked until module N's
// quiz is passed (or N has no quiz and was opened). Completion = passed / total.

export type ModuleState = 'locked' | 'available' | 'started' | 'failed' | 'passed';

type ModuleLike = { id: string; quiz?: { id: string; retries: number; passPercent: number } | null };
type ProgressLike = {
  moduleId: string;
  seenAt: Date | null;
  passed: boolean;
  attempts: number;
  bestScore: number | null;
  lastScore: number | null;
};

export type ModuleProgress<M> = {
  module: M;
  index: number;
  state: ModuleState;
  progress: ProgressLike | null;
  /** Remaining quiz attempts, or null when unlimited / no quiz. */
  attemptsLeft: number | null;
};

export function courseProgress<M extends ModuleLike>(modules: M[], rows: ProgressLike[]) {
  const byId = new Map(rows.map((r) => [r.moduleId, r]));
  let unlocked = true;
  const items: ModuleProgress<M>[] = modules.map((m, index) => {
    const p = byId.get(m.id) ?? null;
    let state: ModuleState;
    if (!unlocked) state = 'locked';
    else if (p?.passed) state = 'passed';
    else if (p && m.quiz && p.attempts > 0 && p.lastScore !== null && p.lastScore < m.quiz.passPercent) state = 'failed';
    else if (p?.seenAt) state = 'started';
    else state = 'available';
    const attemptsLeft = m.quiz && m.quiz.retries > 0 ? Math.max(0, m.quiz.retries - (p?.attempts ?? 0)) : null;
    unlocked = state === 'passed';
    return { module: m, index, state, progress: p, attemptsLeft };
  });
  const passed = items.filter((i) => i.state === 'passed').length;
  const total = modules.length;
  const current = items.find((i) => i.state !== 'passed' && i.state !== 'locked') ?? null;
  const started = rows.some((r) => r.seenAt);
  return {
    items,
    passed,
    total,
    pct: total ? Math.round((passed / total) * 100) : 0,
    complete: total > 0 && passed === total,
    started,
    current,
  };
}
