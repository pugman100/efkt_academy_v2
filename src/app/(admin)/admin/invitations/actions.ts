'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { db } from '@/lib/db';
import {
  createInvitation,
  inviteCountry,
  newInvitationLink,
  resendInvitation,
  revokeInvitation,
  saveInviteSettings,
} from '@/lib/invitations';

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const PATH = '/admin/invitations';
const fail = (e: unknown): { ok: false; error: string } => ({ ok: false, error: e instanceof Error ? e.message : 'Something went wrong' });

const sendSchema = z.object({
  recipients: z.array(z.object({ email: z.string().trim().toLowerCase().email(), name: z.string().trim().max(120) })).min(1).max(500),
  role: z.enum(['LEARNER', 'TEAM_LEAD', 'ADMIN']),
  country: z.enum(['auto', 'Denmark', 'Norway']),
  groupIds: z.array(z.string()).max(100),
  categoryIds: z.array(z.string()).max(100),
  message: z.string().max(2000),
});

export async function sendInvitations(input: z.input<typeof sendSchema>): Promise<Result<{ sent: string[]; skipped: string[] }>> {
  const admin = await requireAdmin();
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Check the email addresses' };
  const d = parsed.data;
  const emails = [...new Set(d.recipients.map((r) => r.email))];
  const [users, open] = await Promise.all([
    db.user.findMany({ where: { email: { in: emails, mode: 'insensitive' } }, select: { email: true } }),
    db.invitation.findMany({ where: { email: { in: emails }, status: 'PENDING' }, select: { email: true } }),
  ]);
  const taken = new Set([...users, ...open].map((x) => x.email.toLowerCase()));
  const [groupIds, categoryIds] = await Promise.all([
    db.group.findMany({ where: { id: { in: d.groupIds } }, select: { id: true } }).then((r) => r.map((g) => g.id)),
    db.category.findMany({ where: { id: { in: d.categoryIds } }, select: { id: true } }).then((r) => r.map((c) => c.id)),
  ]);
  const sent: string[] = [];
  const skipped: string[] = [];
  const seen = new Set<string>();
  for (const r of d.recipients) {
    if (seen.has(r.email)) continue;
    seen.add(r.email);
    if (taken.has(r.email)) { skipped.push(r.email); continue; }
    const { invitation } = await createInvitation({
      email: r.email,
      name: r.name,
      role: d.role,
      country: d.country === 'auto' ? inviteCountry(r.email) : d.country,
      message: d.message,
      groupIds,
      categoryIds,
      invitedById: admin.id,
    });
    await audit(admin.id, 'invitation.create', { type: 'invitation', id: invitation.id }, { email: r.email, role: d.role, country: invitation.country, groupIds, categoryIds });
    sent.push(r.email);
  }
  revalidatePath(PATH);
  return { ok: true, sent, skipped };
}

const id = z.string().min(1);

export async function resendInvite(inviteId: string): Promise<Result<{ email: string }>> {
  const admin = await requireAdmin();
  try {
    const { invitation, mailed } = await resendInvitation(id.parse(inviteId));
    await audit(admin.id, 'invitation.resend', { type: 'invitation', id: invitation.id }, { email: invitation.email, mailed });
    revalidatePath(PATH);
    return { ok: true, email: invitation.email };
  } catch (e) {
    return fail(e);
  }
}

export async function revokeInvite(inviteId: string): Promise<Result> {
  const admin = await requireAdmin();
  try {
    const inv = await revokeInvitation(id.parse(inviteId));
    await audit(admin.id, 'invitation.revoke', { type: 'invitation', id: inv.id }, { email: inv.email });
    revalidatePath(PATH);
    return { ok: true };
  } catch (e) {
    return fail(e);
  }
}

/** Mints a new link (the previous one stops working) for the admin to paste elsewhere. */
export async function copyInviteLink(inviteId: string): Promise<Result<{ link: string }>> {
  const admin = await requireAdmin();
  try {
    const { invitation, link } = await newInvitationLink(id.parse(inviteId));
    await audit(admin.id, 'invitation.link', { type: 'invitation', id: invitation.id }, { email: invitation.email });
    revalidatePath(PATH);
    return { ok: true, link };
  } catch (e) {
    return fail(e);
  }
}

const settingsSchema = z.object({
  autoRemind: z.boolean(),
  remindAfterDays: z.number().int().min(1).max(60),
  maxReminders: z.number().int().min(1).max(10),
}).partial();

export async function updateInviteSettings(patch: z.input<typeof settingsSchema>): Promise<Result> {
  const admin = await requireAdmin();
  const parsed = settingsSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: 'Invalid setting' };
  const next = await saveInviteSettings(parsed.data);
  await audit(admin.id, 'invitation.settings', { type: 'setting', id: 'invitations' }, next);
  revalidatePath(PATH);
  return { ok: true };
}
