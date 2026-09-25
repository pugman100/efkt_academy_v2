/* Dev/ops helper: set a user's password.  Usage: npx tsx scripts/set-password.ts <email> <password> */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();
(async () => {
  const [email, pw] = process.argv.slice(2);
  if (!email || !pw) throw new Error('Usage: set-password.ts <email> <password>');
  await db.user.update({ where: { email: email.toLowerCase() }, data: { passwordHash: await bcrypt.hash(pw, 12) } });
  console.log('Password updated for', email);
  await db.$disconnect();
})();
