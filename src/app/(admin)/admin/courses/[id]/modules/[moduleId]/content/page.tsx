import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseBlocks } from '@/lib/blocks';
import { BlockEditor } from '@/components/admin/courses/BlockEditor';

export const metadata: Metadata = { title: 'Innholdseditor' };

export default async function ModuleContentPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  await requireAdmin();
  const { id, moduleId } = await params;
  const mod = await db.module.findFirst({
    where: { id: moduleId, courseId: id },
    select: { id: true, title: true, blocks: true, course: { select: { id: true, title: true } } },
  });
  if (!mod) notFound();
  const courses = await db.course.findMany({ orderBy: { title: 'asc' }, select: { id: true, title: true, description: true } });

  return (
    <BlockEditor
      moduleId={mod.id}
      moduleTitle={mod.title}
      course={mod.course}
      initial={parseBlocks(mod.blocks)}
      courses={courses}
    />
  );
}
