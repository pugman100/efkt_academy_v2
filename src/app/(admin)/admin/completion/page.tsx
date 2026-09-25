import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { ago, initials } from '@/lib/format';
import { PageHeader } from '@/components/admin/PageHeader';
import { EMPTY_STYLE, Initials, StatTile } from '@/components/admin/tracking/ui';
import { STATUS, loadCompletion, readFilters, trackRows, type CellKey } from '@/components/admin/tracking/completion-data';
import { CompletionFilters } from './CompletionFilters';
import { ExportPanel } from './ExportPanel';

export const metadata: Metadata = { title: 'Completion' };

const LEARNER_W = 240, GROUP_W = 150, PROGRESS_W = 220, LAST_W = 130;
const MODULE_W = 76, COURSE_W = 104;

function StatusCell({ k, title, width }: { k: CellKey | null; title: string; width: number }) {
  const s = k ? STATUS[k] : null;
  return (
    <div style={{ width, minWidth: width, display: 'flex', justifyContent: 'center' }}>
      {s ? (
        <span title={title} style={{ width: 32, height: 32, borderRadius: 10, background: s.bg, color: s.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className={`ph-bold ph-${s.icon}`} style={{ fontSize: 14 }} aria-label={title} />
        </span>
      ) : (
        <span title={title} style={{ width: 32, height: 32, borderRadius: 10, border: '1px dashed var(--border-dashed)' }} />
      )}
    </div>
  );
}

export default async function CompletionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const [scope, sp] = await Promise.all([getScope(), searchParams]);
  const filters = readFilters(sp);
  const [data, groups] = await Promise.all([loadCompletion(scope), db.group.findMany({ orderBy: { createdAt: 'asc' }, select: { name: true } })]);
  const { course, all, shown } = trackRows(data, filters);
  const where = scopeLine(scope);

  const doneCount = all.filter((r) => r.sum.bucket === 'Completed').length;
  const goingCount = all.filter((r) => r.sum.bucket === 'In progress').length;
  const avg = all.length ? Math.round(all.reduce((a, r) => a + r.sum.pct, 0) / all.length) : 0;
  const stats = [
    course
      ? { label: 'Enrolled', value: all.length, sub: `${course.groupCount} ${course.groupCount === 1 ? 'group' : 'groups'} with access` }
      : { label: 'Learners', value: all.length, sub: `${data.courses.length} courses in ${where}` },
    { label: 'Completed', value: doneCount, sub: all.length ? `${Math.round((doneCount / all.length) * 100)}% of ${course ? 'enrolled' : 'learners'}` : 'Nobody enrolled yet' },
    { label: 'In progress', value: goingCount, sub: 'at least one module started' },
    { label: 'Average progress', value: `${avg}%`, sub: 'of modules passed' },
  ];

  const columns = course
    ? course.modules.map((m, i) => ({ key: m.id, head: `M${i + 1}`, title: m.title, width: MODULE_W, href: null as string | null }))
    : data.courses.map((c) => {
        const next = new URLSearchParams({ ...(filters.group && { group: filters.group }), ...(filters.status && { status: filters.status }), ...(filters.q && { q: filters.q }), course: c.id });
        return { key: c.id, head: c.title, title: c.title, width: COURSE_W, href: `/admin/completion?${next}` };
      });
  // Per-person export column, overview only (the drill-down keeps the prototype's columns).
  const ACT_W = course ? 0 : 40;
  const minWidth = LEARNER_W + GROUP_W + PROGRESS_W + columns.reduce((a, c) => a + c.width, 0) + LAST_W + ACT_W + 16 * (columns.length + (course ? 4 : 5)) + 48;
  const legend: CellKey[] = ['passed', 'failed', 'started', 'none'];
  const unit = course ? 'modules' : 'courses';

  return (
    <div className="efkt-page">
      <PageHeader eyebrow={`EFKT Academy · ${where}`} thin="Completion" fat="tracking" />

      <CompletionFilters courses={data.courses.map((c) => ({ id: c.id, title: c.title }))} groups={groups.map((g) => g.name)} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        {stats.map((s) => <StatTile key={s.label} {...s} />)}
      </div>

      <ExportPanel filters={filters} course={course} shownCount={shown.length} allCount={all.length} courseCount={data.courses.length} where={where} />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', marginTop: -8 }}>
        {legend.map((k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
            <span style={{ width: 24, height: 24, borderRadius: 8, background: STATUS[k].bg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: STATUS[k].fg }}>
              <i className={`ph-bold ph-${STATUS[k].icon}`} style={{ fontSize: 12 }} aria-hidden />
            </span>
            {STATUS[k].label}
          </div>
        ))}
        {!course ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
            <span style={{ width: 24, height: 24, borderRadius: 8, border: '1px dashed var(--border-dashed)' }} />
            No access
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: -8 }}>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', minWidth }}>
            <div style={{ width: LEARNER_W, minWidth: LEARNER_W }}>Learner</div>
            <div style={{ width: GROUP_W, minWidth: GROUP_W }}>Group</div>
            <div style={{ width: PROGRESS_W, minWidth: PROGRESS_W }}>Progress</div>
            {columns.map((c) => (
              <div key={c.key} title={c.title} style={{ width: c.width, minWidth: c.width, textAlign: 'center' }}>
                {c.href ? (
                  <Link href={c.href} className="trk-head-link" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{c.head}</Link>
                ) : c.head}
              </div>
            ))}
            <div style={{ width: LAST_W, minWidth: LAST_W, textAlign: 'right' }}>Last activity</div>
            {ACT_W ? <div style={{ width: ACT_W, minWidth: ACT_W }} /> : null}
          </div>

          {shown.map(({ user, rec, sum }) => (
            <div key={user.id} className="trk-row" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', minWidth }}>
              <div style={{ width: LEARNER_W, minWidth: LEARNER_W, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Initials text={initials(user.name)} size={32} />
                <span style={{ fontSize: 16, fontWeight: 500 }}>{user.name}</span>
              </div>
              <div style={{ width: GROUP_W, minWidth: GROUP_W, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{user.groups.join(', ') || 'No group'}</div>
              <div style={{ width: PROGRESS_W, minWidth: PROGRESS_W }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{sum.pct}%</span>
                  <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {course ? `${sum.passed} / ${sum.total}` : `${sum.done} / ${sum.done + sum.going + sum.notStarted}`} {unit}
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--efkt-border)', overflow: 'hidden' }}>
                  <div style={{ height: 8, borderRadius: 4, width: `${sum.pct}%`, background: sum.bucket === 'Completed' ? 'var(--efkt-green)' : 'var(--efkt-coral)', transition: 'width 320ms cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
              {course && rec
                ? rec.cells.map((cel, i) => (
                    <StatusCell key={columns[i].key} k={cel.key} width={MODULE_W}
                      title={`${columns[i].head} ${columns[i].title} · ${STATUS[cel.key].label}${cel.score !== null ? ' · ' + cel.score + '%' : ''}`} />
                  ))
                : data.courses.map((c) => {
                    const r = data.records.get(user.id)?.get(c.id);
                    return (
                      <StatusCell key={c.id} k={r?.key ?? null} width={COURSE_W}
                        title={r ? `${c.title} · ${STATUS[r.key].label} · ${r.passed} / ${r.total} modules · ${r.via}` : `${c.title} · No access`} />
                    );
                  })}
              <div style={{ width: LAST_W, minWidth: LAST_W, textAlign: 'right', fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{ago(sum.last)}</div>
              {ACT_W ? (
                <div style={{ width: ACT_W, minWidth: ACT_W, display: 'flex', justifyContent: 'flex-end' }}>
                  <a className="trk-plate" href={`/api/admin/export?format=xlsx&type=user&userId=${user.id}`} title={`Export ${user.name} (XLSX)`} aria-label={`Export ${user.name}`}>
                    <i className="ph ph-download-simple" style={{ fontSize: 18 }} aria-hidden />
                  </a>
                </div>
              ) : null}
            </div>
          ))}

          {shown.length === 0 ? <div style={EMPTY_STYLE}>No learners match that filter.</div> : null}
        </div>
        <div style={{ marginTop: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          {course
            ? `A module counts as passed at ${course.passPercent}% or better on its quiz. Modules unlock in order.`
            : 'One column per published course — open a course for its modules. A course counts as passed when every module is passed. Only people with access to a course are listed.'}
        </div>
      </div>
    </div>
  );
}
