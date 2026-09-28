import { NextResponse } from 'next/server';
import { destroySession, getSession } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { appUrl } from '@/lib/tokens';

export async function POST() {
  const s = await getSession();
  if (s?.impersonatorId) await audit(s.impersonatorId, 'impersonation.stop', { type: 'user', id: s.userId });
  await destroySession();
  return NextResponse.redirect(appUrl('/login'), { status: 303 });
}
