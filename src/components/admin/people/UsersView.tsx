'use client';

import { useMemo, useRef, useState, useTransition, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { impersonate } from '@/app/(admin)/admin/users/actions';
import { PageHeader } from '@/components/admin/PageHeader';
import { COUNTRY_SHORT, ROLE_LABEL, ROLES } from '@/lib/labels';
import { Initials, MUTED, ProgressLine, RoleBadge, roleAvatarBg, SEARCH_STYLE, SELECT_STYLE, StatTile } from './bits';
import { UserDrawer } from './UserDrawer';
import { CreateUserDialog } from './CreateUserDialog';
import { BulkBar, SelectBox } from './BulkBar';
import type { GroupOption, RegionOption, UserDetail, UserRow } from './types';

const COLS = { pick: 24, name: 230, group: 160, role: 130, courses: 190, last: 120, go: 84 };
const GRID_MIN = Object.values(COLS).reduce((a, b) => a + b, 0) + 16 * 6;
const STATUSES = [
  { value: 'active', label: 'Active users' },
  { value: 'off', label: 'Deactivated users' },
  { value: 'all', label: 'All users' },
];
const col = (w: number) => ({ width: w, minWidth: w });

export function UsersView({
  scopeLine,
  stats,
  rows,
  groups,
  regions,
  detail,
}: {
  scopeLine: string;
  stats: { label: string; value: number; sub: string }[];
  rows: UserRow[];
  groups: GroupOption[];
  regions: RegionOption[];
  detail: UserDetail | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [switching, startSwitch] = useTransition();
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('all');
  const [role, setRole] = useState('all');
  // Deactivated people are hidden unless asked for.
  const [status, setStatus] = useState('active');
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const anchor = useRef<string | null>(null);
  const [creating, setCreating] = useState(false);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (u) =>
        (!s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
        (group === 'all' || u.groupIds.includes(group)) &&
        (role === 'all' || u.role === role) &&
        (status === 'all' || (status === 'off') === u.off),
    );
  }, [rows, q, group, role, status]);

  // Actions only ever apply to selected rows that are visible under the current filters.
  const selected = shown.filter((u) => picked.has(u.id));
  const shownPicked = selected.length;
  const allOn = shown.length > 0 && shownPicked === shown.length;

  function pick(id: string, e: MouseEvent) {
    e.stopPropagation();
    const next = new Set(picked);
    const on = !next.has(id);
    // Shift-click selects (or clears) every visible row between the last click and this one.
    const from = anchor.current ? shown.findIndex((u) => u.id === anchor.current) : -1;
    const to = shown.findIndex((u) => u.id === id);
    const range = e.shiftKey && from >= 0 && to >= 0 ? shown.slice(Math.min(from, to), Math.max(from, to) + 1) : [shown[to]];
    for (const u of range) if (u) (on ? next.add(u.id) : next.delete(u.id));
    anchor.current = id;
    setPicked(next);
  }

  function pickAll() {
    const next = new Set(picked);
    for (const u of shown) (allOn ? next.delete(u.id) : next.add(u.id));
    setPicked(next);
  }

  const open = (id: string) => router.push(`/admin/users?u=${encodeURIComponent(id)}`, { scroll: false });
  const close = () => router.push('/admin/users', { scroll: false });

  return (
    <div className="efkt-page">
      <PageHeader
        eyebrow={`Access · ${scopeLine}`}
        thin="People at"
        fat="EFKT"
        actions={
          <>
            <Button variant="secondary" iconRight="key" onClick={() => setCreating(true)}>Create user</Button>
            <ButtonLink href="/admin/invitations" iconRight="plus">Invite people</ButtonLink>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16 }}>
        {stats.map((s) => <StatTile key={s.label} label={s.label} value={s.value} sub={s.sub} />)}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input icon="magnifying-glass" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} style={SEARCH_STYLE} aria-label="Search name or email" />
        <Select
          aria-label="Filter by group"
          options={[{ value: 'all', label: 'All groups' }, ...groups.map((g) => ({ value: g.id, label: g.name }))]}
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          style={SELECT_STYLE}
        />
        <Select
          aria-label="Filter by role"
          options={[{ value: 'all', label: 'All roles' }, ...ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))]}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={SELECT_STYLE}
        />
        <Select aria-label="Filter by status" options={STATUSES} value={status} onChange={(e) => setStatus(e.target.value)} style={SELECT_STYLE} />
      </div>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', overflowX: 'auto', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', minWidth: GRID_MIN }}>
          <div style={{ ...col(COLS.pick), display: 'flex' }}>
            <SelectBox checked={allOn} mixed={!allOn && shownPicked > 0} disabled={!shown.length} label={allOn ? 'Clear selection' : `Select all ${shown.length} shown`} onClick={(e) => (e.stopPropagation(), pickAll())} />
          </div>
          <div style={col(COLS.name)}>Name</div>
          <div style={col(COLS.group)}>Group</div>
          <div style={col(COLS.role)}>Role</div>
          <div style={col(COLS.courses)}>Assigned courses</div>
          <div style={col(COLS.last)}>Last activity</div>
          <div style={col(COLS.go)} />
        </div>
        {shown.map((u) => (
          <div
            key={u.id}
            role="button"
            tabIndex={0}
            onClick={() => open(u.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(u.id))}
            className="efkt-row"
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', minWidth: GRID_MIN, cursor: 'pointer', background: picked.has(u.id) ? 'var(--efkt-offwhite)' : undefined }}
          >
            <div style={{ ...col(COLS.pick), display: 'flex' }}>
              <SelectBox checked={picked.has(u.id)} label={`Select ${u.name}`} onClick={(e) => pick(u.id, e)} />
            </div>
            <div style={{ ...col(COLS.name), display: 'flex', alignItems: 'center', gap: 12 }}>
              <Initials name={u.name} bg={roleAvatarBg(u.role)} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: u.off ? 'var(--text-muted)' : 'var(--text-body)' }}>{u.name}</span>
                  {u.off ? (
                    <span style={{ padding: '2px 10px', borderRadius: 25, background: 'var(--efkt-gray-100)', fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Deaktivert</span>
                  ) : null}
                </div>
                <div style={{ ...MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
              </div>
            </div>
            <div style={col(COLS.group)}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{u.groups}</div>
              <div style={MUTED}>{COUNTRY_SHORT[u.country]}{u.region ? ` · ${u.region}` : ''}</div>
            </div>
            <div style={col(COLS.role)}><RoleBadge role={u.role} /></div>
            <div style={col(COLS.courses)}>
              <ProgressLine
                label={u.assigned ? u.pct + '%' : '—'}
                counter={u.assigned ? `${u.done} / ${u.assigned} courses` : 'No courses assigned'}
                pct={u.pct}
                done={u.assigned > 0 && u.pct === 100}
              />
            </div>
            <div style={{ ...col(COLS.last), ...MUTED }}>{u.last}</div>
            <div style={{ ...col(COLS.go), display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              {u.canImpersonate ? (
                <button
                  type="button"
                  className="pp-softbtn"
                  title={`Log in as ${u.name}`}
                  aria-label={`Log in as ${u.name}`}
                  disabled={switching}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    startSwitch(async () => {
                      // Redirects to the learner dashboard on success.
                      const r = await impersonate(u.id);
                      if (r && !r.ok) toast(r.error, 'error');
                    });
                  }}
                >
                  <i className="ph ph-sign-in" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                </button>
              ) : null}
              <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
            </div>
          </div>
        ))}
        {shown.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>No users match that filter.</div>
        ) : null}
      </div>

      {selected.length ? (
        <BulkBar users={selected} groups={groups} regions={regions} onClear={() => setPicked(new Set())} />
      ) : null}

      {detail ? <UserDrawer key={detail.id} user={detail} groups={groups} regions={regions} onClose={close} /> : null}
      {creating ? (
        <CreateUserDialog
          groups={groups}
          regions={regions}
          onClose={() => setCreating(false)}
          onOpenUser={(id) => {
            setCreating(false);
            open(id);
          }}
        />
      ) : null}
    </div>
  );
}
