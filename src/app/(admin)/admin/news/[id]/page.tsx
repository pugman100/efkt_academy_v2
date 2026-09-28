import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getScope } from '@/lib/scope';
import { NewsEditor } from '@/components/admin/news/NewsEditor';
import { publishDueStories } from '@/components/admin/news/publishDue';
import { loadEditorOptions, loadStory } from '../data';

export const metadata: Metadata = { title: 'Edit story' };

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  await publishDueStories();
  const [story, scope] = await Promise.all([loadStory(id), getScope()]);
  if (!story) notFound();
  const { groups, courses } = await loadEditorOptions(scope);
  return <NewsEditor key={story.id} initial={story} groups={groups} courses={courses} />;
}
