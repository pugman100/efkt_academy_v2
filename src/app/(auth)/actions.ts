'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession, homeFor } from '@/lib/auth';
import { hashPassword, passwordOk, verifyPassword, PASSWORD_MIN } from '@/lib/password';
import { appUrl, hashToken, newToken } from '@/lib/tokens';
import { mailLayout, sendMail } from '@/lib/email';
import { audit } from '@/lib/audit';
import { saveImage } from '@/lib/storage';

const WINDOW = 15 * 60 * 1000;
const LOCK_AFTER = 5;
const RESET_TTL = 60 * 60 * 1000;

async function clientIp() {
  const h = await headers();
  return (h.get('x-forwarded-for')?.split(',')[0] || h.get('x-real-ip') || 'unknown').trim();
}

export type LoginState = { error?: string; email?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const remember = form.get('remember') === 'on';
  const next = String(form.get('next') || '');
  if (!email || !password) return { error: 'Fyll inn både e-post og passord.', email };

  const ip = await clientIp();
  const since = new Date(Date.now() - WINDOW);
  const [failsForEmail, failsForIp] = await Promise.all([
    db.loginAttempt.count({ where: { email, success: false, createdAt: { gte: since } } }),
    db.loginAttempt.count({ where: { ip, success: false, createdAt: { gte: since } } }),
  ]);
  if (failsForEmail >= LOCK_AFTER || failsForIp >= 30) {
    return { error: 'Kontoen er midlertidig låst etter fem forsøk. Prøv igjen om 15 minutter, eller bruk «Glemt passord?».', email };
  }

  const user = await db.user.findUnique({ where: { email } });
  const ok = !!user && user.status === 'ACTIVE' && (await verifyPassword(password, user.passwordHash));
  await db.loginAttempt.create({ data: { email, ip, success: ok } });

  if (!ok || !user) {
    const n = failsForEmail + 1;
    if (n >= LOCK_AFTER) return { error: 'Kontoen er midlertidig låst etter fem forsøk. Prøv igjen om 15 minutter, eller bruk «Glemt passord?».', email };
    if (n >= 3) return { error: 'Tre forsøk uten hell. Bruk «Glemt passord?» for å sette et nytt — kontoen låses etter fem forsøk.', email };
    return { error: `Feil e-post eller passord. Forsøk ${n} av 5.`, email };
  }

  await db.loginAttempt.deleteMany({ where: { email, success: false } });
  await createSession(user.id, { remember });
  // Only follow same-site relative paths.
  const dest = next.startsWith('/') && !next.startsWith('//') ? next : homeFor(user.role);
  redirect(user.role !== 'ADMIN' && dest.startsWith('/admin') ? '/' : dest);
}

export type ForgotState = { sent?: boolean; email?: string; error?: string; resends?: number };

export async function requestReset(prev: ForgotState, form: FormData): Promise<ForgotState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const resend = form.get('resend') === '1';
  if (!z.string().email().safeParse(email).success) return { error: 'Skriv inn en gyldig e-postadresse.', email };
  const resends = resend ? (prev.resends ?? 0) + 1 : 0;
  if (resends > 3) return { ...prev, error: 'Grensen er nådd. Kontakt teamlederen din.' };

  // Same response whether or not the address exists — no account enumeration.
  const user = await db.user.findUnique({ where: { email } });
  const recent = user
    ? await db.passwordReset.count({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - RESET_TTL) } } })
    : 0;
  if (user && user.status === 'ACTIVE' && recent < 5) {
    const token = newToken();
    await db.passwordReset.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL) } });
    const url = appUrl(`/reset/${token}`);
    await sendMail({
      to: user.email,
      subject: 'Sett nytt passord',
      text: `Noen har bedt om nytt passord til Photographer Dashboard. Åpne lenken for å velge et nytt. Lenken utløper om 60 minutter.\n\n${url}\n\nBa du ikke om dette? Da kan du se bort fra e-posten — passordet ditt er uendret.`,
      html: mailLayout({
        heading: 'Sett nytt passord',
        body: ['Noen har bedt om nytt passord til Photographer Dashboard. Trykk på knappen under for å velge et nytt. Lenken utløper om 60 minutter.'],
        cta: { label: 'Sett nytt passord', url },
        footer: 'Ba du ikke om dette? Da kan du se bort fra e-posten — passordet ditt er uendret.',
      }),
    });
  }
  return { sent: true, email, resends };
}

