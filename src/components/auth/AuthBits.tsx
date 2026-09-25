import type { ReactNode } from 'react';

export function AuthTitle({ thin, fat, children }: { thin: string; fat: string; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
        {thin} <span style={{ fontWeight: 800 }}>{fat}</span>
      </h2>
      {children ? <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{children}</div> : null}
    </div>
  );
}

export function AuthError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" style={{ display: 'flex', gap: 12, padding: 20, background: 'var(--efkt-blush)', borderRadius: 20 }}>
      <i className="ph ph-warning-circle" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
      <div style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 500, textWrap: 'pretty' }}>{children}</div>
    </div>
  );
}

export function RoundIcon({ icon, tone = 'mint', bold }: { icon: string; tone?: 'mint' | 'blush'; bold?: boolean }) {
  return (
    <span style={{ width: 56, height: 56, borderRadius: '50%', background: tone === 'mint' ? 'var(--efkt-mint)' : 'var(--efkt-blush)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone === 'mint' ? 'var(--efkt-navy)' : 'var(--efkt-coral)' }}>
      <i className={`${bold ? 'ph-bold' : 'ph'} ph-${icon}`} style={{ fontSize: 24 }} aria-hidden />
    </span>
  );
}
