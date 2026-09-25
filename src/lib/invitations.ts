import 'server-only';
import type { Country, Prisma, Role } from '@prisma/client';
import { db } from './db';
import { sendMail, mailLayout } from './email';
import { appUrl, hashToken, newToken } from './tokens';
import { dateNo } from './format';

const DAY = 24 * 60 * 60 * 1000;

/** Stored in the `Setting` row with key `invitations`. */
export type InviteSettings = { autoRemind: boolean; remindAfterDays: number; maxReminders: number; expiryDays: number };
export const INVITE_SETTINGS_KEY = 'invitations';
const DEFAULTS: InviteSettings = { autoRemind: true, remindAfterDays: 7, maxReminders: 2, expiryDays: 14 };

export async function getInviteSettings(): Promise<InviteSettings> {
  const row = await db.setting.findUnique({ where: { key: INVITE_SETTINGS_KEY } });
  const v = (row?.value ?? {}) as Partial<InviteSettings>;
  return { ...DEFAULTS, ...v };
}

export async function saveInviteSettings(patch: Partial<InviteSettings>): Promise<InviteSettings> {
  const next = { ...(await getInviteSettings()), ...patch };
  await db.setting.upsert({ where: { key: INVITE_SETTINGS_KEY }, create: { key: INVITE_SETTINGS_KEY, value: next }, update: { value: next } });
  return next;
}

/** Country guessed from the address, as in the prototype: `.no` → Norway, everything else → Denmark. */
export function inviteCountry(email: string): Exclude<Country, 'Both'> {
  return email.trim().toLowerCase().endsWith('.no') ? 'Norway' : 'Denmark';
}

export function inviteLink(token: string): string {
  return appUrl('/invite/' + token);
}

type MailKind = 'invite' | 'reminder';

async function sendInviteMail(
  inv: { email: string; name: string; message: string; expiresAt: Date; invitedBy?: { name: string } | null },
  token: string,
  kind: MailKind,
) {
  const url = inviteLink(token);
  const hello = inv.name ? `Hei ${inv.name.split(' ')[0]},` : 'Hei,';
  const from = inv.invitedBy?.name ? `${inv.invitedBy.name} har invitert deg` : 'Du er invitert';
  const body = [
    hello,
    kind === 'reminder'
      ? 'En liten påminnelse: invitasjonen din til EFKT Academy venter fortsatt på deg.'
      : `${from} til EFKT Academy – stedet for kurs, nyheter og alt du trenger for oppdragene dine.`,
    ...(inv.message.trim() ? [inv.message.trim()] : []),
    `Opprett kontoen din med knappen under. Lenken gjelder til ${dateNo(inv.expiresAt)}.`,
  ];
  const subject = kind === 'reminder' ? 'Påminnelse: Du er invitert til EFKT Academy' : 'Du er invitert til EFKT Academy';
  const text = [...body, `Opprett konto: ${url}`, 'Hilsen EFKT Academy'].join('\n\n');
  return sendMail({
    to: inv.email,
    subject,
    text,
    html: mailLayout({ heading: 'Velkommen til EFKT Academy', body, cta: { label: 'Opprett konto', url } }),
  });
}

export type NewInvitation = {
  email: string;
  name?: string;
  role: Role;
  country?: Country;
  message?: string;
  groupIds?: string[];
  categoryIds?: string[];
  invitedById: string | null;
};

/** Creates a PENDING invitation (only the token hash is stored) and emails the link. */
export async function createInvitation(input: NewInvitation) {
  const settings = await getInviteSettings();
  const token = newToken();
  const email = input.email.trim().toLowerCase();
  const invitation = await db.invitation.create({
    data: {
      email,
      name: input.name?.trim() ?? '',
      role: input.role,
      country: input.country && input.country !== 'Both' ? input.country : inviteCountry(email),
      message: input.message?.trim() ?? '',
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + settings.expiryDays * DAY),
      invitedById: input.invitedById,
      groups: { connect: (input.groupIds ?? []).map((id) => ({ id })) },
      categories: { connect: (input.categoryIds ?? []).map((id) => ({ id })) },
    },
    include: { invitedBy: { select: { name: true } } },
  });
  const mail = await sendInviteMail(invitation, token, 'invite');
  return { invitation, link: inviteLink(token), mailed: mail.ok };
}

