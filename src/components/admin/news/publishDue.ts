import 'server-only';
import { db } from '@/lib/db';

/** Flips scheduled stories whose publishAt has passed to PUBLISHED. Returns how many went live. */
export async function publishDueStories(now: Date = new Date()): Promise<number> {
  const { count } = await db.newsStory.updateMany({
    where: { status: 'SCHEDULED', publishAt: { lte: now } },
    data: { status: 'PUBLISHED' },
  });
  return count;
}
