// Content blocks shared by news stories and "built" course modules.

export type Block =
  | { id: string; kind: 'heading'; text: string; fat?: string }
  | { id: string; kind: 'paragraph'; text: string }
  | { id: string; kind: 'image'; imageId?: string; src?: string; caption?: string; hint?: string }
  | { id: string; kind: 'imagetext'; imageId?: string; src?: string; text: string; side: 'left' | 'right'; hint?: string }
  | { id: string; kind: 'quote'; text: string; who?: string }
  | { id: string; kind: 'list'; items: string } // one item per line
  | { id: string; kind: 'button'; label: string; url: string }
  | { id: string; kind: 'divider' }
  | { id: string; kind: 'course'; courseId: string };

export type BlockKind = Block['kind'];

export const BLOCK_KINDS: { kind: BlockKind; label: string; icon: string }[] = [
  { kind: 'heading', label: 'Heading', icon: 'text-h' },
  { kind: 'paragraph', label: 'Text', icon: 'text-align-left' },
  { kind: 'image', label: 'Image', icon: 'image' },
  { kind: 'imagetext', label: 'Image + text', icon: 'columns' },
  { kind: 'quote', label: 'Quote', icon: 'quotes' },
  { kind: 'list', label: 'Bullet list', icon: 'list-bullets' },
  { kind: 'button', label: 'Button', icon: 'cursor-click' },
  { kind: 'divider', label: 'Divider', icon: 'minus' },
  { kind: 'course', label: 'Linked course', icon: 'graduation-cap' },
];

export function newBlock(kind: BlockKind): Block {
  const id = 'b' + Math.random().toString(36).slice(2, 10);
  switch (kind) {
    case 'heading': return { id, kind, text: 'Ny overskrift', fat: 'overskrift' };
    case 'paragraph': return { id, kind, text: 'Skriv teksten her. Hold det kort og konkret.' };
    case 'image': return { id, kind, hint: 'Drop an image', caption: '' };
    case 'imagetext': return { id, kind, hint: 'Drop an image', text: 'Tekst ved siden av bildet.', side: 'left' };
    case 'quote': return { id, kind, text: 'Et sitat som understreker poenget.', who: 'Navn Navnesen' };
    case 'list': return { id, kind, items: 'Første punkt\nAndre punkt\nTredje punkt' };
    case 'button': return { id, kind, label: 'Les mer', url: 'https://' };
    case 'course': return { id, kind, courseId: '' };
    default: return { id, kind: 'divider' };
  }
}

export function parseBlocks(v: unknown): Block[] {
  return Array.isArray(v) ? (v as Block[]) : [];
}

/** Image URL for a block or other image reference (uploaded file id or static path). */
export function imageSrc(ref: { imageId?: string | null; src?: string | null }): string | null {
  if (ref.imageId) return fileUrl(ref.imageId);
  return ref.src || null;
}

export function fileUrl(id: string | null | undefined): string | null {
  return id ? `/api/files/${id}` : null;
}

/** Google Slides "publish to web" links end in /pub — /embed is the frameable form. */
export function embedUrl(url: string | null | undefined): string {
  const u = String(url || '').trim();
  if (!u) return '';
  const withProto = /^https?:\/\//.test(u) ? u : 'https://' + u;
  return withProto
    .replace('/pub?', '/embed?')
    .replace(/\/pub$/, '/embed')
    .replace('/edit?', '/embed?')
    .replace(/\/edit$/, '/embed');
}

export function sourceLabel(m: { source: 'EMBED' | 'BUILT'; url: string }): string {
  if (m.source === 'BUILT') return 'Bygget her';
  const u = m.url || '';
  if (u.includes('docs.google.com/presentation')) return 'Google Slides';
  if (u.includes('docs.google.com/document')) return 'Google Docs';
  if (u.includes('youtube') || u.includes('vimeo')) return 'Video';
  return 'Lenket side';
}

export type QuizOption = { text: string; correct: boolean };
export function parseOptions(v: unknown): QuizOption[] {
  return Array.isArray(v) ? (v as QuizOption[]) : [];
}
