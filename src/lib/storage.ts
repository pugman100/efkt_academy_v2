import 'server-only';
import { db } from './db';

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/** Stores an uploaded image and returns its id (serve with fileUrl(id)). */
export async function saveImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error('Only JPG, PNG, WebP, GIF or AVIF images are allowed.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image is larger than 6 MB.');
  const data = Buffer.from(await file.arrayBuffer());
  const row = await db.fileUpload.create({
    data: { filename: file.name.slice(0, 200), mimeType: file.type, size: file.size, data },
    select: { id: true },
  });
  return row.id;
}
