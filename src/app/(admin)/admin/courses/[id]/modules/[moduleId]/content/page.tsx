import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseBlocks } from '@/lib/blocks';
import { BlockEditor } from '@/components/admin/courses/BlockEditor';

export const metadata: Metadata = { title: 'Bygg modulen' };

export default async function ModuleContentPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  await requireAdmin();
  const { id, moduleId } = await params;
  const mod = await db.module.findFirst({
    where: { id: moduleId, courseId: id },
    select: { id: true, title: true, order: true, blocks: true, course: { select: { id: true, title: true, _count: { select: { modules: true } } } } },
  });
  if (!mod) notFound();
  const [position, courses] = await Promise.all([
    db.module.count({ where: { courseId: id, order: { lt: mod.order } } }),
    db.course.findMany({
      where: { status: { not: 'ARCHIVED' } },
      orderBy: { title: 'asc' },
      select: { id: true, title: true, description: true, categories: { select: { name: true } } },
    }),
  ]);

  return (
    <BlockEditor
      moduleId={mod.id}
      moduleTitle={mod.title}
      moduleNumber={position + 1}
      course={{ id: mod.course.id, title: mod.course.title, modules: mod.course._count.modules }}
      initial={parseBlocks(mod.blocks)}
      courses={courses.map((c) => ({ id: c.id, title: c.title, description: c.description, categories: c.categories.map((k) => k.name).join(', ') }))}
    />
  );
}
