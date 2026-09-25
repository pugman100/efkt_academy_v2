import type { ComponentProps, ReactNode } from 'react';
import './admin-tracking.css';

/** Off-white stat tile: label, big number, muted sub line. */
export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub: ReactNode }) {
  return (
    <div style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.045em' }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

/** 40px icon plate (10px radius) used for row actions. */
export function PlateButton({ icon, danger, className, ...rest }: { icon: string; danger?: boolean } & ComponentProps<'button'>) {
  return (
    <button type="button" className={`trk-plate${danger ? ' trk-plate--danger' : ''}${className ? ' ' + className : ''}`} {...rest}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 18 }} aria-hidden />
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{children}</div>;
}

/** Round initials plate. */
export function Initials({ text, size = 44, bg = 'var(--efkt-offwhite)', fontSize = 14 }: { text: string; size?: number; bg?: string; fontSize?: number }) {
  return (
    <span style={{ width: size, height: size, minWidth: size, borderRadius: '50%', background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 600, color: 'var(--efkt-navy)' }}>
      {text}
    </span>
  );
}

export const EMPTY_STYLE = { padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' } as const;
