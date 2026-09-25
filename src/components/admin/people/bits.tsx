import type { CSSProperties, ReactNode } from 'react';
import type { Role } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';
import { ROLE_LABEL } from '@/lib/labels';
import { initials } from '@/lib/format';

export const MUTED: CSSProperties = { fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' };
export const SECTION: CSSProperties = { fontSize: 16, fontWeight: 600 };
export const SEARCH_STYLE: CSSProperties = { width: 280 };
export const SELECT_STYLE: CSSProperties = { width: 220 };

const ROLE_BG: Record<Role, string> = { ADMIN: 'var(--efkt-mint)', TEAM_LEAD: 'var(--efkt-sand)', LEARNER: 'var(--efkt-offwhite)' };
const ROLE_TONE = { ADMIN: 'mint', TEAM_LEAD: 'sand', LEARNER: 'neutral' } as const;

export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={ROLE_TONE[role]}>{ROLE_LABEL[role]}</Badge>;
}

export function Initials({ name, size = 40, bg = 'var(--efkt-offwhite)', fontSize = 14 }: { name: string; size?: number; bg?: string; fontSize?: number }) {
  return (
    <span title={name} style={{ width: size, height: size, minWidth: size, borderRadius: '50%', background: bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize, fontWeight: 600 }}>
      {initials(name)}
    </span>
  );
}

export function roleAvatarBg(role: Role) {
  return ROLE_BG[role];
}

/** Label + counter above an 8px bar; green when complete. */
export function ProgressLine({ label, counter, pct, done }: { label: ReactNode; counter: ReactNode; pct: number; done: boolean }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-body)' }}>{label}</span>
        <span style={{ ...MUTED, whiteSpace: 'nowrap' }}>{counter}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--efkt-border)', overflow: 'hidden' }}>
        <div style={{ height: 8, borderRadius: 4, width: pct + '%', background: done ? 'var(--efkt-green)' : 'var(--efkt-coral)', transition: 'width 320ms cubic-bezier(0.4,0,0.2,1)' }} />
      </div>
    </div>
  );
}

export function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub: string }) {
  return (
    <div style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.045em' }}>{value}</div>
      <div style={{ ...MUTED, marginTop: 8 }}>{sub}</div>
    </div>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return <div style={{ padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, ...MUTED }}>{children}</div>;
}

/** Pill toggle used for picking groups (navy when on). */
export function PickPill({ on, icon, children, onClick, disabled }: { on: boolean; icon?: string; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className="pp-pick"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 16px', borderRadius: 20,
        border: '1px solid ' + (on ? 'var(--efkt-navy)' : 'var(--border-default)'),
        background: on ? 'var(--efkt-navy)' : 'var(--efkt-white)', color: on ? 'var(--efkt-white)' : 'var(--text-body)',
        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--efkt-font)', fontSize: 14, fontWeight: 500, opacity: disabled ? 0.5 : 1,
      }}
    >
      <i className={`ph ph-${icon ?? (on ? 'check' : 'plus')}`} style={{ fontSize: 14 }} aria-hidden />
      {children}
    </button>
  );
}
