import Link from 'next/link';
import { Photo } from '@/components/ui/Photo';
import { fileUrl } from '@/lib/blocks';
import { dateNo } from '@/lib/format';

export type NewsItem = {
  id: string;
  title: string;
  lead: string;
  category: string;
  authorName: string;
  pinned: boolean;
  heroId: string | null;
  heroX: number;
  heroY: number;
  heroScale: number;
  publishAt: Date | null;
  createdAt: Date;
};

export const NEWS_SELECT = {
  id: true, title: true, lead: true, category: true, authorName: true, pinned: true,
  heroId: true, heroX: true, heroY: true, heroScale: true, publishAt: true, createdAt: true,
} as const;

export function newsPhoto(n: NewsItem) {
  return { src: fileUrl(n.heroId), x: n.heroX, y: n.heroY, scale: n.heroScale };
}
export const newsDate = (n: NewsItem) => dateNo(n.publishAt ?? n.createdAt);

export function FeaturedNews({ n }: { n: NewsItem }) {
  return (
    <Link href={`/news/${n.id}`} className="lr-lift" style={{ height: '100%', position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-offwhite)', minHeight: 380, display: 'block' }}>
      <Photo {...newsPhoto(n)} style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0) 25%, rgba(12,14,57,0.85) 100%)' }} />
      <div style={{ position: 'relative', height: '100%', minHeight: 380, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 16 }}>
        <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 25, background: 'var(--efkt-coral)', fontSize: 14, fontWeight: 600, color: 'var(--efkt-white)' }}>
          {n.pinned ? <i className="ph-bold ph-push-pin" style={{ fontSize: 12 }} aria-hidden /> : null}
          {n.category}
        </span>
        <div style={{ fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.04em', fontWeight: 800, color: 'var(--efkt-white)', textWrap: 'pretty' }}>{n.title}</div>
        <div style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.9)', maxWidth: 520, textWrap: 'pretty' }}>{n.lead}</div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.75)' }}>{newsDate(n)}{n.authorName ? ` · ${n.authorName}` : ''}</div>
      </div>
    </Link>
  );
}

/**
 * Secondary story in "Siste nytt". With a hero photo it is shown the same way as the
 * featured story: the whole photo, a Deep Navy scrim and white text (readable on any
 * photo, light or dark). Without a photo it is a plain white card with navy text.
 */
export function NewsRow({ n }: { n: NewsItem }) {
  const meta = `${newsDate(n)}${n.authorName ? ` · ${n.authorName}` : ''}`;
  if (n.heroId) {
    return (
      <Link href={`/news/${n.id}`} className="lr-lift" style={{ flex: 1, position: 'relative', minHeight: 200, borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-offwhite)', display: 'block' }}>
        <Photo {...newsPhoto(n)} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0.15) 0%, rgba(12,14,57,0.85) 100%)' }} />
        <span style={{ position: 'relative', height: '100%', minHeight: 200, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
          <span style={{ alignSelf: 'flex-start', padding: '6px 14px', borderRadius: 25, background: 'var(--efkt-coral)', fontSize: 14, fontWeight: 600, color: 'var(--efkt-white)' }}>{n.category}</span>
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--efkt-white)', textWrap: 'pretty' }}>{n.title}</span>
          <span style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.9)', textWrap: 'pretty' }}>{n.lead}</span>
          <span style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.75)' }}>{meta}</span>
        </span>
      </Link>
    );
  }
  return (
    <Link href={`/news/${n.id}`} className="lr-soft" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: 24, border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)' }}>{n.category}</span>
      <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-body)', textWrap: 'pretty' }}>{n.title}</span>
      <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{n.lead}</span>
      <span style={{ marginTop: 'auto', fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{meta}</span>
    </Link>
  );
}

export function NewsCard({ n }: { n: NewsItem }) {
  return (
    <Link href={`/news/${n.id}`} className="lr-lift" style={{ height: '100%', border: '1px solid var(--border-default)', borderRadius: 20, overflow: 'hidden', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column' }}>
      <Photo {...newsPhoto(n)} style={{ height: 180 }} />
      <span style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)' }}>{n.category}</span>
        <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-body)', textWrap: 'pretty' }}>{n.title}</span>
        <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{newsDate(n)}</span>
      </span>
    </Link>
  );
}
