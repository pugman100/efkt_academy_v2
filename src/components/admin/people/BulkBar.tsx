'use client';

import { useEffect, useRef, useState, useTransition, type MouseEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Checkbox, Input, Radio, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { ROLE_LABEL, ROLES } from '@/lib/labels';
import {
  bulkDelete,
  bulkSendPasswordReset,
  bulkSetActive,
  bulkSetGroups,
  bulkSetLocation,
  bulkSetRole,
  type BulkResult,
} from '@/app/(admin)/admin/users/bulk-actions';
import { BULK_ASSIGN_HANDOFF } from './BulkAssign';
import type { GroupOption, RegionOption, UserRow } from './types';

type Kind = 'group-add' | 'group-remove' | 'role' | 'location' | 'deactivate' | 'reactivate' | 'reset' | 'delete';

const people = (n: number) => `${n} ${n === 1 ? 'user' : 'users'}`;

/** Row checkbox that also reports Shift for range selection. */
export function SelectBox({ checked, mixed, disabled, label, onClick }: { checked: boolean; mixed?: boolean; disabled?: boolean; label: string; onClick: (e: MouseEvent) => void }) {
  const on = checked || mixed;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? 'mixed' : checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      onKeyDown={(e) => e.stopPropagation()}
      style={{
        width: 24, height: 24, minWidth: 24, borderRadius: 8, padding: 0, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: on ? 'var(--efkt-coral)' : 'var(--efkt-white)', border: '1px solid ' + (on ? 'var(--efkt-coral)' : 'var(--border-default)'),
      }}
    >
      {on ? <i className={`ph-bold ph-${mixed ? 'minus' : 'check'}`} style={{ fontSize: 14, color: 'var(--efkt-white)' }} aria-hidden /> : null}
    </button>
  );
}

