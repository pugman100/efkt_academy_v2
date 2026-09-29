'use client';

import type { Block } from '@/lib/blocks';
import { fileUrl } from '@/lib/blocks';
import { headingParts } from '@/components/blocks/BlockRenderer';
import { Photo } from '@/components/ui/Photo';
import { BlockCanvas } from './BlockCanvas';
import type { CourseOption, StoryData } from './types';

type Props = {
  story: StoryData;
  meta: string;
  courses: CourseOption[];
  selected: number | null;
  heroEdit: boolean;
  onHeroEdit: (on: boolean) => void;
  onField: (fields: Partial<StoryData>) => void;
  onSelect: (i: number | null) => void;
  onBlock: (i: number, b: Block) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onRemove: (i: number) => void;
};

/** Live preview laid out like the learner news reader; click a block to edit it in place. */
export function StoryPreview({ story: d, meta, courses, selected, heroEdit, onHeroEdit, onField, onSelect, onBlock, onMove, onRemove }: Props) {
  const title = headingParts(d.title || 'Uten tittel');

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className="ph ph-eye" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Live preview — klikk på en blokk for å redigere den direkte</div>
      </div>

      <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, overflow: 'hidden', background: 'var(--surface-card)' }}>
        <div style={{ position: 'relative', minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <Photo src={fileUrl(d.hero.imageId)} x={d.hero.x} y={d.hero.y} scale={d.hero.scale} style={{ position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0.55) 0%, rgba(12,14,57,0.15) 40%, rgba(12,14,57,0.85) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', flex: 1, minHeight: 320, boxSizing: 'border-box', padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{d.category}</div>
            {heroEdit ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input autoFocus className="nw-inline nw-inline--hero" value={d.title} placeholder="Tittel" onChange={(e) => onField({ title: e.target.value })}
                  style={{ fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.06em', fontWeight: 300 }} />
                <textarea className="nw-inline nw-inline--hero" rows={2} value={d.lead} placeholder="Kort ingress som vises på dashboardet" onChange={(e) => onField({ lead: e.target.value })}
                  style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.5 }} />
                <button type="button" onClick={() => onHeroEdit(false)} style={{ alignSelf: 'flex-start', height: 36, padding: '0 16px', border: 'none', borderRadius: 18, background: 'var(--efkt-white)', cursor: 'pointer', color: 'var(--efkt-navy)', fontSize: 14, fontWeight: 500 }}>
                  Ferdig
                </button>
              </div>
            ) : (
              <div className="nw-hero-hit" title="Klikk for å redigere" onClick={() => onHeroEdit(true)}>
                <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.05, letterSpacing: '-0.06em', fontWeight: 300, color: 'var(--efkt-white)', textWrap: 'pretty' }}>
                  {title.before}
                  <span style={{ fontWeight: 800 }}>{title.fat}</span>
                  {title.after}
                </h1>
              </div>
            )}
            <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.9)' }}>{meta}</div>
          </div>
        </div>

        <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div className="nw-prev" title="Klikk for å redigere" onClick={() => onHeroEdit(true)}
            style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.5, color: d.lead ? 'var(--text-body)' : 'var(--text-muted)', textWrap: 'pretty' }}>
            {d.lead || 'Legg til en kort ingress som vises på dashboardet.'}
          </div>
          <div style={{ height: 1, background: 'var(--border-default)' }} />
          <BlockCanvas blocks={d.blocks} courses={courses} selected={selected} onSelect={onSelect} onBlock={onBlock} onMove={onMove} onRemove={onRemove} />
        </div>
      </div>
    </div>
  );
}
