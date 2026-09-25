'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, useTransition } from 'react';
import { Button, ButtonLink, Input, Select, Switch, Textarea, useToast } from '@/components/ui';
import { BlockView, type LinkedCourse } from '@/components/blocks/BlockRenderer';
import { BLOCK_KINDS, imageSrc, newBlock, type Block, type BlockKind } from '@/lib/blocks';
import { uploadImage } from '@/app/actions/upload';
import { saveModuleBlocks } from '@/app/(admin)/admin/courses/actions';
import './courses.css';

type CourseOption = { id: string; title: string; description: string };

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 } as const;

function meta(kind: BlockKind) {
  return BLOCK_KINDS.find((k) => k.kind === kind) ?? { kind, label: kind, icon: 'square' };
}

function summary(b: Block, courses: CourseOption[]): string {
  switch (b.kind) {
    case 'heading': return b.text;
    case 'paragraph': return b.text.slice(0, 60);
    case 'image': return b.caption || 'Uten bildetekst';
    case 'imagetext': return b.text.slice(0, 50);
    case 'quote': return '«' + b.text.slice(0, 40) + '»';
    case 'list': return b.items.split('\n').filter(Boolean).length + ' punkter';
    case 'button': return b.label + ' → ' + b.url;
    case 'course': return courses.find((c) => c.id === b.courseId)?.title || 'Ingen kurs valgt';
    default: return '—';
  }
}