export function BulkBar({ users, groups, regions, onClear }: { users: UserRow[]; groups: GroupOption[]; regions: RegionOption[]; onClear: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [kind, setKind] = useState<Kind | null>(null);
  const [more, setMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const ids = users.map((u) => u.id);
  const active = users.filter((u) => !u.off).length;
  const off = users.length - active;

  useEffect(() => {
    if (!more) return;
    const close = (e: globalThis.MouseEvent) => moreRef.current && !moreRef.current.contains(e.target as Node) && setMore(false);
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [more]);

  const run = (fn: () => Promise<BulkResult>, verb: string) =>
    start(async () => {
      const r = await fn().catch(() => ({ ok: false as const, error: 'Something went wrong. Please try again.' }));
      if (!r.ok) return toast(r.error, 'error');
      setKind(null);
      onClear();
      const rest = r.skipped.length ? ` · skipped ${r.skipped.join(', ')}` : '';
      toast(`${people(r.done)} ${verb}${rest}`);
    });

  function assignCourses() {
    try {
      sessionStorage.setItem(BULK_ASSIGN_HANDOFF, JSON.stringify(ids));
    } catch {}
    router.push('/admin/bulk-assign');
  }

  async function exportAs(format: 'csv' | 'xlsx') {
    setMore(false);
    try {
      const res = await fetch('/api/admin/users/export', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ format, ids }) });
      if (!res.ok) throw new Error();
      const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? `users.${format}`;
      const url = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement('a'), { href: url, download: name });
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast('Export failed. Please try again.', 'error');
    }
  }

  const menuItem = (icon: string, label: string, onClick: () => void, danger?: boolean) => (
    <button type="button" role="menuitem" className="pp-hoverbg" onClick={() => (setMore(false), onClick())}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16, fontWeight: 300, color: danger ? 'var(--efkt-coral)' : 'var(--text-body)', textAlign: 'left', borderRadius: 10 }}>
      <i className={`ph ph-${icon}`} style={{ fontSize: 20 }} aria-hidden />
      {label}
    </button>
  );

  return (
    <>
      {/* Keeps the last rows reachable above the fixed bar. */}
      <div style={{ height: 88 }} aria-hidden />
      <div
        role="toolbar"
          className="pp-bulkbar"
        aria-label="Actions for selected users"
        style={{
          width: 'max-content',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '12px 12px 12px 24px', borderRadius: 40,
          background: 'var(--efkt-deep-navy)', color: 'var(--efkt-white)', boxShadow: '0 16px 48px rgba(12,14,57,0.28)',
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, marginRight: 8 }}>{users.length} selected</span>
        <Button size="sm" variant="ghost" className="pp-barbtn" iconLeft="users-three" onClick={() => setKind('group-add')} disabled={pending}>Add to group</Button>
        <Button size="sm" variant="ghost" className="pp-barbtn" iconLeft="user-minus" onClick={() => setKind('group-remove')} disabled={pending}>Remove from group</Button>
        <Button size="sm" variant="ghost" className="pp-barbtn" iconLeft="book-open" onClick={assignCourses} disabled={pending}>Assign courses</Button>
        {active ? <Button size="sm" variant="ghost" className="pp-barbtn" iconLeft="prohibit" onClick={() => setKind('deactivate')} disabled={pending}>Deactivate</Button> : null}
        {off ? <Button size="sm" variant="ghost" className="pp-barbtn" iconLeft="arrow-counter-clockwise" onClick={() => setKind('reactivate')} disabled={pending}>Reactivate</Button> : null}
        <div ref={moreRef} style={{ position: 'relative' }}>
          <Button size="sm" variant="ghost" className="pp-barbtn" iconRight="caret-up" onClick={() => setMore((m) => !m)} aria-haspopup="menu" aria-expanded={more} disabled={pending}>More</Button>
          {more ? (
            <div role="menu" style={{ position: 'absolute', bottom: 'calc(100% + 12px)', right: 0, width: 280, padding: 8, borderRadius: 16, background: 'var(--surface-card)', boxShadow: '0 16px 48px rgba(12,14,57,0.18)', border: '1px solid var(--border-default)' }}>
              {menuItem('identification-badge', 'Change role', () => setKind('role'))}
              {menuItem('map-pin', 'Change country or region', () => setKind('location'))}
              {menuItem('key', 'Send password reset', () => setKind('reset'))}
              {menuItem('file-csv', 'Export to CSV', () => exportAs('csv'))}
              {menuItem('microsoft-excel-logo', 'Export to Excel', () => exportAs('xlsx'))}
              {off ? menuItem('trash', `Delete ${people(off)}…`, () => setKind('delete'), true) : null}
            </div>
          ) : null}
        </div>
        <button type="button" onClick={onClear} aria-label="Clear selection" title="Clear selection"
          style={{ width: 40, height: 40, minWidth: 40, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.12)', color: 'var(--efkt-white)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ph ph-x" style={{ fontSize: 16 }} aria-hidden />
        </button>
      </div>

      {kind === 'group-add' || kind === 'group-remove' ? (
        <GroupDialog add={kind === 'group-add'} count={users.length} groups={groups} pending={pending} onClose={() => setKind(null)}
          onConfirm={(g) => run(() => bulkSetGroups(ids, g, kind === 'group-add'), kind === 'group-add' ? 'added' : 'removed')} />
      ) : null}
      {kind === 'role' ? <RoleDialog count={users.length} pending={pending} onClose={() => setKind(null)} onConfirm={(r) => run(() => bulkSetRole(ids, r), 'updated')} /> : null}
      {kind === 'location' ? (
        <LocationDialog count={users.length} regions={regions} pending={pending} onClose={() => setKind(null)} onConfirm={(c, r) => run(() => bulkSetLocation(ids, c, r), 'moved')} />
      ) : null}
      {kind === 'deactivate' ? (
        <Confirm title={`Deactivate ${people(active)}?`} icon="prohibit" confirm="Deactivate" pending={pending} onClose={() => setKind(null)} onConfirm={() => run(() => bulkSetActive(ids, false), 'deactivated')}>
          They are signed out everywhere straight away and can no longer sign in. Their course history is kept, and you can reactivate them at any time.
          {off ? ` ${people(off)} already deactivated will be skipped.` : ''}
        </Confirm>
      ) : null}
      {kind === 'reactivate' ? (
        <Confirm title={`Reactivate ${people(off)}?`} icon="arrow-counter-clockwise" confirm="Reactivate" pending={pending} onClose={() => setKind(null)} onConfirm={() => run(() => bulkSetActive(ids, true), 'reactivated')}>
          They can sign in again with their existing password and pick up where they left off.
          {active ? ` ${people(active)} already active will be skipped.` : ''}
        </Confirm>
      ) : null}
      {kind === 'reset' ? (
        <Confirm title={`Send password reset to ${people(active)}?`} icon="key" confirm="Send emails" pending={pending} onClose={() => setKind(null)} onConfirm={() => run(() => bulkSendPasswordReset(ids), 'emailed')}>
          Each person gets an email with a link to choose a new password. The link expires after 60 minutes; their current password keeps working until they change it.
          {off ? ` ${people(off)} deactivated will be skipped.` : ''}
        </Confirm>
      ) : null}
      {kind === 'delete' ? <DeleteDialog count={off} skipped={active} pending={pending} onClose={() => setKind(null)} onConfirm={(n) => run(() => bulkDelete(ids, n), 'deleted')} /> : null}
    </>
  );
}

