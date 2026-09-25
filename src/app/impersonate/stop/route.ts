import { NextResponse } from 'next/server';
import { createSession, destroySession, getSession } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { db } from '@/lib/db';
import { appUrl } from '@/lib/tokens';

/** "Back to admin" from the impersonation banner. */
export async function POST() {
  const session = await getSession();
  const adminId = session?.impersonatorId;
  if (!session || !adminId) return NextResponse.redirect(appUrl('/'), { status: 303 });

  await audit(adminId, 'impersonation.stop', { type: 'user', id: session.userId });
  await destroySession();
  // Only hand the admin session back if that person is still an active administrator.
  const admin = await db.user.findUnique({ where: { id: adminId }, select: { role: true, status: true } });
  if (admin?.role !== 'ADMIN' || admin.status !== 'ACTIVE') return NextResponse.redirect(appUrl('/login'), { status: 303 });
  await createSession(adminId);
  return NextResponse.redirect(appUrl('/admin/users'), { status: 303 });
}
