'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { appUrl, hashToken, newToken } from '@/lib/tokens';
import { mailLayout, sendMail } from '@/lib/email';

/** Outcome of a batch action: how many users changed, and why the rest were left alone. */
export type BulkResult = { ok: true; done: number; skipped: string[] } | { ok: false; error: string };

const MAX = 500;
const ids = z.array(z.string().min(1).max(64)).min(1, 'Select at least one user').max(MAX, `Select at most ${MAX} users at a time`);
const role = z.enum(['LEARNER', 'TEAM_LEAD', 'ADMIN']);
const country = z.enum(['Denmark', 'Norway']);

function refresh() {
  revalidatePath('/admin/users');
  revalidatePath('/admin/groups');
  revalidatePath('/admin/courses', 'layout');
}

async function start(userIds: unknown) {
  const admin = await requireAdmin();
  const parsed = ids.safeParse(userIds);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const users = await db.user.findMany({
    where: { id: { in: [...new Set(parsed.data)] } },
    select: { id: true, name: true, email: true, role: true, status: true, country: true, regionId: true },
  });
  return { ok: true as const, admin, users };
}

/** One audit row per user, all written together. */
function auditMany(actorId: string, action: string, type: string, rows: { id: string; details?: Prisma.InputJsonValue }[]) {
  return db.auditLog.createMany({
    data: rows.map((r) => ({ actorId, action, targetType: type, targetId: r.id, details: { bulk: true, ...((r.details as object) ?? {}) } })),
  });
}

const note = (n: number, why: string) => (n ? [`${n} ${why}`] : []);

// ---------- Groups ----------

export async function bulkSetGroups(userIds: string[], groupIds: string[], add: boolean): Promise<BulkResult> {
  const s = await start(userIds);
  if (!s.ok) return s;
  const g = z.array(z.string().min(1).max(64)).min(1, 'Choose at least one group').max(50).safeParse(groupIds);
  if (!g.success) return { ok: false, error: g.error.issues[0]?.message ?? 'Invalid input' };
  const groups = await db.group.findMany({ where: { id: { in: g.data } }, select: { id: true, users: { where: { id: { in: s.users.map((u) => u.id) } }, select: { id: true } } } });
  if (!groups.length) return { ok: false, error: 'Group not found' };

  // Only users whose membership actually changes count as done.
  const changed = new Set<string>();
  for (const grp of groups) {
    const members = new Set(grp.users.map((u) => u.id));
    for (const u of s.users) if (add !== members.has(u.id)) changed.add(u.id);
  }
  const targets = s.users.filter((u) => changed.has(u.id));
  const link = groups.map((grp) => ({ id: grp.id }));
  await db.$transaction([
    ...targets.map((u) => db.user.update({ where: { id: u.id }, data: { groups: add ? { connect: link } : { disconnect: link } } })),
    auditMany(s.admin.id, add ? 'group.member.add' : 'group.member.remove', 'user', targets.map((u) => ({ id: u.id, details: { groupIds: groups.map((x) => x.id) } }))),
  ]);
  refresh();
  return { ok: true, done: targets.length, skipped: note(s.users.length - targets.length, add ? 'already in the group' : 'not in the group') };
}

// ---------- Status ----------

export async function bulkSetActive(userIds: string[], active: boolean): Promise<BulkResult> {
  const s = await start(userIds);
  if (!s.ok) return s;
  const self = s.users.some((u) => u.id === s.admin.id);
  const targets = s.users.filter((u) => u.id !== s.admin.id && (u.status === 'ACTIVE') === !active);
  const tIds = targets.map((u) => u.id);
  await db.$transaction([
    db.user.updateMany({ where: { id: { in: tIds } }, data: { status: active ? 'ACTIVE' : 'DEACTIVATED' } }),
    // Deactivation signs people out everywhere at once.
    ...(active ? [] : [db.session.deleteMany({ where: { OR: [{ userId: { in: tIds } }, { impersonatorId: { in: tIds } }] } })]),
    auditMany(s.admin.id, active ? 'user.reactivate' : 'user.deactivate', 'user', targets),
  ]);
  refresh();
  return {
    ok: true,
    done: targets.length,
    skipped: [...(self && !active ? ['you (you cannot deactivate yourself)'] : []), ...note(s.users.length - targets.length - (self && !active ? 1 : 0), active ? 'already active' : 'already deactivated')],
  };
}

