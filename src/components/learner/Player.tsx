'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { BlockRenderer, type LinkedCourse } from '@/components/blocks/BlockRenderer';
import { useToast } from '@/components/ui/Toast';
import type { Block } from '@/lib/blocks';
import type { ModuleState } from '@/lib/progress';
import { syncModule } from '@/app/(learner)/courses/[id]/modules/[moduleId]/actions';

const PING = 10;

export type PlayerProps = {
  courseId: string;
  courseTitle: string;
  module: {
    id: string;
    title: string;
    source: 'EMBED' | 'BUILT';
    url: string;
    embed: string;
    blocks: Block[];
    minSeconds: number;
    quiz: { questions: number; passPercent: number } | null;
  };
  index: number;
  steps: { id: string; title: string; state: ModuleState }[];
  prevId: string | null;
  nextId: string | null;
  nextTitle: string | null;
  passed: boolean;
  failed: boolean;
  dwellSeconds: number;
  confirmed: boolean;
  courses: Record<string, LinkedCourse>;
  impersonating: string | null;
};

/** Opens a URL in a separate window placed to the right of the course window. */
function openBeside(url: string) {
  const scr = window.screen as Screen & { availLeft?: number; availTop?: number };
  const availLeft = scr.availLeft ?? 0;
  const w = Math.max(480, Math.round(scr.availWidth * 0.4));
  const h = Math.max(480, window.outerHeight || scr.availHeight);
  let left = window.screenX + window.outerWidth;
  if (left + w > availLeft + scr.availWidth) left = availLeft + scr.availWidth - w;
  const top = window.screenY;
  const win = window.open(url, 'efkt-side', `width=${w},height=${h},left=${left},top=${top}`);
  win?.focus();
  return !!win;
}

function formatRemain(s: number) {
  return s >= 60 ? Math.ceil(s / 60) + ' min' : s + ' sek';
}

