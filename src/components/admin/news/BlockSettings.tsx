'use client';

import { BLOCK_KINDS, type Block } from '@/lib/blocks';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch, Textarea } from '@/components/ui/Field';
import type { CourseOption } from './types';

export function blockMeta(b: Block) {
  return BLOCK_KINDS.find((k) => k.kind === b.kind) ?? { kind: b.kind, label: b.kind, icon: 'square' };
}

/** One-line summary for the block list. */
export function blockSummary(b: Block, courses: CourseOption[]): string {
  switch (b.kind) {
    case 'heading': return b.text;
    case 'paragraph': return b.text.slice(0, 60);
    case 'image': return b.caption || (b.imageId ? 'No caption' : 'No image yet');
    case 'imagetext': return b.text.slice(0, 50);
    case 'quote': return '“' + b.text.slice(0, 40) + '”';
    case 'list': return b.items.split('\n').filter(Boolean).length + ' punkter';
    case 'button': return b.label + ' → ' + b.url;
    case 'course': return courses.find((c) => c.id === b.courseId)?.title ?? 'No course chosen';
    case 'divider': return '—';
  }
}

const IMAGE_HELP = 'Klikk eller slipp et nytt bilde på blokken i forhåndsvisningen for å bytte det.';

function ImageHelp({ has, onClear }: { has: boolean; onClear: () => void }) {
  return (
    <>
      <div style={{ padding: '16px 20px', background: 'var(--efkt-offwhite)', borderRadius: 16, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{IMAGE_HELP}</div>
      {has ? (
        <div>
          <Button variant="secondary" onClick={onClear}>Fjern bildet</Button>
        </div>
      ) : null}
    </>
  );
}

/** Settings card for the selected block (mirrors the inline editor). */
export function BlockSettings({ block: b, courses, onChange }: { block: Block; courses: CourseOption[]; onChange: (b: Block) => void }) {
  const meta = blockMeta(b);
  let fields: React.ReactNode;
  switch (b.kind) {
    case 'heading':
      fields = (
        <>
          <Input label="Heading" value={b.text} onChange={(e) => onChange({ ...b, text: e.target.value })} />
          <Input label="Word in bold" value={b.fat ?? ''} onChange={(e) => onChange({ ...b, fat: e.target.value })} hint="EFKT headings set one word heavy and the rest light." />
        </>
      );
      break;
    case 'paragraph':
      fields = <Textarea label="Text" rows={6} value={b.text} onChange={(e) => onChange({ ...b, text: e.target.value })} />;
      break;
    case 'image':
      fields = (
        <>
          <ImageHelp has={!!b.imageId} onClear={() => onChange({ ...b, imageId: undefined, src: undefined })} />
          <Input label="Image placeholder text" value={b.hint ?? ''} onChange={(e) => onChange({ ...b, hint: e.target.value })} hint="Shown in the empty image until a photo is added." />
          <Input label="Caption" value={b.caption ?? ''} onChange={(e) => onChange({ ...b, caption: e.target.value })} />
        </>
      );
      break;
    case 'imagetext':
      fields = (
        <>
          <Textarea label="Text" rows={5} value={b.text} onChange={(e) => onChange({ ...b, text: e.target.value })} />
          <ImageHelp has={!!b.imageId} onClear={() => onChange({ ...b, imageId: undefined, src: undefined })} />
          <Input label="Image placeholder text" value={b.hint ?? ''} onChange={(e) => onChange({ ...b, hint: e.target.value })} />
          <Switch checked={b.side !== 'right'} onChange={() => onChange({ ...b, side: b.side === 'right' ? 'left' : 'right' })} label={b.side === 'right' ? 'Image on the right' : 'Image on the left'} />
        </>
      );
      break;
    case 'quote':
      fields = (
        <>
          <Textarea label="Quote" rows={4} value={b.text} onChange={(e) => onChange({ ...b, text: e.target.value })} />
          <Input label="Who said it" value={b.who ?? ''} onChange={(e) => onChange({ ...b, who: e.target.value })} />
        </>
      );
      break;
    case 'list':
      fields = <Textarea label="Bullet points" rows={6} value={b.items} onChange={(e) => onChange({ ...b, items: e.target.value })} hint="One point per line. Max five, per the EFKT guidelines." />;
      break;
    case 'button':
      fields = (
        <>
          <Input label="Button label" value={b.label} onChange={(e) => onChange({ ...b, label: e.target.value })} />
          <Input label="Link" icon="link" value={b.url} onChange={(e) => onChange({ ...b, url: e.target.value })} />
        </>
      );
      break;
    case 'course':
      fields = (
        <Select
          label="Course"
          options={[{ value: '', label: 'Choose a course' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]}
          value={b.courseId}
          onChange={(e) => onChange({ ...b, courseId: e.target.value })}
          hint="Readers get a card that opens the course."
        />
      );
      break;
    case 'divider':
      fields = <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>A divider has no settings. Use it to separate two topics inside one story.</div>;
      break;
  }
  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className={`ph ph-${meta.icon}`} style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ fontSize: 20, fontWeight: 600 }}>{meta.label} settings</div>
      </div>
      {fields}
    </div>
  );
}
