'use client';

import { useRef, useState, useTransition } from 'react';
import { Button, Dialog, Input, Select, Switch, Textarea, useToast } from '@/components/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import type { QuizOption } from '@/lib/blocks';
import { deleteBankQuestion, importBankCsv, saveBankQuestion } from '@/app/(admin)/admin/question-bank/actions';
import { CSV_EXAMPLE } from './csv';
import './courses.css';

type BankQ = { id: string; text: string; multi: boolean; options: QuizOption[]; categoryId: string | null; category: string | null; uses: number };
type Form = { id: string | null; categoryId: string | null; text: string; multi: boolean; options: QuizOption[] };
type Cat = { id: string; name: string };

const ALL = '__all';
const NONE = '__none';

export function QuestionBank({ questions, categories }: { questions: BankQ[]; categories: Cat[] }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(ALL);
  const [form, setForm] = useState<Form | null>(null);
  const [removing, setRemoving] = useState<BankQ | null>(null);
  const [showFormat, setShowFormat] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const q = search.trim().toLowerCase();
  const shown = questions.filter(
    (x) =>
      (!q || x.text.toLowerCase().includes(q) || x.options.some((o) => o.text.toLowerCase().includes(q))) &&
      (cat === ALL || (cat === NONE ? !x.categoryId : x.categoryId === cat)),
  );

  async function importFile(f: File | undefined) {
    if (!f) return;
    const text = await f.text();
    if (file.current) file.current.value = '';
    start(async () => {
      const res = await importBankCsv(text);
      if (!res.ok) return toast(res.error, 'error');
      if (res.errors.length) toast(`${res.imported} imported · ${res.errors.length} skipped (${res.errors[0]})`, 'error');
      else toast(`${res.imported} ${res.imported === 1 ? 'question' : 'questions'} imported`);
    });
  }

  return (
    <div className="efkt-page" style={{ paddingBottom: 64 }}>
      <PageHeader
        eyebrow={<span style={{ display: 'block', marginBottom: 4 }}>EFKT Academy · {questions.length} questions</span>}
        thin="Question"
        fat="bank"
        actions={
          <>
            <Button variant="secondary" iconRight="file-csv" onClick={() => setShowFormat(true)}>Import CSV</Button>
            <Button iconRight="plus" onClick={() => setForm({ id: null, categoryId: cat !== ALL && cat !== NONE ? cat : null, text: '', multi: false, options: [0, 1, 2, 3].map(() => ({ text: '', correct: false })) })}>
              New question
            </Button>
          </>
        }
      />
      <div style={{ marginTop: -12, maxWidth: 720, fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        Reusable questions, tagged by category. The quiz builder copies them into a quiz with «Hent fra banken», so editing a question here never changes a quiz.
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input icon="magnifying-glass" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} aria-label="Search questions" />
        <Select
          options={[{ value: ALL, label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name })), { value: NONE, label: 'Uncategorised' }]}
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          style={{ width: 220 }}
          aria-label="Category"
        />
        <div style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
          {shown.length} of {questions.length}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: pending ? 0.8 : 1 }}>
        {shown.map((x) => (
          <div key={x.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, padding: '20px 24px', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, boxShadow: '0 4px 24px rgba(12,14,57,0.06)' }}>
            <i className={`ph ph-${x.multi ? 'list-checks' : 'check-circle'}`} style={{ fontSize: 24, color: 'var(--efkt-coral)', marginTop: 2 }} aria-hidden />
            <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 600, textWrap: 'pretty' }}>{x.text}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {x.options.map((o, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, fontSize: 14, fontWeight: 300, background: o.correct ? 'var(--efkt-mint)' : 'var(--efkt-offwhite)' }}>
                    {o.correct ? <i className="ph-bold ph-check" style={{ fontSize: 12, color: 'var(--efkt-navy)' }} aria-hidden /> : null}
                    {o.text}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
                {x.category ?? 'Uncategorised'} · {x.multi ? 'flervalg' : 'ett riktig'} · used in {x.uses} {x.uses === 1 ? 'quiz' : 'quizzes'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button type="button" className="ac-sq" title="Edit" aria-label="Edit question" onClick={() => setForm({ id: x.id, categoryId: x.categoryId, text: x.text, multi: x.multi, options: x.options.map((o) => ({ ...o })) })}>
                <i className="ph ph-pencil-simple" aria-hidden />
              </button>
              <button type="button" className="ac-sq ac-sq--danger" title="Delete" aria-label="Delete question" onClick={() => setRemoving(x)}>
                <i className="ph ph-trash" aria-hidden />
              </button>
            </div>
          </div>
        ))}
        {shown.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', border: '1px solid var(--border-default)', borderRadius: 20 }}>
            {questions.length ? 'No questions match that filter.' : 'The bank is empty. Add a question, import a CSV, or save one from a quiz with «Lagre i banken».'}
          </div>
        ) : null}
      </div>

      <input ref={file} type="file" accept=".csv,text/csv" hidden onChange={(e) => { setShowFormat(false); importFile(e.target.files?.[0]); }} />

      <Dialog
        open={showFormat}
        onClose={() => setShowFormat(false)}
        width={640}
        title="Import questions from CSV"
        subtitle="One question per row. Categories that don't exist yet are created."
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowFormat(false)}>Cancel</Button>
            <Button iconRight="upload-simple" onClick={() => file.current?.click()}>Choose CSV file</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14, fontWeight: 300, lineHeight: 1.6 }}>
          <div>
            Columns: <b style={{ fontWeight: 600 }}>category, question, multi, option1, correct1, option2, correct2, …</b> (2–6 options).
            The header row is optional. <i>multi</i> and <i>correct</i> take yes/no (also ja, true/false, 1/0, x). Comma or semicolon separated;
            wrap text containing the separator in double quotes. A question with several correct answers becomes multi-choice.
          </div>
          <pre style={{ margin: 0, padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, lineHeight: 1.6, overflowX: 'auto', whiteSpace: 'pre' }}>{CSV_EXAMPLE}</pre>
          <div style={{ color: 'var(--text-muted)' }}>The quiz builder&rsquo;s «Importer CSV» reads the same format (the category column is ignored there).</div>
        </div>
      </Dialog>

      <Dialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        title="Delete question?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              disabled={pending}
              onClick={() => {
                const x = removing!;
                setRemoving(null);
                start(async () => {
                  const res = await deleteBankQuestion(x.id);
                  toast(res.ok ? 'Question deleted' : res.error, res.ok ? 'ok' : 'error');
                });
              }}
            >
              Delete question
            </Button>
          </>
        }
      >
        <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, textWrap: 'pretty' }}>
          «{removing?.text}» is removed from the bank.{removing?.uses ? ` The ${removing.uses} ${removing.uses === 1 ? 'quiz' : 'quizzes'} using it keep their copy.` : ''}
        </div>
      </Dialog>

      {form ? <BankDialog initial={form} categories={categories} onClose={() => setForm(null)} /> : null}
    </div>
  );
}

