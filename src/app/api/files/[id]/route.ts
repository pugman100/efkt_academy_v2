import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Images are only visible to signed-in users.
  if (!(await getSession())) return new Response('Unauthorized', { status: 401 });
  const { id } = await params;
  const file = await db.fileUpload.findUnique({ where: { id } });
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      // Files are immutable (new upload = new id).
      'Cache-Control': 'private, max-age=31536000, immutable',
    },
  });
}