/** Block editor for a built module: palette, ordered block list, field editor and live preview. */
export function BlockEditor({
  moduleId,
  moduleTitle,
  course,
  initial,
  courses,
}: {
  moduleId: string;
  moduleTitle: string;
  course: { id: string; title: string };
  initial: Block[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [blocks, setBlocks] = useState<Block[]>(initial);
  const [sel, setSel] = useState<number | null>(initial.length ? 0 : null);
  const back = `/admin/courses/${course.id}`;

  const linked = useMemo(
    () => Object.fromEntries(courses.map((c): [string, LinkedCourse] => [c.id, { ...c, href: null }])),
    [courses],
  );

  const update = (i: number, patch: Partial<Block>) => setBlocks((bs) => bs.map((b, j) => (j === i ? ({ ...b, ...patch } as Block) : b)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = blocks.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
    setSel(j);
  };

  function save() {
    start(async () => {
      const res = await saveModuleBlocks(moduleId, blocks);
      if (!res.ok) return toast(res.error, 'error');
      toast('Innholdet er lagret');
      router.push(back);
    });
  }

  const current = sel !== null && sel < blocks.length ? blocks[sel] : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--efkt-white)', zIndex: 56, overflowY: 'auto' }}>
      <div style={{ padding: '40px 48px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <Link href={back} className="efkt-link">
            <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> Tilbake til {course.title}
          </Link>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', margin: '20px 0 12px' }}>Modulinnhold · {moduleTitle}</div>
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
            Innholds<span style={{ fontWeight: 800 }}>editor</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ButtonLink variant="secondary" href={back}>Avbryt</ButtonLink>
          <Button onClick={save} disabled={pending}>Lagre innhold</Button>
        </div>
      </div>

      <div style={{ padding: '40px 48px 64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <div style={card}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Legg til blokk</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
              {BLOCK_KINDS.map((k) => (
                <button
                  key={k.kind}
                  type="button"
                  className="ac-palette"
                  onClick={() => {
                    setBlocks((bs) => [...bs, newBlock(k.kind)]);
                    setSel(blocks.length);
                  }}
                >
                  <i className={`ph ph-${k.icon}`} style={{ fontSize: 18, color: 'var(--efkt-coral)' }} aria-hidden />
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...card, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Blokker</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{blocks.length} {blocks.length === 1 ? 'blokk' : 'blokker'}</div>
            </div>
            {blocks.length === 0 ? (
              <div style={{ padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Ingen blokker ennå. Legg til en over.</div>
            ) : null}
            {blocks.map((b, i) => {
              const m = meta(b.kind);
              return (
                <div key={b.id} role="option" aria-selected={sel === i} tabIndex={0} className="ac-selrow" onClick={() => setSel(i)} onKeyDown={(e) => e.key === 'Enter' && setSel(i)}>
                  <i className={`ph ph-${m.icon}`} style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary(b, courses)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="ac-mini" title="Flytt opp" aria-label="Flytt opp" disabled={i === 0} onClick={() => move(i, -1)}><i className="ph ph-arrow-up" aria-hidden /></button>
                    <button type="button" className="ac-mini" title="Flytt ned" aria-label="Flytt ned" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}><i className="ph ph-arrow-down" aria-hidden /></button>
                    <button
                      type="button"
                      className="ac-mini ac-mini--danger"
                      title="Slett"
                      aria-label="Slett"
                      onClick={() => {
                        setBlocks((bs) => bs.filter((_, j) => j !== i));
                        setSel(null);
                      }}
                    >
                      <i className="ph ph-trash" aria-hidden />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {current && sel !== null ? <BlockFields key={current.id} block={current} courses={courses} onChange={(patch) => update(sel, patch)} /> : null}
        </div>

        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <i className="ph ph-eye" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Slik ser modulen ut for den lærende</div>
          </div>
          <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {blocks.map((b, i) => (
              <div
                key={b.id}
                onClick={() => setSel(i)}
                style={{ cursor: 'pointer', borderRadius: 12, outline: sel === i ? '2px dashed var(--efkt-coral)' : 'none', outlineOffset: 8 }}
              >
                {(b.kind === 'image' || b.kind === 'imagetext') && !imageSrc(b) ? <ImagePlaceholder block={b} /> : <BlockView block={b} courses={linked} />}
                {b.kind === 'course' && !b.courseId ? <Muted>Ingen kurs valgt</Muted> : null}
              </div>
            ))}
            {blocks.length === 0 ? <Muted>Forhåndsvisningen fylles når du legger til blokker.</Muted> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{children}</div>;
}

/** Image / image+text block before an image is uploaded. */
function ImagePlaceholder({ block }: { block: Extract<Block, { kind: 'image' | 'imagetext' }> }) {
  const box = (
    <div style={{ flex: 1, minWidth: 200, height: block.kind === 'image' ? 240 : 200, borderRadius: 20, border: '1px dashed var(--border-dashed)', background: 'var(--efkt-offwhite)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
      <i className="ph ph-image" style={{ fontSize: 28 }} aria-hidden />
      {block.hint || 'Slipp et bilde'}
    </div>
  );
  if (block.kind === 'image') return box;
  return (
    <div style={{ display: 'flex', flexDirection: block.side === 'right' ? 'row-reverse' : 'row', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      {box}
      <div style={{ flex: 1, minWidth: 200, fontSize: 16, fontWeight: 300, lineHeight: 1.6, textWrap: 'pretty', whiteSpace: 'pre-line' }}>{block.text}</div>
    </div>
  );
}

/** Settings of the selected block. */
function BlockFields({ block: b, courses, onChange }: { block: Block; courses: CourseOption[]; onChange: (patch: Partial<Block>) => void }) {
  const m = meta(b.kind);
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <i className={`ph ph-${m.icon}`} style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ fontSize: 20, fontWeight: 600 }}>{m.label}</div>
      </div>
      {b.kind === 'heading' ? (
        <>
          <Input label="Overskrift" value={b.text} onChange={(e) => onChange({ text: e.target.value })} />
          <Input label="Ordet i fet" value={b.fat ?? ''} onChange={(e) => onChange({ fat: e.target.value })} hint="EFKT-overskrifter setter ett ord tungt og resten lett." />
        </>
      ) : null}
      {b.kind === 'paragraph' ? <Textarea label="Tekst" rows={6} value={b.text} onChange={(e) => onChange({ text: e.target.value })} /> : null}
      {b.kind === 'image' ? (
        <>
          <ImageUpload imageId={b.imageId} onChange={(imageId) => onChange({ imageId })} />
          <Input label="Plassholdertekst" value={b.hint ?? ''} onChange={(e) => onChange({ hint: e.target.value })} hint="Vises til bildet er lastet opp." />
          <Input label="Bildetekst" value={b.caption ?? ''} onChange={(e) => onChange({ caption: e.target.value })} />
        </>
      ) : null}
      {b.kind === 'imagetext' ? (
        <>
          <Textarea label="Tekst" value={b.text} onChange={(e) => onChange({ text: e.target.value })} />
          <ImageUpload imageId={b.imageId} onChange={(imageId) => onChange({ imageId })} />
          <Input label="Plassholdertekst" value={b.hint ?? ''} onChange={(e) => onChange({ hint: e.target.value })} />
          <Switch
            checked={b.side !== 'right'}
            onChange={() => onChange({ side: b.side === 'right' ? 'left' : 'right' })}
            label={b.side === 'right' ? 'Bilde til høyre' : 'Bilde til venstre'}
          />
        </>
      ) : null}
      {b.kind === 'quote' ? (
        <>
          <Textarea label="Sitat" value={b.text} onChange={(e) => onChange({ text: e.target.value })} />
          <Input label="Hvem sa det" value={b.who ?? ''} onChange={(e) => onChange({ who: e.target.value })} />
        </>
      ) : null}
      {b.kind === 'list' ? <Textarea label="Punkter" rows={6} value={b.items} onChange={(e) => onChange({ items: e.target.value })} hint="Ett punkt per linje. Maks fem." /> : null}
      {b.kind === 'button' ? (
        <>
          <Input label="Knappetekst" value={b.label} onChange={(e) => onChange({ label: e.target.value })} />
          <Input label="Lenke" icon="link" value={b.url} onChange={(e) => onChange({ url: e.target.value })} />
        </>
      ) : null}
      {b.kind === 'course' ? (
        <Select
          label="Kurs"
          options={[{ value: '', label: 'Velg kurs' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]}
          value={b.courseId}
          onChange={(e) => onChange({ courseId: e.target.value })}
        />
      ) : null}
      {b.kind === 'divider' ? <Muted>En skillelinje har ingen innstillinger.</Muted> : null}
    </div>
  );
}

function ImageUpload({ imageId, onChange }: { imageId?: string; onChange: (id: string | undefined) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('file', file);
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.ok) onChange(res.id);
    else toast(res.error, 'error');
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <button type="button" className="efkt-btn efkt-btn--secondary efkt-btn--sm" disabled={busy} onClick={() => input.current?.click()}>
        <i className="ph ph-upload-simple" style={{ fontSize: 16 }} aria-hidden /> {busy ? 'Laster opp…' : imageId ? 'Bytt bilde' : 'Last opp bilde'}
      </button>
      {imageId ? <button type="button" className="efkt-link" onClick={() => onChange(undefined)}>Fjern bildet</button> : null}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </div>
  );
}