// ---------- Role ----------

export async function bulkSetRole(userIds: string[], nextRole: string): Promise<BulkResult> {
  const s = await start(userIds);
  if (!s.ok) return s;
  const r = role.safeParse(nextRole);
  if (!r.success) return { ok: false, error: 'Choose a role' };
  const self = s.users.some((u) => u.id === s.admin.id && u.role !== r.data);
  const targets = s.users.filter((u) => u.id !== s.admin.id && u.role !== r.data);
  await db.$transaction([
    db.user.updateMany({ where: { id: { in: targets.map((u) => u.id) } }, data: { role: r.data } }),
    auditMany(s.admin.id, 'user.role', 'user', targets.map((u) => ({ id: u.id, details: { from: u.role, to: r.data } }))),
  ]);
  refresh();
  return {
    ok: true,
    done: targets.length,
    skipped: [...(self ? ['you (you cannot change your own role)'] : []), ...note(s.users.length - targets.length - (self ? 1 : 0), 'already had that role')],
  };
}

// ---------- Country and region ----------

export async function bulkSetLocation(userIds: string[], nextCountry: string, regionId: string | null): Promise<BulkResult> {
  const s = await start(userIds);
  if (!s.ok) return s;
  const c = country.safeParse(nextCountry);
  if (!c.success) return { ok: false, error: 'Choose a country' };
  if (regionId && !(await db.region.count({ where: { id: regionId, country: c.data } }))) return { ok: false, error: 'That region belongs to another country' };
  const targets = s.users.filter((u) => u.country !== c.data || u.regionId !== regionId);
  await db.$transaction([
    db.user.updateMany({ where: { id: { in: targets.map((u) => u.id) } }, data: { country: c.data, regionId } }),
    auditMany(s.admin.id, 'user.country', 'user', targets.map((u) => ({ id: u.id, details: { from: u.country, to: c.data, regionId } }))),
  ]);
  refresh();
  return { ok: true, done: targets.length, skipped: note(s.users.length - targets.length, 'already there') };
}

// ---------- Password reset ----------

export async function bulkSendPasswordReset(userIds: string[]): Promise<BulkResult> {
  const s = await start(userIds);
  if (!s.ok) return s;
  const targets = s.users.filter((u) => u.status === 'ACTIVE');
  for (const u of targets) {
    const token = newToken();
    await db.passwordReset.create({ data: { userId: u.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
    const url = appUrl(`/reset/${token}`);
    await sendMail({
      to: u.email,
      subject: 'Sett nytt passord',
      text: `Administratoren din har sendt deg en lenke for å velge nytt passord til EFKT Academy. Lenken utløper om 60 minutter.\n\n${url}`,
      html: mailLayout({
        heading: 'Sett nytt passord',
        body: ['Administratoren din har sendt deg en lenke for å velge nytt passord til EFKT Academy. Lenken utløper om 60 minutter.'],
        cta: { label: 'Sett nytt passord', url },
      }),
    });
  }
  await auditMany(s.admin.id, 'password.reset.send', 'user', targets);
  refresh();
  return { ok: true, done: targets.length, skipped: note(s.users.length - targets.length, 'deactivated') };
}

// ---------- Delete ----------

/**
 * Permanently deletes deactivated users with their progress, quiz results and sessions.
 * Active users are never deleted: deactivate first. `confirm` must equal the number of
 * users that will be deleted, as typed by the admin.
 */
export async function bulkDelete(userIds: string[], confirm: number): Promise<BulkResult> {
  const s = await start(userIds);
  if (!s.ok) return s;
  const targets = s.users.filter((u) => u.id !== s.admin.id && u.status === 'DEACTIVATED');
  if (!targets.length) return { ok: false, error: 'Only deactivated users can be deleted. Deactivate them first.' };
  if (confirm !== targets.length) return { ok: false, error: `Type ${targets.length} to confirm` };
  await db.$transaction([
    // Written first, in the same transaction, so the log keeps who was deleted.
    auditMany(s.admin.id, 'user.delete', 'user', targets.map((u) => ({ id: u.id, details: { name: u.name, email: u.email, role: u.role } }))),
    db.user.deleteMany({ where: { id: { in: targets.map((u) => u.id) }, status: 'DEACTIVATED' } }),
  ]);
  refresh();
  return { ok: true, done: targets.length, skipped: note(s.users.length - targets.length, 'still active (deactivate them first)') };
}
