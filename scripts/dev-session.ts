/* Dev helper: mints a session for a user and prints the cookie value.
 * Usage: npx tsx scripts/dev-session.ts mpu@efkt.com
 */
import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const db = new PrismaClient();
(async () => {
  const email = process.argv[2] || 'mpu@efkt.com';
  const user = await db.user.findUniqueOrThrow({ where: { email } });
  const token = randomBytes(32).toString('base64url');
  await db.session.create({
    data: { id: createHash('sha256').update(token).digest('hex'), userId: user.id, expiresAt: new Date(Date.now() + 7 * 86400_000) },
  });
  console.log(token);
  await db.$disconnect();
})();
