import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getUser, homeFor } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = { title: 'Logg inn' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getUser();
  if (user) redirect(homeFor(user.role));
  const { next } = await searchParams;
  return <LoginForm next={next ?? ''} />;
}
