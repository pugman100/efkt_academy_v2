'use client';

/* eslint-disable @next/next/no-img-element */
import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { fileUrl } from '@/lib/blocks';

export type Crop = { imageId: string | null; x: number; y: number; scale: number };

/**
 * Image upload with drag-to-reposition and zoom. The crop is stored as focus x/y (percent)
 * and scale, and rendered anywhere with <Photo x y scale>. `overlay` renders on top
 * (e.g. the title on a navy scrim, as the tile will look on the dashboard).
 */
export function ImageCropField({
  value,
  onChange,
  height = 300,
  overlay,
  placeholder = 'Slipp et bilde av en bolig her',
  hint,
  style,
}: {
  value: Crop;
  onChange: (v: Crop) => void;
  height?: number;
  overlay?: ReactNode;
  placeholder?: string;
  hint?: ReactNode;
  style?: CSSProperties;
}) {
  const input = useRef<HTMLInputElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const src = fileUrl(value.imageId);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    const fd = new FormData();
    fd.set('file', file);
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.ok) onChange({ imageId: res.id, x: 50, y: 50, scale: 1 });
    else setError(res.error);
  }

  const clamp = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div
        onPointerDown={(e) => {
          if (!src) return;
          const r = e.currentTarget.getBoundingClientRect();
          drag.current = { x: e.clientX, y: e.clientY, ox: value.x, oy: value.y, w: r.width, h: r.height };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          // Dragging the image right reveals more of its left side → focus moves left.
          const k = 100 / value.scale;
          onChange({ ...value, x: clamp(d.ox - ((e.clientX - d.x) / d.w) * k), y: clamp(d.oy - ((e.clientY - d.y) / d.h) * k) });
        }}
        onPointerUp={() => (drag.current = null)}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files?.[0]);
        }}
        style={{
          position: 'relative', height, borderRadius: 20, overflow: 'hidden', background: 'var(--efkt-offwhite)',
          cursor: src ? 'grab' : 'default', touchAction: 'none', userSelect: 'none',
          outline: over ? '2px dashed var(--efkt-coral)' : undefined, outlineOffset: -2,
        }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              objectPosition: `${value.x}% ${value.y}%`, transform: `scale(${value.scale})`, transformOrigin: `${value.x}% ${value.y}%`,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            style={{ position: 'absolute', inset: 0, border: '1px dashed var(--efkt-divider)', borderRadius: 20, background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--efkt-font)', fontSize: 14, color: 'var(--text-muted)' }}
          >
            <i className="ph ph-image" style={{ fontSize: 28 }} aria-hidden />
            {busy ? 'Laster opp…' : placeholder}
          </button>
        )}
        {overlay ? <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>{overlay}</div> : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button type="button" className="efkt-btn efkt-btn--secondary efkt-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
          <i className="ph ph-upload-simple" style={{ fontSize: 16 }} aria-hidden /> {busy ? 'Uploading…' : src ? 'Replace image' : 'Upload image'}
        </button>
        {src ? (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--text-muted)', flex: 1, minWidth: 180 }}>
              <i className="ph ph-magnifying-glass-minus" aria-hidden />
              <input
                type="range" min={1} max={3} step={0.01} value={value.scale}
                onChange={(e) => onChange({ ...value, scale: Number(e.target.value) })}
                style={{ flex: 1, accentColor: 'var(--efkt-coral)' }}
                aria-label="Zoom"
              />
              <i className="ph ph-magnifying-glass-plus" aria-hidden />
            </label>
            <button type="button" className="efkt-link" onClick={() => onChange({ imageId: null, x: 50, y: 50, scale: 1 })}>
              Remove
            </button>
          </>
        ) : null}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0] ?? undefined)} />
      </div>
      {error ? <div style={{ fontSize: 14, color: 'var(--efkt-coral)' }}>{error}</div> : null}
      {hint ? <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{hint}</div> : null}
    </div>
  );
}
