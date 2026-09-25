import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { imageSrc, parseBlocks } from '@/lib/blocks';
import { BlockRenderer } from '@/components/blocks/BlockRenderer';
import { Photo } from '@/components/ui/Photo';
import { NewsCard, newsDate, newsPhoto, NEWS_SELECT } from '@/components/learner/News';
import { linkedCourses, NEWS_ORDER, splitLast, visibleNewsWhere } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Nyheter' };

export default async function NewsReader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const where = visibleNewsWhere(user);
  const story = await db.newsStory.findFirst({ where: { ...where, id }, select: { ...NEWS_SELECT, blocks: true } });
  if (!story) notFound();
  const more = await db.newsStory.findMany({ where: { ...where, id: { not: id } }, orderBy: NEWS_ORDER, take: 6, select: NEWS_SELECT });
  // Image blocks without an image are left out of the reader.
  const blocks = parseBlocks(story.blocks).filter((b) => !((b.kind === 'image' || b.kind === 'imagetext') && !imageSrc(b)));
  const t = splitLast(story.title);

  return (
    <>
      <section style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <Photo {...newsPhoto(story)} style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0.55) 0%, rgba(12,14,57,0.15) 40%, rgba(12,14,57,0.85) 100%)' }} />
        <div className="lr-x" style={{ position: 'relative', height: '100%', paddingTop: 32, paddingBottom: 48, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <Link href="/" className="lr-back">
            <i className="ph ph-arrow-left" style={{ fontSize: 14 }} aria-hidden /> Dashboard
          </Link>
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 900 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{story.category}</div>
            <h1 className="lr-page-title" style={{ margin: 0, fontSize: 54, lineHeight: 1.05, letterSpacing: '-0.06em', fontWeight: 300, color: 'var(--efkt-white)', textWrap: 'pretty' }}>
              {t.thin} <span style={{ fontWeight: 800 }}>{t.fat}</span>
            </h1>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.9)' }}>{newsDate(story)}{story.authorName ? ` · ${story.authorName}` : ''}</div>
          </div>
        </div>
      </section>

      <section className="lr-x" style={{ paddingTop: 64, paddingBottom: 96, display: 'flex', justifyContent: 'center' }}>
        <article style={{ width: '100%', maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 28 }}>
          {story.lead ? <div style={{ fontSize: 20, fontWeight: 300, lineHeight: 1.5, color: 'var(--text-body)', textWrap: 'pretty' }}>{story.lead}</div> : null}
          <div style={{ height: 1, background: 'var(--border-default)' }} />
          <BlockRenderer blocks={blocks} courses={await linkedCourses(user, blocks)} />
        </article>
      </section>

      {more.length ? (
        <section className="lr-x" style={{ paddingTop: 64, paddingBottom: 96, background: 'var(--efkt-offwhite)' }}>
          <h2 style={{ margin: '0 0 32px', fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.045em', fontWeight: 300 }}>
            Flere <span style={{ fontWeight: 800 }}>nyheter</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,360px),1fr))', gap: 24, alignItems: 'stretch' }}>
            {more.map((n) => <NewsCard key={n.id} n={n} />)}
          </div>
        </section>
      ) : null}
    </>
  );
}
