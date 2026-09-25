import type { Prisma } from '@prisma/client';
import { db } from './db';

/** Audited actions: assignments, pass-mark changes, impersonation, deactivation, etc. */
export async function audit(
  actorId: string | null,
  action: string,
  target: { type?: string; id?: string } = {},
  details: Prisma.InputJsonValue = {},
) {
  await db.auditLog.create({
    data: { actorId, action, targetType: target.type ?? '', targetId: target.id ?? '', details },
  });
}
