import { PrismaClient } from '@prisma/client';
import { createHash } from 'node:crypto';
import { processInvitationReminders } from '../src/lib/invitations';
const db = new PrismaClient();
const DAY = 86400000;
(async () => {
  const link = process.argv[2];
  const tok = link.split('/invite/')[1];
  const sec = await db.invitation.findFirst({ where: { email: 'zz.second@efkt.com' } });
  console.log('second status', sec?.status, 'hash matches copied link', sec?.tokenHash === createHash('sha256').update(tok).digest('hex'));
  // snapshot all non-test invites to restore afterwards
  const snap = await db.invitation.findMany({ where: { NOT: { email: { startsWith: 'zz.' } } } });
  const t0 = new Date();
  const tp = await db.invitation.findFirstOrThrow({ where: { email: 'zz.testperson@efkt.no' } });
  await db.invitation.update({ where: { id: tp.id }, data: { sentAt: new Date(Date.now() - 8 * DAY) } });
  const ex = await db.invitation.create({ data: { email: 'zz.expired@efkt.com', tokenHash: 'zz-' + Date.now(), expiresAt: new Date(Date.now() - DAY) } });
  console.log(await processInvitationReminders());
  console.log('tp after', await db.invitation.findUnique({ where: { id: tp.id }, select: { remindersSent: true, lastRemindedAt: true, status: true } }));
  console.log('expired after', (await db.invitation.findUnique({ where: { id: ex.id } }))?.status);
  const mails = await db.emailOutbox.findMany({ where: { createdAt: { gte: t0 } }, select: { id: true, to: true, subject: true } });
  console.log(mails);
  // restore
  for (const s of snap) {
    const { id, ...rest } = s;
    await db.invitation.update({ where: { id }, data: { status: rest.status, tokenHash: rest.tokenHash, remindersSent: rest.remindersSent, lastRemindedAt: rest.lastRemindedAt, expiresAt: rest.expiresAt, sentAt: rest.sentAt } });
  }
  await db.emailOutbox.deleteMany({ where: { createdAt: { gte: t0 }, NOT: { to: { startsWith: 'zz.' } } } });
  await db.$disconnect();
})();
