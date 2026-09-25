'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { ModuleSource } from '@prisma/client';
import { Badge, Button, Dialog, useToast } from '@/components/ui';
import { sourceLabel } from '@/lib/blocks';
import { deleteModule, moveModule, setModuleSeconds } from '@/app/(admin)/admin/courses/actions';
import { ModuleDialog, type ModuleForm } from './ModuleDialog';
import './courses.css';

export type ModuleRow = {
  id: string;
  title: string;
  source: ModuleSource;
  url: string;
  blockCount: number;
  minSeconds: number;
  quiz: { questions: number; passPercent: number } | null;
};

type Stats = { modules: number; withQuiz: number; pass: string; enrolled: number };

function subLine(m: ModuleRow) {
  const content = m.source === 'BUILT' ? `${m.blockCount} ${m.blockCount === 1 ? 'innholdsblokk' : 'innholdsblokker'}` : m.url || 'Ingen lenke ennå';
  const quiz = m.quiz ? `  ·  quiz: ${m.quiz.questions} spørsmål, bestått ved ${m.quiz.passPercent}%` : '  ·  ingen quiz';
  return content + quiz;
}

export function ModulesTab({ courseId, modules, stats }: { courseId: string; modules: ModuleRow[]; stats: Stats }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [dialog, setDialog] = useState<{ moduleId: string | null; form: ModuleForm } | null>(null);
  const [removing, setRemoving] = useState<ModuleRow | null>(null);

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, msg?: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) toast(res.error ?? 'Something went wrong', 'error');
      else if (msg) toast(msg);
    });

  const edit = (m: ModuleRow) =>
    setDialog({ moduleId: m.id, form: { title: m.title, source: m.source, url: m.url, withQuiz: !!m.quiz } });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 32, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, opacity: pending ? 0.8 : 1 }}>
        {modules.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: '20px 24px', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, boxShadow: '0 4px 24px rgba(12,14,57,0.06)' }}>
            <div style={{ width: 32, height: 32, minWidth: 32, borderRadius: '50%', background: 'var(--efkt-offwhite)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{i + 1}</div>
            <i className={`ph ph-${m.source === 'BUILT' ? 'article' : 'presentation-chart'}`} style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.url || undefined}>{subLine(m)}</div>
            </div>
            <Badge tone={m.source === 'BUILT' ? 'sand' : 'mint'}>{sourceLabel(m)}</Badge>
            {m.source === 'BUILT' ? (
              <Link href={`/admin/courses/${courseId}/modules/${m.id}/content`} className="ac-pill">
                <i className="ph ph-pencil-simple-line" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden /> Rediger innhold
              </Link>
            ) : (
              <button type="button" className="ac-pill" onClick={() => edit(m)}>
                <i className="ph ph-pencil-simple-line" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden /> Bytt lenke
              </button>
            )}
            {m.quiz && m.minSeconds > 0 ? <GateInput key={m.minSeconds} value={m.minSeconds} onCommit={(n) => run(() => setModuleSeconds(m.id, n))} /> : null}
            <Link href={`/admin/courses/${courseId}/modules/${m.id}/quiz`} className="ac-pill ac-pill--coral">
              <i className="ph ph-list-checks" style={{ fontSize: 16 }} aria-hidden /> {m.quiz ? 'Edit quiz' : 'Add quiz'}
            </Link>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" className="ac-sq" title="Move up" aria-label="Move up" disabled={i === 0 || pending} onClick={() => run(() => moveModule(m.id, -1))}><i className="ph ph-arrow-up" aria-hidden /></button>
              <button type="button" className="ac-sq" title="Move down" aria-label="Move down" disabled={i === modules.length - 1 || pending} onClick={() => run(() => moveModule(m.id, 1))}><i className="ph ph-arrow-down" aria-hidden /></button>
              <button type="button" className="ac-sq" title="Edit" aria-label="Edit module" onClick={() => edit(m)}><i className="ph ph-pencil-simple" aria-hidden /></button>
              <button type="button" className="ac-sq ac-sq--danger" title="Remove" aria-label="Remove module" onClick={() => setRemoving(m)}><i className="ph ph-trash" aria-hidden /></button>
            </div>
          </div>
        ))}

        <button type="button" className="ac-add" onClick={() => setDialog({ moduleId: null, form: { title: '', source: 'EMBED', url: '', withQuiz: true } })}>
          <i className="ph ph-plus" style={{ fontSize: 20 }} aria-hidden /> Add module
        </button>
      </div>

      <div style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Completion rules</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <div>A module is completed when the learner passes its end-of-module quiz.</div>
          <div>The course is completed when every required module is passed.</div>
        </div>
        <div style={{ height: 1, background: 'var(--border-default)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Stat label="Modules" value={stats.modules} />
          <Stat label="With quiz" value={stats.withQuiz} />
          <Stat label="Pass score" value={stats.pass} />
          <Stat label="Enrolled" value={stats.enrolled} />
        </div>
      </div>

      {dialog ? <ModuleDialog courseId={courseId} moduleId={dialog.moduleId} initial={dialog.form} onClose={() => setDialog(null)} /> : null}

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Remove module?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              disabled={pending}
              onClick={() => {
                const m = removing!;
                setRemoving(null);
                run(() => deleteModule(m.id), 'Module removed');
              }}
            >
              Remove module
            </Button>
          </>
        }
      >
        <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, textWrap: 'pretty' }}>
          «{removing?.title}» is removed from the course{removing?.quiz ? ' together with its quiz' : ''}, and learners&rsquo; progress on it is deleted.
        </div>
      </Dialog>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
      <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/** Per-module dwell seconds. Raw while typing, clamped (5–3600) on blur. */
function GateInput({ value, onCommit }: { value: number; onCommit: (n: number) => void }) {
  const [raw, setRaw] = useState(String(value));
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
      <i className="ph ph-clock" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
      <input
        type="text"
        inputMode="numeric"
        value={raw}
        onChange={(e) => setRaw(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
        onBlur={() => {
          const n = Math.max(5, Math.min(3600, parseInt(raw, 10) || 10));
          setRaw(String(n));
          if (n !== value) onCommit(n);
        }}
        title="Minimum tid på modulen før quizen åpnes"
        style={{ width: 74, padding: '10px 12px', border: '1px solid var(--border-default)', borderRadius: 25, background: 'var(--efkt-white)', fontFamily: 'var(--efkt-font)', fontSize: 14, fontWeight: 500, color: 'var(--text-body)', textAlign: 'center' }}
      />
      sek
    </label>
  );
}
