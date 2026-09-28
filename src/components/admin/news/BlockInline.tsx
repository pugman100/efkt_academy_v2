'use client';

import type { Block } from '@/lib/blocks';
import type { CourseOption } from './types';
import { ImageDrop } from './ImageDrop';

/** In-place editor for the selected block, keeping the reader's typography. */
export function BlockInline({ block: b, courses, onChange }: { block: Block; courses: CourseOption[]; onChange: (b: Block) => void }) {
  switch (b.kind) {
    case 'heading':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input autoFocus className="nw-inline" value={b.text} placeholder="Overskrift" onChange={(e) => onChange({ ...b, text: e.target.value })}
            style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.045em', fontWeight: 300 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
            Uthevet ord
            <input className="nw-inline" value={b.fat ?? ''} placeholder="siste ord" onChange={(e) => onChange({ ...b, fat: e.target.value })}
              style={{ width: 'auto', flex: 1, fontSize: 14, fontWeight: 800 }} />
          </label>
        </div>
      );
    case 'paragraph':
      return (
        <textarea autoFocus className="nw-inline" rows={3} value={b.text} placeholder="Skriv tekst…" onChange={(e) => onChange({ ...b, text: e.target.value })}
          style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7 }} />
      );
    case 'image':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ImageDrop imageId={b.imageId} hint={b.hint} onUpload={(id) => onChange({ ...b, imageId: id, src: undefined })} style={{ height: 380 }} />
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Klikk eller slipp et bilde for å bytte</div>
          <input className="nw-inline" value={b.caption ?? ''} placeholder="Bildetekst (valgfri)" onChange={(e) => onChange({ ...b, caption: e.target.value })}
            style={{ fontSize: 14, fontWeight: 300 }} />
        </div>
      );
    case 'imagetext':
      return (
        <div style={{ display: 'flex', flexDirection: b.side === 'right' ? 'row-reverse' : 'row', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <ImageDrop imageId={b.imageId} hint={b.hint} onUpload={(id) => onChange({ ...b, imageId: id, src: undefined })} style={{ flex: 1, minWidth: 240, height: 260 }} />
          <textarea className="nw-inline" rows={4} value={b.text} placeholder="Tekst ved siden av bildet" onChange={(e) => onChange({ ...b, text: e.target.value })}
            style={{ flex: 1, minWidth: 240, width: 'auto', fontSize: 16, fontWeight: 300, lineHeight: 1.7 }} />
        </div>
      );
    case 'quote':
      return (
        <div style={{ padding: 32, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <i className="ph ph-quotes" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
          <textarea autoFocus className="nw-inline" rows={2} value={b.text} placeholder="Sitat" onChange={(e) => onChange({ ...b, text: e.target.value })}
            style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.5 }} />
          <input className="nw-inline" value={b.who ?? ''} placeholder="Hvem sa det" onChange={(e) => onChange({ ...b, who: e.target.value })}
            style={{ fontSize: 14, fontWeight: 600 }} />
        </div>
      );
    case 'list':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea autoFocus className="nw-inline" rows={3} value={b.items} placeholder="Ett punkt per linje" onChange={(e) => onChange({ ...b, items: e.target.value })}
            style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.8 }} />
          <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Ett punkt per linje</span>
        </div>
      );
    case 'button':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input autoFocus className="nw-inline" value={b.label} placeholder="Knappetekst" onChange={(e) => onChange({ ...b, label: e.target.value })}
            style={{ alignSelf: 'flex-start', width: 'auto', minWidth: 220, borderRadius: 25, padding: '14px 28px', background: 'var(--efkt-coral)', color: 'var(--efkt-white)', borderColor: 'var(--efkt-white)', fontSize: 16, fontWeight: 600 }} />
          <input className="nw-inline" value={b.url} placeholder="https://" onChange={(e) => onChange({ ...b, url: e.target.value })} style={{ fontSize: 14, fontWeight: 300 }} />
        </div>
      );
    case 'course':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20 }}>
          <i className="ph ph-graduation-cap" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
          <select className="nw-inline" value={b.courseId} onChange={(e) => onChange({ ...b, courseId: e.target.value })} style={{ fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
            <option value="">Velg et kurs</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>
      );
    case 'divider':
      return <div style={{ height: 1, background: 'var(--border-default)' }} />;
  }
}
