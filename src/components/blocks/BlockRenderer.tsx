import Link from 'next/link';
import type { Block } from '@/lib/blocks';
import { imageSrc } from '@/lib/blocks';
import { Photo } from '@/components/ui/Photo';

export type LinkedCourse = { id: string; title: string; description: string; href: string | null };

/** Splits a heading into thin text + the fat key word (defaults to the last word). */
export function headingParts(text: string, fat?: string) {
  if (fat && text.includes(fat)) {
    const i = text.indexOf(fat);
    return { before: text.slice(0, i), fat, after: text.slice(i + fat.length) };
  }
  const words = text.split(' ');
  return { before: words.slice(0, -1).join(' ') + (words.length > 1 ? ' ' : ''), fat: words[words.length - 1] ?? '', after: '' };
}

/** Read-only rendering of one content block (news stories and built modules). */
export function BlockView({ block: b, courses }: { block: Block; courses?: Record<string, LinkedCourse> }) {
  switch (b.kind) {
    case 'heading': {
      const p = headingParts(b.text, b.fat);
      return (
        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.045em', fontWeight: 300, color: 'var(--text-body)' }}>
          {p.before}
          <span style={{ fontWeight: 800 }}>{p.fat}</span>
          {p.after}
        </h2>
      );
    }
    case 'paragraph':
      return <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: 'var(--text-body)', textWrap: 'pretty', whiteSpace: 'pre-line' }}>{b.text}</div>;
    case 'image': {
      const src = imageSrc(b);
      if (!src) return null;
      return (
        <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Photo src={src} style={{ height: 380, borderRadius: 20 }} />
          {b.caption ? <figcaption style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{b.caption}</figcaption> : null}
        </figure>
      );
    }
    case 'imagetext':
      return (
        <div style={{ display: 'flex', flexDirection: b.side === 'right' ? 'row-reverse' : 'row', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <Photo src={imageSrc(b)} style={{ flex: 1, minWidth: 240, height: 260, borderRadius: 20 }} />
          <div style={{ flex: 1, minWidth: 240, fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: 'var(--text-body)', textWrap: 'pretty', whiteSpace: 'pre-line' }}>{b.text}</div>
        </div>
      );
    case 'quote':
      return (
        <blockquote style={{ margin: 0, padding: 32, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <i className="ph ph-quotes" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
          <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.5, color: 'var(--text-body)', textWrap: 'pretty' }}>{b.text}</div>
          {b.who ? <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>{b.who}</div> : null}
        </blockquote>
      );
    case 'list':
      return (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {b.items.split('\n').filter(Boolean).map((it, i) => (
            <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <i className="ph-bold ph-check" style={{ fontSize: 16, color: 'var(--efkt-coral)', marginTop: 5 }} aria-hidden />
              <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.7, color: 'var(--text-body)', textWrap: 'pretty' }}>{it}</span>
            </li>
          ))}
        </ul>
      );
    case 'button':
      return (
        <div>
          <a href={b.url} target="_blank" rel="noopener noreferrer" className="efkt-btn efkt-btn--primary" style={{ fontWeight: 600 }}>
            {b.label} <i className="ph ph-arrow-up-right" style={{ fontSize: 16 }} aria-hidden />
          </a>
        </div>
      );
    case 'divider':
      return <div style={{ height: 1, background: 'var(--border-default)' }} />;
    case 'course': {
      const c = courses?.[b.courseId];
      if (!c) return null;
      const inner = (
        <>
          <span style={{ width: 48, height: 48, minWidth: 48, borderRadius: 10, background: 'var(--efkt-white)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-graduation-cap" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
          </span>
          <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)' }}>Kurs</span>
            <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-body)' }}>{c.title}</span>
            <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{c.description}</span>
          </span>
          {c.href ? <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden /> : null}
        </>
      );
      const style = { display: 'flex', alignItems: 'center', gap: 20, padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, textDecoration: 'none' } as const;
      return c.href ? <Link href={c.href} className="efkt-card--hover" style={style}>{inner}</Link> : <div style={style}>{inner}</div>;
    }
  }
}

export function BlockRenderer({ blocks, courses, gap = 28 }: { blocks: Block[]; courses?: Record<string, LinkedCourse>; gap?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} courses={courses} />
      ))}
    </div>
  );
}
