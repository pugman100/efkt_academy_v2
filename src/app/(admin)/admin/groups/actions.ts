'use server';

import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import type { ActionResult } from '@/components/admin/people/types';

const id = z.string().min(1).max(64);
const groupSchema = z.object({
  id: id.nullable(),
  name: z.string().trim().min(2, 'Give the group a name').max(80),
  description: z.string().trim().max(500),
  memberIds: z.array(id).max(5000),
});

function refresh() {
  revalidatePath('/admin/groups');
  revalidatePath('/admin/users');
}

/** Create or edit a group; `memberIds` is the complete new member list. */
export async function saveGroup(input: z.input<typeof groupSchema>): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = groupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { id: groupId, name, description, memberIds } = parsed.data;
  const users = memberIds.map((u) => ({ id: u }));
  try {
    if (groupId) {
      const before = await db.group.findUnique({ where: { id: groupId }, include: { users: { select: { id: true } } } });
      if (!before) return { ok: false, error: 'Group not found' };
      await db.group.update({ where: { id: groupId }, data: { name, description, users: { set: users } } });
      const was = new Set(before.users.map((u) => u.id));
      const now = new Set(memberIds);
      await audit(admin.id, 'group.update', { type: 'group', id: groupId }, {
        name,
        added: memberIds.filter((u) => !was.has(u)),
        removed: [...was].filter((u) => !now.has(u)),
      });
    } else {
      const g = await db.group.create({ data: { name, description, users: { connect: users } } });
      await audit(admin.id, 'group.create', { type: 'group', id: g.id }, { name, members: memberIds.length });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { ok: false, error: `A group called ${name} already exists` };
    throw e;
  }
  refresh();
  return { ok: true };
}

export async function deleteGroup(groupId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!id.safeParse(groupId).success) return { ok: false, error: 'Invalid input' };
  const g = await db.group.findUnique({ where: { id: groupId }, select: { name: true } });
  if (!g) return { ok: false, error: 'Group not found' };
  await db.group.delete({ where: { id: groupId } });
  await audit(admin.id, 'group.delete', { type: 'group', id: groupId }, { name: g.name });
  refresh();
  revalidatePath('/admin/courses', 'layout');
  return { ok: true };
}
