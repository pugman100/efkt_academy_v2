'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import type { Country, CourseStatus } from '@prisma/client';
import { Badge, Button, ButtonLink, Tag, useToast } from '@/components/ui';
import { COUNTRY_SHORT, COURSE_STATUS_LABEL, COURSE_STATUS_TONE } from '@/lib/labels';
import { setCourseStatus } from '@/app/(admin)/admin/courses/actions';
import './courses.css';

/** Back link, two-weight title, tags and the Completion / Preview / status actions. */
export function CourseHeader({
  course,
  categories,
  metaLine,
}: {
  course: { id: string; title: string; status: CourseStatus; country: Country };
  categories: string[];
  metaLine: string;
}) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const words = course.title.split(' ');

  const setStatus = (status: CourseStatus, msg: string) =>
    start(async () => {
      const res = await setCourseStatus(course.id, status);
      toast(res.ok ? msg : res.error, res.ok ? 'ok' : 'error');
    });

  return (
    <>
      <Link href="/admin/courses" className="efkt-link">
        <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> All courses
      </Link>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 20 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
            {words.slice(0, -1).join(' ')} <span style={{ fontWeight: 800 }}>{words[words.length - 1]}</span>
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {categories.map((k) => <Tag key={k}>{k}</Tag>)}
            <Badge tone={COURSE_STATUS_TONE[course.status]}>{COURSE_STATUS_LABEL[course.status]}</Badge>
            <Tag>{COUNTRY_SHORT[course.country]}</Tag>
            <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{metaLine}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <ButtonLink variant="secondary" href={`/admin/completion?course=${course.id}`}>Completion</ButtonLink>
          <ButtonLink variant="secondary" href={`/courses/${course.id}`} target="_blank" rel="noopener">Preview</ButtonLink>
          {course.status === 'PUBLISHED' ? (
            <Button variant="secondary" disabled={pending} onClick={() => setStatus('DRAFT', 'Course unpublished — it is a draft again')}>Unpublish</Button>
          ) : course.status === 'ARCHIVED' ? (
            <Button disabled={pending} onClick={() => setStatus('DRAFT', 'Course restored as a draft')}>Restore as draft</Button>
          ) : (
            <Button disabled={pending} onClick={() => setStatus('PUBLISHED', 'Course published')}>Publish course</Button>
          )}
        </div>
      </div>
    </>
  );
}
