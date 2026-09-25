import type { Country, NewsStatus } from '@prisma/client';
import type { Block } from '@/lib/blocks';
import type { Crop } from '@/components/ui/ImageCropField';

/** Story as the editor holds it (serialisable: dates as ISO strings). */
export type StoryData = {
  id: string | null;
  title: string;
  lead: string;
  category: string;
  authorName: string;
  country: Country;
  status: NewsStatus;
  pinned: boolean;
  groupIds: string[];
  hero: Crop;
  publishAt: string | null;
  blocks: Block[];
};

export type GroupOption = { id: string; name: string; inScope: number };
export type CourseOption = { id: string; title: string; description: string; categories: string };

export type SaveIntent = 'draft' | 'publish' | 'schedule';

export type SaveStoryInput = Omit<StoryData, 'id' | 'status'> & { id: string | null; intent: SaveIntent };

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };
