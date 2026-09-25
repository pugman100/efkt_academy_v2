import { createHash, randomBytes } from 'node:crypto';

/** A URL-safe random token. Only its hash is ever stored. */
export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function appUrl(path = ''): string {
  const base = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return base + path;
}
