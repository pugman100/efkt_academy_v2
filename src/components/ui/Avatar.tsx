/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react';
import { initials } from '@/lib/format';

/** Round avatar: photo if present, otherwise initials on navy. */
export function Avatar({ name, src, size = 40, style }: { name: string; src?: string | null; size?: number; style?: CSSProperties }) {
  const s: CSSProperties = { width: size, height: size, minWidth: size, borderRadius: '50%', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style };
  if (src) return <img src={src} alt="" style={{ ...s, objectFit: 'cover' }} />;
  return (
    <span style={{ ...s, background: 'var(--efkt-mint)', color: 'var(--efkt-navy)', fontSize: Math.max(14, Math.round(size * 0.36)), fontWeight: 600 }}>
      {initials(name)}
    </span>
  );
}
