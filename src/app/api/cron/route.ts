import { timingSafeEqual } from 'node:crypto';
import { processInvitationReminders } from '@/lib/invitations';
import { publishDueStories } from '@/components/admin/news/publishDue';
import { processCourseReminders } from '@/lib/course-reminders';

/**
 * Scheduled job (daily on Vercel Hobby): invitation reminders + expiry, scheduled news,
 * and course reminders (not started / not finished).
 * Call with `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!secret || given.length !== secret.length || !timingSafeEqual(Buffer.from(given), Buffer.from(secret))) {
    return new Response('Unauthorized', { status: 401 });
  }
  const invitations = await processInvitationReminders();
  const news = await publishDueStories();
  const courseReminders = await processCourseReminders();
  return Response.json({ ok: true, invitations, publishedStories: news, courseReminders });
}
