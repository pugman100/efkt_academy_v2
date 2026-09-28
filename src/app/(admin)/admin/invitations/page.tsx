import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { ago, daysUntil, initials } from '@/lib/format';
import { INVITE_STATUS_LABEL, INVITE_STATUS_TONE, ROLE_LABEL } from '@/lib/labels';
import { getInviteSettings, nextReminderAt } from '@/lib/invitations';
import { InvitationsView, type InviteRow } from './InvitationsView';

export const metadata: Metadata = { title: 'Invitations' };

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const inDays = (d: Date) => {
  const n = daysUntil(d);
  return n <= 0 ? 'today' : n === 1 ? 'in 1 day' : `in ${n} days`;
};

export default async function InvitationsPage() {
  await requireAdmin();
  const [scope, settings] = await Promise.all([getScope(), getInviteSettings()]);
  const countryWhere = scope === 'All' ? {} : { country: scope };
  const [invites, groups, categories] = await Promise.all([
    db.invitation.findMany({
      where: { status: { not: 'REVOKED' }, ...countryWhere },
      include: { groups: { select: { name: true } } },
      orderBy: { sentAt: 'desc' },
    }),
    db.group.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, _count: { select: { users: { where: { status: 'ACTIVE', ...countryWhere } } } } },
    }),
    db.category.findMany({ orderBy: { order: 'asc' }, select: { id: true, name: true } }),
  ]);

  const rows: InviteRow[] = invites.map((i) => {
    const pending = i.status === 'PENDING';
    let note = '';
    let remindLine = '';
    if (i.status === 'ACCEPTED') note = 'Joined ' + lower(ago(i.acceptedAt));
    else if (i.status === 'EXPIRED') {
      note = 'Expired ' + lower(ago(i.expiresAt));
      remindLine = `${i.remindersSent} ${i.remindersSent === 1 ? 'reminder' : 'reminders'} sent, no sign-in`;
    } else {
      note = 'Expires ' + inDays(i.expiresAt);
      const next = nextReminderAt(i, settings);
      const count = i.remindersSent > 0 ? ` · ${i.remindersSent} of ${settings.maxReminders} sent` : '';
      if (i.remindersSent >= settings.maxReminders) remindLine = 'Reminders exhausted';
      else if (i.remindersSent > 0 && i.lastRemindedAt) remindLine = 'Reminded ' + lower(ago(i.lastRemindedAt)) + count;
      else if (next) remindLine = (next.getTime() <= Date.now() ? 'Reminder due' : 'Reminder ' + inDays(next)) + count;
      else remindLine = 'No reminder before expiry' + count;
    }
    return {
      id: i.id,
      name: i.name || i.email.split('@')[0],
      email: i.email,
      initials: initials(i.name || i.email),
      role: ROLE_LABEL[i.role],
      groupLine: i.groups.length ? i.groups.map((g) => g.name).join(' · ') : 'No group',
      status: i.status,
      statusLabel: INVITE_STATUS_LABEL[i.status],
      tone: INVITE_STATUS_TONE[i.status],
      note,
      sent: ago(i.sentAt),
      remindLine,
      reminded: i.remindersSent > 0,
      open: pending || i.status === 'EXPIRED',
    };
  });

  return (
    <InvitationsView
      scopeLine={scopeLine(scope)}
      rows={rows}
      settings={settings}
      groups={groups.map((g) => ({ id: g.id, name: g.name, count: g._count.users }))}
      categories={categories}
    />
  );
}
