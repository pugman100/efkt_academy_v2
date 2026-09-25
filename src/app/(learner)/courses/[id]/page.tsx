import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Photo } from '@/components/ui/Photo';
import { ResetCourse, ResetModuleButton } from '@/components/learner/ResetControls';
import { attemptsLeft, courseThumb, loadCourse, splitLast } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Kurs' };

export default async function CourseOverview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { course: c, progress, row, category } = await loadCourse(user, id);
  const t = splitLast(c.title);
  const passPercents = c.modules.flatMap((m) => (m.quiz ? [m.quiz.passPercent] : []));
  const pass = passPercents.length ? Math.max(...passPercents) : null;
  const anyDone = progress.items.some((i) => i.progress);
  const moduleHref = (mid: string) => `/courses/${c.id}/modules/${mid}`;

  return (
    <>
      <section style={{ position: 'relative', height: 440, overflow: 'hidden' }}>
        <Photo {...courseThumb(c)} style={{ position: 'absolute', inset: 0 }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(12,14,57,0.55) 0%, rgba(12,14,57,0.20) 40%, rgba(12,14,57,0.85) 100%)',
          }}
        />
        <div
          className="lr-x"
          style={{
            position: 'relative',
            height: '100%',
            paddingTop: 32,
            paddingBottom: 48,
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 900,
            boxSizing: 'border-box',
          }}
        >
          <Link href="/" className="lr-back">
            <i className="ph ph-arrow-left" style={{ fontSize: 14 }} aria-hidden /> Mine kurs
          </Link>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {category ? <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{category.name}</div> : null}
            <h1
              className="lr-page-title"
              style={{ margin: 0, fontSize: 54, lineHeight: 1.05, letterSpacing: '-0.06em', fontWeight: 300, color: 'var(--efkt-white)', textWrap: 'pretty' }}
            >
              {t.thin} <span style={{ fontWeight: 800 }}>{t.fat}</span>
            </h1>
            <div style={{ fontSize: 20, fontWeight: 300, color: 'rgba(255,255,255,0.9)', maxWidth: 640, textWrap: 'pretty' }}>{c.description}</div>
          </div>
        </div>
      </section>

      <section className="lr-x" style={{ paddingTop: 40, maxWidth: 960, boxSizing: 'border-box', width: '100%' }}>
        {c.reference ? (
          <div
            style={{
              padding: '24px 28px',
              background: 'var(--efkt-offwhite)',
              borderRadius: 20,
              fontSize: 16,
              fontWeight: 300,
              color: 'var(--text-muted)',
              textWrap: 'pretty',
            }}
          >
            Referansemateriale. Åpne hvilken som helst del når du trenger den — ingenting her spores eller vurderes.
          </div>
        ) : (
          <div style={{ padding: '24px 28px', background: 'var(--efkt-offwhite)', borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em' }}>{progress.pct}%</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
                {progress.passed} av {progress.total} moduler bestått{pass !== null ? ` · bestått ved ${pass}%` : ''}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--efkt-border)', overflow: 'hidden' }}>
              <div
                style={{ height: 8, borderRadius: 4, width: progress.pct + '%', background: progress.complete ? 'var(--efkt-green)' : 'var(--efkt-coral)' }}
              />
            </div>
            {progress.current && !progress.complete ? (
              <div style={{ marginTop: 20 }}>
                <ButtonLink href={moduleHref(progress.current.module.id)} prefetch={false} iconRight="arrow-right">
                  {progress.started ? `Fortsett med modul ${progress.current.index + 1}` : 'Start kurset'}
                </ButtonLink>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section
        className="lr-x"
        style={{ paddingTop: 32, paddingBottom: 96, maxWidth: 960, boxSizing: 'border-box', width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {progress.items.map((it) => {
          const m = it.module;
          const p = it.progress;
          const passed = it.state === 'passed';
          const failed = it.state === 'failed';
          const locked = it.state === 'locked';
          const current = progress.current?.module.id === m.id;
          const seen = !!p?.seenAt;
          const full = row.get(m.id);
          const gateMet = !!full && full.dwellSeconds >= m.minSeconds && full.confirmedAllSlides;
          const left = attemptsLeft(m.quiz, p?.attempts ?? 0);
          const score = p?.bestScore ?? p?.lastScore;
          const statusLabel = c.reference
            ? 'Reference'
            : passed
              ? 'Bestått' + (m.quiz && score != null ? ` ${score}%` : '')
              : failed
                ? `Ikke bestått ${p?.lastScore}%`
                : current && seen
                  ? 'Quiz gjenstår'
                  : current
                    ? 'Ikke startet'
                    : 'Låst';
          const tone: BadgeTone = passed ? 'mint' : failed ? 'sand' : current && !c.reference ? 'sand' : 'neutral';
          // Passed modules re-open the quiz from the player, which keeps the row compact.
          const showQuiz = !locked && !!m.quiz && seen && !passed && gateMet;
          const gateWaiting = !locked && !!m.quiz && seen && !passed && !gateMet;
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
                padding: '20px 24px',
                border: '1px solid var(--border-default)',
                borderRadius: 20,
                background: 'var(--surface-card)',
              }}
            >
              <span
                style={{
                  width: 56,
                  height: 56,
                  minWidth: 56,
                  borderRadius: 12,
                  background: 'var(--efkt-offwhite)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i
                  className={`ph ph-${c.reference ? 'file-text' : passed ? 'check-circle' : locked ? 'lock-simple' : 'play-circle'}`}
                  style={{ fontSize: 24, color: 'var(--efkt-coral)' }}
                  aria-hidden
                />
              </span>
              <div style={{ minWidth: 180, flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                  {it.index + 1}. {m.title}
                </div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4, overflowWrap: 'anywhere' }}>
                  {c.reference
                    ? m.source === 'BUILT'
                      ? 'Bygget her'
                      : m.url
                    : m.quiz
                      ? `${m.quiz._count.questions} spørsmål · bestått ved ${m.quiz.passPercent}%`
                      : 'Ingen quiz — fullføres når du har åpnet innholdet'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Badge tone={tone}>{statusLabel}</Badge>
                {!locked ? (
                  <ButtonLink href={moduleHref(m.id)} prefetch={false} variant="secondary">
                    {c.reference ? 'Åpne' : seen ? 'Åpne igjen' : 'Åpne innhold'}
                  </ButtonLink>
                ) : null}
                {showQuiz ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                    {left === 0 && !passed ? (
                      <ButtonLink href={moduleHref(m.id)} prefetch={false} iconRight="arrow-counter-clockwise">
                        Gå gjennom modulen på nytt
                      </ButtonLink>
                    ) : (
                      <ButtonLink href={`${moduleHref(m.id)}/quiz`} prefetch={false} iconRight="list-checks">
                        {failed ? 'Prøv igjen' : 'Ta quizen'}
                      </ButtonLink>
                    )}
                    <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
                      {left === null ? 'Ubegrenset antall forsøk' : left > 0 ? `${left} forsøk igjen` : 'Ingen forsøk igjen — gå gjennom modulen på nytt'}
                    </span>
                  </div>
                ) : null}
                {locked ? (
                  <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 220, textWrap: 'pretty' }}>
                    Åpnes når forrige modul er bestått
                  </span>
                ) : null}
                {gateWaiting ? (
                  <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 240, textWrap: 'pretty' }}>
                    Åpne modulen og bekreft at du har vært gjennom alle slidene for å ta quizen
                  </span>
                ) : null}
                {p && !c.reference ? (
                  <ResetModuleButton courseId={c.id} moduleId={m.id} title={m.title} isLast={it.index === c.modules.length - 1} passed={passed} />
                ) : null}
              </div>
            </div>
          );
        })}

        {anyDone && !c.reference ? <ResetCourse courseId={c.id} title={c.title} moduleCount={c.modules.length} /> : null}
      </section>
    </>
  );
}
