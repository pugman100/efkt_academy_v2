/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ContinueTile, CourseTile, type TileData } from '@/components/learner/CourseTile';
import { FeaturedNews, NewsRow, NEWS_SELECT } from '@/components/learner/News';
import { courseThumb, dashboardSettings, myCourses, NEWS_ORDER, visibleNewsWhere } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Photographer Dashboard' };

const H2 = { margin: 0, fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.045em', fontWeight: 300 } as const;
const CARD = { height: '100%', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 } as const;
const GRID = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,360px),1fr))', gap: 24, alignItems: 'stretch' } as const;

export default async function Dashboard() {
  const user = await requireUser();
  const [mine, news, settings, regions] = await Promise.all([
    myCourses(user),
    db.newsStory.findMany({ where: visibleNewsWhere(user), orderBy: NEWS_ORDER, take: 4, select: NEWS_SELECT }),
    dashboardSettings(),
    db.region.findMany({ where: { country: user.country }, orderBy: { order: 'asc' } }),
  ]);

  const tile = (m: (typeof mine)[number]): TileData => ({
    href: `/courses/${m.course.id}`,
    title: m.course.title,
    description: m.course.description,
    category: m.category?.name ?? '',
    photo: courseThumb(m.course),
    pct: m.progress.pct,
    passed: m.progress.passed,
    total: m.progress.total,
  });

  const tracked = mine.filter((m) => !m.course.reference);
  const refs = mine.filter((m) => m.course.reference);
  const current = tracked.filter((m) => m.progress.pct > 0 && m.progress.pct < 100);
  const doneCount = tracked.filter((m) => m.progress.pct === 100).length;
  const waiting = tracked.length - current.length - doneCount;

  const heroLine = current.length
    ? `Du har ${current.length} kurs i gang og ${waiting} som venter på å bli startet.`
    : 'Alt du er tildelt er oppdatert.';

  // Sections by (primary) category, in category order.
  const sections = new Map<string, { name: string; icon: string; desc: string; order: number; items: typeof tracked }>();
  for (const m of tracked) {
    const key = m.category?.id ?? '_';
    if (!sections.has(key))
      sections.set(key, {
        name: m.category?.name ?? 'Andre kurs',
        icon: m.category?.icon ?? 'folder',
        desc: m.category?.description ?? '',
        order: m.category?.order ?? 999,
        items: [],
      });
    sections.get(key)!.items.push(m);
  }
  const sectionList = [...sections.values()].sort((a, b) => a.order - b.order);

  const featured = news[0];
  const rest = news.slice(1);
  const dial = user.country === 'Denmark' ? '+45' : '+47';
  const first = user.name.split(' ')[0];

  return (
    <>
      <section style={{ position: 'relative', minHeight: 520, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <img src="/assets/photo-hero.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0.45) 0%, rgba(12,14,57,0.42) 30%, rgba(12,14,57,0.78) 62%, rgba(12,14,57,0.92) 100%)' }} />
        <div className="lr-pad-hero" style={{ position: 'relative', flex: 1, padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 16, maxWidth: 760 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-white)' }}>Photographer Dashboard</div>
          <h1 className="lr-hero-title" style={{ margin: 0, fontSize: 70, lineHeight: 1, letterSpacing: '-0.065em', fontWeight: 300, color: 'var(--efkt-white)' }}>
            Hei, <span style={{ fontWeight: 800 }}>{first}</span>
          </h1>
          <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--efkt-white)', textWrap: 'pretty' }}>{heroLine}</div>
        </div>
      </section>

      {featured ? (
        <section className="lr-x" style={{ paddingTop: 64 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={H2}>Siste <span style={{ fontWeight: 800 }}>nytt</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 24, alignItems: 'stretch' }}>
            <FeaturedNews n={featured} />
            {rest.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
                {rest.map((n) => <NewsRow key={n.id} n={n} />)}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div style={{ marginTop: 96, background: 'var(--efkt-mint)', paddingBottom: 96 }}>
        {current.length ? (
          <section className="lr-x" style={{ paddingTop: 64 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 32 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <i className="ph ph-graduation-cap" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>EFKT Academy</span>
                </div>
                <h2 style={{ ...H2, fontSize: 40, letterSpacing: '-0.065em' }}>Fortsett <span style={{ fontWeight: 800 }}>læringen</span></h2>
              </div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{doneCount} av {tracked.length} tildelte kurs fullført</div>
            </div>
            <div style={GRID}>
              {current.map((m) => <ContinueTile key={m.course.id} t={tile(m)} />)}
            </div>
          </section>
        ) : (
          <section className="lr-x" style={{ paddingTop: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <i className="ph ph-graduation-cap" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>EFKT Academy</span>
            </div>
            <h2 style={{ ...H2, fontSize: 40, letterSpacing: '-0.065em' }}>Fortsett der du <span style={{ fontWeight: 800 }}>slapp</span></h2>
            {!tracked.length ? (
              <div style={{ marginTop: 16, fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
                Du har ingen tildelte kurs ennå. Se i <Link href="/catalog" className="lr-coral" style={{ color: 'var(--efkt-coral)', fontWeight: 500 }}>kurskatalogen</Link> for kurs du kan melde deg på.
              </div>
            ) : null}
          </section>
        )}

        {sectionList.map((s) => {
          const words = s.name.split(' ');
          const full = s.items.filter((m) => m.progress.pct === 100).length;
          return (
            <section key={s.name} className="lr-x" style={{ paddingTop: 64 }}>
              <div style={{ height: 1, background: 'rgba(55,59,84,0.15)', marginBottom: 32 }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
                <i className={`ph ph-${s.icon}`} style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h2 style={{ ...H2, margin: '0 0 6px' }}>
                    {words.length > 1 ? words.slice(0, -1).join(' ') + ' ' : ''}
                    <span style={{ fontWeight: 800 }}>{words[words.length - 1]}</span>
                  </h2>
                  <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{s.desc}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{full} av {s.items.length} fullført</div>
              </div>
              <div style={GRID}>
                {s.items.map((m) => <CourseTile key={m.course.id} t={tile(m)} />)}
              </div>
            </section>
          );
        })}
      </div>

      {refs.length ? (
        <section className="lr-x" style={{ paddingTop: 96, paddingBottom: 96, background: 'var(--surface-dark)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
            <i className="ph ph-books" style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ minWidth: 0, flex: 1 }}>
              <h2 style={{ ...H2, margin: '0 0 6px', color: 'var(--efkt-white)' }}>Referanse<span style={{ fontWeight: 800 }}>materiale</span></h2>
              <div style={{ fontSize: 16, fontWeight: 300, color: 'rgba(255,255,255,0.75)', textWrap: 'pretty' }}>Slå opp her mens du jobber. Ingen fremdrift, ingen quiz.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 20, alignItems: 'stretch' }}>
            {refs.map(({ course: c }) => (
              <Link key={c.id} href={`/courses/${c.id}`} className="lr-dark" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: 20, padding: 20, borderRadius: 20, background: 'rgba(255,255,255,0.08)', transition: 'background 180ms cubic-bezier(0.4,0,0.2,1)' }}>
                <span style={{ width: 80, height: 80, minWidth: 80, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`ph ph-${c.icon || 'file-text'}`} style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ minHeight: 44, fontSize: 16, fontWeight: 600, color: 'var(--efkt-white)', textWrap: 'pretty' }}>{c.title}</div>
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>
                    {c.modules.length} {c.modules.length === 1 ? 'del' : 'deler'} · alltid tilgjengelig
                  </div>
                </div>
                <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="lr-x" style={{ paddingTop: 96, paddingBottom: 96, background: 'var(--efkt-offwhite)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 24, alignItems: 'stretch' }}>
          <div style={CARD}>
            <h2 style={H2}>Kontakt <span style={{ fontWeight: 800 }}>oss</span></h2>
            {settings.contactIntro ? <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{settings.contactIntro}</div> : null}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 12 }}>
              {regions.filter((r) => r.leadName).map((r) => (
                <div key={r.id} style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)' }}>{r.name}</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{r.leadName}</div>
                  {r.leadEmail ? <a href={`mailto:${r.leadEmail}`} className="lr-coral" style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-link)' }}>{r.leadEmail}</a> : null}
                  {r.leadMobile ? <a href={`tel:${dial}${r.leadMobile.replace(/ /g, '')}`} className="lr-coral" style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-link)' }}>mob: {r.leadMobile}</a> : null}
                </div>
              ))}
            </div>
            {settings.contactNotes.length ? (
              <>
                <div style={{ height: 1, background: 'var(--border-default)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {settings.contactNotes.map((n, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16 }}>
                      <i className={`ph ph-${n.icon}`} style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
                      <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-body)', textWrap: 'pretty' }}>{n.label}</div>
                        <a href={n.href} className="lr-coral" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-link)' }}>{n.value}</a>
                        {n.note ? <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{n.note}</div> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            {settings.contactFooter ? (
              <div style={{ marginTop: 'auto', padding: 20, background: 'var(--efkt-sand)', borderRadius: 20, fontSize: 16, fontWeight: 600, textWrap: 'pretty' }}>{settings.contactFooter}</div>
            ) : null}
          </div>

          <div style={CARD}>
            <h2 style={H2}>Viktige <span style={{ fontWeight: 800 }}>lenker</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {settings.importantLinks.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="lr-softer" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, transition: 'background 180ms cubic-bezier(0.4,0,0.2,1)' }}>
                  <i className={`ph ph-${l.icon}`} style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
                  <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>{l.label}</span>
                    {l.sub ? <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{l.sub}</span> : null}
                  </span>
                  <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
