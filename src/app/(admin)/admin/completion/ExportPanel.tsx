import type { TrackCourse, TrackFilters } from '@/components/admin/tracking/completion-data';

type Card = { label: string; sub: string; icon: string; query: Record<string, string> };

function href(format: 'csv' | 'xlsx', query: Record<string, string>) {
  return '/api/admin/export?' + new URLSearchParams({ format, ...query });
}

/** "Eksporter rapport": four server-side exports, each as CSV or XLSX. */
export function ExportPanel({
  filters,
  course,
  shownCount,
  allCount,
  courseCount,
  where,
}: {
  filters: TrackFilters;
  course: TrackCourse | null;
  shownCount: number;
  allCount: number;
  courseCount: number;
  where: string;
}) {
  const view: Record<string, string> = {
    ...(filters.group && { group: filters.group }),
    ...(filters.status && { status: filters.status }),
    ...(filters.q && { q: filters.q }),
  };
  const people: Card = { label: 'Alle personer — sammendrag', sub: 'En rad per person på tvers av kursene deres', icon: 'user-list', query: { type: 'user' } };
  const cards: Card[] = [
    course
      ? { label: 'Dette kurset — per modul', sub: `${course.title} · ${shownCount} av ${allCount} lærende i visningen`, icon: 'table', query: { type: 'course', courseId: course.id, ...view } }
      : { ...people, sub: `En rad per person · ${shownCount} av ${allCount} i visningen`, query: { type: 'user', ...view } },
    { label: 'Alle kurs — per person', sub: `En rad per person per kurs · ${courseCount} kurs i ${where}`, icon: 'users-three', query: { type: 'all' } },
    { label: 'Alle kurs — sammendrag', sub: 'En rad per kurs med fullføringsgrad', icon: 'chart-bar', query: { type: 'course' } },
    ...(course ? [people] : []),
  ];

  return (
    <div style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <i className="ph ph-download-simple" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Eksporter rapport</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
            CSV er semikolonseparert med BOM — åpnes direkte i Excel med æøå intakt. XLSX er klar for Excel med overskrifter og filtre. Eksporten følger landsvalget i menyen; den øverste følger også filtrene over tabellen.
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 12, alignItems: 'stretch' }}>
        {cards.map((x) => (
          <div key={x.label} className="trk-export" style={{ height: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: 20, border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--efkt-white)', boxSizing: 'border-box' }}>
            <i className={`ph ph-${x.icon}`} style={{ fontSize: 24, color: 'var(--efkt-coral)', flexShrink: 0 }} aria-hidden />
            <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)' }}>{x.label}</span>
              <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{x.sub}</span>
              <span style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <a className="trk-fmt" href={href('csv', x.query)} download><i className="ph ph-file-csv" style={{ fontSize: 16 }} aria-hidden />CSV</a>
                <a className="trk-fmt" href={href('xlsx', x.query)} download><i className="ph ph-file-xls" style={{ fontSize: 16 }} aria-hidden />XLSX</a>
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