function Confirm({ title, icon, confirm, pending, danger, disabled, onClose, onConfirm, children }: {
  title: string; icon: string; confirm: string; pending: boolean; danger?: boolean; disabled?: boolean; onClose: () => void; onConfirm: () => void; children: ReactNode;
}) {
  return (
    <Dialog open onClose={onClose} icon={icon} title={title} footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={pending || disabled}>{pending ? 'Working…' : confirm}</Button>
      </>
    }>
      <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-body)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
    </Dialog>
  );
}

function GroupDialog({ add, count, groups, pending, onClose, onConfirm }: { add: boolean; count: number; groups: GroupOption[]; pending: boolean; onClose: () => void; onConfirm: (ids: string[]) => void }) {
  const [on, setOn] = useState<Set<string>>(new Set());
  const flip = (id: string) => setOn((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <Confirm title={`${add ? 'Add' : 'Remove'} ${people(count)} ${add ? 'to' : 'from'}…`} icon={add ? 'users-three' : 'user-minus'} confirm={add ? 'Add to groups' : 'Remove from groups'}
      pending={pending} disabled={!on.size} onClose={onClose} onConfirm={() => onConfirm([...on])}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {groups.map((g) => <Checkbox key={g.id} label={g.name} checked={on.has(g.id)} onChange={() => flip(g.id)} />)}
        {!groups.length ? <span style={{ color: 'var(--text-muted)' }}>No groups yet. Create one under Groups.</span> : null}
      </div>
      {add
        ? <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>They get every course assigned to these groups straight away.</span>
        : <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>They lose courses they only had through these groups. Their progress is kept and returns if they are added back.</span>}
    </Confirm>
  );
}

function RoleDialog({ count, pending, onClose, onConfirm }: { count: number; pending: boolean; onClose: () => void; onConfirm: (role: string) => void }) {
  const [role, setRole] = useState('');
  return (
    <Confirm title={`Change role for ${people(count)}`} icon="identification-badge" confirm="Change role" pending={pending} disabled={!role} onClose={onClose} onConfirm={() => onConfirm(role)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {ROLES.map((r) => <Radio key={r} name="bulk-role" label={ROLE_LABEL[r]} checked={role === r} onChange={() => setRole(r)} />)}
      </div>
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Administrators can manage everything in the admin panel. Your own role is never changed.</span>
    </Confirm>
  );
}

function LocationDialog({ count, regions, pending, onClose, onConfirm }: { count: number; regions: RegionOption[]; pending: boolean; onClose: () => void; onConfirm: (country: string, regionId: string | null) => void }) {
  const [country, setCountry] = useState('Norway');
  const [region, setRegion] = useState('');
  const options = regions.filter((r) => r.country === country);
  return (
    <Confirm title={`Move ${people(count)}`} icon="map-pin" confirm="Save" pending={pending} onClose={onClose} onConfirm={() => onConfirm(country, region || null)}>
      <Select label="Country" options={[{ value: 'Norway', label: 'Norway' }, { value: 'Denmark', label: 'Denmark' }]} value={country} onChange={(e) => (setCountry(e.target.value), setRegion(''))} />
      <Select label="Region" options={[{ value: '', label: 'No region' }, ...options.map((r) => ({ value: r.id, label: r.name }))]} value={region} onChange={(e) => setRegion(e.target.value)} />
      <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Courses for the other country stop showing for them; their progress is kept.</span>
    </Confirm>
  );
}

function DeleteDialog({ count, skipped, pending, onClose, onConfirm }: { count: number; skipped: number; pending: boolean; onClose: () => void; onConfirm: (n: number) => void }) {
  const [typed, setTyped] = useState('');
  return (
    <Confirm title={`Permanently delete ${people(count)}?`} icon="trash" confirm={`Delete ${people(count)}`} danger pending={pending} disabled={typed.trim() !== String(count)} onClose={onClose} onConfirm={() => onConfirm(Number(typed))}>
      <span>This cannot be undone. Their course progress, quiz results and completion history are removed and disappear from completion exports. The audit log keeps a record of who was deleted.</span>
      {skipped ? <span>Only deactivated users can be deleted, so {people(skipped)} still active will be skipped.</span> : null}
      <Input label={`Type ${count} to confirm`} inputMode="numeric" autoFocus value={typed} onChange={(e) => setTyped(e.target.value)} />
    </Confirm>
  );
}
