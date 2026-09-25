'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { SCOPE_COOKIE } from '@/lib/scope';

export async function setScope(scope: 'All' | 'Denmark' | 'Norway') {
  await requireAdmin();
  (await cookies()).set(SCOPE_COOKIE, scope, { path: '/', sameSite: 'lax', httpOnly: true, maxAge: 60 * 60 * 24 * 365 });
  revalidatePath('/admin', 'layout');
}
