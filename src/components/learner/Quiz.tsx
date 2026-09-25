'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitQuiz, type QuizResult } from '@/app/(learner)/courses/[id]/modules/[moduleId]/quiz/actions';

type Q = { id: string; text: string; multi: boolean; options: { i: number; text: string }[] };

export type QuizProps = {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  passPercent: number;
  needed: number;
  showFeedback: boolean;
  questions: Q[];
  next: { id: string; title: string } | null;
};

const SECTION = { maxWidth: 820, boxSizing: 'border-box', width: '100%' } as const;

export function Quiz(props: QuizProps) {
  const { courseId, moduleId, next } = props;
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  // Freeze the question order for this attempt; a refresh after grading must not reshuffle it.
  const [qs, setQs] = useState(props.questions);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const count = qs.length;
  const answered = qs.filter((q) => (answers[q.id] ?? []).length > 0).length;
  const canSubmit = answered === count;
  const courseHref = `/courses/${courseId}`;
  const playerHref = `${courseHref}/modules/${moduleId}`;
  const isLast = !next;

  function pick(q: Q, i: number) {
    if (result) return;
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      return { ...a, [q.id]: q.multi ? (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]) : [i] };
    });
  }

  function submit() {
    if (!canSubmit) return toast('Svar på alle spørsmålene først');
    start(async () => {
      const res = await submitQuiz({ courseId, moduleId, answers });
      if (!res.ok) return toast(res.error, 'error');
      setResult(res.result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setQs(props.questions);
    router.refresh();
    window.scrollTo({ top: 0 });
  }

  const g = result;
  const left = g?.attemptsLeft ?? null;
  const canRetry = !!g && !g.passed && (left === null || left > 0);
  const outOfTries = !!g && !g.passed && left !== null && left <= 0;
  const r = g && {
    score: g.score + '%',
    line: `${g.right} av ${g.total} riktige`,
    heading: g.passed ? 'Bestått' : 'Ikke bestått',
    bg: g.passed ? 'var(--efkt-mint)' : 'var(--efkt-blush)',
    icon: g.passed ? 'check' : 'x',
    iconColor: g.passed ? 'var(--efkt-green)' : 'var(--efkt-coral)',
    body: g.passed ? `Modulen «${props.moduleTitle}» er fullført.` : `Du trengte ${props.needed} riktige. Gå gjennom modulen på nytt og prøv igjen.`,
    retryLine: g.passed
      ? ''
      : left === null
        ? 'Du kan prøve så mange ganger du vil.'
        : left > 0
          ? `Du har ${left} forsøk igjen.`
          : 'Du har brukt alle forsøkene på rad. Gå gjennom modulen på nytt, så nullstilles forsøkene.',
  };
  const reviewLabel = outOfTries ? 'Gå gjennom modulen på nytt' : 'Gå gjennom modulen';
  const nextHref = next ? `${courseHref}/modules/${next.id}` : courseHref;

  const actions = (compact: boolean) =>
    g ? (
      <>
        {g.passed && next ? (
          <ButtonLink href={nextHref} prefetch={false} iconRight="arrow-right">Neste: {next.title}</ButtonLink>
        ) : null}
        {g.passed && next && !compact ? <ButtonLink href={courseHref} variant="secondary">Tilbake til kursoversikten</ButtonLink> : null}
        {g.passed && isLast ? <ButtonLink href={courseHref} iconRight="check">Fullfør kurset</ButtonLink> : null}
        {canRetry ? <Button onClick={retry}>Prøv quizen igjen</Button> : null}
        {!g.passed ? (
          <ButtonLink href={playerHref} prefetch={false} variant="secondary" iconRight="arrow-counter-clockwise">{reviewLabel}</ButtonLink>
        ) : null}
        {!g.passed && !compact ? <ButtonLink href={courseHref} variant="secondary">Tilbake til kurset</ButtonLink> : null}
      </>
    ) : null;

  return (
    <>
      <section className="lr-x" style={{ ...SECTION, paddingTop: 40 }}>
        <Link href={courseHref} className="lr-coral" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'var(--efkt-coral)' }}>
          <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> {props.courseTitle}
        </Link>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', margin: '20px 0 12px' }}>Quiz · {props.moduleTitle}</div>
        <h1 className="lr-page-title" style={{ margin: '0 0 16px', fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
          Test din <span style={{ fontWeight: 800 }}>kunnskap</span>
        </h1>
        <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Du må ha {props.needed} av {count} riktige for å bestå. Består du, fullføres modulen «{props.moduleTitle}»
          {isLast ? ', og hele kurset er ferdig.' : ' og neste modul åpnes.'}
        </div>
      </section>

      {g && r ? (
        <section className="lr-x" style={{ ...SECTION, paddingTop: 32 }}>
          <div role="status" style={{ padding: 32, borderRadius: 20, background: r.bg, display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <span style={{ width: 56, height: 56, minWidth: 56, borderRadius: '50%', background: 'var(--efkt-white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: r.iconColor }}>
              <i className={`ph-bold ph-${r.icon}`} style={{ fontSize: 24 }} aria-hidden />
            </span>
            <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.045em' }}>{r.score}</span>
                <span style={{ fontSize: 20, fontWeight: 600 }}>{r.heading}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>{r.line} · bestått ved {props.passPercent}%</div>
              <div style={{ fontSize: 16, fontWeight: 300, textWrap: 'pretty' }}>{r.body}</div>
              {r.retryLine ? <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{r.retryLine}</div> : null}
              {g.passed && isLast ? (
                <div style={{ fontSize: 16, fontWeight: 600, textWrap: 'pretty' }}>Det var siste modul — kurset «{props.courseTitle}» er fullført.</div>
              ) : null}
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>{actions(false)}</div>
        </section>
      ) : null}

      <section className="lr-x" style={{ ...SECTION, paddingTop: 40, paddingBottom: 96, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {qs.map((q, n) => {
          const chosen = answers[q.id] ?? [];
          const qr = g?.questions[q.id];
          const reveal = !!qr?.correct;
          return (
            <div key={q.id} style={{ padding: 28, border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', background: 'var(--efkt-offwhite)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{n + 1}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', textWrap: 'pretty' }}>{q.text}</div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4 }}>{q.multi ? 'Flere riktige svar' : 'Ett riktig svar'}</div>
                </div>
                {qr ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: qr.ok ? 'var(--efkt-green)' : 'var(--efkt-coral)', whiteSpace: 'nowrap' }}>
                    <i className={`ph-bold ph-${qr.ok ? 'check-circle' : 'x-circle'}`} style={{ fontSize: 18 }} aria-hidden />
                    {qr.ok ? 'Riktig' : 'Feil'}
                  </span>
                ) : null}
              </div>
              <div role={q.multi ? 'group' : 'radiogroup'} aria-label={q.text} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((o) => {
                  const isChosen = chosen.includes(o.i);
                  const correct = reveal && qr!.correct!.includes(o.i);
                  const bg = reveal
                    ? correct ? 'var(--efkt-mint)' : isChosen ? 'var(--efkt-blush)' : 'var(--efkt-offwhite)'
                    : isChosen ? 'var(--efkt-mint)' : 'var(--efkt-offwhite)';
                  const icon = reveal
                    ? correct ? 'check-circle' : isChosen ? 'x-circle' : q.multi ? 'square' : 'circle'
                    : isChosen ? (q.multi ? 'check-square' : 'check-circle') : q.multi ? 'square' : 'circle';
                  const iconColor = reveal
                    ? correct ? 'var(--efkt-green)' : isChosen ? 'var(--efkt-coral)' : 'var(--efkt-muted)'
                    : isChosen ? 'var(--efkt-navy)' : 'var(--efkt-muted)';
                  return (
                    <button
                      key={o.i}
                      type="button"
                      role={q.multi ? 'checkbox' : 'radio'}
                      aria-checked={isChosen}
                      disabled={!!g}
                      onClick={() => pick(q, o.i)}
                      className="lr-opt"
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, border: 'none', borderRadius: 20, background: bg, cursor: g ? 'default' : 'pointer', fontFamily: 'var(--efkt-font)', fontSize: 16, fontWeight: 300, color: 'var(--text-body)', textAlign: 'left' }}
                    >
                      <i className={`ph-bold ph-${icon}`} style={{ fontSize: 22, color: iconColor, flexShrink: 0 }} aria-hidden />
                      <span style={{ minWidth: 0, flex: 1, textWrap: 'pretty' }}>{o.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {g && r ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, position: 'sticky', bottom: 24 }}>
            <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>{r.heading} · {r.score}</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{r.line}</span>
            </div>
            {actions(true)}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, position: 'sticky', bottom: 24 }}>
            <div style={{ minWidth: 0, flex: 1, fontSize: 16, fontWeight: 500 }}>{answered} av {count} besvart</div>
            <Button onClick={submit} iconRight="check" disabled={pending} aria-disabled={!canSubmit}>
              {pending ? 'Retter…' : canSubmit ? 'Lever svar' : 'Svar på alle spørsmålene'}
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
