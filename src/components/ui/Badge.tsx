import type { CSSProperties, ReactNode } from 'react';

export type BadgeTone = 'mint' | 'sand' | 'blush' | 'gold' | 'neutral' | 'navy' | 'coral';

const BG: Record<BadgeTone, [string, string]> = {
  mint: ['var(--efkt-mint)', 'var(--efkt-navy)'],
  sand: ['var(--efkt-sand)', 'var(--efkt-navy)'],
  blush: ['var(--efkt-blush)', 'var(--efkt-navy)'],
  gold: ['var(--efkt-gold)', 'var(--efkt-navy)'],
  neutral: ['var(--efkt-offwhite)', 'var(--efkt-navy)'],
  navy: ['var(--efkt-navy)', 'var(--efkt-white)'],
  coral: ['var(--efkt-coral)', 'var(--efkt-white)'],
};

/** Status pill. */
export function Badge({ children, tone = 'mint', icon, style }: { children: ReactNode; tone?: BadgeTone; icon?: string; style?: CSSProperties }) {
  const [bg, fg] = BG[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 'var(--efkt-radius-pill)',
        background: bg,
        color: fg,
        fontSize: 'var(--text-micro)',
        fontWeight: 'var(--efkt-weight-medium)',
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon ? <i className={`ph ph-${icon}`} style={{ fontSize: 14 }} aria-hidden /> : null}
      {children}
    </span>
  );
}
