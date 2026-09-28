import 'server-only';
import { randomUUID } from 'node:crypto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { db } from './db';

export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

/** Neon Object Storage bucket declared in neon.ts. */
const BUCKET = 'uploads';

// Credentials, endpoint and region come from the AWS_* variables `neon env pull` writes.
// Neon only supports path-style addressing.
const s3 = new S3Client({ forcePathStyle: true });

const objectKey = (id: string) => `images/${id}`;

/** Stores an uploaded image and returns its id (serve with fileUrl(id)). */
export async function saveImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error('Only JPG, PNG, WebP, GIF or AVIF images are allowed.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image is larger than 6 MB.');
  const body = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  // Object first, row second: a failed upload leaves no dangling row.
  try {
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: objectKey(id), Body: body, ContentType: file.type }));
  } catch (e) {
    console.error('[storage] upload failed', e);
    throw new Error('Upload failed. Please try again.');
  }
  await db.fileUpload.create({ data: { id, filename: file.name.slice(0, 200), mimeType: file.type, size: body.length } });
  return id;
}

/** Opens a stored image for streaming, or null if the object is missing. */
export async function readImage(id: string): Promise<ReadableStream | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: objectKey(id) }));
    return res.Body?.transformToWebStream() ?? null;
  } catch (e) {
    if ((e as { name?: string }).name === 'NoSuchKey') return null;
    throw e;
  }
}
