'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/lib/db';
import { createSession, destroySession, requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { hashPassword, makePassword, PASSWORD_MIN } from '@/lib/password';
import { appUrl, hashToken, newToken } from '@/lib/tokens';
import { mailLayout, sendMail } from '@/lib/email';
import { ROLE_LABEL } from '@/lib/labels';
import type { ActionResult } from '@/components/admin/people/types';

const id = z.string().min(1).max(64);
const role = z.enum(['LEARNER', 'TEAM_LEAD', 'ADMIN']);
const country = z.enum(['Denmark', 'Norway']);

function refresh() {
  revalidatePath('/admin/users');
  revalidatePath('/admin/groups');
}

async function regionFits(regionId: string | null, c: 'Denmark' | 'Norway') {
  if (!regionId) return true;
  return (await db.region.count({ where: { id: regionId, country: c } })) > 0;
}

// ---------- Create ----------

const createSchema = z.object({
  name: z.string().trim().min(2, 'Skriv inn navnet').max(120),
  email: z.string().trim().toLowerCase().email('Skriv inn en gyldig e-post'),
  jobTitle: z.string().trim().max(120),
  country,
  regionId: id.nullable(),
  role,
  groupIds: z.array(id).max(50),
  password: z.string().min(PASSWORD_MIN, 'Passordet må ha minst 8 tegn').max(200),
});

export async function createUser(input: z.input<typeof createSchema>): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;
  if (await db.user.findUnique({ where: { email: d.email } })) return { ok: false, error: `Det finnes allerede en bruker med ${d.email}` };
  if (!(await regionFits(d.regionId, d.country))) return { ok: false, error: 'Regionen hører til et annet land' };

  const user = await db.user.create({
    data: {
      name: d.name,
      email: d.email,
      jobTitle: d.jobTitle,
      country: d.country,
      regionId: d.regionId,
      role: d.role,
      passwordHash: await hashPassword(d.password),
      createdByAdmin: true,
      groups: { connect: d.groupIds.map((g) => ({ id: g })) },
    },
  });
  await audit(admin.id, 'user.create', { type: 'user', id: user.id }, { email: d.email, role: d.role, country: d.country, groups: d.groupIds });
  refresh();
  return { ok: true, id: user.id };
}

// ---------- Profile ----------

const updateSchema = z.object({ role: role.optional(), country: country.optional(), regionId: id.nullable().optional() });

export async function updateUser(userId: string, input: z.input<typeof updateSchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success || !id.safeParse(userId).success) return { ok: false, error: 'Invalid input' };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: 'User not found' };
  const d = parsed.data;
  if (d.role && d.role !== user.role && user.id === admin.id) return { ok: false, error: 'You cannot change your own role' };

  const nextCountry = d.country ?? (user.country === 'Both' ? 'Denmark' : user.country);
  let regionId = d.regionId === undefined ? user.regionId : d.regionId;
  // Moving country drops a region that belongs to the old one.
  if (!(await regionFits(regionId, nextCountry))) {
    if (d.regionId !== undefined) return { ok: false, error: 'That region belongs to another country' };
    regionId = null;
  }
  await db.user.update({ where: { id: userId }, data: { role: d.role, country: d.country, regionId } });
  if (d.role && d.role !== user.role)
    await audit(admin.id, 'user.role', { type: 'user', id: userId }, { from: user.role, to: d.role });
  if (d.country && d.country !== user.country)
    await audit(admin.id, 'user.country', { type: 'user', id: userId }, { from: user.country, to: d.country });
  refresh();
  return { ok: true };
}

export async function setUserGroup(userId: string, groupId: string, member: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!id.safeParse(userId).success || !id.safeParse(groupId).success) return { ok: false, error: 'Invalid input' };
  await db.user.update({
    where: { id: userId },
    data: { groups: member ? { connect: { id: groupId } } : { disconnect: { id: groupId } } },
  });
  await audit(admin.id, member ? 'group.member.add' : 'group.member.remove', { type: 'group', id: groupId }, { userId });
  refresh();
  return { ok: true };
}

export async function setDirectCourse(userId: string, courseId: string, assigned: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!id.safeParse(userId).success || !id.safeParse(courseId).success) return { ok: false, error: 'Invalid input' };
  await db.user.update({
    where: { id: userId },
    data: { directCourses: assigned ? { connect: { id: courseId } } : { disconnect: { id: courseId } } },
  });
  await audit(admin.id, assigned ? 'assignment.add' : 'assignment.remove', { type: 'course', id: courseId }, { userId });
  refresh();
  revalidatePath('/admin/courses', 'layout');
  return { ok: true };
}

// ---------- Access ----------

export async function setUserActive(userId: string, active: boolean): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!id.safeParse(userId).success) return { ok: false, error: 'Invalid input' };
  if (userId === admin.id) return { ok: false, error: 'You cannot deactivate yourself' };
  await db.$transaction([
    db.user.update({ where: { id: userId }, data: { status: active ? 'ACTIVE' : 'DEACTIVATED' } }),
    // Deactivation signs the person out everywhere at once.
    ...(active ? [] : [db.session.deleteMany({ where: { OR: [{ userId }, { impersonatorId: userId }] } })]),
  ]);
  await audit(admin.id, active ? 'user.reactivate' : 'user.deactivate', { type: 'user', id: userId });
  refresh();
  return { ok: true };
}

export async function sendPasswordReset(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const user = id.safeParse(userId).success ? await db.user.findUnique({ where: { id: userId } }) : null;
  if (!user) return { ok: false, error: 'User not found' };
  if (user.status !== 'ACTIVE') return { ok: false, error: 'Reactivate the user first' };
  const token = newToken();
  await db.passwordReset.create({ data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) } });
  const url = appUrl(`/reset/${token}`);
  await sendMail({
    to: user.email,
    subject: 'Sett nytt passord',
    text: `Administratoren din har sendt deg en lenke for å velge nytt passord til EFKT Academy. Lenken utløper om 60 minutter.\n\n${url}`,
    html: mailLayout({
      heading: 'Sett nytt passord',
      body: ['Administratoren din har sendt deg en lenke for å velge nytt passord til EFKT Academy. Lenken utløper om 60 minutter.'],
      cta: { label: 'Sett nytt passord', url },
    }),
  });
  await audit(admin.id, 'password.reset.send', { type: 'user', id: userId });
  refresh();
  return { ok: true };
}

/** "Log in as": swaps the admin's session for a short, bannered session as the learner. */
export async function impersonate(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const target = id.safeParse(userId).success ? await db.user.findUnique({ where: { id: userId } }) : null;
  if (!target) return { ok: false, error: 'User not found' };
  if (target.id === admin.id) return { ok: false, error: 'You cannot log in as yourself' };
  if (target.role === 'ADMIN') return { ok: false, error: `You cannot log in as another ${ROLE_LABEL.ADMIN.toLowerCase()}` };
  if (target.status !== 'ACTIVE') return { ok: false, error: 'Reactivate the user first' };

  await audit(admin.id, 'impersonation.start', { type: 'user', id: target.id }, { email: target.email });
  await destroySession();
  await createSession(target.id, { impersonatorId: admin.id });
  redirect('/');
}

/** A readable one-off password for the create-user form. */
export async function generatePassword(): Promise<string> {
  await requireAdmin();
  return makePassword();
}
