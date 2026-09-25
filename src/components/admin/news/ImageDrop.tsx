'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { fileUrl } from '@/lib/blocks';
import { Photo } from '@/components/ui/Photo';
import { useToast } from '@/components/ui/Toast';

/** Click-or-drop image upload for image blocks; stores the uploaded file id. */
export function ImageDrop({ imageId, hint, onUpload, style }: { imageId?: string; hint?: string; onUpload: (id: string) => void; style?: CSSProperties }) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    const fd = new FormData();
    fd.set('file', file);
    const res = await uploadImage(fd);
    setBusy(false);
    if (res.ok) onUpload(res.id);
    else toast(res.error, 'error');
  }

  return (
    <div
      className="nw-drop"
      data-over={over}
      role="button"
      tabIndex={0}
      title="Klikk eller slipp et bilde"
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
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
      style={style}
    >
      {imageId ? (
        <Photo src={fileUrl(imageId)} style={{ position: 'absolute', inset: 0 }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, border: '1px dashed var(--efkt-divider)', borderRadius: 20, background: 'var(--efkt-offwhite)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 16 }}>
          <i className="ph ph-image" style={{ fontSize: 28 }} aria-hidden />
          {busy ? 'Laster opp…' : hint || 'Slipp et bilde her'}
        </div>
      )}
      {imageId && busy ? (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(12,14,57,0.45)', color: 'var(--efkt-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>Laster opp…</div>
      ) : null}
      <input ref={input} type="file" accept="image/*" hidden onClick={(e) => e.stopPropagation()} onChange={(e) => upload(e.target.files?.[0] ?? undefined)} />
    </div>
  );
}
