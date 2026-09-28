'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Country, CourseStatus } from '@prisma/client';
import { Badge, Button, Input, Select } from '@/components/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { COUNTRY_SHORT, COURSE_STATUS_LABEL, COURSE_STATUS_TONE } from '@/lib/labels';
import { NewCourseDialog } from './NewCourseDialog';
import './courses.css';

export type CourseRow = {
  id: string;
  title: string;
  description: string;
  categories: string[];
  country: Country;
  modules: number;
  groups: number;
  users: number;
  status: CourseStatus;
  updated: string;
};

const STATUS_FILTERS: { label: string; value: CourseStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Published', value: 'PUBLISHED' },
  { label: 'Draft', value: 'DRAFT' },
];

const COLS = { gridTemplateColumns: 'minmax(260px,2.4fr) minmax(120px,1fr) 100px 130px 120px 120px 44px' };

function assignedLine(r: CourseRow) {
  const parts = [];
  if (r.groups) parts.push(r.groups + (r.groups === 1 ? ' group' : ' groups'));
  if (r.users) parts.push(r.users + (r.users === 1 ? ' person' : ' people'));
  return parts.length ? parts.join(' · ') : 'Nobody yet';
}

export function CourseList({
  rows,
  categories,
  scopeLine,
  defaultCountry,
}: {
  rows: CourseRow[];
  categories: { id: string; name: string }[];
  scopeLine: string;
  defaultCountry: Country;
}) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All categories');
  const [status, setStatus] = useState<CourseStatus | 'ALL'>('ALL');
  const [creating, setCreating] = useState(false);
  const filters = rows.some((r) => r.status === 'ARCHIVED') ? [...STATUS_FILTERS, { label: 'Archived', value: 'ARCHIVED' as const }] : STATUS_FILTERS;

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (c) =>
        (!q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) &&
        (cat === 'All categories' || c.categories.includes(cat)) &&
        (status === 'ALL' || c.status === status),
    );
  }, [rows, search, cat, status]);

  return (
    <div className="efkt-page" style={{ paddingBottom: 64 }}>
      <PageHeader
        eyebrow={<span style={{ display: 'block', marginBottom: 4 }}>EFKT Academy · {scopeLine}</span>}
        thin="Course"
        fat="library"
        actions={<Button iconRight="plus" onClick={() => setCreating(true)}>New course</Button>}
      />

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input icon="magnifying-glass" placeholder="Search courses" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} aria-label="Search courses" />
        <Select
          options={['All categories', ...categories.map((c) => c.name)]}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{ width: 220 }}
          aria-label="Category"
        />
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {filters.map((f) => (
            <button key={f.value} type="button" className="ac-filter" aria-pressed={status === f.value} onClick={() => setStatus(f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--surface-card)', overflowX: 'auto' }}>
          <div style={{ display: 'grid', ...COLS, gap: 16, padding: '20px 24px', borderBottom: '1px solid var(--border-default)', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', minWidth: 1000 }}>
            <div>Course</div>
            <div>Categories / country</div>
            <div>Modules</div>
            <div>Assigned to</div>
            <div>Status</div>
            <div>Updated</div>
            <div />
          </div>
          {shown.map((r) => (
            <Link key={r.id} href={`/admin/courses/${r.id}`} className="ac-trow">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.title}</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{r.description}</div>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{r.categories.join(' · ')}</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{COUNTRY_SHORT[r.country]}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 500 }}>{r.modules}</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{assignedLine(r)}</div>
              <div>
                <Badge tone={COURSE_STATUS_TONE[r.status]}>{COURSE_STATUS_LABEL[r.status]}</Badge>
              </div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{r.updated}</div>
              <div style={{ textAlign: 'right' }}>
                <i className="ph ph-arrow-up-right" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
              </div>
            </Link>
          ))}
          {shown.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>No courses match that filter.</div>
          ) : null}
        </div>
      </div>

      {creating ? <NewCourseDialog open onClose={() => setCreating(false)} categories={categories} defaultCountry={defaultCountry} /> : null}
    </div>
  );
}
