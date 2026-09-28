import type { ReactNode } from 'react';
import { Heading } from '@/components/ui/Heading';

/** "EFKT Academy · Denmark and Norway" eyebrow + two-weight H1 + actions on the right. */
export function PageHeader({ eyebrow, thin, fat, thinAfter, actions, children }: { eyebrow?: ReactNode; thin?: string; fat: string; thinAfter?: string; actions?: ReactNode; children?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        {eyebrow ? <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{eyebrow}</div> : null}
        <Heading level="h1" thin={thin} fat={fat} thinAfter={thinAfter} />
        {children}
      </div>
      {actions ? <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{actions}</div> : null}
    </div>
  );
}
