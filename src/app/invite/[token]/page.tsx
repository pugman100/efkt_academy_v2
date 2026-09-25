import type { Metadata } from 'next';
import { findInvitation } from '@/app/(auth)/actions';
import { Logo } from '@/components/ui/Logo';
import { ButtonLink } from '@/components/ui';
import { ROLE_LABEL } from '@/lib/labels';
import { AcceptForm } from '@/components/auth/AcceptForm';
import { RoundIcon } from '@/components/auth/AuthBits';
import { AcceptDone } from '@/components/auth/AcceptDone';
import { getUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Invitation' };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findInvitation(token);

  let body: React.ReactNode;
  if (found.state === 'ok') {
    const inv = found.inv;
    const groups = inv.groups.map((g) => g.name);
    const gl = groups.join(' and ');
    const days = Math.max(1, Math.ceil((inv.expiresAt.getTime() - Date.now()) / 86_400_000));
    const intro = `You have been invited as ${ROLE_LABEL[inv.role].toLowerCase()}${gl ? ' in ' + gl : ''}. This link is valid for ${days} ${days === 1 ? 'day' : 'days'}.`;
    body = <AcceptForm token={token} email={inv.email} name={inv.name} intro={intro} groups={groups} />;
  } else if (found.state === 'accepted' && (await getUser())?.email === found.inv.email.toLowerCase()) {
    // Just accepted in this browser (the action signs the new user in and re-renders the page).
    body = <AcceptDone groups={found.inv.groups.map((g) => g.name)} />;
  } else {
    const accepted = found.state === 'accepted';
    body = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-start' }}>
        <RoundIcon icon={accepted ? 'check' : 'clock-countdown'} tone={accepted ? 'mint' : 'blush'} bold={accepted} />
        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, letterSpacing: '-0.04em', fontWeight: 300 }}>
          {accepted ? <>Already <span style={{ fontWeight: 800 }}>accepted</span></> : <>Invitation <span style={{ fontWeight: 800 }}>expired</span></>}
        </h2>
        <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          {accepted
            ? 'This invitation has been used. Sign in with the email and password you chose.'
            : 'This invitation link is no longer valid. Ask your administrator or teamleader to send you a new one.'}
        </div>
        <ButtonLink href="/login" iconRight="arrow-right">Go to sign in</ButtonLink>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-dark)', padding: '48px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, fontFamily: 'var(--efkt-font)', color: 'var(--text-body)' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <Logo variant="white" width={110} />
      </div>
      <div style={{ width: '100%', maxWidth: 560, background: 'var(--surface-card)', borderRadius: 20, padding: 'clamp(24px, 5vw, 40px)', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {body}
      </div>
    </div>
  );
}
