import { passwordRules } from '@/lib/password-rules';

/** Four-bar strength meter + rule checklist (Login prototype, reset step). */
export function PasswordStrength({ password }: { password: string }) {
  const rules = passwordRules(password);
  const score = password.length === 0 ? 0 : rules.filter((r) => r.ok).length;
  const barColor = score >= 4 ? 'var(--efkt-green)' : score >= 3 ? 'var(--efkt-gold)' : 'var(--efkt-coral)';
  const label = password.length === 0 ? 'Ikke fylt ut' : score >= 4 ? 'Sterkt passord' : score >= 3 ? 'Greit — legg til ett krav mer' : 'For svakt';
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < score ? barColor : 'var(--efkt-border)', transition: 'background 180ms cubic-bezier(0.4,0,0.2,1)' }} />
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }} aria-live="polite">{label}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20 }}>
        {rules.map((r) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className={`ph-bold ph-${r.ok ? 'check' : 'circle'}`} style={{ fontSize: 16, color: r.ok ? 'var(--efkt-green)' : 'var(--efkt-muted)' }} aria-hidden />
            <span style={{ fontSize: 14, fontWeight: 300, color: r.ok ? 'var(--text-body)' : 'var(--text-muted)' }}>{r.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
