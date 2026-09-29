'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Button, ButtonLink, Input, useToast } from '@/components/ui';
import { BLOCK_KINDS, newBlock, type Block } from '@/lib/blocks';
import { saveModuleBlocks } from '@/app/(admin)/admin/courses/actions';
import { BlockCanvas } from '@/components/admin/news/BlockCanvas';
import { BlockSettings, blockMeta, blockSummary } from '@/components/admin/news/BlockSettings';
import type { CourseOption } from '@/components/admin/news/types';
import '@/components/admin/news/news.css';
import './courses.css';

const CARD = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 } as const;
const CARD_TITLE = { fontSize: 20, fontWeight: 600 } as const;

/**
 * Module content editor — the same builder as news stories: add, reorder and delete blocks
 * in the left panel, and edit them in place in the live preview (laid out like the player).
 */
export function BlockEditor({
  moduleId,
  moduleTitle,
  moduleNumber,
  course,
  initial,
  courses,
}: {
  moduleId: string;
  moduleTitle: string;
  moduleNumber: number;
  course: { id: string; title: string; modules: number };
  initial: Block[];
  courses: CourseOption[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState(moduleTitle);
  const [blocks, setBlocksState] = useState<Block[]>(initial);
  const [sel, setSel] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const back = `/admin/courses/${course.id}`;

  const setBlocks = (fn: (b: Block[]) => Block[]) => {
    setBlocksState(fn);
    setDirty(true);
  };
  const setBlock = (i: number, b: Block) => setBlocks((bs) => bs.map((x, j) => (j === i ? b : x)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    setBlocks((bs) => {
      const arr = bs.slice();
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
    setSel(j);
  };
  const remove = (i: number) => {
    setBlocks((bs) => bs.filter((_, j) => j !== i));
    setSel(null);
  };
  const add = (kind: Block['kind']) => {
    setBlocks((bs) => [...bs, newBlock(kind)]);
    setSel(blocks.length);
  };

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function save(close: boolean) {
    if (!title.trim()) return toast('Gi modulen en tittel', 'error');
    start(async () => {
      const res = await saveModuleBlocks(moduleId, blocks, title);
      if (!res.ok) return void toast(res.error, 'error');
      setDirty(false);
      toast('Innholdet er lagret');
      if (close) router.push(back);
      else router.refresh();
    });
  }

  const selected = sel !== null && sel < blocks.length ? blocks[sel] : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--efkt-white)', zIndex: 56, overflowY: 'auto' }}>
      <div className="efkt-page" style={{ paddingTop: 40, gap: 40, paddingBottom: 64, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <Link href={back} className="efkt-link">
              <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> Tilbake til {course.title}
            </Link>
            <h1 style={{ margin: '20px 0 0', fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
              Bygg <span style={{ fontWeight: 800 }}>modulen</span>
            </h1>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: dirty ? 'var(--efkt-gold)' : 'var(--efkt-green)' }} />
              {dirty ? 'Ulagrede endringer' : 'Alt er lagret'} · Modul {moduleNumber} av {course.modules}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <ButtonLink variant="secondary" href={back}>Avbryt</ButtonLink>
            <Button variant="secondary" onClick={() => save(false)} disabled={pending || !dirty}>Lagre</Button>
            <Button onClick={() => save(true)} disabled={pending}>Lagre og lukk</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
            <div style={CARD}>
              <div style={CARD_TITLE}>Modul</div>
              <Input
                label="Modultittel"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                hint="Vises i kursoversikten og øverst i spilleren."
              />
            </div>

            <div style={CARD}>
              <div style={CARD_TITLE}>Legg til blokk</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
                {BLOCK_KINDS.map((k) => (
                  <button key={k.kind} type="button" className="nw-palette" onClick={() => add(k.kind)}>
                    <i className={`ph ph-${k.icon}`} style={{ fontSize: 18, color: 'var(--efkt-coral)' }} aria-hidden />
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...CARD, gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
                <div style={CARD_TITLE}>Blokker</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{blocks.length} {blocks.length === 1 ? 'blokk' : 'blokker'}</div>
              </div>
              {blocks.length === 0 ? (
                <div style={{ padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Ingen blokker ennå. Legg til en over.</div>
              ) : null}
              {blocks.map((b, i) => {
                const meta = blockMeta(b);
                return (
                  <div key={b.id} className="nw-blockrow" aria-current={sel === i} onClick={() => setSel(i)}>
                    <i className={`ph ph-${meta.icon}`} style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{meta.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blockSummary(b, courses)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="nw-mini" title="Flytt opp" disabled={i === 0} onClick={() => move(i, -1)}><i className="ph ph-arrow-up" style={{ fontSize: 16 }} /></button>
                      <button type="button" className="nw-mini" title="Flytt ned" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}><i className="ph ph-arrow-down" style={{ fontSize: 16 }} /></button>
                      <button type="button" className="nw-mini nw-mini--danger" title="Slett blokk" onClick={() => remove(i)}><i className="ph ph-trash" style={{ fontSize: 16 }} /></button>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected ? <BlockSettings block={selected} courses={courses} onChange={(b) => setBlock(sel!, b)} /> : null}
          </div>

          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <i className="ph ph-eye" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Live preview — klikk på en blokk for å redigere den direkte</div>
            </div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--surface-dark)', padding: '0 12px 12px' }}>
              {/* Same frame as the learner player: title bar on Deep Navy, content on white. */}
              <div style={{ padding: '16px 12px' }}>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.65)' }}>{course.title} · Modul {moduleNumber} av {course.modules}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--efkt-white)' }}>{title || 'Uten tittel'}</div>
              </div>
              <div style={{ background: 'var(--efkt-white)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>
                <BlockCanvas blocks={blocks} courses={courses} selected={sel} onSelect={setSel} onBlock={setBlock} onMove={move} onRemove={remove} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
