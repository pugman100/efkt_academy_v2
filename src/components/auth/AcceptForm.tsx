'use client';

/* eslint-disable @next/next/no-img-element */
import { useActionState, useRef, useState } from 'react';
import { acceptInvitation, type AcceptState } from '@/app/(auth)/actions';
import { Button, Input, Textarea } from '@/components/ui';
import { initials } from '@/lib/format';
import { AuthError } from './AuthBits';
import { AcceptDone } from './AcceptDone';

export function AcceptForm({ token, email, name: initialName, intro, groups }: { token: string; email: string; name: string; intro: string; groups: string[] }) {
  const [state, action, pending] = useActionState<AcceptState, FormData>(acceptInvitation, {});
  const [name, setName] = useState(initialName);
  const [pw, setPw] = useState('');
  const [photo, setPhoto] = useState<{ url: string; label: string } | null>(null);
  const file = useRef<HTMLInputElement>(null);

  if (state.done) return <AcceptDone groups={state.groups ?? groups} />;

  const ready = pw.length >= 8;
  const hint = pw.length === 0 ? 'At least 8 characters.' : ready ? 'Strong enough.' : 'A little longer — 8 characters minimum.';

  return (
    <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <input type="hidden" name="token" value={token} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>EFKT Academy · invitation</div>
        <h2 style={{ margin: 0, fontSize: 32, lineHeight: 1.15, letterSpacing: '-0.04em', fontWeight: 300 }}>
          Set up your <span style={{ fontWeight: 800 }}>profile</span>
        </h2>
        <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{intro}</div>
      </div>

      {state.error ? <AuthError>{state.error}</AuthError> : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, flexWrap: 'wrap' }}>
        {photo ? (
          <img src={photo.url} alt="" style={{ width: 72, height: 72, minWidth: 72, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <span style={{ width: 72, height: 72, minWidth: 72, borderRadius: '50%', background: 'var(--efkt-white)', border: '1px dashed var(--border-dashed)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: 'var(--text-muted)' }}>
            {initials(name || 'N N')}
          </span>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Profile picture</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{photo ? photo.label : 'Square JPG or PNG, at least 400×400.'}</div>
        </div>
        <Button variant="secondary" onClick={() => file.current?.click()}>{photo ? 'Replace photo' : 'Upload photo'}</Button>
        <input
          ref={file}
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPhoto(f ? { url: URL.createObjectURL(f), label: `${f.name} · ${(f.size / 1024 / 1024).toFixed(1)} MB` } : null);
          }}
        />
      </div>

      <Input label="Full name" name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      <Input label="Email" value={email} disabled hint="Your invitation is tied to this address." autoComplete="username" />
      <Textarea label="Short bio" name="bio" placeholder="What you do at EFKT, and where you are based." />
      <Input label="Choose a password" name="password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} hint={hint} autoComplete="new-password" />
      <Button type="submit" iconRight="arrow-right" disabled={pending || !ready} style={{ alignSelf: 'flex-start' }}>
        {pending ? 'Creating…' : 'Create my account'}
      </Button>
    </form>
  );
}
