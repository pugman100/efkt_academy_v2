'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { uploadImage } from '@/app/actions/upload';
import { saveProfile } from '@/app/(learner)/profile/actions';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Photo } from '@/components/ui/Photo';
import { Tag } from '@/components/ui/Tag';
import { useToast } from '@/components/ui/Toast';
import { fileUrl } from '@/lib/blocks';

type Values = { name: string; jobTitle: string; phone: string; bio: string; photoId: string | null };

export function ProfileForm({ initial, email, region, teamleader, groups }: { initial: Values; email: string; region: string; teamleader: string; groups: string[] }) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const set = (patch: Partial<Values>) => setV((cur) => ({ ...cur, ...patch }));

  async function upload(f: File | undefined) {
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.set('file', f);
    const res = await uploadImage(fd);
    setUploading(false);
    if (res.ok) set({ photoId: res.id });
    else toast(res.error, 'error');
  }

  function save() {
    if (!v.name.trim()) return toast('Navnet kan ikke være tomt', 'error');
    start(async () => {
      const res = await saveProfile(v);
      if (!res.ok) return toast(res.error, 'error');
      setSaved(v);
      toast('Profilen er lagret');
      router.refresh();
    });
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Om deg</div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>Dette vises til teamlederen din og til kundesenteret.</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>Profilbilde</div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void upload(e.dataTransfer.files?.[0]);
          }}
          style={{ height: 200, borderRadius: 20, overflow: 'hidden', position: 'relative' }}
        >
          {v.photoId ? (
            <Photo src={fileUrl(v.photoId)} style={{ position: 'absolute', inset: 0 }} />
          ) : (
            <button
              type="button"
              onClick={() => file.current?.click()}
              style={{ position: 'absolute', inset: 0, border: '1px dashed var(--efkt-divider)', borderRadius: 20, background: 'var(--efkt-offwhite)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--efkt-font)', fontSize: 14, color: 'var(--text-muted)' }}
            >
              <i className="ph ph-user-circle" style={{ fontSize: 32 }} aria-hidden />
              {uploading ? 'Laster opp…' : 'Slipp et portrett her'}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" iconLeft="upload-simple" onClick={() => file.current?.click()} disabled={uploading}>
            {uploading ? 'Laster opp…' : v.photoId ? 'Bytt bilde' : 'Last opp bilde'}
          </Button>
          {v.photoId ? <button type="button" className="efkt-link" onClick={() => set({ photoId: null })}>Fjern</button> : null}
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => void upload(e.target.files?.[0])} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>Kvadratisk JPG eller PNG, minst 400×400. Vises som rund miniatyr i toppfeltet.</div>
      </div>

      <Input label="Fullt navn" value={v.name} onChange={(e) => set({ name: e.target.value })} maxLength={120} />
      <Input label="E-post" value={email} disabled hint="E-posten er knyttet til kontoen din og kan bare endres av en administrator." />
      <Input label="Stilling og sted" value={v.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} maxLength={120} />
      <Input label="Mobil" type="tel" value={v.phone} onChange={(e) => set({ phone: e.target.value })} maxLength={40} />
      <Input label="Region" value={region || '—'} disabled hint="Regionen settes av en administrator." />

      <div>
        <Textarea label="Kort om deg" value={v.bio} onChange={(e) => set({ bio: e.target.value.slice(0, 280) })} rows={4} />
        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{v.bio.length} / 280 tegn</div>
      </div>

      <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Tilhørighet</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {groups.map((g) => <Tag key={g}>{g}</Tag>)}
        </div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Gruppene dine bestemmer hvilke kurs du får. Teamleder: {teamleader || '—'}. Ta kontakt med teamlederen din hvis noe er feil.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Button onClick={save} disabled={pending || uploading}>Lagre endringer</Button>
        {dirty ? (
          <Button variant="secondary" onClick={() => setV(saved)}>Forkast</Button>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Ingen ulagrede endringer</span>
        )}
      </div>
    </div>
  );
}
