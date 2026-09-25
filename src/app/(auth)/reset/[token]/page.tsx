import type { Metadata } from 'next';
import { resetEmailFor } from '@/app/(auth)/actions';
import { ResetForm, ResetExpired } from '@/components/auth/ResetForm';

export const metadata: Metadata = { title: 'Sett nytt passord' };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const email = await resetEmailFor(token);
  return email ? <ResetForm token={token} email={email} /> : <ResetExpired />;
}
