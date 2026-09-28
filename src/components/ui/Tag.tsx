import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

const TONES: Record<string, CSSProperties> = {
  default: { background: 'var(--efkt-offwhite)', color: 'var(--efkt-navy)', border: '1px solid var(--border-default)' },
  coral: { background: 'var(--efkt-coral)', color: 'var(--efkt-white)', border: '1px solid var(--efkt-coral)' },
  navy: { background: 'var(--efkt-navy)', color: 'var(--efkt-white)', border: '1px solid var(--efkt-navy)' },
  outline: { background: 'transparent', color: 'var(--efkt-navy)', border: '1px solid var(--efkt-navy)' },
  white: { background: 'var(--efkt-white)', color: 'var(--efkt-navy)', border: '1px solid var(--border-default)' },
  onPhoto: { background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(12px)', color: 'var(--efkt-white)', border: 'none' },
};

/** Fully rounded pill for labels and filters. Pass onClick to make it a toggle button. */
export function Tag({
  children,
  tone = 'default',
  icon,
  active,
  onClick,
  style,
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
  icon?: string;
  active?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
}) {
  const t = active ? TONES.navy : TONES[tone];
  const s: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 'var(--efkt-radius-pill)',
    fontFamily: 'var(--efkt-font)',
    fontSize: 'var(--text-micro)',
    fontWeight: 'var(--efkt-weight-medium)',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    transition: 'background var(--efkt-duration) var(--efkt-ease), color var(--efkt-duration) var(--efkt-ease)',
    ...t,
    ...style,
  };
  const inner = (
    <>
      {icon ? <i className={`ph ph-${icon}`} style={{ fontSize: 16 }} aria-hidden /> : null}
      {children}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={!!active} style={{ ...s, cursor: 'pointer' }}>
      {inner}
    </button>
  ) : (
    <span style={s}>{inner}</span>
  );
}
