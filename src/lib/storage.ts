import 'server-only';
import { randomUUID } from 'node:crypto';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { db } from './db';

// Vercel rejects request bodies over 4.5 MB; the browser shrinks photos before upload.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
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
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image is larger than 4 MB.');
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

// ---------- Documents (PDF modules) ----------
// PDFs are often larger than the host's 4.5 MB request/response limit, so the browser
// uploads them straight to the bucket with a presigned PUT, and learners read them through
// a short-lived presigned GET. The app only ever handles the id.

export const MAX_DOCUMENT_BYTES = 100 * 1024 * 1024;
const docKey = (id: string) => `documents/${id}`;

/** Step 1: a presigned PUT URL the browser uploads the PDF to (valid 15 minutes). */
export async function presignDocumentUpload(size: number): Promise<{ id: string; url: string }> {
  if (!Number.isFinite(size) || size <= 0) throw new Error('The file is empty.');
  if (size > MAX_DOCUMENT_BYTES) throw new Error('The PDF is larger than 100 MB.');
  const id = randomUUID();
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: docKey(id), ContentType: 'application/pdf' }), { expiresIn: 900 });
  return { id, url };
}

/** Step 2: checks the object really landed (and is a PDF within the limit), then records it. */
export async function confirmDocumentUpload(id: string, filename: string): Promise<void> {
  let head;
  try {
    head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: docKey(id) }));
  } catch {
    throw new Error('The upload did not finish. Please try again.');
  }
  const size = head.ContentLength ?? 0;
  if (head.ContentType !== 'application/pdf' || size <= 0 || size > MAX_DOCUMENT_BYTES) throw new Error('Only PDF files up to 100 MB are allowed.');
  await db.fileUpload.upsert({
    where: { id },
    create: { id, filename: filename.slice(0, 200), mimeType: 'application/pdf', size },
    update: {},
  });
}

/** A short-lived link that shows the PDF inline in the browser. */
export async function presignDocumentRead(id: string, filename: string): Promise<string> {
  const safe = filename.replace(/[^\w.\- ]+/g, '_') || 'document.pdf';
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: docKey(id),
      ResponseContentType: 'application/pdf',
      ResponseContentDisposition: `inline; filename="${safe}"`,
    }),
    { expiresIn: 3600 },
  );
}
