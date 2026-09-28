'use client';

import { useState, useTransition } from 'react';
import { Button, Dialog, Input, Select, useToast } from '@/components/ui';
import { initials } from '@/lib/format';
import { assignCourseUsers } from '@/app/(admin)/admin/courses/actions';
import './courses.css';

export type Person = { id: string; name: string; country: string; groups: string[]; viaGroup: boolean; assigned: boolean };

/** "Tildel flere personer": pick many people for individual assignment. */
export function BulkAssignDialog({ courseId, people, onClose }: { courseId: string; people: Person[]; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All groups');
  const [picks, setPicks] = useState<string[]>([]);

  const q = search.trim().toLowerCase();
  const shown = people.filter((p) => (!q || p.name.toLowerCase().includes(q)) && (group === 'All groups' || p.groups.includes(group)));
  const assignable = shown.filter((p) => !p.viaGroup && !p.assigned);
  const groupNames = [...new Set(people.flatMap((p) => p.groups))].sort();

  function add() {
    start(async () => {
      const res = await assignCourseUsers(courseId, picks, true);
      if (!res.ok) return toast(res.error, 'error');
      toast(`${res.count} ${res.count === 1 ? 'person' : 'personer'} tildelt`);
      onClose();
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      width={680}
      title="Tildel flere personer"
      subtitle="Individuell tildeling. Folk som får kurset via gruppen sin er markert og kan ikke velges."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Avbryt</Button>
          <Button onClick={add} disabled={!picks.length || pending}>
            {picks.length ? `Tildel ${picks.length} ${picks.length === 1 ? 'person' : 'personer'}` : 'Velg personer'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input icon="magnifying-glass" placeholder="Søk etter navn" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 260 }} aria-label="Søk etter navn" />
        <Select options={['All groups', ...groupNames]} value={group} onChange={(e) => setGroup(e.target.value)} style={{ width: 220 }} aria-label="Group" />
        <button
          type="button"
          className="efkt-link"
          style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
          onClick={() => setPicks(picks.length ? [] : assignable.map((p) => p.id))}
        >
          {picks.length ? 'Fjern alle' : 'Velg alle som kan tildeles'}
        </button>
      </div>

      <div style={{ padding: '16px 20px', background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
        {assignable.length} av {shown.length} kan tildeles · {shown.length - assignable.length} har kurset allerede
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 420, paddingRight: 4 }}>
        {shown.map((p) => {
          const blocked = p.viaGroup || p.assigned;
          const picked = picks.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              className="ac-pick"
              style={{ alignItems: 'center', padding: '16px 20px' }}
              disabled={blocked}
              aria-pressed={picked}
              onClick={() => setPicks(picked ? picks.filter((x) => x !== p.id) : [...picks, p.id])}
            >
              <i className={`ph-bold ph-${blocked ? 'check-circle' : picked ? 'check-square' : 'square'}`} style={{ fontSize: 22, color: picked ? 'var(--efkt-navy)' : 'var(--efkt-muted)', flexShrink: 0 }} aria-hidden />
              <span style={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', background: 'var(--efkt-white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--text-body)' }}>{initials(p.name)}</span>
              <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>{p.name}</span>
                <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[p.groups.join(', '), p.country].filter(Boolean).join(' · ')}
                </span>
              </span>
              {blocked ? (
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{p.viaGroup ? 'Har kurset via gruppen sin' : 'Allerede tildelt'}</span>
              ) : null}
            </button>
          );
        })}
        {shown.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>Ingen personer matcher filteret.</div>
        ) : null}
      </div>
    </Dialog>
  );
}