async function validResetToken(token: string) {
  const row = await db.passwordReset.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date() || row.user.status !== 'ACTIVE') return null;
  return row;
}

export async function resetEmailFor(token: string): Promise<string | null> {
  return (await validResetToken(token))?.user.email ?? null;
}

export type ResetState = { error?: string; done?: boolean; expired?: boolean; email?: string };

export async function resetPassword(_prev: ResetState, form: FormData): Promise<ResetState> {
  const token = String(form.get('token') || '');
  const pw1 = String(form.get('pw1') || '');
  const pw2 = String(form.get('pw2') || '');
  const row = await validResetToken(token);
  if (!row) return { expired: true };
  if (!passwordOk(pw1)) return { error: 'Passordet oppfyller ikke alle kravene' };
  if (pw1 !== pw2) return { error: 'Passordene er ikke like' };

  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(pw1) } }),
    db.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    // Signed out everywhere else when the password changes.
    db.session.deleteMany({ where: { userId: row.userId } }),
    db.loginAttempt.deleteMany({ where: { email: row.user.email, success: false } }),
  ]);
  await audit(row.userId, 'password.reset', { type: 'user', id: row.userId });
  await sendMail({
    to: row.user.email,
    subject: 'Passordet ditt er endret',
    text: 'Passordet ditt til Photographer Dashboard er endret. Var det ikke deg? Kontakt teamlederen din med en gang.',
    html: mailLayout({
      heading: 'Passordet er endret',
      body: ['Passordet ditt til Photographer Dashboard er endret.', 'Var det ikke deg? Kontakt teamlederen din med en gang.'],
    }),
  });
  return { done: true, email: row.user.email };
}

// ---------- Invitations ----------

export async function findInvitation(token: string) {
  const inv = await db.invitation.findUnique({ where: { tokenHash: hashToken(token) }, include: { groups: true } });
  if (!inv) return { state: 'invalid' as const };
  if (inv.status === 'ACCEPTED') return { state: 'accepted' as const, inv };
  if (inv.status !== 'PENDING' || inv.expiresAt < new Date()) return { state: 'expired' as const, inv };
  return { state: 'ok' as const, inv };
}

export type AcceptState = { error?: string; done?: boolean; groups?: string[] };

export async function acceptInvitation(_prev: AcceptState, form: FormData): Promise<AcceptState> {
  const token = String(form.get('token') || '');
  const name = String(form.get('name') || '').trim();
  const bio = String(form.get('bio') || '').trim().slice(0, 1000);
  const password = String(form.get('password') || '');
  const photo = form.get('photo');

  const found = await findInvitation(token);
  if (found.state !== 'ok') return { error: 'This invitation is no longer valid. Ask your administrator for a new one.' };
  const inv = await db.invitation.findUniqueOrThrow({ where: { id: found.inv.id }, include: { groups: true, categories: true } });
  if (name.length < 2) return { error: 'Please enter your full name.' };
  if (password.length < PASSWORD_MIN) return { error: 'Password needs at least 8 characters' };
  if (await db.user.findUnique({ where: { email: inv.email.toLowerCase() } }))
    return { error: 'An account with this email already exists. Sign in instead.' };

  let photoId: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    try {
      photoId = await saveImage(photo);
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Could not save the photo.' };
    }
  }

  // Categories chosen on the invitation grant their published courses directly.
  const categoryCourses = inv.categories.length
    ? await db.course.findMany({ where: { categories: { some: { id: { in: inv.categories.map((c) => c.id) } } } }, select: { id: true } })
    : [];

  const user = await db.user.create({
    data: {
      email: inv.email.toLowerCase(),
      name,
      bio,
      photoId,
      passwordHash: await hashPassword(password),
      role: inv.role,
      country: inv.country === 'Both' ? 'Denmark' : inv.country,
      groups: { connect: inv.groups.map((g) => ({ id: g.id })) },
      directCourses: { connect: categoryCourses },
    },
  });
  await db.invitation.update({ where: { id: inv.id }, data: { status: 'ACCEPTED', acceptedAt: new Date() } });
  await audit(user.id, 'invitation.accept', { type: 'invitation', id: inv.id }, { email: inv.email });
  await createSession(user.id);
  return { done: true, groups: inv.groups.map((g) => g.name) };
}
