'use client';

import { useRef, useState, useTransition } from 'react';
import type { Role } from '@prisma/client';
import { Button, Checkbox, Dialog, Input, Select, Tag, Textarea, useToast } from '@/components/ui';
import { Initials } from '@/components/admin/tracking/ui';
import { ROLES, ROLE_LABEL } from '@/lib/labels';
import { initials } from '@/lib/format';
import { sendInvitations } from './actions';

export type Option = { id: string; name: string };
type Recipient = { name: string; email: string };
type Mode = 'single' | 'paste' | 'file';

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: 'single', label: 'One by one', icon: 'user-plus' },
  { key: 'paste', label: 'Paste a list', icon: 'list-dashes' },
  { key: 'file', label: 'Import CSV', icon: 'file-csv' },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "anders.bak@efkt.com" → "Anders Bak" */
function nameFromEmail(email: string) {
  return email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function parsePasted(text: string): Recipient[] {
  return text.split(/[\n,;]+/).map((x) => x.trim().toLowerCase()).filter((x) => EMAIL.test(x)).map((email) => ({ email, name: nameFromEmail(email) }));
}

/** CSV with columns name, email (bio ignored). Header row optional; comma or semicolon separated. */
function parseCsv(text: string): Recipient[] {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const sep = lines[0].includes(';') ? ';' : ',';
  const split = (l: string) => l.split(sep).map((c) => c.trim().replace(/^"|"$/g, ''));
  const head = split(lines[0]).map((c) => c.toLowerCase());
  const hasHead = head.some((c) => c === 'email' || c === 'e-post' || c === 'e-mail');
  const ei = hasHead ? head.findIndex((c) => c === 'email' || c === 'e-post' || c === 'e-mail') : -1;
  const ni = hasHead ? head.findIndex((c) => c === 'name' || c === 'navn') : -1;
  return (hasHead ? lines.slice(1) : lines).flatMap((l) => {
    const cells = split(l);
    const email = (ei >= 0 ? cells[ei] : cells.find((c) => EMAIL.test(c)) ?? '').toLowerCase();
    if (!EMAIL.test(email)) return [];
    const name = ni >= 0 ? cells[ni] : cells.find((c) => c && !EMAIL.test(c)) ?? '';
    return [{ email, name: name || nameFromEmail(email) }];
  });
}

export function InviteDialog({
  open,
  onClose,
  onSent,
  groups,
  categories,
  expiryDays,
}: {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
  groups: (Option & { count: number })[];
  categories: Option[];
  expiryDays: number;
}) {
  const toast = useToast();
  const file = useRef<HTMLInputElement>(null);
  const [busy, start] = useTransition();
  const [mode, setMode] = useState<Mode>('single');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pasted, setPasted] = useState('');
  const [queue, setQueue] = useState<Recipient[]>([]);
  const [role, setRole] = useState<Role>('LEARNER');
  const [country, setCountry] = useState<'auto' | 'Denmark' | 'Norway'>('auto');
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  function reset() {
    setMode('single'); setName(''); setEmail(''); setPasted(''); setQueue([]); setRole('LEARNER');
    setCountry('auto'); setGroupIds([]); setCategoryIds([]); setMessage('');
  }
  const close = () => { reset(); onClose(); };
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  function addRecipient() {
    const e = email.trim().toLowerCase();
    if (!EMAIL.test(e)) return toast('Add a valid email address', 'error');
    setQueue((q) => (q.some((r) => r.email === e) ? q : [...q, { email: e, name: name.trim() || nameFromEmail(e) }]));
    setName('');
    setEmail('');
  }

  async function importFile(f: File | undefined) {
    if (!f) return;
    const rows = parseCsv(await f.text());
    if (!rows.length) return toast('No email addresses found in ' + f.name, 'error');
    setQueue((q) => [...q, ...rows.filter((r) => !q.some((x) => x.email === r.email))]);
    setMode('single');
    toast(`${rows.length} rows imported from ${f.name}`);
  }

  // Everything that would be sent: the queue, the pasted list, and a typed-but-not-added address.
  const typed = mode === 'single' && EMAIL.test(email.trim()) ? [{ email: email.trim().toLowerCase(), name: name.trim() || nameFromEmail(email.trim()) }] : [];
  const people = [...queue, ...(mode === 'paste' ? parsePasted(pasted) : []), ...typed].filter((r, i, all) => all.findIndex((x) => x.email === r.email) === i);

  function submit() {
    if (!people.length) return toast('Add at least one recipient', 'error');
    start(async () => {
      const r = await sendInvitations({ recipients: people, role, country, groupIds, categoryIds, message });
      if (!r.ok) return toast(r.error, 'error');
      const skip = r.skipped.length ? ` · ${r.skipped.length} skipped (already invited or signed up)` : '';
      toast((r.sent.length === 1 ? 'Invitation sent to ' + r.sent[0] : `${r.sent.length} invitations sent`) + skip, r.sent.length ? 'ok' : 'error');
      if (r.sent.length) { reset(); onSent(); onClose(); }
    });
  }

  const total = people.length;
  const reachLine = total === 0
    ? `Each person gets a link that expires in ${expiryDays} days. Courses follow from their group and category access.`
    : `${total} ${total === 1 ? 'person' : 'people'} · ${ROLE_LABEL[role].toLowerCase()} · ${groupIds.length ? groupIds.length + (groupIds.length === 1 ? ' group' : ' groups') : 'no group'} · courses follow from group and category access`;

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Invite people"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Sending…' : 'Send invitations'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {MODES.map((m) => (
            <button key={m.key} type="button" className="trk-mode" aria-pressed={mode === m.key} onClick={() => setMode(m.key)}>
              <i className={`ph ph-${m.icon}`} style={{ fontSize: 18, color: 'var(--efkt-coral)' }} aria-hidden /> {m.label}
            </button>
          ))}
        </div>

        {mode === 'single' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input label="Full name" placeholder="e.g. Anders Bak" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" type="email" placeholder="navn@efkt.com" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRecipient(); } }}
              hint="Profile picture and bio are added by the person on first sign-in." />
            <Button variant="secondary" iconRight="plus" onClick={addRecipient}>Add to list</Button>
          </div>
        ) : null}

        {mode === 'paste' ? (
          <Textarea label="Email addresses" rows={5} placeholder={'anders.bak@efkt.com\nsilje.rud@efkt.no'} value={pasted}
            onChange={(e) => setPasted(e.target.value)} hint="One per line, or separated by comma or semicolon." />
        ) : null}

        {mode === 'file' ? (
          <button
            type="button"
            className="trk-drop"
            onClick={() => file.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); importFile(e.dataTransfer.files?.[0]); }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 24px', border: '1px dashed var(--border-dashed)', borderRadius: 20, background: 'var(--efkt-offwhite)', cursor: 'pointer', fontFamily: 'var(--efkt-font)' }}
          >
            <i className="ph ph-upload-simple" style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-body)' }}>Drop a CSV here or click to choose a file</span>
            <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Columns: name, email. Existing users are skipped.</span>
            <input ref={file} type="file" accept=".csv,text/csv,text/plain" hidden onChange={(e) => { importFile(e.target.files?.[0]); e.target.value = ''; }} />
          </button>
        ) : null}

        {queue.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{queue.length} {queue.length === 1 ? 'recipient' : 'recipients'}</div>
            {queue.map((r) => (
              <div key={r.email} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--efkt-offwhite)', borderRadius: 12 }}>
                <Initials text={initials(r.name)} size={32} bg="var(--efkt-mint)" />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email} · Bio and photo added on first sign-in</div>
                </div>
                <button type="button" aria-label={'Remove ' + r.email} onClick={() => setQueue((q) => q.filter((x) => x.email !== r.email))}
                  style={{ width: 32, height: 32, minWidth: 32, border: 'none', borderRadius: '50%', background: 'rgba(55,59,84,0.10)', cursor: 'pointer', color: 'var(--efkt-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph ph-x" style={{ fontSize: 12 }} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ height: 1, background: 'var(--border-default)' }} />

        <Select label="Role" options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} value={role} onChange={(e) => setRole(e.target.value as Role)} />
        <Select
          label="Country"
          options={[{ value: 'auto', label: 'From the email address' }, { value: 'Denmark', label: 'Denmark' }, { value: 'Norway', label: 'Norway' }]}
          value={country}
          onChange={(e) => setCountry(e.target.value as typeof country)}
          hint="Addresses ending in .no join Norway, everyone else Denmark — unless you choose a country."
        />

        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Add to groups</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groups.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Checkbox label={g.name} checked={groupIds.includes(g.id)} onChange={() => setGroupIds((l) => toggle(l, g.id))} />
                <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{g.count} in scope</span>
              </div>
            ))}
          </div>
        </div>

        {categories.length ? (
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Categories</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((c) => (
                <Tag key={c.id} active={categoryIds.includes(c.id)} onClick={() => setCategoryIds((l) => toggle(l, c.id))}>{c.name}</Tag>
              ))}
            </div>
          </div>
        ) : null}

        <Textarea label="Message in the invitation" rows={3} placeholder="Optional — shown above the sign-up button." value={message} onChange={(e) => setMessage(e.target.value)} />

        <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{reachLine}</div>
      </div>
    </Dialog>
  );
}
