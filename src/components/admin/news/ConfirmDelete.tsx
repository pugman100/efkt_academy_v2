'use client';

import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

/** "Delete this story?" confirmation. */
export function ConfirmDelete({ title, open, busy, onCancel, onConfirm }: { title: string; open: boolean; busy?: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      icon="trash"
      title="Delete story?"
      subtitle={title}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete story'}</Button>
        </>
      }
    >
      <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-body)', textWrap: 'pretty' }}>
        The story disappears from every dashboard straight away. This cannot be undone.
      </div>
    </Dialog>
  );
}
