'use client';

import { useMemo, useState, useTransition, type ReactNode } from 'react';
import type { Country, CourseStatus } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/admin/PageHeader';
import { COUNTRY_SHORT, COURSE_STATUS_LABEL, COURSE_STATUS_TONE } from '@/lib/labels';
import { bulkAssign } from '@/app/(admin)/admin/bulk-assign/actions';
import { Initials, MUTED } from './bits';

type U = { id: string; name: string; country: Country; groupIds: string[]; groups: string; inScope: boolean };
type G = { id: string; name: string; icon: string };
type C = { id: string; title: string; status: CourseStatus; country: Country; reference: boolean; category: string };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
const toggle = (set: Set<string>, id: string) => {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

export function BulkAssign({ scopeLine, users, groups, courses, access }: { scopeLine: string; users: U[]; groups: G[]; courses: C[]; access: Record<string, string[]> }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [tab, setTab] = useState<'people' | 'groups'>('people');
  const [pickedUsers, setPickedUsers] = useState<Set<string>>(new Set());
  const [pickedGroups, setPickedGroups] = useState<Set<string>>(new Set());
  const [pickedCourses, setPickedCourses] = useState<Set<string>>(new Set());
  const [uq, setUq] = useState('');
  const [ug, setUg] = useState('all');
  const [cq, setCq] = useState('');

  const people = users.filter((u) => u.inScope);
  const shownPeople = people.filter((u) => (!uq.trim() || u.name.toLowerCase().includes(uq.trim().toLowerCase())) && (ug === 'all' || u.groupIds.includes(ug)));
  const shownCourses = courses.filter((c) => !cq.trim() || c.title.toLowerCase().includes(cq.trim().toLowerCase()));
  const memberCount = (gid: string) => users.filter((u) => u.groupIds.includes(gid)).length;

  const preview = useMemo(() => {
    const targets = users.filter((u) => pickedUsers.has(u.id) || u.groupIds.some((g) => pickedGroups.has(g)));
    let fresh = 0, already = 0, hidden = 0;
    for (const c of courses.filter((x) => pickedCourses.has(x.id))) {
      const has = new Set(access[c.id] ?? []);
      for (const u of targets) {
        if (has.has(u.id)) already++;
        else if (c.status !== 'PUBLISHED' || !(c.country === 'Both' || c.country === u.country)) hidden++;
        else fresh++;
      }
    }
    return { users: targets.length, courses: pickedCourses.size, fresh, already, hidden };
  }, [users, courses, access, pickedUsers, pickedGroups, pickedCourses]);

  const ready = preview.courses > 0 && (pickedUsers.size > 0 || pickedGroups.size > 0);

  const apply = () =>
    start(async () => {
      const r = await bulkAssign({ userIds: [...pickedUsers], groupIds: [...pickedGroups], courseIds: [...pickedCourses] });
      if (!r.ok) return toast(r.error, 'error');
      toast(`${plural(r.courses, 'course', 'courses')} assigned to ${plural(preview.users, 'person', 'people')}`);
      setPickedUsers(new Set());
      setPickedGroups(new Set());
      setPickedCourses(new Set());
    });

  const allPeopleOn = shownPeople.length > 0 && shownPeople.every((u) => pickedUsers.has(u.id));
  const allCoursesOn = shownCourses.length > 0 && shownCourses.every((c) => pickedCourses.has(c.id));

  return (
    <div className="efkt-page">
      <PageHeader eyebrow={`Access · ${scopeLine}`} thin="Bulk" fat="assign" />
      <div style={{ maxWidth: 720, fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty', marginTop: -12 }}>
        Pick people and groups on the left, courses on the right, and assign them all in one go. Groups keep receiving the courses as their members change.
      </div>

      <div className="pp-bulk">
        <Panel
          title="Who"
          aside={
            <div className="efkt-seg">
              <button type="button" aria-pressed={tab === 'people'} onClick={() => setTab('people')}>People · {pickedUsers.size}</button>
              <button type="button" aria-pressed={tab === 'groups'} onClick={() => setTab('groups')}>Groups · {pickedGroups.size}</button>
            </div>
          }
        >
          {tab === 'people' ? (
            <>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Input icon="magnifying-glass" placeholder="Search name" aria-label="Search name" value={uq} onChange={(e) => setUq(e.target.value)} style={{ flex: '1 1 200px' }} />
                <Select aria-label="Filter by group" options={[{ value: 'all', label: 'All groups' }, ...groups.map((g) => ({ value: g.id, label: g.name }))]} value={ug} onChange={(e) => setUg(e.target.value)} style={{ flex: '1 1 180px' }} />
              </div>
              <SelectAll on={allPeopleOn} n={shownPeople.length} onClick={() => setPickedUsers((s) => { const n = new Set(s); shownPeople.forEach((u) => (allPeopleOn ? n.delete(u.id) : n.add(u.id))); return n; })} />
              <List empty="Nobody matches that filter.">
                {shownPeople.map((u) => (
                  <PickRow key={u.id} on={pickedUsers.has(u.id)} onClick={() => setPickedUsers((s) => toggle(s, u.id))} lead={<Initials name={u.name} size={36} bg="var(--efkt-white)" />} title={u.name} sub={`${u.groups || 'No group'} · ${u.country}`} />
                ))}
              </List>
            </>
          ) : (
            <List empty="No groups yet.">
              {groups.map((g) => (
                <PickRow
                  key={g.id}
                  on={pickedGroups.has(g.id)}
                  onClick={() => setPickedGroups((s) => toggle(s, g.id))}
                  lead={<i className={`ph ph-${g.icon}`} style={{ fontSize: 28, color: 'var(--efkt-coral)', width: 36, textAlign: 'center' }} aria-hidden />}
                  title={g.name}
                  sub={`${plural(memberCount(g.id), 'member', 'members')} · all countries`}
                />
              ))}
            </List>
          )}
        </Panel>

        <Panel title="Courses" aside={<span style={MUTED}>{pickedCourses.size} selected</span>}>
          <Input icon="magnifying-glass" placeholder="Search courses" aria-label="Search courses" value={cq} onChange={(e) => setCq(e.target.value)} />
          <SelectAll on={allCoursesOn} n={shownCourses.length} onClick={() => setPickedCourses((s) => { const n = new Set(s); shownCourses.forEach((c) => (allCoursesOn ? n.delete(c.id) : n.add(c.id))); return n; })} />
          <List empty="No courses match that search.">
            {shownCourses.map((c) => (
              <PickRow
                key={c.id}
                on={pickedCourses.has(c.id)}
                onClick={() => setPickedCourses((s) => toggle(s, c.id))}
                title={c.title}
                sub={[c.category, COUNTRY_SHORT[c.country], c.reference ? 'Reference' : ''].filter(Boolean).join(' · ')}
                tail={c.status !== 'PUBLISHED' ? <Badge tone={COURSE_STATUS_TONE[c.status]}>{COURSE_STATUS_LABEL[c.status]}</Badge> : undefined}
              />
            ))}
          </List>
        </Panel>
      </div>

      <div style={{ position: 'sticky', bottom: 24, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', padding: 24, background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, boxShadow: '0 8px 32px rgba(12,14,57,0.10)' }}>
        <i className="ph ph-stack" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {ready ? `${plural(preview.users, 'user', 'users')} will get ${plural(preview.courses, 'course', 'courses')}` : 'Pick who, then which courses'}
          </div>
          <div style={{ ...MUTED, marginTop: 4 }}>
            {ready
              ? [
                  `${plural(preview.fresh, 'new course access', 'new course accesses')}`,
                  preview.already ? `${preview.already} already have access` : '',
                  preview.hidden ? `${preview.hidden} not visible yet (draft or other country)` : '',
                  pickedGroups.size ? `new members of ${plural(pickedGroups.size, 'group', 'groups')} get them too` : '',
                ].filter(Boolean).join(' · ')
              : 'Nothing is assigned until you confirm.'}
          </div>
        </div>
        <Button iconRight="check" onClick={apply} disabled={!ready || pending}>
          {ready ? `Assign ${plural(preview.courses, 'course', 'courses')}` : 'Assign'}
        </Button>
      </div>
    </div>
  );
}

function Panel({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 4px 24px rgba(12,14,57,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</div>
        {aside}
      </div>
      {children}
    </div>
  );
}

function SelectAll({ on, n, onClick }: { on: boolean; n: number; onClick: () => void }) {
  return (
    <button type="button" className="efkt-link" onClick={onClick} disabled={n === 0} style={{ alignSelf: 'flex-end' }}>
      {on ? 'Clear these' : `Select all ${n}`}
    </button>
  );
}

function List({ empty, children }: { empty: string; children: ReactNode[] }) {
  return (
    <div style={{ maxHeight: 520, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
      {children.length ? children : <div style={{ padding: '48px 24px', textAlign: 'center', ...MUTED, fontSize: 16 }}>{empty}</div>}
    </div>
  );
}

function PickRow({ on, onClick, lead, title, sub, tail }: { on: boolean; onClick: () => void; lead?: ReactNode; title: string; sub: string; tail?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={on ? undefined : 'pp-hoverbg'}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', border: 'none', borderRadius: 20, background: on ? 'var(--efkt-offwhite)' : 'var(--efkt-white)', cursor: 'pointer', fontFamily: 'var(--efkt-font)', textAlign: 'left' }}
    >
      <i className={`ph-bold ph-${on ? 'check-square' : 'square'}`} style={{ fontSize: 22, color: on ? 'var(--efkt-navy)' : 'var(--efkt-muted)', flexShrink: 0 }} aria-hidden />
      {lead}
      <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>{title}</span>
        <span style={{ ...MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub}</span>
      </span>
      {tail}
    </button>
  );
}
