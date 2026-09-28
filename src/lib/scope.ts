import 'server-only';
import { cookies } from 'next/headers';
import type { Scope } from './labels';

export const SCOPE_COOKIE = 'efkt_admin_country';

/** The admin's global country filter (sidebar switcher). */
export async function getScope(): Promise<Scope> {
  const v = (await cookies()).get(SCOPE_COOKIE)?.value;
  return v === 'Denmark' || v === 'Norway' ? v : 'All';
}

export function scopeLine(scope: Scope): string {
  return scope === 'All' ? 'Denmark and Norway' : scope;
}
