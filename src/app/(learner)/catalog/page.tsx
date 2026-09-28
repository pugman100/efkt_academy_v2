import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { reachableWhere } from '@/lib/access';
import { Photo } from '@/components/ui/Photo';
import { EnrolButton } from '@/components/learner/EnrolButton';
import { courseThumb, primaryCategory } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Kurskatalog' };

export default async function Catalog() {
  const user = await requireUser();
  // Self-enrol courses the learner doesn't already have by any route.
  const courses = await db.course.findMany({
    where: {
      status: 'PUBLISHED',
      selfEnrol: true,
      country: { in: [user.country, 'Both'] },
      NOT: reachableWhere(user),
    },
    include: { categories: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <>
      <section className="lr-x" style={{ paddingTop: 64 }}>
        <h1 className="lr-page-title" style={{ margin: '0 0 12px', fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
          Kurs<span style={{ fontWeight: 800 }}>katalog</span>
        </h1>
        <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 640, textWrap: 'pretty' }}>
          Åpent for alle på teamet ditt. Meld deg på når du har tid.
        </div>
      </section>
      <section className="lr-x" style={{ paddingTop: 32, paddingBottom: 96, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,360px),1fr))', gap: 24, alignItems: 'stretch' }}>
        {courses.map((c) => (
          <div key={c.id} style={{ height: '100%', borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-white)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: 200 }}>
              <Photo {...courseThumb(c)} style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0) 40%, rgba(12,14,57,0.7) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{primaryCategory(c.categories)?.name}</div>
                <div style={{ fontSize: 24, lineHeight: 1.15, letterSpacing: '-0.03em', fontWeight: 800, color: 'var(--efkt-white)' }}>{c.title}</div>
              </div>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{c.description}</div>
              <div style={{ marginTop: 'auto' }}>
                <EnrolButton courseId={c.id} />
              </div>
            </div>
          </div>
        ))}
        {!courses.length ? (
          <div style={{ gridColumn: '1 / -1', padding: 32, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
            <i className="ph ph-check-circle" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              Du er allerede med på alle kursene i katalogen. Nye kurs dukker opp her når de blir åpnet for påmelding.
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
