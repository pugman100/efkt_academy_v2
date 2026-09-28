'use client';

import { useState, useTransition } from 'react';
import { changePassword } from '@/app/(learner)/profile/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { passwordRules, PASSWORD_RULES } from '@/lib/password-rules';

export function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [pending, start] = useTransition();
  const toast = useToast();

  const rules = passwordRules(next);
  const passed = rules.filter((r) => r.ok).length;
  const score = next.length === 0 ? 0 : passed;
  const barColor = score >= 4 ? 'var(--efkt-green)' : score >= 3 ? 'var(--efkt-gold)' : 'var(--efkt-coral)';
  const strength = next.length === 0 ? 'Ikke fylt ut' : score >= 4 ? 'Sterkt passord' : score >= 3 ? 'Greit — legg til ett krav mer' : 'For svakt';
  const matchHint = repeat.length === 0 ? 'Skriv det nye passordet en gang til.' : next === repeat ? 'Passordene er like.' : 'Passordene er ikke like.';

  function save() {
    if (!current) return toast('Skriv inn det nåværende passordet', 'error');
    if (passed < PASSWORD_RULES.length) return toast('Det nye passordet oppfyller ikke kravene', 'error');
    if (next !== repeat) return toast('Passordene er ikke like', 'error');
    start(async () => {
      const res = await changePassword({ current, next, repeat });
      if (!res.ok) return toast(res.error, 'error');
      setCurrent('');
      setNext('');
      setRepeat('');
      toast('Passordet er endret');
    });
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Bytt passord</div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>Du blir logget ut av andre enheter når passordet endres.</div>
      </div>
      <Input label="Nåværende passord" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <Input label="Nytt passord" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < score ? barColor : 'var(--efkt-border)', transition: 'background 180ms cubic-bezier(0.4,0,0.2,1)' }} />
          ))}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>{strength}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20 }}>
        {rules.map((r) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className={`ph-bold ph-${r.ok ? 'check' : 'circle'}`} style={{ fontSize: 16, color: r.ok ? 'var(--efkt-green)' : 'var(--efkt-muted)' }} aria-hidden />
            <span style={{ fontSize: 14, fontWeight: 300, color: r.ok ? 'var(--text-body)' : 'var(--text-muted)' }}>{r.label}</span>
          </div>
        ))}
      </div>
      <Input label="Gjenta nytt passord" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} hint={matchHint} />
      <div>
        <Button variant="secondary" onClick={save} disabled={pending}>Lagre nytt passord</Button>
      </div>
    </div>
  );
}
