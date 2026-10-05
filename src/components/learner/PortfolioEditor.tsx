'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { shrinkImage } from '@/lib/upload-client';
import { PORTFOLIO_MAX } from '@/lib/portfolio';
import { addPortfolioImage, deletePortfolioImage, movePortfolioImage, newPortfolioLink, replacePortfolioImage } from '@/app/(learner)/profile/portfolio-actions';

type Img = { id: string; src: string; width: number; height: number };
type Result = { ok: true } | { ok: false; error: string };

const SEND_LIMIT = 4 * 1024 * 1024;

/** Resizes like every other upload, measures the result and packs it for the server action. */
async function prepare(file: File): Promise<FormData | string> {
  if (!file.type.startsWith('image/')) return `${file.name} er ikke et bilde.`;
  const f = await shrinkImage(file).catch(() => file);
  if (f.size > SEND_LIMIT) return `${file.name} er for stort (maks 4 MB).`;
  const bmp = await createImageBitmap(f).catch(() => null);
  if (!bmp) return `${file.name} kunne ikke leses.`;
  const fd = new FormData();
  fd.set('file', f);
  fd.set('width', String(bmp.width));
  fd.set('height', String(bmp.height));
  bmp.close();
  return fd;
}

export function PortfolioEditor({ name, link, images }: { name: string; link: string; images: Img[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState('');
  const add = useRef<HTMLInputElement>(null);
  const swap = useRef<HTMLInputElement>(null);
  const swapId = useRef<string | null>(null);
  const left = PORTFOLIO_MAX - images.length;
  const working = pending || !!busy;

  async function call(fn: () => Promise<Result>) {
    const r = await fn().catch(() => ({ ok: false as const, error: 'Noe gikk galt. Prøv igjen.' }));
    if (!r.ok) toast(r.error, 'error');
    return r.ok;
  }

  async function addFiles(list: FileList | null) {
    const files = [...(list ?? [])];
    if (!files.length) return;
    const take = files.slice(0, left);
    let added = 0;
    for (const [i, file] of take.entries()) {
      setBusy(`Laster opp ${i + 1} av ${take.length}…`);
      const fd = await prepare(file);
      if (typeof fd === 'string') toast(fd, 'error');
      else if (await call(() => addPortfolioImage(fd))) added++;
    }
    setBusy('');
    router.refresh();
    if (files.length > take.length) toast(`Bare ${PORTFOLIO_MAX} bilder er plass – ${files.length - take.length} ble ikke lagt til.`, 'error');
    else if (added) toast(added === 1 ? 'Bildet er lagt til' : `${added} bilder er lagt til`);
  }

  async function replace(list: FileList | null) {
    const file = list?.[0];
    const id = swapId.current;
    if (!file || !id) return;
    setBusy('Bytter bilde…');
    const fd = await prepare(file);
    if (typeof fd === 'string') toast(fd, 'error');
    else if (await call(() => replacePortfolioImage(id, fd))) toast('Bildet er byttet');
    setBusy('');
    router.refresh();
  }

  const run = (fn: () => Promise<Result>, msg?: string) =>
    start(async () => {
      if ((await call(fn)) && msg) toast(msg);
      router.refresh();
    });

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast('Lenken er kopiert');
    } catch {
      window.prompt('Kopier lenken til porteføljen', link);
    }
  }

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Portefølje</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
            Opptil {PORTFOLIO_MAX} bilder, liggende og stående. Bildene skaleres ned automatisk og vises på svart bakgrunn under «Portfolio: {name}». Alle med lenken kan se porteføljen.
          </div>
        </div>
        <Button iconLeft="plus" onClick={() => add.current?.click()} disabled={working || left <= 0}>
          {busy || (left <= 0 ? 'Porteføljen er full' : 'Legg til bilder')}
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: 12, borderRadius: 16, background: 'var(--efkt-offwhite)' }}>
        <i className="ph ph-link" style={{ fontSize: 20, color: 'var(--efkt-coral)', marginLeft: 4 }} aria-hidden />
        <span style={{ flex: 1, minWidth: 200, fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={link}>{link}</span>
        <Button size="sm" variant="secondary" iconLeft="copy" onClick={copy}>Kopier lenke</Button>
        <a href={link} target="_blank" rel="noopener noreferrer" className="efkt-btn efkt-btn--ghost efkt-btn--sm">
          <i className="ph ph-arrow-square-out" style={{ fontSize: 20 }} aria-hidden /> Åpne
        </a>
        <Button
          size="sm"
          variant="ghost"
          iconLeft="arrows-clockwise"
          disabled={working}
          onClick={() => window.confirm('Lage en ny lenke? Den gamle lenken slutter å virke med en gang.') && run(() => newPortfolioLink(), 'Ny lenke er laget')}
        >
          Ny lenke
        </Button>
      </div>

      {images.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, padding: 12, borderRadius: 16, background: '#000' }}>
          {images.map((img, i) => (
            <figure key={img.id} className="pfe-tile" style={{ width: Math.round((200 * img.width) / img.height) }}>
              <img src={img.src} alt={`Bilde ${i + 1}`} />
              <figcaption className="pfe-tools">
                <button type="button" title="Flytt til venstre" aria-label="Flytt til venstre" disabled={working || i === 0} onClick={() => run(() => movePortfolioImage(img.id, -1))}><i className="ph ph-arrow-left" aria-hidden /></button>
                <button type="button" title="Flytt til høyre" aria-label="Flytt til høyre" disabled={working || i === images.length - 1} onClick={() => run(() => movePortfolioImage(img.id, 1))}><i className="ph ph-arrow-right" aria-hidden /></button>
                <button type="button" title="Bytt bilde" aria-label="Bytt bilde" disabled={working} onClick={() => ((swapId.current = img.id), swap.current?.click())}><i className="ph ph-swap" aria-hidden /></button>
                <button type="button" title="Slett" aria-label="Slett bildet" disabled={working} onClick={() => window.confirm('Slette bildet fra porteføljen?') && run(() => deletePortfolioImage(img.id), 'Bildet er slettet')}><i className="ph ph-trash" aria-hidden /></button>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => add.current?.click()}
          disabled={working}
          style={{ height: 180, border: '1px dashed var(--efkt-divider)', borderRadius: 20, background: '#000', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'var(--efkt-font)', fontSize: 14 }}
        >
          <i className="ph ph-images" style={{ fontSize: 32 }} aria-hidden />
          {busy || 'Legg til de første bildene i porteføljen'}
        </button>
      )}
      <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{images.length} av {PORTFOLIO_MAX} bilder</div>

      <input ref={add} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { void addFiles(e.target.files); e.target.value = ''; }} />
      <input ref={swap} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { void replace(e.target.files); e.target.value = ''; }} />
    </div>
  );
}