function BankDialog({ initial, categories, onClose }: { initial: Form; categories: Cat[]; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [f, setF] = useState(initial);
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));
  const setOpt = (j: number, patch: Partial<QuizOption>) => set({ options: f.options.map((o, k) => (k === j ? { ...o, ...patch } : o)) });

  const submit = () =>
    start(async () => {
      const res = await saveBankQuestion(f.id, { categoryId: f.categoryId, text: f.text, multi: f.multi, options: f.options });
      if (!res.ok) return toast(res.error, 'error');
      toast(f.id ? 'Question saved' : 'Question added to the bank');
      onClose();
    });

  return (
    <Dialog
      open
      onClose={onClose}
      width={600}
      title={f.id ? 'Edit question' : 'New question'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{f.id ? 'Save question' : 'Add question'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Select
          label="Category"
          options={[{ value: '', label: 'Uncategorised' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          value={f.categoryId ?? ''}
          onChange={(e) => set({ categoryId: e.target.value || null })}
        />
        <Textarea label="Spørsmål" placeholder="e.g. I hvilken rekkefølge fotograferes rommene?" value={f.text} onChange={(e) => set({ text: e.target.value })} autoFocus />
        <Switch
          checked={f.multi}
          label="Flere riktige svar"
          onChange={() => {
            const first = f.options.findIndex((o) => o.correct);
            set({ multi: !f.multi, options: f.multi ? f.options.map((o, j) => ({ ...o, correct: j === first })) : f.options });
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Alternativer</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Click the circle to mark the correct answer.</div>
          {f.options.map((o, j) => (
            <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: o.correct ? 'var(--efkt-mint)' : 'var(--efkt-offwhite)', borderRadius: 20 }}>
              <button
                type="button"
                aria-label="Mark as correct"
                aria-pressed={o.correct}
                onClick={() => set({ options: f.options.map((x, k) => (f.multi ? (k === j ? { ...x, correct: !x.correct } : x) : { ...x, correct: k === j })) })}
                style={{ width: 32, height: 32, minWidth: 32, border: 'none', borderRadius: '50%', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className={`ph-bold ph-${o.correct ? 'check-circle' : 'circle'}`} style={{ fontSize: 22, color: o.correct ? 'var(--efkt-green)' : 'var(--efkt-muted)' }} aria-hidden />
              </button>
              <input
                value={o.text}
                placeholder={`Alternativ ${j + 1}`}
                onChange={(e) => setOpt(j, { text: e.target.value })}
                style={{ minWidth: 0, flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--efkt-font)', fontSize: 16, fontWeight: 300, color: 'var(--text-body)', outline: 'none', padding: '8px 0' }}
              />
              <button
                type="button"
                aria-label="Remove option"
                onClick={() => (f.options.length <= 2 ? toast('A question needs at least two options', 'error') : set({ options: f.options.filter((_, k) => k !== j) }))}
                style={{ width: 32, height: 32, minWidth: 32, border: 'none', borderRadius: '50%', background: 'rgba(55,59,84,0.08)', cursor: 'pointer', color: 'var(--efkt-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className="ph ph-x" style={{ fontSize: 12 }} aria-hidden />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="efkt-link"
            style={{ alignSelf: 'flex-start', padding: '8px 0' }}
            onClick={() => (f.options.length >= 6 ? toast('Six options is the maximum', 'error') : set({ options: [...f.options, { text: '', correct: false }] }))}
          >
            <i className="ph ph-plus" style={{ fontSize: 16 }} aria-hidden /> Legg til alternativ
          </button>
        </div>
      </div>
    </Dialog>
  );
}
