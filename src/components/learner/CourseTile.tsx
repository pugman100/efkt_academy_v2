import Link from 'next/link';
import { Photo } from '@/components/ui/Photo';

export type TileData = {
  href: string;
  title: string;
  description: string;
  category: string;
  photo: { src: string | null; x: number; y: number; scale: number };
  pct: number;
  passed: number;
  total: number;
};

const SCRIM = (from: number, to: number) => `linear-gradient(180deg, rgba(12,14,57,0) ${from}%, rgba(12,14,57,${to}) 100%)`;

function status(t: TileData) {
  const done = t.pct === 100;
  const started = t.pct > 0 && !done;
  return {
    done,
    started,
    label: done ? 'Fullført' : started ? 'I gang' : 'Ikke startet',
    icon: done ? 'check' : started ? 'dot-outline' : 'play',
    bg: done ? 'var(--efkt-green)' : started ? 'var(--efkt-coral)' : 'var(--efkt-navy)',
    cta: done ? 'Se igjen' : started ? 'Fortsett' : 'Start kurset',
  };
}

function Bar({ pct, done }: { pct: number; done?: boolean }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: 'var(--efkt-border)', overflow: 'hidden' }}>
      <div style={{ height: 8, borderRadius: 4, width: pct + '%', background: done ? 'var(--efkt-green)' : 'var(--efkt-coral)', transition: 'width 320ms cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  );
}

/** Big "Fortsett læringen" tile: 300px photo, title on the scrim, progress below. */
export function ContinueTile({ t }: { t: TileData }) {
  return (
    <Link href={t.href} className="lr-lift" style={{ height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-offwhite)', display: 'block' }}>
      <div style={{ position: 'relative', height: 300 }}>
        <Photo {...t.photo} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: SCRIM(30, 0.72) }} />
        <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{t.category}</div>
          <div style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.04em', fontWeight: 800, color: 'var(--efkt-white)', textWrap: 'pretty' }}>{t.title}</div>
        </div>
      </div>
      <div style={{ padding: '24px 28px', background: 'var(--efkt-white)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>{t.pct}%</span>
          <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{t.passed} / {t.total} moduler</span>
        </div>
        <Bar pct={t.pct} />
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'var(--efkt-coral)' }}>
          {t.pct > 0 ? `Fortsett med modul ${t.passed + 1}` : 'Start kurset'} <i className="ph ph-arrow-right" style={{ fontSize: 14 }} aria-hidden />
        </div>
      </div>
    </Link>
  );
}

/** Category-section tile: status chip, title on the scrim, description, progress, CTA. */
export function CourseTile({ t }: { t: TileData }) {
  const s = status(t);
  return (
    <Link href={t.href} className="lr-lift" style={{ height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-white)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', height: 230 }}>
        <Photo {...t.photo} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: SCRIM(35, 0.75) }} />
        <div style={{ position: 'absolute', inset: 0, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
          <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 25, background: s.bg, fontSize: 14, fontWeight: 600, color: 'var(--efkt-white)' }}>
            <i className={`ph-bold ph-${s.icon}`} style={{ fontSize: 12 }} aria-hidden />
            {s.label}
          </span>
          <div style={{ fontSize: 24, lineHeight: 1.15, letterSpacing: '-0.03em', fontWeight: 800, color: 'var(--efkt-white)', textWrap: 'pretty' }}>{t.title}</div>
        </div>
      </div>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        <div style={{ minHeight: 44, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{t.description}</div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-body)' }}>{t.pct}%</span>
            <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{t.passed} / {t.total} moduler</span>
          </div>
          <Bar pct={t.pct} done={s.done} />
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500, color: 'var(--efkt-coral)' }}>
          {s.cta} <i className="ph ph-arrow-right" style={{ fontSize: 14 }} aria-hidden />
        </div>
      </div>
    </Link>
  );
}
