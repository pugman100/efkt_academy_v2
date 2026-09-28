/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react';

const FILES = {
  primary: 'efkt-logo-primary.svg',
  white: 'efkt-logo-white.svg',
  mark: 'efkt-maerke.svg',
} as const;

/** Inserts the official EFKT logo file. Never redrawn. Wordmark aspect 2.985:1; mark 1:1.909. */
export function Logo({ variant = 'primary', width, style }: { variant?: keyof typeof FILES; width?: number; style?: CSSProperties }) {
  const isMark = variant === 'mark';
  const w = width || (isMark ? 32 : 140);
  return (
    <img
      src={`/assets/logo/${FILES[variant]}`}
      alt="EFKT"
      style={{ width: w, height: isMark ? w * 1.909 : w / 2.985, display: 'block', ...style }}
    />
  );
}
