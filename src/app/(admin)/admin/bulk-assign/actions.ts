'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { audit } from '@/lib/audit';

const ids = z.array(z.string().min(1).max(64)).max(2000);
const schema = z.object({ userIds: ids, groupIds: ids, courseIds: ids.min(1, 'Pick at least one course') });

/** Connects every chosen course to every chosen group and person, in one transaction. */
export async function bulkAssign(input: z.input<typeof schema>): Promise<{ ok: true; courses: number } | { ok: false; error: string }> {
  const admin = await requireAdmin();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { userIds, groupIds, courseIds } = parsed.data;
  if (!userIds.length && !groupIds.length) return { ok: false, error: 'Pick at least one person or group' };

  const courses = await db.course.findMany({ where: { id: { in: courseIds }, status: { not: 'ARCHIVED' } }, select: { id: true } });
  if (courses.length !== courseIds.length) return { ok: false, error: 'Some courses no longer exist or are archived' };

  await db.$transaction(
    courses.map((c) =>
      db.course.update({
        where: { id: c.id },
        data: {
          groups: { connect: groupIds.map((id) => ({ id })) },
          users: { connect: userIds.map((id) => ({ id })) },
        },
      }),
    ),
  );
  await audit(admin.id, 'assignment.bulk', { type: 'course' }, { courseIds, groupIds, userIds });
  revalidatePath('/admin', 'layout');
  return { ok: true, courses: courses.length };
}
