'use client';

import { useState, useTransition } from 'react';
import { Button, Checkbox, Input, Switch, Tag, useToast } from '@/components/ui';
import { assignCourseUsers, setCourseGroup, setSelfEnrol } from '@/app/(admin)/admin/courses/actions';
import { BulkAssignDialog, type Person } from './BulkAssignDialog';
import './courses.css';

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 } as const;

export function AssignmentTab({
  courseId,
  groups,
  assigned,
  people,
  categories,
  inherited,
  selfEnrol,
}: {
  courseId: string;
  groups: { id: string; name: string; count: number; checked: boolean }[];
  assigned: { id: string; name: string }[];
  people: Person[];
  categories: string[];
  inherited: { id: string; group: string; category: string }[];
  selfEnrol: boolean;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [query, setQuery] = useState('');
  const [bulk, setBulk] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg?: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) toast(res.error ?? 'Something went wrong', 'error');
      else if (msg) toast(msg);
    });

  const q = query.trim().toLowerCase();
  const matches = q ? people.filter((p) => !p.assigned && p.name.toLowerCase().includes(q)).slice(0, 8) : [];
  const inheritedNames = [...new Set(inherited.map((g) => g.group))];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24, alignItems: 'start', opacity: pending ? 0.85 : 1 }}>
      <div style={card}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Groups</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Every member of a selected group is enrolled.</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groups.map((g) => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <Checkbox
                checked={g.checked}
                label={g.name}
                onChange={() => run(() => setCourseGroup(courseId, g.id, !g.checked), g.checked ? `${g.name} removed` : `${g.name} assigned`)}
              />
              <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{g.count} in scope</span>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Individual users</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Enrol someone outside the selected groups.</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" iconRight="users-three" onClick={() => setBulk(true)}>Tildel flere</Button>
          {assigned.length ? (
            <Button
              variant="secondary"
              onClick={() => run(() => assignCourseUsers(courseId, assigned.map((u) => u.id), false), `${assigned.length} ${assigned.length === 1 ? 'individuell tildeling' : 'individuelle tildelinger'} fjernet`)}
            >
              Fjern alle
            </Button>
          ) : null}
        </div>
        <Input icon="magnifying-glass" placeholder="Search people" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search people" />
        {matches.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {matches.map((p) => (
              <button
                key={p.id}
                type="button"
                className="ac-listbtn"
                style={{ padding: 12 }}
                onClick={() => {
                  setQuery('');
                  run(() => assignCourseUsers(courseId, [p.id], true), `${p.name} assigned`);
                }}
              >
                <i className="ph ph-plus" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden /> {p.name}
                <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--text-muted)' }}>{[p.groups.join(', '), p.country].filter(Boolean).join(' · ')}</span>
              </button>
            ))}
          </div>
        ) : null}
        {assigned.length ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {assigned.map((u) => (
              <span key={u.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 8px 8px 16px', borderRadius: 25, background: 'var(--efkt-mint)', fontSize: 14, fontWeight: 500 }}>
                {u.name}
                <button
                  type="button"
                  aria-label={`Remove ${u.name}`}
                  onClick={() => run(() => assignCourseUsers(courseId, [u.id], false), `${u.name} removed`)}
                  style={{ width: 20, height: 20, border: 'none', borderRadius: '50%', background: 'rgba(55,59,84,0.12)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--efkt-navy)' }}
                >
                  <i className="ph ph-x" style={{ fontSize: 11 }} aria-hidden />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div style={{ ...card, gap: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Category &amp; catalogue</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Groups assigned to a category get every course in it.</div>
        </div>
        <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Arvet fra {categories.join(', ')}</div>
          {inheritedNames.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {inheritedNames.map((g) => (
                <span key={g} title={'via category ' + inherited.filter((x) => x.group === g).map((x) => x.category).join(', ')}>
                  <Tag>{g}</Tag>
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>No groups have these categories yet.</div>
          )}
          {categories.length > 1 && inherited.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              {categories.map((k) => {
                const gs = inherited.filter((g) => g.category === k).map((g) => g.group);
                return gs.length ? <span key={k}>via {k} → {gs.join(', ')}</span> : null;
              })}
            </div>
          ) : null}
        </div>
        <Switch checked={selfEnrol} onChange={() => run(() => setSelfEnrol(courseId, !selfEnrol))} label="Available for self-enrolment" />
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {selfEnrol
            ? 'Anyone with portal access can find this course in the catalogue and enrol themselves.'
            : 'Only assigned users and groups can see this course.'}
        </div>
      </div>

      {bulk ? <BulkAssignDialog courseId={courseId} people={people} onClose={() => setBulk(false)} /> : null}
    </div>
  );
}
