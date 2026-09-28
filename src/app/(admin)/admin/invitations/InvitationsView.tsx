'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { InviteStatus } from '@prisma/client';
import { PageHeader } from '@/components/admin/PageHeader';
import { Badge, Button, Input, Select, Switch, useToast, type BadgeTone } from '@/components/ui';
import { EMPTY_STYLE, Initials, PlateButton, StatTile } from '@/components/admin/tracking/ui';
import type { InviteSettings } from '@/lib/invitations';
import { copyInviteLink, resendInvite, revokeInvite, updateInviteSettings } from './actions';
import { InviteDialog, type Option } from './InviteDialog';

export type InviteRow = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: string;
  groupLine: string;
  status: InviteStatus;
  statusLabel: string;
  tone: BadgeTone;
  note: string;
  sent: string;
  remindLine: string;
  reminded: boolean;
  /** Pending or expired: can be resent, revoked or re-linked. */
  open: boolean;
};

const FILTERS: { key: 'All' | InviteStatus; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'EXPIRED', label: 'Expired' },
];
const REMIND_AFTER = [
  { value: '3', label: 'After 3 days' },
  { value: '7', label: 'After 1 week' },
  { value: '14', label: 'After 2 weeks' },
];
const REMIND_MAX = [1, 2, 3].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'reminder' : 'reminders'}` }));
const GRID = 'minmax(260px,2fr) minmax(180px,1.2fr) minmax(150px,1fr) minmax(190px,1.2fr) 140px';

export function InvitationsView({
  scopeLine,
  rows,
  settings,
  groups,
  categories,
}: {
  scopeLine: string;
  rows: InviteRow[];
  settings: InviteSettings;
  groups: (Option & { count: number })[];
  categories: Option[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'All' | InviteStatus>('All');
  const [dialog, setDialog] = useState(false);

  const count = (s: InviteStatus) => rows.filter((r) => r.status === s).length;
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => (!t || r.email.toLowerCase().includes(t) || r.name.toLowerCase().includes(t)) && (status === 'All' || r.status === status));
  }, [rows, q, status]);

  function run<T extends { ok: boolean }>(fn: () => Promise<T>, done: (r: T) => string) {
    start(async () => {
      const r = await fn();
      if (r.ok) toast(done(r));
      else toast('error' in r ? String(r.error) : 'Something went wrong', 'error');
    });
  }

  const setSetting = (patch: Partial<InviteSettings>, msg?: string) =>
    run(() => updateInviteSettings(patch), () => msg ?? 'Reminder settings saved');

  function copy(row: InviteRow) {
    start(async () => {
      const r = await copyInviteLink(row.id);
      if (!r.ok) return toast(r.error, 'error');
      try {
        await navigator.clipboard.writeText(r.link);
        toast('New link copied — the previous link no longer works');
      } catch {
        window.prompt('Copy the new invitation link', r.link);
      }
    });
  }

  function revoke(row: InviteRow) {
    if (!window.confirm(`Revoke the invitation to ${row.email}? The link stops working.`)) return;
    run(() => revokeInvite(row.id), () => 'Invitation revoked');
  }

  const pendingCount = count('PENDING');
  const reminders = settings.maxReminders === 1 ? '1 reminder' : `${settings.maxReminders} reminders`;
  const after = REMIND_AFTER.find((o) => o.value === String(settings.remindAfterDays))?.label ?? `After ${settings.remindAfterDays} days`;
  const remindSummary = settings.autoRemind
    ? `Anyone who has not signed in gets the invitation again ${after.toLowerCase()}, up to ${reminders}. ${pendingCount} invitations are in the queue.`
    : 'Reminders are off. Pending invitations stay unsent until you resend them by hand.';
  const afterOptions = REMIND_AFTER.some((o) => o.value === String(settings.remindAfterDays))
    ? REMIND_AFTER
    : [...REMIND_AFTER, { value: String(settings.remindAfterDays), label: after }];

  return (
    <div className="efkt-page">
      <PageHeader
        eyebrow={`Access · ${scopeLine}`}
        thin="Invitations"
        fat="& access"
        actions={<Button iconRight="plus" onClick={() => setDialog(true)}>Invite people</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 16 }}>
          <StatTile label="Pending" value={pendingCount} sub="awaiting first sign-in" />
          <StatTile label="Accepted" value={count('ACCEPTED')} sub="active accounts" />
          <StatTile label="Expired" value={count('EXPIRED')} sub={`links older than ${settings.expiryDays} days`} />
        </div>

        <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <i className="ph ph-bell-ringing" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Automatic reminders</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{remindSummary}</div>
            </div>
            <Switch
              aria-label="Automatic reminders"
              checked={settings.autoRemind}
              disabled={pending}
              onChange={() => setSetting({ autoRemind: !settings.autoRemind }, settings.autoRemind ? 'Automatic reminders off' : 'Automatic reminders on')}
            />
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Select label="Send again" options={afterOptions} value={String(settings.remindAfterDays)} disabled={pending}
              onChange={(e) => setSetting({ remindAfterDays: Number(e.target.value) })} style={{ width: 220 }} />
            <Select label="Stop after" options={REMIND_MAX} value={String(settings.maxReminders)} disabled={pending}
              onChange={(e) => setSetting({ maxReminders: Number(e.target.value) })} style={{ width: 220 }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input icon="magnifying-glass" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 280 }} aria-label="Search invitations" />
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className="trk-pill" aria-pressed={status === f.key} onClick={() => setStatus(f.key)}>
              {f.key === 'All' ? f.label : `${f.label} (${count(f.key)})`}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: -8, border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: 24, padding: '20px 32px', borderBottom: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', minWidth: 1060 }}>
          <div>Person</div><div>Role and groups</div><div>Status</div><div>Sent and reminders</div><div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {shown.map((i) => (
          <div key={i.id} className="trk-row" style={{ display: 'grid', gridTemplateColumns: GRID, gap: 24, alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid var(--border-default)', minWidth: 1060 }}>
            <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Initials text={i.initials} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{i.name}</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.email}</div>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{i.role}</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4, textWrap: 'pretty' }}>{i.groupLine}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <Badge tone={i.tone}>{i.statusLabel}</Badge>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 8 }}>{i.note}</div>
            </div>
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Sent {i.sent}</div>
              {i.remindLine && settings.autoRemind ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
                  <i className={`ph ph-${i.reminded ? 'bell-ringing' : 'bell'}`} style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden />
                  {i.remindLine}
                </div>
              ) : null}
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
              {i.open ? (
                <>
                  <PlateButton icon="link" title="Copy a new invitation link" aria-label="Copy a new invitation link" disabled={pending} onClick={() => copy(i)} />
                  <PlateButton icon="paper-plane-tilt" title={i.status === 'EXPIRED' ? 'Send again' : 'Resend'} aria-label="Resend invitation" disabled={pending}
                    onClick={() => run(() => resendInvite(i.id), () => 'Invitation sent to ' + i.email)} />
                  <PlateButton icon="trash" danger title="Revoke invitation" aria-label="Revoke invitation" disabled={pending} onClick={() => revoke(i)} />
                </>
              ) : null}
            </div>
          </div>
        ))}
        {shown.length === 0 ? <div style={EMPTY_STYLE}>No invitations match that filter.</div> : null}
      </div>

      <InviteDialog
        open={dialog}
        onClose={() => setDialog(false)}
        onSent={() => { setStatus('PENDING'); router.refresh(); }}
        groups={groups}
        categories={categories}
        expiryDays={settings.expiryDays}
      />
    </div>
  );
}
