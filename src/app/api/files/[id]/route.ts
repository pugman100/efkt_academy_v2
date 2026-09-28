import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { readImage } from '@/lib/storage';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Images are only visible to signed-in users; the bucket is private and read server-side.
  if (!(await getSession())) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const file = await db.fileUpload.findUnique({ where: { id } });
  if (!file) return new Response('Not found', { status: 404 });
  // Images uploaded before the move to object storage still carry their bytes.
  const body = file.data ? new Uint8Array(file.data) : await readImage(id);
  if (!body) return new Response('Not found', { status: 404 });
  return new Response(body, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      // Files are immutable (new upload = new id).
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
