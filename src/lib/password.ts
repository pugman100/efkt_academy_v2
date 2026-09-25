import bcrypt from 'bcryptjs';

// Client-safe rules live in password-rules.ts; re-exported here for server code.
export { PASSWORD_RULES, passwordRules, passwordOk } from './password-rules';

export const PASSWORD_MIN = 8;

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string | null | undefined): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(pw, hash);
}

/** Readable one-off password for admin-created test accounts. */
export function makePassword(): string {
  const words = ['Fjord', 'Balkong', 'Kamera', 'Drone', 'Vindu', 'Stue', 'Lys', 'Kjokken'];
  const w = words[Math.floor(Math.random() * words.length)];
  return w + '-' + (1000 + Math.floor(Math.random() * 9000)) + '!';
}
