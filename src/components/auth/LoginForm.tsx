'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { login, type LoginState } from '@/app/(auth)/actions';
import { Button, Checkbox, Input, useToast } from '@/components/ui';
import { AuthError, AuthTitle } from './AuthBits';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [remember, setRemember] = useState(true);
  const toast = useToast();
  return (
    <>
      <AuthTitle thin="Logg" fat="inn">Bruk e-postadressen du fikk invitasjonen på.</AuthTitle>
      {state.error ? <AuthError>{state.error}</AuthError> : null}
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <input type="hidden" name="next" value={next} />
        <Input label="E-post" name="email" type="email" autoComplete="email" placeholder="navn@efkt.com" defaultValue={state.email} required />
        <Input label="Passord" name="password" type="password" autoComplete="current-password" required />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <Checkbox name="remember" checked={remember} onChange={() => setRemember((r) => !r)} label="Husk meg" />
          <Link href="/login/forgot" className="efkt-link">Glemt passord?</Link>
        </div>
        <Button type="submit" iconRight="arrow-right" disabled={pending}>{pending ? 'Logger inn…' : 'Logg inn'}</Button>
      </form>
      <div style={{ height: 1, background: 'var(--border-default)' }} />
      <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        Ansatt i EFKT? Du kan også{' '}
        <a href="#sso" onClick={(e) => { e.preventDefault(); toast('Microsoft-innlogging er ikke satt opp ennå'); }}>logge inn med Microsoft</a>.
      </div>
    </>
  );
}
