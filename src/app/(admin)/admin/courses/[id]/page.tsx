import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope } from '@/lib/scope';
import { ago } from '@/lib/format';
import { parseBlocks } from '@/lib/blocks';
import { CourseHeader } from '@/components/admin/courses/CourseHeader';
import { RecertNotice } from '@/components/admin/courses/RecertNotice';
import { ModulesTab } from '@/components/admin/courses/ModulesTab';
import { AssignmentTab } from '@/components/admin/courses/AssignmentTab';
import { SettingsTab } from '@/components/admin/courses/SettingsTab';
import { recertChanges } from '../recert';

type Tab = 'modules' | 'assignment' | 'settings';
const TABS: { key: Tab; label: string }[] = [
  { key: 'modules', label: 'Modules' },
  { key: 'assignment', label: 'Assignment' },
  { key: 'settings', label: 'Settings' },
];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = await db.course.findUnique({ where: { id }, select: { title: true } });
  return { title: c?.title ?? 'Course' };
}

const COURSE_INCLUDE = {
  categories: { orderBy: { order: 'asc' }, include: { groups: { select: { id: true, name: true } } } },
  groups: { select: { id: true, name: true } },
  users: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
  modules: { orderBy: { order: 'asc' }, include: { quiz: { include: { _count: { select: { questions: true } } } } } },
} satisfies Prisma.CourseInclude;
type CourseFull = Prisma.CourseGetPayload<{ include: typeof COURSE_INCLUDE }>;

/** Everyone who currently has the course (the access rule, minus self-enrol not yet taken). */
function holdersWhere(courseId: string, country: string): Prisma.UserWhereInput {
  return {
    status: 'ACTIVE',
    ...(country === 'Both' ? {} : { country: country as 'Denmark' | 'Norway' }),
    OR: [
      { directCourses: { some: { id: courseId } } },
      { groups: { some: { courses: { some: { id: courseId } } } } },
      { groups: { some: { categories: { some: { courses: { some: { id: courseId } } } } } } },
      { enrolments: { some: { courseId } } },
    ],
  };
}

export default async function CoursePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === 'assignment' || rawTab === 'settings' ? rawTab : 'modules';
  const scope = await getScope();

  const course = await db.course.findUnique({ where: { id }, include: COURSE_INCLUDE });
  if (!course) notFound();

  const quizzes = course.modules.flatMap((m) => (m.quiz ? [m.quiz] : []));
  const passes = [...new Set(quizzes.map((q) => q.passPercent))].sort((a, b) => a - b);
  const categoryNames = course.categories.map((k) => k.name);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '40px 48px 0' }}>
        <CourseHeader
          course={{ id: course.id, title: course.title, status: course.status, country: course.country }}
          categories={categoryNames}
          metaLine={`${course.modules.length} modules · updated ${ago(course.updatedAt).toLowerCase()}`}
        />
        {course.recertFlag ? <RecertNotice courseId={course.id} changes={await recertChanges(course.id)} /> : null}
        <nav style={{ display: 'flex', gap: 32, marginTop: 40, borderBottom: '1px solid var(--border-default)' }}>
          {TABS.map((t) => (
            <Link key={t.key} href={t.key === 'modules' ? `/admin/courses/${id}` : `/admin/courses/${id}?tab=${t.key}`} scroll={false} className="ac-tab" aria-current={tab === t.key ? 'page' : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      <div style={{ padding: '40px 48px 64px' }}>
        {tab === 'modules' ? (
          <ModulesTab
            courseId={course.id}
            modules={course.modules.map((m) => ({
              id: m.id,
              title: m.title,
              source: m.source,
              url: m.url,
              blockCount: parseBlocks(m.blocks).length,
              minSeconds: m.minSeconds,
              quiz: m.quiz ? { questions: m.quiz._count.questions, passPercent: m.quiz.passPercent } : null,
            }))}
            stats={{
              modules: course.modules.length,
              withQuiz: quizzes.length,
              pass: passes.length ? passes.join('% / ') + '%' : 'No quiz yet',
              enrolled: await db.user.count({ where: holdersWhere(course.id, course.country) }),
            }}
          />
        ) : null}
        {tab === 'assignment' ? await assignment(course, scope) : null}
        {tab === 'settings' ? await settings(course, passes) : null}
      </div>
    </div>
  );
}

async function assignment(course: CourseFull, scope: 'All' | 'Denmark' | 'Norway') {
  const inScope = scope === 'All' ? {} : { country: scope };
  const [groups, people] = await Promise.all([
    db.group.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, _count: { select: { users: { where: { status: 'ACTIVE', ...inScope } } } } },
    }),
    db.user.findMany({
      where: { status: 'ACTIVE', ...inScope },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, country: true, groups: { select: { id: true, name: true } } },
    }),
  ]);
  const direct = new Set(course.groups.map((g) => g.id));
  const inherited = course.categories.flatMap((k) => k.groups.map((g) => ({ id: g.id, group: g.name, category: k.name })));
  const viaGroups = new Set([...direct, ...inherited.map((g) => g.id)]);
  const assigned = new Set(course.users.map((u) => u.id));
  return (
    <AssignmentTab
      courseId={course.id}
      groups={groups.map((g) => ({ id: g.id, name: g.name, count: g._count.users, checked: direct.has(g.id) }))}
      assigned={course.users}
      people={people.map((p) => ({
        id: p.id,
        name: p.name,
        country: p.country,
        groups: p.groups.map((g) => g.name),
        viaGroup: p.groups.some((g) => viaGroups.has(g.id)),
        assigned: assigned.has(p.id),
      }))}
      categories={course.categories.map((k) => k.name)}
      inherited={inherited}
      selfEnrol={course.selfEnrol}
    />
  );
}

async function settings(course: CourseFull, passes: number[]) {
  const categories = await db.category.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, _count: { select: { courses: true } } },
  });
  return (
    <SettingsTab
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        country: course.country,
        categoryIds: course.categories.map((k) => k.id),
        thumbnailId: course.thumbnailId,
        thumbX: course.thumbX,
        thumbY: course.thumbY,
        thumbScale: course.thumbScale,
        reference: course.reference,
        icon: course.icon,
        status: course.status,
      }}
      categories={categories.map((k) => ({ id: k.id, name: k.name, count: k._count.courses }))}
      pass={passes.length ? passes[passes.length - 1] : 80}
      quizCount={course.modules.filter((m) => m.quiz).length}
    />
  );
}
