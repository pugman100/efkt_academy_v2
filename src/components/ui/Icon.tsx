import type { CSSProperties } from 'react';

/** Phosphor icon (the only icon family EFKT uses). */
export function Icon({
  name,
  size = 20,
  weight = 'regular',
  color,
  style,
  className,
}: {
  name: string;
  size?: number;
  weight?: 'regular' | 'bold' | 'fill';
  color?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const base = weight === 'regular' ? 'ph' : `ph-${weight}`;
  return (
    <i
      className={`${base} ph-${name}${className ? ' ' + className : ''}`}
      style={{ fontSize: size, color, lineHeight: 1, ...style }}
      aria-hidden
    />
  );
}
