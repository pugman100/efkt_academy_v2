const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR;

/** "Today", "Yesterday", "3 days ago", "2 weeks ago" — admin (English) copy. */
export function ago(d: Date | string | null | undefined): string {
  if (!d) return 'Never';
  const t = typeof d === 'string' ? new Date(d) : d;
  const diff = Date.now() - t.getTime();
  const days = Math.floor(diff / DAY);
  if (diff < 0) return inFuture(t);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

function inFuture(t: Date): string {
  const days = Math.ceil((t.getTime() - Date.now()) / DAY);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

/** Days until a date, clamped at 0. */
export function daysUntil(d: Date): number {
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / DAY));
}

const NO_MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];

/** "15. september 2026" — learner (Norwegian/Danish) copy. */
export function dateNo(d: Date | string | null | undefined): string {
  if (!d) return '';
  const t = typeof d === 'string' ? new Date(d) : d;
  return `${t.getDate()}. ${NO_MONTHS[t.getMonth()]} ${t.getFullYear()}`;
}

/** "Joined March 2025" style month-year. */
export function monthYear(d: Date): string {
  return d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
