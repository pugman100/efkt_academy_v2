'use client';

import { useActionState } from 'react';
import { requestReset, type ForgotState } from '@/app/(auth)/actions';
import { Button, ButtonLink, Input } from '@/components/ui';
import { AuthError, AuthTitle, RoundIcon } from './AuthBits';
import Link from 'next/link';

export function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestReset, {});

  if (state.sent) {
    const resends = state.resends ?? 0;
    return (
      <>
        <RoundIcon icon="envelope-simple" />
        <AuthTitle thin="Sjekk" fat="e-posten">
          Finnes det en konto på {state.email}, ligger lenken der om et øyeblikk. Sjekk også søppelpost.
        </AuthTitle>
        {state.error ? <AuthError>{state.error}</AuthError> : null}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <form action={action}>
            <input type="hidden" name="email" value={state.email} />
            <input type="hidden" name="resend" value="1" />
            <Button type="submit" variant="secondary" disabled={pending}>
              {resends === 0 ? 'Send på nytt' : `Sendt ${resends} ${resends === 1 ? 'gang' : 'ganger'}`}
            </Button>
          </form>
          <ButtonLink href="/login" variant="secondary">Tilbake til innlogging</ButtonLink>
        </div>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="efkt-link" style={{ alignSelf: 'flex-start' }}>
        <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> Tilbake til innlogging
      </Link>
      <AuthTitle thin="Glemt" fat="passord">
        Skriv inn e-postadressen din. Vi sender en lenke du kan sette nytt passord med. Lenken er gyldig i 60 minutter.
      </AuthTitle>
      {state.error ? <AuthError>{state.error}</AuthError> : null}
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <Input label="E-post" name="email" type="email" autoComplete="email" placeholder="navn@efkt.com" defaultValue={state.email} required />
        <Button type="submit" iconRight="paper-plane-tilt" disabled={pending}>Send lenke</Button>
      </form>
    </>
  );
}
