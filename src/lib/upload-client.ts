// Browser-side image upload: shrinks large photos before sending them, so they stay well
// under the host's request limit (4.5 MB on Vercel), and never leaves the caller hanging.
import { uploadImage } from '@/app/actions/upload';

type Result = { ok: true; id: string } | { ok: false; error: string };

const MAX_EDGE = 2400;
const SEND_LIMIT = 4 * 1024 * 1024;
const SHRINK_ABOVE = 1.5 * 1024 * 1024;

/** Downscales large photos (long edge 2400px, WebP) in the browser; returns small files as-is. */
export async function shrinkImage(file: File): Promise<File> {
  // GIFs may be animated; canvas would keep only the first frame.
  if (file.type === 'image/gif' || typeof createImageBitmap !== 'function') return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size <= SHRINK_ABOVE) {
    bmp.close();
    return file;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.85));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: blob.type });
}

/** Uploads one image (resized if large) and returns its id or a readable error. */
export async function uploadImageFile(file: File): Promise<Result> {
  try {
    const f = await shrinkImage(file);
    if (f.size > SEND_LIMIT) return { ok: false, error: 'Image is too large. Please use an image under 4 MB.' };
    const fd = new FormData();
    fd.set('file', f);
    return await uploadImage(fd);
  } catch {
    return { ok: false, error: 'Upload failed. Check your connection and try again.' };
  }
}
