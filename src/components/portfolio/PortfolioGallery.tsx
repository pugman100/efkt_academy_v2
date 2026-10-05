'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';

type Img = { src: string; width: number; height: number };

/** Justified rows (portrait and landscape side by side, in the chosen order) with a full-screen viewer. */
export function PortfolioGallery({ name, images }: { name: string; images: Img[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, step]);

  const current = open === null ? null : images[open];

  return (
    <>
      <div className="pf-grid">
        {images.map((img, i) => (
          <button key={img.src} type="button" className="pf-tile" style={{ '--r': (img.width / img.height).toFixed(4) } as CSSProperties} onClick={() => setOpen(i)} aria-label={`Open image ${i + 1} of ${images.length}`}>
            <img src={img.src} width={img.width} height={img.height} alt={`${name}, image ${i + 1}`} loading={i < 6 ? 'eager' : 'lazy'} decoding="async" />
          </button>
        ))}
      </div>

      {current ? (
        <div
          className="pf-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${open! + 1} of ${images.length}`}
          onClick={() => setOpen(null)}
          onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const x = e.changedTouches[0]?.clientX;
            if (touch.current !== null && x !== undefined && Math.abs(x - touch.current) > 50) step(x < touch.current ? 1 : -1);
            touch.current = null;
          }}
        >
          <img src={current.src} alt={`${name}, image ${open! + 1}`} onClick={(e) => e.stopPropagation()} />
          <button type="button" className="pf-close" aria-label="Close" onClick={() => setOpen(null)}><i className="ph ph-x" aria-hidden /></button>
          {images.length > 1 ? (
            <>
              <button type="button" className="pf-nav pf-nav--prev" aria-label="Previous image" onClick={(e) => (e.stopPropagation(), step(-1))}><i className="ph ph-caret-left" aria-hidden /></button>
              <button type="button" className="pf-nav pf-nav--next" aria-label="Next image" onClick={(e) => (e.stopPropagation(), step(1))}><i className="ph ph-caret-right" aria-hidden /></button>
              <div className="pf-count">{open! + 1} / {images.length}</div>
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
