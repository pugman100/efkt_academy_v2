'use client';

import { useState, useTransition } from 'react';
import { Input, Select, Switch, useToast } from '@/components/ui';
import { setPrerequisite } from '@/app/(admin)/admin/courses/actions';

export type PrerequisiteOption = { id: string; title: string; status: string; blocked: boolean };

/**
 * "Only visible after completing another course" — off by default. The course picker
 * leaves out this course and any course that already depends on it (no loops).
 */
export function PrerequisiteField({
  courseId,
  prerequisiteId,
  unlockDelayDays,
  options,
}: {
  courseId: string;
  prerequisiteId: string | null;
  unlockDelayDays: number;
  options: PrerequisiteOption[];
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [on, setOn] = useState(!!prerequisiteId);
  const [pick, setPick] = useState(prerequisiteId ?? '');
  const [days, setDays] = useState(String(unlockDelayDays));
  const choices = options.filter((o) => !o.blocked);
  const chosen = options.find((o) => o.id === pick);

  const save = (next: { prerequisiteId: string | null; unlockDelayDays: number }, msg: string) =>
    start(async () => {
      const r = await setPrerequisite(courseId, next);
      toast(r.ok ? msg : r.error, r.ok ? 'ok' : 'error');
    });

  const n = Math.max(0, Math.round(Number(days) || 0));
  const line = !on
    ? 'Everyone who has this course sees it straight away.'
    : !pick
      ? 'Choose the course that must be completed first.'
      : `Hidden until the learner has completed «${chosen?.title ?? '…'}»${n ? `, then unlocked ${n} ${n === 1 ? 'day' : 'days'} later` : ', then unlocked straight away'}. They get an email when it unlocks. People who completed it before this was switched on, or already started this course, keep access.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 16, fontWeight: 500 }}>Prerequisite</div>
      <Switch
        checked={on}
        disabled={pending}
        label="Only visible after completing another course"
        onChange={() => {
          const next = !on;
          setOn(next);
          if (!next && prerequisiteId) save({ prerequisiteId: null, unlockDelayDays: 0 }, 'Prerequisite removed');
        }}
      />
      {on ? (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Select
            label="Course to complete first"
            options={[{ value: '', label: 'Choose a course' }, ...choices.map((o) => ({ value: o.id, label: o.status === 'PUBLISHED' ? o.title : `${o.title} (${o.status.toLowerCase()})` }))]}
            value={pick}
            disabled={pending}
            onChange={(e) => {
              setPick(e.target.value);
              if (e.target.value) save({ prerequisiteId: e.target.value, unlockDelayDays: n }, 'Prerequisite saved');
            }}
            style={{ flex: 2, minWidth: 240 }}
          />
          <Input
            label="Unlock after (days)"
            type="number"
            min={0}
            max={730}
            value={days}
            disabled={pending || !pick}
            onChange={(e) => setDays(e.target.value)}
            onBlur={() => pick && n !== unlockDelayDays && save({ prerequisiteId: pick, unlockDelayDays: n }, 'Unlock delay saved')}
            hint="0 = straight away"
            style={{ flex: 1, minWidth: 160 }}
          />
        </div>
      ) : null}
      {on && chosen && chosen.status !== 'PUBLISHED' ? (
        <div style={{ padding: 16, background: 'var(--efkt-blush)', borderRadius: 16, fontSize: 14, fontWeight: 500 }}>
          «{chosen.title}» isn’t published, so nobody can complete it yet — this course stays hidden until it is.
        </div>
      ) : null}
      <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{line}</div>
    </div>
  );
}
