'use server';

import { requireUser } from '@/lib/auth';
import { saveImage } from '@/lib/storage';

/** Uploads one image (form field "file"). Admins upload content images; learners their own avatar. */
export async function uploadImage(form: FormData): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireUser();
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'No file selected.' };
  try {
    return { ok: true, id: await saveImage(file) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Upload failed.' };
  }
}
