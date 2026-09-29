'use client';

import type { Block } from '@/lib/blocks';
import { BlockView, type LinkedCourse } from '@/components/blocks/BlockRenderer';
import { BlockInline } from './BlockInline';
import { blockMeta } from './BlockSettings';
import type { CourseOption } from './types';
import './news.css';

type Props = {
  blocks: Block[];
  courses: CourseOption[];
  selected: number | null;
  onSelect: (i: number | null) => void;
  onBlock: (i: number, b: Block) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onRemove: (i: number) => void;
};

/**
 * Blocks rendered as the learner sees them; click one to edit it in place.
 * Shared by the news story editor and the course module editor.
 */
export function BlockCanvas({ blocks, courses, selected, onSelect, onBlock, onMove, onRemove }: Props) {
  const linked: Record<string, LinkedCourse> = Object.fromEntries(courses.map((c) => [c.id, { id: c.id, title: c.title, description: c.description, href: null }]));
  return (
    <>
      {blocks.length === 0 ? (
        <div style={{ padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Ingen blokker ennå. Legg til en fra panelet til venstre.</div>
      ) : null}
      {blocks.map((b, i) => {
        const on = selected === i;
        return (
          <div key={b.id} className="nw-prev" aria-current={on} title={on ? undefined : 'Klikk for å redigere'} onClick={() => !on && onSelect(i)}>
            {on ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)' }}>Redigerer: {blockMeta(b).label.toLowerCase()}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button type="button" className="nw-mini" title="Flytt opp" disabled={i === 0} onClick={() => onMove(i, -1)}><i className="ph ph-arrow-up" style={{ fontSize: 16 }} /></button>
                  <button type="button" className="nw-mini" title="Flytt ned" disabled={i === blocks.length - 1} onClick={() => onMove(i, 1)}><i className="ph ph-arrow-down" style={{ fontSize: 16 }} /></button>
                  <button type="button" className="nw-mini nw-mini--danger" title="Slett blokk" onClick={() => onRemove(i)}><i className="ph ph-trash" style={{ fontSize: 16 }} /></button>
                  <button type="button" onClick={() => onSelect(null)} style={{ height: 36, padding: '0 14px', border: 'none', borderRadius: 18, background: 'var(--efkt-navy)', cursor: 'pointer', color: 'var(--efkt-white)', fontSize: 14, fontWeight: 500 }}>Ferdig</button>
                </div>
              </div>
            ) : null}
            {on ? <BlockInline block={b} courses={courses} onChange={(nb) => onBlock(i, nb)} /> : <PreviewBlock block={b} courses={linked} />}
          </div>
        );
      })}
    </>
  );
}

/** Reader rendering, with placeholders where the reader would render nothing yet. */
function PreviewBlock({ block: b, courses }: { block: Block; courses: Record<string, LinkedCourse> }) {
  if (b.kind === 'image' && !b.imageId && !b.src) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 380, borderRadius: 20, background: 'var(--efkt-offwhite)', border: '1px dashed var(--efkt-divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
          <i className="ph ph-image" style={{ fontSize: 28 }} aria-hidden />
          {b.hint || 'Slipp et bilde her'}
        </div>
        {b.caption ? <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{b.caption}</div> : null}
      </div>
    );
  }
  if (b.kind === 'course' && !courses[b.courseId]) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, border: '1px dashed var(--efkt-divider)', borderRadius: 20, background: 'var(--efkt-offwhite)', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>
        <i className="ph ph-graduation-cap" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
        Ingen kurs valgt
      </div>
    );
  }
  return <BlockView block={b} courses={courses} />;
}
