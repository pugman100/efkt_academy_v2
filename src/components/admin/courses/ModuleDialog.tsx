'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import type { ModuleSource } from '@prisma/client';
import { Button, Dialog, Input, useToast } from '@/components/ui';
import { embedUrl } from '@/lib/blocks';
import { addModule, updateModule } from '@/app/(admin)/admin/courses/actions';
import { uploadPdfFile } from '@/lib/upload-client';
import { fileSize, type FileInfo } from './files';
import './courses.css';

export type ModuleForm = { title: string; source: ModuleSource; url: string; fileId: string | null; file: FileInfo | null; withQuiz: boolean };

const SOURCES: { key: ModuleSource; label: string; icon: string }[] = [
  { key: 'EMBED', label: 'Lenke / Google Slides', icon: 'presentation-chart' },
  { key: 'BUILT', label: 'Bygg innholdet her', icon: 'article' },
  { key: 'PDF', label: 'Last opp PDF', icon: 'file-pdf' },
];
const TYPES = [
  { quiz: false, label: 'Uten quiz', icon: 'browser' },
  { quiz: true, label: 'Med quiz', icon: 'browsers' },
];
const EMBED_HELP = 'I Google Slides: Fil → Del → Publiser på nettet → kopier lenken. Vi gjør den om til en innebygd visning automatisk, så den spilles inne i kurset uten popup.';

/** Add module (new) or edit module (title, source, link, quiz on/off). */
export function ModuleDialog({ courseId, moduleId, initial, onClose }: { courseId: string; moduleId: string | null; initial: ModuleForm; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [f, setF] = useState(initial);
  const set = (patch: Partial<ModuleForm>) => setF((x) => ({ ...x, ...patch }));
  const preview = embedUrl(f.url);
  const dropsQuiz = !!moduleId && initial.withQuiz && !f.withQuiz;

  function submit() {
    start(async () => {
      if (moduleId) {
        const res = await updateModule(moduleId, { title: f.title, source: f.source, url: f.url, fileId: f.fileId, withQuiz: f.withQuiz });
        if (!res.ok) return toast(res.error, 'error');
        toast('Modulen er lagret');
        return onClose();
      }
      const res = await addModule(courseId, { title: f.title, source: f.source, url: f.url, fileId: f.fileId, withQuiz: f.withQuiz });
      if (!res.ok) return toast(res.error, 'error');
      onClose();
      if (f.source === 'BUILT') {
        toast('Modulen er lagt til — bygg innholdet');
        router.push(`/admin/courses/${courseId}/modules/${res.id}/content`);
      } else if (f.withQuiz) {
        toast('Modulen er lagt til — bygg quizen');
        router.push(`/admin/courses/${courseId}/modules/${res.id}/quiz`);
      } else toast('Modulen er lagt til');
    });
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={moduleId ? 'Edit module' : 'Add module'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{moduleId ? 'Save module' : 'Add module'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Hvor kommer innholdet fra?</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SOURCES.map((o) => (
              <button key={o.key} type="button" className="ac-choice" aria-pressed={f.source === o.key} onClick={() => set({ source: o.key })}>
                <i className={`ph ph-${o.icon}`} aria-hidden /> {o.label}
              </button>
            ))}
          </div>
        </div>

        <Input label="Modultittel" placeholder="e.g. Lighting an empty room" value={f.title} onChange={(e) => set({ title: e.target.value })} autoFocus={!moduleId} />

        {f.source === 'EMBED' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Publisert lenke"
              placeholder="https://docs.google.com/presentation/d/e/…/pub?start=false"
              icon="link"
              value={f.url}
              onChange={(e) => set({ url: e.target.value })}
              hint={EMBED_HELP}
            />
            {preview ? (
              <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Spilles som</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-body)', wordBreak: 'break-all' }}>{preview}</div>
              </div>
            ) : null}
          </div>
        ) : f.source === 'PDF' ? (
          <PdfField
            file={f.file}
            onUploaded={(fileId, file) => set({ fileId, file, title: f.title || file.name.replace(/\.pdf$/i, '') })}
          />
        ) : (
          <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', gap: 16 }}>
            <i className="ph ph-article" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              Du bygger innholdet i samme editor som nyhetssakene — overskrift, tekst, bilde, bilde + tekst, sitat, punktliste, knapp og lenket kurs — og redigerer direkte i forhåndsvisningen. Editoren åpnes når du lagrer modulen.
            </div>
          </div>
        )}

        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>Quiz</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TYPES.map((t) => (
              <button key={t.label} type="button" className="ac-choice" style={{ minWidth: 150 }} aria-pressed={f.withQuiz === t.quiz} onClick={() => set({ withQuiz: t.quiz })}>
                <i className={`ph ph-${t.icon}`} aria-hidden /> {t.label}
              </button>
            ))}
          </div>
          {dropsQuiz ? (
            <div style={{ marginTop: 12, display: 'flex', gap: 12, padding: 20, background: 'var(--efkt-blush)', borderRadius: 20 }}>
              <i className="ph ph-warning-circle" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
              <div style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 500, textWrap: 'pretty' }}>Saving deletes this module&rsquo;s quiz and its questions.</div>
            </div>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}

/** Drag-and-drop / browse PDF upload, straight to storage, with progress. */
function PdfField({ file, onUploaded }: { file: FileInfo | null; onUploaded: (fileId: string, file: FileInfo) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [over, setOver] = useState(false);

  async function upload(f: File | undefined) {
    if (!f) return;
    if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) return toast('Velg en PDF-fil', 'error');
    setProgress(0);
    const res = await uploadPdfFile(f, setProgress);
    setProgress(null);
    if (!res.ok) return toast(res.error, 'error');
    onUploaded(res.id, { name: f.name, size: f.size });
    toast('PDF-en er lastet opp');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); upload(e.dataTransfer.files?.[0]); }}
        disabled={progress !== null}
        style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: 24, textAlign: 'left', cursor: 'pointer',
          border: `1px dashed ${over ? 'var(--efkt-coral)' : 'var(--efkt-divider)'}`, borderRadius: 20,
          background: 'var(--efkt-offwhite)', fontFamily: 'var(--efkt-font)', color: 'var(--text-body)',
        }}
      >
        <i className="ph ph-file-pdf" style={{ fontSize: 32, color: 'var(--efkt-coral)' }} aria-hidden />
        <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 600, overflowWrap: 'anywhere' }}>
            {progress !== null ? `Laster opp … ${Math.round(progress * 100)}%` : file ? file.name : 'Slipp en PDF her, eller klikk for å velge'}
          </span>
          <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
            {file && progress === null ? `${fileSize(file.size)} · klikk for å bytte fil` : 'PDF, opptil 100 MB. Vises side for side inne i kurset.'}
          </span>
        </span>
      </button>
      {progress !== null ? (
        <div className="efkt-progress"><span style={{ width: `${Math.round(progress * 100)}%` }} /></div>
      ) : null}
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}
