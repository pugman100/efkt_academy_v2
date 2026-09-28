import type { CSSProperties, ReactNode } from 'react';

const LEVELS = {
  hero: { fontSize: 70, lineHeight: 1.2, letterSpacing: '-0.02em', fat: 800 },
  h1: { fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fat: 800 },
  h2: { fontSize: 32, lineHeight: 1.2, letterSpacing: '-0.03em', fat: 800 },
  h3: { fontSize: 24, lineHeight: 1.25, letterSpacing: '-0.03em', fat: 800 },
};

/**
 * EFKT's two-weight heading: key word at 800, the rest at 300, same size and colour.
 * `<Heading thin="Course" fat="library" />` → "Course **library**".
 */
export function Heading({
  level = 'h1',
  thin,
  fat,
  thinAfter,
  onDark,
  as,
  style,
}: {
  level?: keyof typeof LEVELS;
  thin?: ReactNode;
  fat: ReactNode;
  thinAfter?: ReactNode;
  onDark?: boolean;
  as?: 'h1' | 'h2' | 'h3';
  style?: CSSProperties;
}) {
  const L = LEVELS[level];
  const Tag = as ?? (level === 'h1' || level === 'hero' ? 'h1' : level);
  return (
    <Tag
      style={{
        margin: 0,
        fontSize: L.fontSize,
        lineHeight: L.lineHeight,
        letterSpacing: L.letterSpacing,
        fontWeight: 300,
        color: onDark ? 'var(--efkt-white)' : 'var(--text-heading)',
        textWrap: 'pretty',
        ...style,
      }}
    >
      {thin ? <>{thin} </> : null}
      <span style={{ fontWeight: L.fat }}>{fat}</span>
      {thinAfter ? <> {thinAfter}</> : null}
    </Tag>
  );
}

/** Splits "Course library" into thin + fat on the given key word (for dynamic titles). */
export function TwoWeight({ text, fat }: { text: string; fat?: string }) {
  if (!fat || !text.includes(fat)) return <>{text}</>;
  const i = text.indexOf(fat);
  return (
    <>
      {text.slice(0, i)}
      <span style={{ fontWeight: 800 }}>{fat}</span>
      {text.slice(i + fat.length)}
    </>
  );
}
