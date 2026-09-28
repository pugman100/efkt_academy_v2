import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { getScope } from '@/lib/scope';
import { newBlock } from '@/lib/blocks';
import { NewsEditor } from '@/components/admin/news/NewsEditor';
import { loadEditorOptions } from '../data';

export const metadata: Metadata = { title: 'New story' };

export default async function NewStoryPage() {
  const admin = await requireAdmin();
  const scope = await getScope();
  const { groups, courses } = await loadEditorOptions(scope);
  return (
    <NewsEditor
      groups={groups}
      courses={courses}
      initial={{
        id: null, title: '', lead: '', category: 'Produksjon', authorName: admin.name,
        country: scope === 'All' ? 'Both' : scope, status: 'DRAFT', pinned: false, groupIds: [],
        hero: { imageId: null, x: 50, y: 50, scale: 1 }, publishAt: null,
        blocks: [newBlock('heading'), newBlock('paragraph')],
      }}
    />
  );
}
