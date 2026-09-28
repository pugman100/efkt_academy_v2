'use client';

import { useActionState, useState } from 'react';
import { resetPassword, type ResetState } from '@/app/(auth)/actions';
import { Button, ButtonLink, Input } from '@/components/ui';
import { AuthError, AuthTitle, RoundIcon } from './AuthBits';
import { PasswordStrength } from './PasswordStrength';

export function ResetExpired() {
  return (
    <>
      <RoundIcon icon="clock-countdown" tone="blush" />
      <AuthTitle thin="Lenken er" fat="utløpt">
        Lenker for nytt passord er gyldige i 60 minutter. Be om en ny, eller kontakt teamlederen din hvis det fortsetter.
      </AuthTitle>
      <ButtonLink href="/login/forgot" iconRight="arrow-right">Be om ny lenke</ButtonLink>
    </>
  );
}

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetPassword, {});
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  if (state.expired) return <ResetExpired />;
  if (state.done)
    return (
      <>
        <RoundIcon icon="check" bold />
        <AuthTitle thin="Passordet er" fat="endret">
          Du kan logge inn med det nye passordet nå. Vi har sendt en bekreftelse til {state.email}.
        </AuthTitle>
        <ButtonLink href="/login" iconRight="arrow-right">Logg inn</ButtonLink>
      </>
    );

  const matchHint = pw2.length === 0 ? 'Skriv passordet en gang til.' : pw1 === pw2 ? 'Passordene er like.' : 'Passordene er ikke like.';
  return (
    <>
      <AuthTitle thin="Sett nytt" fat="passord">For {email}. Velg noe du ikke bruker andre steder.</AuthTitle>
      {state.error ? <AuthError>{state.error}</AuthError> : null}
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <input type="hidden" name="token" value={token} />
        <input type="text" name="username" autoComplete="username" value={email} readOnly hidden />
        <Input label="Nytt passord" name="pw1" type="password" autoComplete="new-password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
        <PasswordStrength password={pw1} />
        <Input label="Gjenta passordet" name="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} hint={matchHint} />
        <Button type="submit" iconRight="check" disabled={pending}>Lagre passord</Button>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>Du blir logget ut av andre enheter når passordet endres.</div>
      </form>
    </>
  );
}
