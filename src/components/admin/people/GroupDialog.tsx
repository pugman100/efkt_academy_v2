'use client';

import { useState, useTransition } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { deleteGroup, saveGroup } from '@/app/(admin)/admin/groups/actions';
import { MUTED } from './bits';
import type { GroupCard, Person } from './GroupsView';

/** New / edit group, with bulk member selection over the people in scope. */
export function GroupDialog({ group, people, onClose }: { group: GroupCard | null; people: Person[]; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  // Starts from every member (all countries) so out-of-scope members survive a save.
  const [members, setMembers] = useState<Set<string>>(new Set(group?.allMemberIds ?? []));
  const [q, setQ] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const s = q.trim().toLowerCase();
  const shown = people.filter((p) => !s || p.name.toLowerCase().includes(s));
  const allShownOn = shown.length > 0 && shown.every((p) => members.has(p.id));

  const flip = (ids: string[], on: boolean) =>
    setMembers((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const submit = () =>
    start(async () => {
      const r = await saveGroup({ id: group?.id ?? null, name, description, memberIds: [...members] });
      if (!r.ok) return toast(r.error, 'error');
      toast(group ? `${name.trim()} saved` : `${name.trim()} created`);
      onClose();
    });

  const remove = () => {
    if (!group) return;
    if (!confirmDelete) return setConfirmDelete(true);
    start(async () => {
      const r = await deleteGroup(group.id);
      if (!r.ok) return toast(r.error, 'error');
      toast(`${group.name} deleted`);
      onClose();
    });
  };

  const count = members.size;
  return (
    <Dialog
      open
      onClose={onClose}
      title={group ? 'Edit group' : 'New group'}
      footer={
        <>
          {group ? (
            <Button variant="danger" iconLeft="trash" onClick={remove} disabled={pending} style={{ marginRight: 'auto' }}>
              {confirmDelete ? 'Click again to delete' : 'Delete'}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={pending || name.trim().length < 2}>{group ? 'Save group' : 'Create group'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Group name" placeholder="e.g. Stylists" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!group} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        {confirmDelete ? (
          <div style={{ padding: '16px 20px', background: 'var(--efkt-blush)', borderRadius: 16, fontSize: 14, fontWeight: 300 }}>
            Deleting removes the group from its {group?.allMemberIds.length ?? 0} members and from every course and category it is assigned to. Completions are kept.
          </div>
        ) : null}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Members</div>
            <div style={MUTED}>{count} {count === 1 ? 'member selected' : 'members selected'}</div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
            <Input icon="magnifying-glass" placeholder="Search people" aria-label="Search people" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1 }} />
            <button type="button" className="efkt-link" onClick={() => flip(shown.map((p) => p.id), !allShownOn)} style={{ whiteSpace: 'nowrap' }}>
              {allShownOn ? 'Clear these' : `Select all ${shown.length}`}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 280, overflowY: 'auto' }}>
            {shown.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Checkbox checked={members.has(p.id)} onChange={() => flip([p.id], !members.has(p.id))} label={p.name} />
                <span style={{ ...MUTED, whiteSpace: 'nowrap' }}>{p.country}</span>
              </div>
            ))}
            {shown.length === 0 ? <div style={MUTED}>Nobody matches that search.</div> : null}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
