import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { COUNTRY_SHORT, scopeWhere } from '@/lib/labels';
import { fileUrl, parseBlocks } from '@/lib/blocks';
import { dateNo } from '@/lib/format';
import { ButtonLink } from '@/components/ui/Button';
import { NewsList, type NewsRow } from '@/components/admin/news/NewsList';
import { DashboardBanner } from '@/components/admin/news/DashboardBanner';
import type { Crop } from '@/components/ui/ImageCropField';
import { publishDueStories } from '@/components/admin/news/publishDue';
import { timeLabel } from '@/components/admin/news/format';

export const metadata: Metadata = { title: 'News' };

export default async function NewsPage() {
  await requireAdmin();
  const scope = await getScope();
  // Keep statuses honest even if the cron has not run yet.
  await publishDueStories();

  const [stories, banner] = await Promise.all([
    db.newsStory.findMany({
      where: scopeWhere(scope),
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      include: { groups: { select: { name: true } } },
    }),
    db.setting.findUnique({ where: { key: 'dashboardBanner' } }),
  ]);

  const rows: NewsRow[] = stories.map((s) => {
    const blocks = parseBlocks(s.blocks).length;
    return {
      id: s.id,
      title: s.title,
      lead: s.lead,
      category: s.category,
      blockLabel: blocks + (blocks === 1 ? ' block' : ' blocks'),
      country: COUNTRY_SHORT[s.country],
      audience: s.groups.length ? s.groups.map((g) => g.name).join(' · ') : 'Everyone',
      status: s.status,
      date:
        s.status === 'SCHEDULED' && s.publishAt
          ? `${dateNo(s.publishAt)} · ${timeLabel(s.publishAt)}`
          : dateNo(s.status === 'PUBLISHED' ? s.publishAt ?? s.createdAt : s.createdAt),
      pinned: s.pinned,
      hero: s.heroId ? { src: fileUrl(s.heroId)!, x: s.heroX, y: s.heroY, scale: s.heroScale } : null,
    };
  });

  const bannerCrop = (banner?.value as Crop | undefined) ?? { imageId: null, x: 50, y: 50, scale: 1 };

  return (
    <div className="efkt-page" style={{ gap: 0, paddingBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>Dashboard · {scopeLine(scope)}</div>
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
            News <span style={{ fontWeight: 800 }}>feed</span>
          </h1>
        </div>
        <ButtonLink href="/admin/news/new" iconRight="plus">New story</ButtonLink>
      </div>

      <DashboardBanner initial={bannerCrop} />

      <NewsList rows={rows} />
    </div>
  );
}
