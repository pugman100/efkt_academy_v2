'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input, Select } from '@/components/ui';
import '@/components/admin/tracking/admin-tracking.css';

const STATUSES = ['All', 'Completed', 'In progress', 'Not started'];

/** Course / group / search / status filters, kept in the URL so exports can follow them. */
export function CompletionFilters({ courses, groups }: { courses: { id: string; title: string }[]; groups: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, start] = useTransition();
  const [q, setQ] = useState(params.get('q') ?? '');

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`${pathname}${next.size ? '?' + next : ''}`, { scroll: false }));
  }

  // Debounced search.
  useEffect(() => {
    if (q === (params.get('q') ?? '')) return;
    const t = setTimeout(() => set('q', q.trim()), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const status = params.get('status') ?? '';
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Select aria-label="Course" options={[{ value: '', label: 'All courses' }, ...courses.map((c) => ({ value: c.id, label: c.title }))]}
        value={params.get('course') ?? ''} onChange={(e) => set('course', e.target.value)} style={{ width: 320 }} />
      <Select aria-label="Group" options={[{ value: '', label: 'All groups' }, ...groups]}
        value={params.get('group') ?? ''} onChange={(e) => set('group', e.target.value)} style={{ width: 220 }} />
      <Input icon="magnifying-glass" placeholder="Search learners" aria-label="Search learners" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 280 }} />
      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => {
          const v = s === 'All' ? '' : s;
          return (
            <button key={s} type="button" className="trk-pill" aria-pressed={status === v} onClick={() => set('status', v)}>{s}</button>
          );
        })}
      </div>
    </div>
  );
}
