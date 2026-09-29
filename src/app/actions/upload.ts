'use server';

import { requireAdmin, requireUser } from '@/lib/auth';
import { confirmDocumentUpload, presignDocumentUpload, saveImage } from '@/lib/storage';

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

type Fail = { ok: false; error: string };
const msg = (e: unknown, fallback: string) => (e instanceof Error ? e.message : fallback);

/** Admin PDF upload, step 1: where to PUT the file. */
export async function startDocumentUpload(input: { name: string; size: number; type: string }): Promise<{ ok: true; id: string; url: string } | Fail> {
  await requireAdmin();
  if (input.type !== 'application/pdf' && !/\.pdf$/i.test(input.name)) return { ok: false, error: 'Choose a PDF file.' };
  try {
    return { ok: true, ...(await presignDocumentUpload(input.size)) };
  } catch (e) {
    return { ok: false, error: msg(e, 'Upload failed.') };
  }
}

/** Admin PDF upload, step 2: after the browser's PUT succeeded. */
export async function finishDocumentUpload(id: string, name: string): Promise<{ ok: true; id: string } | Fail> {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/.test(id)) return { ok: false, error: 'Invalid upload.' };
  try {
    await confirmDocumentUpload(id, name);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: msg(e, 'Upload failed.') };
  }
}
