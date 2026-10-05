import { db } from '@/lib/db';
import { readImage } from '@/lib/storage';

/**
 * Public portfolio image. Served only while it belongs to the active user whose link code is
 * in the URL, so a new link (or deleting the image) stops it working. Other uploads stay
 * behind sign-in at /api/files.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string; image: string }> }) {
  const { token, image } = await params;
  const row = await db.portfolioImage.findFirst({
    where: { id: image, user: { portfolioToken: token, status: 'ACTIVE' } },
    select: { fileId: true },
  });
  const file = row ? await db.fileUpload.findUnique({ where: { id: row.fileId } }) : null;
  if (!row || !file) return new Response('Not found', { status: 404 });
  const body = file.data ? new Uint8Array(file.data) : await readImage(file.id);
  if (!body) return new Response('Not found', { status: 404 });
  return new Response(body, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.size),
      // Short cache: a new link or a deleted image should stop being served soon.
      'Cache-Control': 'public, max-age=300',
      'X-Robots-Tag': 'noindex',
    },
  });
}
