'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Tag } from '@/components/ui/Tag';
import { Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE } from '@/lib/labels';
import { setUserGroup } from '@/app/(admin)/admin/users/actions';
import { EmptyNote, Initials, MUTED, SECTION } from './bits';
import type { GroupPanelData } from './GroupsView';

export function GroupPanel({ group, scopeLine, onClose }: { group: GroupPanelData; scopeLine: string; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const n = group.members.length;

  const toggle = (userId: string, name: string, add: boolean) =>
    start(async () => {
      const r = await setUserGroup(userId, group.id, add);
      toast(r.ok ? (add ? `${name} added to ${group.name}` : `${name} removed from ${group.name}`) : r.error, r.ok ? 'ok' : 'error');
    });

  return (
    <Dialog open drawer onClose={onClose} icon={group.icon} title={group.name} subtitle={`${n} ${n === 1 ? 'member' : 'members'} · ${scopeLine}`} style={{ opacity: pending ? 0.85 : 1 }}>
      <Select
        label="Add a member"
        options={[{ value: '', label: 'Add someone' }, ...group.addable.map((u) => ({ value: u.id, label: u.name }))]}
        value=""
        disabled={pending || group.addable.length === 0}
        onChange={(e) => {
          const u = group.addable.find((x) => x.id === e.target.value);
          if (u) toggle(u.id, u.name, true);
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={SECTION}>Members</div>
        {n === 0 ? <EmptyNote>Nobody here yet within this country scope.</EmptyNote> : null}
        <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
          {group.members.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--efkt-offwhite)', borderRadius: 20 }}>
              <Initials name={m.name} bg="var(--efkt-white)" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <Link href={`/admin/users?u=${m.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)', textDecoration: 'none' }}>{m.name}</Link>
                <div style={{ ...MUTED, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.country} · {m.otherGroups}</div>
              </div>
              <button type="button" className="pp-removebtn" title="Remove from group" aria-label={`Remove ${m.name} from group`} disabled={pending} onClick={() => toggle(m.id, m.name, false)}>
                <i className="ph ph-user-minus" style={{ fontSize: 18 }} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={SECTION}>Courses assigned directly</div>
        {group.courses.length === 0 ? <div style={MUTED}>None. This group may still receive courses through a category.</div> : null}
        {group.courses.map((c) => (
          <Link
            key={c.id}
            href={`/admin/courses/${c.id}`}
            className="pp-hoverbg"
            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--efkt-white)', textDecoration: 'none' }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>{c.title}</div>
              <div style={MUTED}>{c.category}</div>
            </div>
            <Badge tone={COURSE_STATUS_TONE[c.status]}>{COURSE_STATUS_LABEL[c.status]}</Badge>
          </Link>
        ))}
      </div>

      {group.categories.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={SECTION}>Category access</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {group.categories.map((k) => <Tag key={k}>{k}</Tag>)}
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
