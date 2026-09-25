import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Role } from '@prisma/client';
import { db } from './db';
import { hashToken, newToken } from './tokens';

export const SESSION_COOKIE = 'efkt_session';
const DAY = 24 * 60 * 60 * 1000;

export async function createSession(
  userId: string,
  opts: { remember?: boolean; impersonatorId?: string } = {},
) {
  const token = newToken();
  const ttl = opts.impersonatorId ? DAY / 12 : opts.remember ? 30 * DAY : DAY;
  const h = await headers();
  await db.session.create({
    data: {
      id: hashToken(token),
      userId,
      impersonatorId: opts.impersonatorId ?? null,
      expiresAt: new Date(Date.now() + ttl),
      userAgent: (h.get('user-agent') || '').slice(0, 300),
    },
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    // Session cookie unless "remember me"; impersonation is always short.
    ...(opts.remember && !opts.impersonatorId ? { maxAge: ttl / 1000 } : {}),
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(SESSION_COOKIE);
}

/** The current session with its user, or null. Cached per request. */
export const getSession = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: {
      user: { include: { groups: true, region: true } },
      impersonator: { select: { id: true, name: true } },
    },
  });
  if (!session || session.expiresAt < new Date() || session.user.status !== 'ACTIVE') return null;
  // Touch lastSeenAt at most every 5 minutes, and never while impersonating.
  if (
    !session.impersonatorId &&
    (!session.user.lastSeenAt || Date.now() - session.user.lastSeenAt.getTime() > 5 * 60 * 1000)
  ) {
    await db.user.update({ where: { id: session.userId }, data: { lastSeenAt: new Date() } });
  }
  return session;
});

export type CurrentSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
export type CurrentUser = CurrentSession['user'];

export async function getUser() {
  return (await getSession())?.user ?? null;
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/');
  return user;
}

/** Admin pages and admin server actions. Impersonation sessions never pass. */
export async function requireAdmin(): Promise<CurrentUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'ADMIN' || session.impersonatorId) redirect('/');
  return session.user;
}

export function homeFor(role: Role): string {
  return role === 'ADMIN' ? '/admin' : '/';
}
