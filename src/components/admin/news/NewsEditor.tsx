'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Country } from '@prisma/client';
import { BLOCK_KINDS, newBlock, type Block } from '@/lib/blocks';
import { NEWS_CATEGORIES } from '@/lib/labels';
import { dateNo } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input, Select, Switch } from '@/components/ui/Field';
import { ImageCropField } from '@/components/ui/ImageCropField';
import { useToast } from '@/components/ui/Toast';
import { deleteStory, saveStory } from '@/app/(admin)/admin/news/actions';
import { BlockSettings, blockMeta, blockSummary } from './BlockSettings';
import { ConfirmDelete } from './ConfirmDelete';
import { StoryPreview } from './StoryPreview';
import { fromLocalInput, timeLabel, toLocalInput } from './format';
import type { CourseOption, GroupOption, SaveIntent, StoryData } from './types';
import './news.css';

const CARD = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 } as const;
const CARD_TITLE = { fontSize: 20, fontWeight: 600 } as const;
const COUNTRY_OPTIONS = [
  { value: 'Both', label: 'Both' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Norway', label: 'Norway' },
];
const countryPhrase = (c: Country) => (c === 'Both' ? 'Denmark and Norway' : c);

export function NewsEditor({ initial, groups, courses }: { initial: StoryData; groups: GroupOption[]; courses: CourseOption[] }) {
  const router = useRouter();
  const toast = useToast();
  const [d, setD] = useState(initial);
  const [sel, setSel] = useState<number | null>(initial.id ? null : 0);
  const [heroEdit, setHeroEdit] = useState(false);
  const [schedule, setSchedule] = useState(initial.status === 'SCHEDULED');
  const [when, setWhen] = useState(toLocalInput(initial.publishAt));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();

  const isNew = !initial.id;
  const published = initial.status === 'PUBLISHED';
  const scheduled = initial.status === 'SCHEDULED';

  const patch = (fields: Partial<StoryData>) => setD((s) => ({ ...s, ...fields }));
  const setBlocks = (fn: (b: Block[]) => Block[]) => setD((s) => ({ ...s, blocks: fn(s.blocks) }));
  const setBlock = (i: number, b: Block) => setBlocks((bs) => bs.map((x, j) => (j === i ? b : x)));
  const select = (i: number | null) => {
    setSel(i);
    if (i !== null) setHeroEdit(false);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= d.blocks.length) return;
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
    select(d.blocks.length);
  };

  function commit(intent: SaveIntent) {
    if (!d.title.trim()) {
      toast('Give the story a title', 'error');
      setHeroEdit(true);
      return;
    }
    start(async () => {
      const { title, lead, category, authorName, country, pinned, groupIds, hero, blocks } = d;
      const res = await saveStory({
        id: d.id, intent, title, lead, category, authorName, country, pinned, groupIds, hero, blocks,
        publishAt: intent === 'schedule' ? fromLocalInput(when) : null,
      });
      if (!res.ok) {
        toast(res.error, 'error');
        return;
      }
      toast(res.message);
      router.push('/admin/news');
      router.refresh();
    });
  }

  const primaryIntent: SaveIntent = schedule && !published ? 'schedule' : 'publish';
  const primaryLabel = primaryIntent === 'schedule' ? (scheduled ? 'Update schedule' : 'Schedule story') : published ? 'Update story' : 'Publish story';
  const statusLine = published
    ? 'Published · learners see changes when you click Update story'
    : scheduled && initial.publishAt
      ? `Scheduled · goes live ${dateNo(initial.publishAt)} at ${timeLabel(initial.publishAt)}`
      : isNew
        ? 'New draft · not saved yet'
        : 'Draft · not visible to learners';
  const statusDot = published ? 'var(--efkt-green, #2E8B57)' : 'var(--efkt-gold, #C9A227)';
  const groupNames = groups.filter((g) => d.groupIds.includes(g.id)).map((g) => g.name);
  const audienceLine = groupNames.length
    ? `Visible to ${groupNames.join(', ')} in ${countryPhrase(d.country)}.`
    : `No group selected — visible to everyone in ${countryPhrase(d.country)}.`;
  const metaDate = d.publishAt && (published || scheduled) ? dateNo(d.publishAt) : schedule && fromLocalInput(when) ? dateNo(fromLocalInput(when)) : dateNo(new Date());
  const selected = sel !== null && sel < d.blocks.length ? d.blocks[sel] : null;

  return (
    <div className="efkt-page" style={{ paddingTop: 40, gap: 40, paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <Link href="/admin/news" className="efkt-link">
            <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> All stories
          </Link>
          <h1 style={{ margin: '20px 0 0', fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>{isNew ? 'New story' : 'Edit story'}</h1>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusDot }} />
            {statusLine}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {published ? (
            <Button variant="tertiary" onClick={() => commit('draft')} disabled={pending}>Unpublish</Button>
          ) : (
            <Button variant="secondary" onClick={() => commit('draft')} disabled={pending}>Save draft</Button>
          )}
          <Button onClick={() => commit(primaryIntent)} disabled={pending}>{primaryLabel}</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <div style={CARD}>
            <div style={CARD_TITLE}>Story</div>
            <Input label="Title" placeholder="e.g. Ny leveringsfrist for videoprosjekter" value={d.title} onChange={(e) => patch({ title: e.target.value })} />
            <label className="efkt-field">
              <span className="efkt-field__label">Lead</span>
              <span className="efkt-field__box efkt-field__box--multi">
                <textarea className="efkt-field__input" rows={4} value={d.lead} onChange={(e) => patch({ lead: e.target.value })} />
              </span>
              <span className="efkt-field__hint">Shown on the dashboard card, above the story itself.</span>
            </label>
            <Select label="Category" options={NEWS_CATEGORIES} value={d.category} onChange={(e) => patch({ category: e.target.value })} />
            <Input label="Author" placeholder="Name shown under the title" value={d.authorName} onChange={(e) => patch({ authorName: e.target.value })} />
            <Select label="Country" options={COUNTRY_OPTIONS} value={d.country} onChange={(e) => patch({ country: e.target.value as Country })} />
            <Switch checked={d.pinned} onChange={() => patch({ pinned: !d.pinned })} label="Pin to the top of the dashboard" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Groups</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                {groups.map((g) => {
                  const on = d.groupIds.includes(g.id);
                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <Checkbox checked={on} label={g.name} onChange={() => patch({ groupIds: on ? d.groupIds.filter((x) => x !== g.id) : [...d.groupIds, g.id] })} />
                      <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{g.inScope} in scope</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{audienceLine}</div>
          </div>

          <div style={CARD}>
            <div style={CARD_TITLE}>Hero image</div>
            <ImageCropField value={d.hero} onChange={(hero) => patch({ hero })} height={220} placeholder="Slipp et bilde av en bolig her" hint="Shown behind the title on the dashboard card and at the top of the story. Drag to reposition." />
          </div>

          <div style={CARD}>
            <div style={CARD_TITLE}>Publishing</div>
            {published ? (
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
                Live since {initial.publishAt ? dateNo(initial.publishAt) : 'today'}. Changes go out when you click Update story; Unpublish takes it off the dashboard and keeps it as a draft.
              </div>
            ) : (
              <>
                <Switch checked={schedule} onChange={() => setSchedule(!schedule)} label="Schedule for later" />
                {schedule ? (
                  <Input label="Publish at" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} hint="The story goes live on the dashboard automatically at this time." />
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Publish story makes it visible straight away.</div>
                )}
              </>
            )}
          </div>

          <div style={CARD}>
            <div style={CARD_TITLE}>Add a block</div>
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
            <div style={CARD_TITLE}>Blocks</div>
            {d.blocks.length === 0 ? (
              <div style={{ padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>No blocks yet. Add one above.</div>
            ) : null}
            {d.blocks.map((b, i) => {
              const meta = blockMeta(b);
              return (
                <div key={b.id} className="nw-blockrow" aria-current={sel === i} onClick={() => select(i)}>
                  <i className={`ph ph-${meta.icon}`} style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{meta.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blockSummary(b, courses)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                    <button type="button" className="nw-mini" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}><i className="ph ph-arrow-up" style={{ fontSize: 16 }} /></button>
                    <button type="button" className="nw-mini" title="Move down" disabled={i === d.blocks.length - 1} onClick={() => move(i, 1)}><i className="ph ph-arrow-down" style={{ fontSize: 16 }} /></button>
                    <button type="button" className="nw-mini nw-mini--danger" title="Remove block" onClick={() => remove(i)}><i className="ph ph-trash" style={{ fontSize: 16 }} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {selected ? <BlockSettings block={selected} courses={courses} onChange={(b) => setBlock(sel!, b)} /> : null}

          {!isNew ? (
            <div>
              <Button variant="danger" iconLeft="trash" onClick={() => setConfirmDelete(true)} disabled={pending}>Delete story</Button>
            </div>
          ) : null}
        </div>

        <StoryPreview
          story={d}
          meta={`${metaDate} · ${d.authorName || 'Ukjent forfatter'}`}
          courses={courses}
          selected={sel}
          heroEdit={heroEdit}
          onHeroEdit={(on) => {
            setHeroEdit(on);
            if (on) setSel(null);
          }}
          onField={patch}
          onSelect={select}
          onBlock={setBlock}
          onMove={move}
          onRemove={remove}
        />
      </div>

      <ConfirmDelete
        open={confirmDelete}
        title={d.title}
        busy={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() =>
          start(async () => {
            const res = await deleteStory(initial.id!);
            setConfirmDelete(false);
            if (!res.ok) return void toast(res.error, 'error');
            toast('Story deleted');
            router.push('/admin/news');
            router.refresh();
          })
        }
      />
    </div>
  );
}
