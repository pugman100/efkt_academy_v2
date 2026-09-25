'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { db } from '@/lib/db';

const schema = z.object({
  regionId: z.string().min(1),
  name: z.string().trim().min(1, 'Give the region a teamleader name').max(120),
  email: z.union([z.literal(''), z.string().trim().email('Check the email address')]),
  mobile: z.string().trim().max(40),
});

/** Replaces the person holding a region. The region itself is fixed. */
export async function updateTeamleader(input: z.input<typeof schema>): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse({ ...input, email: input.email?.trim() ?? '' });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  const { regionId, name, email, mobile } = parsed.data;
  const before = await db.region.findUnique({ where: { id: regionId } });
  if (!before) return { ok: false, error: 'Region not found' };
  await db.region.update({ where: { id: regionId }, data: { leadName: name, leadEmail: email, leadMobile: mobile } });
  await audit(admin.id, 'teamleader.update', { type: 'region', id: regionId }, {
    region: before.name,
    before: { name: before.leadName, email: before.leadEmail, mobile: before.leadMobile },
    after: { name, email, mobile },
  });
  revalidatePath('/admin/teamleaders');
  revalidatePath('/', 'layout');
  return { ok: true };
}