export function Player(props: PlayerProps) {
  const { courseId, module: m, steps, index, passed } = props;
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [dwell, setDwell] = useState(props.dwellSeconds);
  const [pending, setPending] = useState(0);
  const [confirmed, setConfirmed] = useState(props.confirmed);
  const pendingRef = useRef(0);
  const syncing = useRef(false);

  const gated = !!m.quiz && !passed;
  const need = m.minSeconds;
  const spent = dwell + pending;
  const timeMet = spent >= need;
  const openable = !m.quiz || passed || (timeMet && confirmed);
  const remain = Math.max(0, need - spent);
  const counting = gated && dwell < need;

  const flush = useCallback(
    async (confirm?: boolean) => {
      if (syncing.current && confirm === undefined) return;
      const seconds = pendingRef.current;
      if (!seconds && confirm === undefined) return;
      syncing.current = true;
      try {
        const res = await syncModule({ moduleId: m.id, seconds, confirm });
        if (res.ok) {
          pendingRef.current = Math.max(0, pendingRef.current - seconds);
          setPending(pendingRef.current);
          setDwell(res.dwellSeconds);
          setConfirmed(res.confirmed);
          return res;
        }
      } finally {
        syncing.current = false;
      }
    },
    [m.id],
  );

  // Dwell ticker: counts only while the tab is visible, pings the server every PING s.
  useEffect(() => {
    if (!counting) return;
    const t = setInterval(() => {
      if (document.hidden) return;
      pendingRef.current += 1;
      setPending(pendingRef.current);
      if (pendingRef.current >= PING) void flush();
    }, 1000);
    const onVis = () => document.hidden && void flush();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [counting, flush]);

  // Send the remainder when the countdown ends or the learner leaves the module.
  useEffect(() => {
    if (gated && timeMet && pendingRef.current > 0) void flush();
  }, [gated, timeMet, flush]);
  useEffect(() => () => void flush(), [flush]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    const el = root.current;
    if (!el?.requestFullscreen || !document.fullscreenEnabled) {
      toast('Nettleseren tillater ikke fullskjerm her — spilleren dekker allerede hele vinduet');
      return;
    }
    await el.requestFullscreen().catch(() => toast('Nettleseren blokkerte fullskjerm', 'error'));
  }

  async function toggleConfirm() {
    if (!timeMet) return toast('Bruk litt mer tid på modulen først');
    const res = await flush(!confirmed);
    if (res && !confirmed && !res.confirmed) toast('Bruk litt mer tid på modulen først');
  }

  function side(url: string) {
    if (!openBeside(url)) toast('Tillat popup-vinduer for å åpne lenken i eget vindu', 'error');
  }

  // Links inside built content open in the side window so the course stays visible.
  function onContentClick(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as HTMLElement).closest('a');
    if (!a || !a.href || a.origin === window.location.origin) return;
    e.preventDefault();
    side(a.href);
  }

  const isEmbed = m.source === 'EMBED' && !!m.embed;
  const isEmpty = m.source === 'EMBED' && !m.embed;
  const fsLabel = fullscreen ? 'Avslutt fullskjerm' : 'Fullskjerm';
  const quizHref = `/courses/${courseId}/modules/${m.id}/quiz`;

  const gateLine = timeMet
    ? confirmed
      ? 'Bekreftet — quizen er åpen.'
      : 'Bekreft at du har vært gjennom alle slidene for å åpne quizen.'
    : `Quizen åpnes om ${formatRemain(remain)}. Bla gjennom alle slidene i mellomtiden.`;

  return (
    <div ref={root} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'var(--surface-dark)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--efkt-font)' }}>
      {props.impersonating ? (
        <div style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(241,85,76,0.18)', flexShrink: 0 }}>
          <i className="ph ph-eye" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden />
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--efkt-white)', minWidth: 0, flex: 1 }}>Viewing EFKT Academy as {props.impersonating}</span>
          <form method="post" action="/impersonate/stop">
            <button type="submit" className="lr-pbtn" style={{ padding: '6px 14px' }}>
              <i className="ph ph-sign-out" style={{ fontSize: 14 }} aria-hidden /> Back to admin
            </button>
          </form>
        </div>
      ) : null}

      <div style={{ padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <Link href={`/courses/${courseId}`} className="lr-pbtn" onClick={() => document.fullscreenElement && document.exitFullscreen().catch(() => {})}>
          <i className="ph ph-arrow-left" style={{ fontSize: 14 }} aria-hidden /> Lukk
        </Link>
        <div style={{ minWidth: 0, flex: 1, marginLeft: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {props.courseTitle} · Modul {index + 1} av {steps.length}
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--efkt-white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</div>
        </div>
        {isEmbed ? (
          <>
            <button
              type="button"
              className="lr-pbtn"
              title="Last modulen på nytt"
              onClick={() => {
                setReloadKey((k) => k + 1);
                toast('Modulen er lastet inn på nytt');
              }}
            >
              <i className="ph ph-arrow-clockwise" style={{ fontSize: 16 }} aria-hidden /> <span className="lr-plabel">Tilbake til modulen</span>
            </button>
            <button type="button" className="lr-pbtn" title="Åpne i eget vindu ved siden av kurset" onClick={() => side(m.url.startsWith('http') ? m.url : 'https://' + m.url)}>
              <i className="ph ph-arrow-square-out" style={{ fontSize: 16 }} aria-hidden /> <span className="lr-plabel">Åpne i eget vindu</span>
            </button>
          </>
        ) : null}
        <button type="button" className="lr-pbtn" title={fsLabel} onClick={toggleFullscreen}>
          <i className={`ph ph-${fullscreen ? 'corners-in' : 'corners-out'}`} style={{ fontSize: 16 }} aria-hidden /> <span className="lr-plabel">{fsLabel}</span>
        </button>
      </div>

      <div style={{ padding: '0 24px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
        {steps.map((st, i) => {
          const here = i === index;
          const locked = st.state === 'locked';
          const done = st.state === 'passed';
          const style = {
            width: 34, height: 34, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600,
            border: locked ? '1px dashed rgba(255,255,255,0.22)' : 'none',
            background: here ? 'var(--efkt-coral)' : done ? 'var(--efkt-mint)' : locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.18)',
            color: here ? 'var(--efkt-white)' : done ? 'var(--efkt-navy)' : locked ? 'rgba(255,255,255,0.35)' : 'var(--efkt-white)',
            transition: 'background 180ms cubic-bezier(0.4,0,0.2,1)',
          } as const;
          const title = st.title + (locked ? ' — låst' : done ? ' — bestått' : here ? ' — du er her' : '');
          return locked ? (
            <button key={st.id} type="button" title={title} onClick={() => toast('Fullfør forrige modul først')} style={{ ...style, cursor: 'not-allowed', fontFamily: 'var(--efkt-font)' }}>
              <i className="ph-bold ph-lock-simple" style={{ fontSize: 12 }} aria-hidden />
            </button>
          ) : (
            <Link key={st.id} href={`/courses/${courseId}/modules/${st.id}`} prefetch={false} title={title} aria-current={here ? 'step' : undefined} style={style}>
              {i + 1}
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1, minHeight: 0, margin: '0 12px', borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-white)', display: 'flex', flexDirection: 'column' }}>
        {isEmbed ? (
          <iframe key={reloadKey} src={m.embed} title={m.title} allowFullScreen allow="fullscreen" style={{ flex: 1, minHeight: 0, width: '100%', border: 'none', display: 'block' }} />
        ) : null}
        {m.source === 'BUILT' ? (
          <div className="lr-pbody" onClickCapture={onContentClick} style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', justifyContent: 'center', color: 'var(--text-body)' }}>
            <div style={{ width: '100%', maxWidth: 760 }}>
              <BlockRenderer blocks={m.blocks} courses={props.courses} />
            </div>
          </div>
        ) : null}
        {isEmpty ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48, textAlign: 'center', color: 'var(--text-body)' }}>
            <i className="ph ph-link-break" style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ fontSize: 20, fontWeight: 600 }}>Innholdet mangler</div>
            <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 420, textWrap: 'pretty' }}>
              Denne modulen har ingen lenke ennå. Si det til teamlederen din, så får administratoren lagt den inn.
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', flexShrink: 0 }}>
        {props.prevId ? (
          <Link href={`/courses/${courseId}/modules/${props.prevId}`} prefetch={false} className="lr-pbtn lr-pbtn--lg">
            <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> Forrige
          </Link>
        ) : null}

        <div style={{ minWidth: 200, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.65)', textWrap: 'pretty' }}>
            {m.quiz ? `${m.quiz.questions} spørsmål · bestått ved ${m.quiz.passPercent}%` : 'Ingen quiz — modulen fullføres når du har sett innholdet'}
          </span>
          {gated ? (
            <span aria-live="polite" style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.5)', textWrap: 'pretty' }}>{gateLine}</span>
          ) : null}
        </div>

        {gated ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={confirmed}
            onClick={toggleConfirm}
            className="lr-pout"
            style={{ gap: 12, fontSize: 14, textAlign: 'left', maxWidth: 320, whiteSpace: 'normal' }}
          >
            {confirmed ? (
              <i className="ph ph-check-circle" style={{ fontSize: 20, color: 'var(--efkt-mint)' }} aria-hidden />
            ) : (
              <i className="ph ph-circle" style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)' }} aria-hidden />
            )}
            {confirmed ? 'Bekreftet — hele modulen gjennomgått' : 'Jeg har vært gjennom alle slidene'}
          </button>
        ) : null}

        {m.quiz && openable ? (
          <Link href={quizHref} prefetch={false} className="lr-pquiz">
            {passed ? 'Ta quizen igjen' : props.failed ? 'Prøv quizen igjen' : 'Ta quizen'} <i className="ph ph-list-checks" style={{ fontSize: 16 }} aria-hidden />
          </Link>
        ) : null}
        {m.quiz && !openable ? (
          <button
            type="button"
            aria-disabled="true"
            onClick={() => toast(timeMet ? 'Bekreft at du har vært gjennom alle slidene' : 'Bruk litt mer tid på modulen først')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', borderRadius: 25, padding: '14px 32px', background: 'rgba(255,255,255,0.12)', cursor: 'not-allowed', fontFamily: 'var(--efkt-font)', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}
          >
            Ta quizen <i className="ph ph-lock-simple" style={{ fontSize: 16 }} aria-hidden />
            {!timeMet ? <span style={{ fontWeight: 400, fontVariantNumeric: 'tabular-nums' }}>· {formatRemain(remain)}</span> : null}
          </button>
        ) : null}
        {props.nextId ? (
          <Link href={`/courses/${courseId}/modules/${props.nextId}`} prefetch={false} className="lr-pout" title={props.nextTitle ? `Neste: ${props.nextTitle}` : undefined}>
            Neste <i className="ph ph-arrow-right" style={{ fontSize: 16 }} aria-hidden />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
