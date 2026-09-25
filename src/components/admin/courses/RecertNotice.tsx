'use client';

import { useState, useTransition } from 'react';
import { Button, Dialog, useToast } from '@/components/ui';
import { resolveRecert } from '@/app/(admin)/admin/courses/actions';

type Change = { moduleId: string; title: string; kind: 'added' | 'removed' | 'changed' };

const KIND: Record<Change['kind'], string> = { added: 'Added', removed: 'Removed', changed: 'Changed' };

/** Shown on a published course whose modules changed: do existing completions stand? */
export function RecertNotice({ courseId, changes }: { courseId: string; changes: Change[] }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const changed = changes.filter((c) => c.kind === 'changed');

  const resolve = (reset: boolean) =>
    start(async () => {
      const res = await resolveRecert(courseId, reset);
      setConfirm(false);
      if (!res.ok) return toast(res.error, 'error');
      toast(reset ? `Progress reset on ${changed.length} ${changed.length === 1 ? 'module' : 'modules'}` : 'Existing completions stand');
    });

  return (
    <div style={{ marginTop: 32, padding: 24, background: 'var(--efkt-sand)', borderRadius: 20, display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <i className="ph ph-seal-warning" style={{ fontSize: 28, color: 'var(--efkt-coral)' }} aria-hidden />
      <div style={{ minWidth: 260, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Modules changed since this course was published</div>
        <div style={{ fontSize: 14, fontWeight: 300, textWrap: 'pretty' }}>
          {changes.map((c) => `${KIND[c.kind]}: ${c.title}`).join(' · ')}
        </div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Decide whether learners who already passed keep their completion, or must take the changed modules again.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignSelf: 'center' }}>
        <Button variant="secondary" size="sm" disabled={pending} onClick={() => resolve(false)}>Existing completions stand</Button>
        {changed.length ? (
          <Button size="sm" disabled={pending} onClick={() => setConfirm(true)}>Reset progress on changed modules</Button>
        ) : null}
      </div>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset progress?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
            <Button disabled={pending} onClick={() => resolve(true)}>Reset progress</Button>
          </>
        }
      >
        <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, textWrap: 'pretty' }}>
          Everyone&rsquo;s progress on {changed.map((c) => `«${c.title}»`).join(', ')} is cleared. They must go through
          {changed.length === 1 ? ' the module and pass its quiz' : ' the modules and pass their quizzes'} again to complete the course.
        </div>
      </Dialog>
    </div>
  );
}
