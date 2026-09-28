/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react';

/**
 * Cropped photo: fills its box (object-fit: cover), with focus x/y in percent and
 * zoom scale — the crop admins set with the drag/zoom cropper. Without a src it shows
 * a calm off-white placeholder with an image icon.
 */
export function Photo({
  src,
  x = 50,
  y = 50,
  scale = 1,
  alt = '',
  style,
  placeholderIcon = 'image',
}: {
  src?: string | null;
  x?: number;
  y?: number;
  scale?: number;
  alt?: string;
  style?: CSSProperties;
  placeholderIcon?: string;
}) {
  const box: CSSProperties = { position: 'relative', overflow: 'hidden', background: 'var(--efkt-gray-100)', ...style };
  if (!src)
    return (
      <div style={{ ...box, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <i className={`ph ph-${placeholderIcon}`} style={{ fontSize: 32, color: 'var(--efkt-divider)' }} aria-hidden />
      </div>
    );
  return (
    <div style={box}>
      <img
        src={src}
        alt={alt}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${x}% ${y}%`,
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: `${x}% ${y}%`,
        }}
      />
    </div>
  );
}