/** Swaps in a fresh token (the old link stops working) and returns it. */
async function rotate(id: string, data: Prisma.InvitationUpdateInput = {}) {
  const token = newToken();
  const invitation = await db.invitation.update({
    where: { id },
    data: { ...data, tokenHash: hashToken(token) },
    include: { invitedBy: { select: { name: true } } },
  });
  return { invitation, token };
}

function assertOpen(inv: { status: string } | null): asserts inv {
  if (!inv) throw new Error('Invitation not found');
  if (inv.status === 'ACCEPTED' || inv.status === 'REVOKED') throw new Error('Invitation is no longer open');
}

/** Sends the invitation again with a new link and a full expiry window; the reminder cycle restarts. */
export async function resendInvitation(id: string) {
  assertOpen(await db.invitation.findUnique({ where: { id }, select: { status: true } }));
  const { expiryDays } = await getInviteSettings();
  const { invitation, token } = await rotate(id, {
    status: 'PENDING',
    sentAt: new Date(),
    expiresAt: new Date(Date.now() + expiryDays * DAY),
    remindersSent: 0,
    lastRemindedAt: null,
  });
  const mail = await sendInviteMail(invitation, token, 'invite');
  return { invitation, link: inviteLink(token), mailed: mail.ok };
}

/** Automatic reminder: new link, same expiry. */
export async function sendReminder(id: string) {
  const current = await db.invitation.findUnique({ where: { id }, select: { status: true } });
  assertOpen(current);
  if (current.status !== 'PENDING') throw new Error('Only pending invitations get reminders');
  const { invitation, token } = await rotate(id, { remindersSent: { increment: 1 }, lastRemindedAt: new Date() });
  const mail = await sendInviteMail(invitation, token, 'reminder');
  return { invitation, link: inviteLink(token), mailed: mail.ok };
}

/**
 * "Copy link": raw tokens are never stored, so a new link is minted (the emailed one stops
 * working). An expired invitation is reopened with a fresh expiry window. Nothing is emailed.
 */
export async function newInvitationLink(id: string) {
  const current = await db.invitation.findUnique({ where: { id }, select: { status: true, expiresAt: true } });
  assertOpen(current);
  const { expiryDays } = await getInviteSettings();
  const stale = current.status === 'EXPIRED' || current.expiresAt < new Date();
  const { invitation, token } = await rotate(id, stale ? { status: 'PENDING', expiresAt: new Date(Date.now() + expiryDays * DAY) } : {});
  return { invitation, link: inviteLink(token) };
}

export async function revokeInvitation(id: string) {
  return db.invitation.update({ where: { id }, data: { status: 'REVOKED' } });
}

/** When the next automatic reminder is due, or null if none will be sent. */
export function nextReminderAt(
  inv: { status: string; sentAt: Date; lastRemindedAt: Date | null; remindersSent: number; expiresAt: Date },
  s: InviteSettings,
): Date | null {
  if (!s.autoRemind || inv.status !== 'PENDING' || inv.remindersSent >= s.maxReminders) return null;
  const at = new Date((inv.lastRemindedAt ?? inv.sentAt).getTime() + s.remindAfterDays * DAY);
  return at < inv.expiresAt ? at : null;
}

/**
 * Scheduled job (called from the cron endpoint): expires overdue PENDING invitations,
 * then sends the reminders that are due according to the settings.
 */
export async function processInvitationReminders() {
  const now = new Date();
  const expired = await db.invitation.updateMany({ where: { status: 'PENDING', expiresAt: { lt: now } }, data: { status: 'EXPIRED' } });
  const settings = await getInviteSettings();
  let reminded = 0;
  const failed: string[] = [];
  if (settings.autoRemind) {
    const candidates = await db.invitation.findMany({
      where: { status: 'PENDING', remindersSent: { lt: settings.maxReminders } },
      select: { id: true, status: true, sentAt: true, lastRemindedAt: true, remindersSent: true, expiresAt: true },
    });
    for (const inv of candidates) {
      const due = nextReminderAt(inv, settings);
      if (!due || due > now) continue;
      try {
        await sendReminder(inv.id);
        reminded++;
      } catch (e) {
        failed.push(`${inv.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }
  return { expired: expired.count, reminded, failed };
}
