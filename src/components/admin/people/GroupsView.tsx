'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Country, CourseStatus } from '@prisma/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { PageHeader } from '@/components/admin/PageHeader';
import type { Scope } from '@/lib/labels';
import { Initials, MUTED, SEARCH_STYLE } from './bits';
import { GroupPanel } from './GroupPanel';
import { GroupDialog } from './GroupDialog';

export type Person = { id: string; name: string; country: Country };
export type GroupCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Members inside the current country scope. */
  members: Person[];
  /** Every member, all countries — kept when editing under a narrower scope. */
  allMemberIds: string[];
  direct: number;
  viaCategory: number;
  courses: { id: string; title: string; via: string }[];
};
export type GroupPanelData = {
  id: string;
  name: string;
  icon: string;
  members: (Person & { otherGroups: string })[];
  addable: { id: string; name: string }[];
  courses: { id: string; title: string; category: string; status: CourseStatus }[];
  categories: string[];
};

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function GroupsView({ scope, scopeLine, cards, people, panel }: { scope: Scope; scopeLine: string; cards: GroupCard[]; people: Person[]; panel: GroupPanelData | null }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<GroupCard | 'new' | null>(null);
  const s = q.trim().toLowerCase();
  const shown = cards.filter((g) => !s || g.name.toLowerCase().includes(s));

  return (
    <div className="efkt-page">
      <PageHeader eyebrow={`Access · ${scopeLine}`} thin="User" fat="groups" actions={<Button iconRight="plus" onClick={() => setEditing('new')}>New group</Button>} />
      <div style={{ maxWidth: 720, fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty', marginTop: -12 }}>
        People can belong to as many groups as their work requires. Courses reach a group directly, or through a category the group has access to.
      </div>
      <Input icon="magnifying-glass" placeholder="Search groups" aria-label="Search groups" value={q} onChange={(e) => setQ(e.target.value)} style={SEARCH_STYLE} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 20, alignItems: 'stretch' }}>
        {shown.map((g) => {
          const dk = g.members.filter((m) => m.country === 'Denmark').length;
          const no = g.members.length - dk;
          return (
            <div key={g.id} style={{ height: '100%', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 4px 24px rgba(12,14,57,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <i className={`ph ph-${g.icon}`} style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{g.name}</div>
                  <div style={{ minHeight: 44, ...MUTED, marginTop: 4, textWrap: 'pretty' }}>{g.description}</div>
                </div>
                <button type="button" className="pp-softbtn" title="Edit group" aria-label={`Edit ${g.name}`} onClick={() => setEditing(g)}>
                  <i className="ph ph-pencil-simple" style={{ fontSize: 18 }} aria-hidden />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>{plural(g.members.length, 'member', 'members')}</span>
                <span style={MUTED}>{scope === 'All' ? `${dk} DK · ${no} NO` : scope}</span>
                <span style={MUTED}>{g.direct} direct · {g.viaCategory} via category</span>
              </div>

              {g.members.length === 0 ? <div style={MUTED}>Nobody in this group within the current country scope.</div> : null}
              <div style={{ minHeight: 36, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {g.members.slice(0, 6).map((m) => <Initials key={m.id} name={m.name} size={36} />)}
                {g.members.length > 6 ? <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>+{g.members.length - 6}</span> : null}
              </div>

              <div style={{ height: 1, background: 'var(--border-default)' }} />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Courses they receive</div>
                {g.courses.length === 0 ? <div style={MUTED}>No courses reach this group yet.</div> : null}
                <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 4 }}>
                  {g.courses.map((c) => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--efkt-offwhite)', borderRadius: 12 }}>
                      <span style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{c.via}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Button variant="secondary" iconRight="arrow-right" onClick={() => router.push(`/admin/groups?g=${g.id}`, { scroll: false })}>Manage members</Button>
              </div>
            </div>
          );
        })}
        {shown.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>No groups match that search.</div>
        ) : null}
      </div>

      {panel ? <GroupPanel key={panel.id} group={panel} scopeLine={scopeLine} onClose={() => router.push('/admin/groups', { scroll: false })} /> : null}
      {editing ? (
        <GroupDialog
          key={editing === 'new' ? 'new' : editing.id}
          group={editing === 'new' ? null : editing}
          people={people}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
