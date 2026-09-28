'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { PageHeader } from '@/components/admin/PageHeader';
import { COUNTRY_SHORT, ROLE_LABEL, ROLES } from '@/lib/labels';
import { Initials, MUTED, ProgressLine, RoleBadge, roleAvatarBg, SEARCH_STYLE, SELECT_STYLE, StatTile } from './bits';
import { UserDrawer } from './UserDrawer';
import { CreateUserDialog } from './CreateUserDialog';
import type { GroupOption, RegionOption, UserDetail, UserRow } from './types';

const COLS = { name: 280, group: 170, role: 140, courses: 220, last: 130, go: 44 };
const GRID_MIN = Object.values(COLS).reduce((a, b) => a + b, 0) + 16 * 5;
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
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('all');
  const [role, setRole] = useState('all');
  const [creating, setCreating] = useState(false);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return rows.filter(
      (u) =>
        (!s || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)) &&
        (group === 'all' || u.groupIds.includes(group)) &&
        (role === 'all' || u.role === role),
    );
  }, [rows, q, group, role]);

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
      </div>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', overflowX: 'auto', marginTop: -8 }}>
        <div style={{ display: 'flex', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', minWidth: GRID_MIN }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', minWidth: GRID_MIN, cursor: 'pointer' }}
          >
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
            <div style={{ ...col(COLS.go), textAlign: 'right' }}>
              <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
            </div>
          </div>
        ))}
        {shown.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>No users match that filter.</div>
        ) : null}
      </div>

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
