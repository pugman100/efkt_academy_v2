'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { NewsStatus } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';
import { Photo } from '@/components/ui/Photo';
import { useToast } from '@/components/ui/Toast';
import { NEWS_STATUS_LABEL, NEWS_STATUS_TONE } from '@/lib/labels';
import { deleteStory, duplicateStory, togglePin } from '@/app/(admin)/admin/news/actions';
import { ConfirmDelete } from './ConfirmDelete';
import './news.css';

export type NewsRow = {
  id: string;
  title: string;
  lead: string;
  category: string;
  blockLabel: string;
  country: string;
  audience: string;
  status: NewsStatus;
  date: string;
  pinned: boolean;
  hero: { src: string; x: number; y: number; scale: number } | null;
};

type Filter = 'All' | NewsStatus;
const FILTERS: Filter[] = ['All', 'PUBLISHED', 'SCHEDULED', 'DRAFT'];
const COLS = 'minmax(280px,2.2fr) minmax(130px,1fr) minmax(170px,1.2fr) 140px 180px';
const MIN_W = 1060;

export function NewsList({ rows }: { rows: NewsRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>('All');
  const [confirm, setConfirm] = useState<NewsRow | null>(null);
  const [pending, start] = useTransition();

  const count = (f: Filter) => (f === 'All' ? rows.length : rows.filter((r) => r.status === f).length);
  const shown = rows.filter((r) => filter === 'All' || r.status === filter);
  const stats = [
    { label: 'Published', value: count('PUBLISHED'), sub: 'live on the dashboard' },
    { label: 'Scheduled', value: count('SCHEDULED'), sub: 'go live automatically' },
    { label: 'Drafts', value: count('DRAFT'), sub: 'not yet visible' },
    { label: 'Pinned', value: rows.filter((r) => r.pinned).length, sub: 'featured at the top' },
  ];

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) toast(done);
      else toast(res.error ?? 'Something went wrong', 'error');
      router.refresh();
    });

  return (
    <>
      <div style={{ paddingTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.045em' }}>{s.value}</div>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 8 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ paddingTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button key={f} type="button" className="nw-filter" aria-pressed={filter === f} onClick={() => setFilter(f)}>
            {f === 'All' ? 'All' : NEWS_STATUS_LABEL[f]} ({count(f)})
          </button>
        ))}
      </div>

      <div style={{ paddingTop: 24 }}>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 24, padding: '20px 32px', borderBottom: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', minWidth: MIN_W }}>
            <div>Story</div>
            <div>Category</div>
            <div>Audience</div>
            <div>Status</div>
            <div style={{ textAlign: 'right' }}>Actions</div>
          </div>
          {shown.map((n) => (
            <div key={n.id} className="nw-row" style={{ display: 'grid', gridTemplateColumns: COLS, gap: 24, alignItems: 'center', padding: '24px 32px', borderBottom: '1px solid var(--border-default)', minWidth: MIN_W }}>
              <div style={{ minWidth: 0, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <Link href={`/admin/news/${n.id}`} aria-label={`Edit ${n.title}`} tabIndex={-1}>
                  <Photo src={n.hero?.src} x={n.hero?.x} y={n.hero?.y} scale={n.hero?.scale} placeholderIcon="newspaper" style={{ width: 64, minWidth: 64, height: 48, borderRadius: 10 }} />
                </Link>
                <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {n.pinned ? <i className="ph-bold ph-push-pin" style={{ fontSize: 14, color: 'var(--efkt-coral)' }} aria-label="Pinned" /> : null}
                  <Link href={`/admin/news/${n.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)', textDecoration: 'none' }}>{n.title}</Link>
                </div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4, textWrap: 'pretty' }}>{n.lead}</div>
                </div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{n.category}</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4 }}>{n.blockLabel}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{n.country}</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4, textWrap: 'pretty' }}>{n.audience}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <Badge tone={NEWS_STATUS_TONE[n.status]}>{NEWS_STATUS_LABEL[n.status]}</Badge>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 8 }}>{n.date}</div>
              </div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                <button type="button" className="nw-act" title={n.pinned ? 'Unpin' : 'Pin to top'} aria-pressed={n.pinned} disabled={pending}
                  onClick={() => run(() => togglePin(n.id), n.pinned ? 'Unpinned' : 'Pinned to the top of the dashboard')}>
                  <i className={n.pinned ? 'ph-fill ph-push-pin' : 'ph ph-push-pin'} style={{ fontSize: 18 }} />
                </button>
                <Link href={`/admin/news/${n.id}`} className="nw-act" title="Edit story"><i className="ph ph-pencil-simple" style={{ fontSize: 18 }} /></Link>
                <button type="button" className="nw-act" title="Duplicate" disabled={pending} onClick={() => run(() => duplicateStory(n.id), 'Story duplicated as a draft')}>
                  <i className="ph ph-copy" style={{ fontSize: 18 }} />
                </button>
                <button type="button" className="nw-act nw-act--danger" title="Delete" disabled={pending} onClick={() => setConfirm(n)}>
                  <i className="ph ph-trash" style={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
          ))}
          {shown.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>No stories match that filter.</div>
          ) : null}
        </div>
      </div>

      <ConfirmDelete
        open={!!confirm}
        title={confirm?.title ?? ''}
        busy={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const id = confirm!.id;
          setConfirm(null);
          run(() => deleteStory(id), 'Story deleted');
        }}
      />
    </>
  );
}
