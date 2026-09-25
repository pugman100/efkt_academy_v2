'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { Button, ButtonLink, Input, Select, Switch, Textarea, useToast } from '@/components/ui';
import type { QuizOption } from '@/lib/blocks';
import { saveQuestionToBank, saveQuiz } from '@/app/(admin)/admin/courses/actions';
import { BankPicker, type BankItem } from './BankPicker';
import { parseQuestionCsv, CSV_HEADER } from './csv';
import './courses.css';

type Q = { key: string; id?: string; text: string; multi: boolean; options: QuizOption[]; bankItemId?: string | null };
type Initial = {
  passPercent: number;
  retries: number;
  shuffle: boolean;
  showFeedback: boolean;
  minSeconds: number;
  questions: Omit<Q, 'key'>[];
};

const card = { background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 } as const;
const RETRIES = ['Unlimited', '1 retry', '2 retries', '3 retries'];
const GATE_HINT = 'Et publisert Google Slides-innhold kan ikke rapportere hvilken side leseren er på. I stedet må modulen ha vært åpen i denne tiden, og den lærende må bekrefte at hele innholdet er gjennomgått, før quizen åpnes. Tiden stopper når fanen er i bakgrunnen.';

let seq = 0;
const key = () => 'q' + ++seq + Math.random().toString(36).slice(2, 6);

export function QuizBuilder({
  moduleId,
  moduleTitle,
  course,
  initial,
  bank,
}: {
  moduleId: string;
  moduleTitle: string;
  course: { id: string; title: string };
  initial: Initial;
  bank: BankItem[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [pass, setPass] = useState(initial.passPercent);
  const [retries, setRetries] = useState(initial.retries);
  const [shuffle, setShuffle] = useState(initial.shuffle);
  const [feedback, setFeedback] = useState(initial.showFeedback);
  const [gate, setGate] = useState(initial.minSeconds > 0);
  const [minRaw, setMinRaw] = useState(String(initial.minSeconds || 10));
  const [questions, setQuestions] = useState<Q[]>(() => initial.questions.map((q) => ({ ...q, key: key() })));
  const [sel, setSel] = useState<number | null>(initial.questions.length ? 0 : null);
  const [bankOpen, setBankOpen] = useState(false);
  const csvInput = useRef<HTMLInputElement>(null);
  const back = `/admin/courses/${course.id}`;

  const needed = questions.length ? Math.ceil((questions.length * pass) / 100) : 0;
  const passOptions = [...new Set([60, 70, 75, 80, 85, 90, 100, pass])].sort((a, b) => a - b).map(String);
  const sq = sel !== null && sel < questions.length ? questions[sel] : null;

  const setQ = (i: number, patch: Partial<Q>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= questions.length) return;
    const next = questions.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setQuestions(next);
    setSel(j);
  };
  const append = (qs: Omit<Q, 'key'>[]) => {
    setQuestions((cur) => [...cur, ...qs.map((q) => ({ ...q, key: key() }))]);
    setSel(questions.length);
  };

  function save() {
    const bad = questions.findIndex((x) => !x.text.trim() || !x.options.some((o) => o.correct) || x.options.some((o) => !o.text.trim()));
    if (bad >= 0) {
      setSel(bad);
      return toast(`Question ${bad + 1} is incomplete`, 'error');
    }
    const minSeconds = gate ? Math.max(5, Math.min(3600, parseInt(minRaw, 10) || 10)) : 0;
    start(async () => {
      const res = await saveQuiz(moduleId, {
        passPercent: pass,
        retries,
        shuffle,
        showFeedback: feedback,
        minSeconds,
        questions: questions.map(({ id, text, multi, options, bankItemId }) => ({ id, text, multi, options, bankItemId: bankItemId ?? null })),
      });
      if (!res.ok) return toast(res.error, 'error');
      toast(res.removed ? 'Quiz removed — module has no quiz' : 'Quiz saved');
      router.push(back);
    });
  }

  async function importCsv(file: File | undefined) {
    if (!file) return;
    const { questions: rows, errors } = parseQuestionCsv(await file.text());
    if (csvInput.current) csvInput.current.value = '';
    if (rows.length) append(rows.map(({ text, multi, options }) => ({ text, multi, options })));
    if (errors.length) toast(`${rows.length} imported · ${errors.length} skipped (${errors[0]})`, 'error');
    else toast(`${rows.length} ${rows.length === 1 ? 'spørsmål' : 'spørsmål'} importert`);
  }

  function saveToBank() {
    if (!sq || sel === null) return;
    if (!sq.text.trim()) return toast('Skriv spørsmålsteksten først', 'error');
    if (!sq.options.some((o) => o.correct)) return toast('Marker det riktige svaret først', 'error');
    const i = sel;
    start(async () => {
      const res = await saveQuestionToBank(course.id, { text: sq.text, multi: sq.multi, options: sq.options });
      if (!res.ok) return toast(res.error, 'error');
      setQ(i, { bankItemId: res.id });
      toast('Lagt i spørsmålsbanken under ' + res.category);
    });
  }

  const inBank = !!sq?.bankItemId;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--efkt-white)', zIndex: 55, overflowY: 'auto' }}>
      <div style={{ padding: '40px 48px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0 }}>
          <Link href={back} className="efkt-link">
            <i className="ph ph-arrow-left" style={{ fontSize: 16 }} aria-hidden /> Back to {course.title}
          </Link>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', margin: '20px 0 12px' }}>Quiz after «{moduleTitle}»</div>
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
            Quiz <span style={{ fontWeight: 800 }}>builder</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ButtonLink variant="secondary" href={back}>Cancel</ButtonLink>
          <Button onClick={save} disabled={pending}>Save quiz</Button>
        </div>
      </div>

      <div style={{ padding: '40px 48px 64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,400px),1fr))', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <div style={card}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Passing</div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Select label="Pass score (%)" options={passOptions} value={String(pass)} onChange={(e) => setPass(Number(e.target.value))} style={{ width: 220 }} />
              <Select
                label="Retries allowed"
                options={RETRIES}
                value={RETRIES[Math.min(retries, 3)]}
                onChange={(e) => setRetries(RETRIES.indexOf(e.target.value))}
                style={{ width: 220 }}
              />
            </div>
            <div style={{ padding: 20, background: 'var(--efkt-mint)', borderRadius: 20, fontSize: 14, fontWeight: 500, textWrap: 'pretty' }}>
              {questions.length
                ? `A learner must answer ${needed} of ${questions.length} correctly to pass and complete «${moduleTitle}».`
                : 'Add at least one question. The quiz is what marks the module complete.'}
            </div>
            <Switch checked={gate} onChange={() => setGate(!gate)} label="Krev gjennomgang før quizen åpnes" />
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{GATE_HINT}</div>
            {gate ? (
              <div style={{ maxWidth: 220 }}>
                <Input
                  label="Minimum tid på modulen (sekunder)"
                  inputMode="numeric"
                  value={minRaw}
                  onChange={(e) => setMinRaw(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                  onBlur={() => setMinRaw(String(Math.max(5, Math.min(3600, parseInt(minRaw, 10) || 10))))}
                />
              </div>
            ) : null}
            <Switch checked={shuffle} onChange={() => setShuffle(!shuffle)} label="Shuffle question order" />
            <Switch checked={feedback} onChange={() => setFeedback(!feedback)} label="Show correct answers afterwards" />
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              {feedback ? 'After submitting, learners see which answers were wrong and the correct one.' : 'Learners only see the score, not which answers were wrong.'}
            </div>
          </div>

          <div style={{ ...card, gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 600 }}>Questions</div>
              <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>{questions.length} {questions.length === 1 ? 'question' : 'questions'}</div>
            </div>
            {questions.length === 0 ? (
              <div style={{ padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
                No questions yet. A module with an empty quiz completes as soon as the learner opens it.
              </div>
            ) : null}
            <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
              {questions.map((q, i) => {
                const correct = q.options.filter((o) => o.correct).length;
                return (
                  <div key={q.key} role="option" aria-selected={sel === i} tabIndex={0} className="ac-selrow" onClick={() => setSel(i)} onKeyDown={(e) => e.key === 'Enter' && setSel(i)}>
                    <span style={{ width: 28, height: 28, minWidth: 28, borderRadius: '50%', background: 'var(--efkt-offwhite)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600 }}>{i + 1}</span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text || 'Uten spørsmålstekst'}</div>
                      <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
                        {q.options.length} alternativer · {correct} riktig{q.multi ? ' · flervalg' : ''}
                      </div>
                    </div>
                    {correct === 0 ? <i className="ph ph-warning-circle" title="No correct answer marked" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden /> : null}
                    <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                      <button type="button" className="ac-mini" title="Move up" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><i className="ph ph-arrow-up" aria-hidden /></button>
                      <button type="button" className="ac-mini" title="Move down" aria-label="Move down" disabled={i === questions.length - 1} onClick={() => move(i, 1)}><i className="ph ph-arrow-down" aria-hidden /></button>
                      <button type="button" className="ac-mini" title="Duplicate" aria-label="Duplicate" onClick={() => append([{ text: q.text, multi: q.multi, options: q.options.map((o) => ({ ...o })), bankItemId: q.bankItemId }])}><i className="ph ph-copy" aria-hidden /></button>
                      <button
                        type="button"
                        className="ac-mini ac-mini--danger"
                        title="Delete"
                        aria-label="Delete"
                        onClick={() => {
                          setQuestions((qs) => qs.filter((_, j) => j !== i));
                          setSel(null);
                        }}
                      >
                        <i className="ph ph-trash" aria-hidden />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: 8 }}>
              <button
                type="button"
                className="ac-add"
                style={{ padding: 20 }}
                onClick={() => append([{ text: '', multi: false, options: [0, 1, 2, 3].map(() => ({ text: '', correct: false })) }])}
              >
                <i className="ph ph-plus" style={{ fontSize: 20 }} aria-hidden /> Nytt spørsmål
              </button>
              <button type="button" className="ac-add ac-add--outline" style={{ padding: 20 }} onClick={() => setBankOpen(true)}>
                <i className="ph ph-books" style={{ fontSize: 20 }} aria-hidden /> Hent fra banken
              </button>
              <button type="button" className="ac-add ac-add--outline" style={{ padding: 20 }} onClick={() => csvInput.current?.click()}>
                <i className="ph ph-file-csv" style={{ fontSize: 20 }} aria-hidden /> Importer CSV
              </button>
            </div>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              CSV-kolonner: <code style={{ fontSize: 14, wordBreak: 'break-all' }}>{CSV_HEADER},…</code> — samme format som i{' '}
              <Link href="/admin/question-bank" className="efkt-link">spørsmålsbanken</Link>. Kategori-kolonnen ignoreres her.
            </div>
            <input ref={csvInput} type="file" accept=".csv,text/csv" hidden onChange={(e) => importCsv(e.target.files?.[0])} />
          </div>
        </div>

        <div style={{ minWidth: 0 }}>
          {sq && sel !== null ? (
            <div style={{ ...card, gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 20, fontWeight: 600 }}>Question {sel + 1}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="ac-pill ac-pill--sm"
                    onClick={() => {
                      // Going back to single choice keeps only the first correct answer.
                      const first = sq.options.findIndex((o) => o.correct);
                      setQ(sel, { multi: !sq.multi, options: sq.multi ? sq.options.map((o, j) => ({ ...o, correct: j === first })) : sq.options });
                    }}
                  >
                    <i className="ph ph-list-checks" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden /> {sq.multi ? 'Flere riktige svar' : 'Ett riktig svar'}
                  </button>
                  <button type="button" className="ac-pill ac-pill--sm" title="Gjenbruk spørsmålet i andre quizer" disabled={inBank || pending} onClick={saveToBank}>
                    <i className="ph ph-bookmark-simple" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden /> {inBank ? 'Ligger i banken' : 'Lagre i banken'}
                  </button>
                </div>
              </div>

              <Textarea label="Spørsmål" placeholder="e.g. I hvilken rekkefølge fotograferes rommene?" value={sq.text} onChange={(e) => setQ(sel, { text: e.target.value })} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>Alternativer</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Click the circle to mark the correct answer.</div>
                {sq.options.map((o, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: o.correct ? 'var(--efkt-mint)' : 'var(--efkt-offwhite)', borderRadius: 20, transition: 'background 180ms cubic-bezier(0.4,0,0.2,1)' }}>
                    <button
                      type="button"
                      title="Mark as correct"
                      aria-label="Mark as correct"
                      aria-pressed={o.correct}
                      onClick={() => setQ(sel, { options: sq.options.map((x, k) => (sq.multi ? (k === j ? { ...x, correct: !x.correct } : x) : { ...x, correct: k === j })) })}
                      style={{ width: 32, height: 32, minWidth: 32, border: 'none', borderRadius: '50%', background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <i className={`ph-bold ph-${o.correct ? 'check-circle' : 'circle'}`} style={{ fontSize: 22, color: o.correct ? 'var(--efkt-green)' : 'var(--efkt-muted)' }} aria-hidden />
                    </button>
                    <input
                      value={o.text}
                      placeholder={`Alternativ ${j + 1}`}
                      onChange={(e) => setQ(sel, { options: sq.options.map((x, k) => (k === j ? { ...x, text: e.target.value } : x)) })}
                      style={{ minWidth: 0, flex: 1, border: 'none', background: 'transparent', fontFamily: 'var(--efkt-font)', fontSize: 16, fontWeight: 300, color: 'var(--text-body)', outline: 'none', padding: '8px 0' }}
                    />
                    <button
                      type="button"
                      title="Remove option"
                      aria-label="Remove option"
                      onClick={() => (sq.options.length <= 2 ? toast('A question needs at least two options', 'error') : setQ(sel, { options: sq.options.filter((_, k) => k !== j) }))}
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
                  onClick={() => (sq.options.length >= 6 ? toast('Six options is the maximum', 'error') : setQ(sel, { options: [...sq.options, { text: '', correct: false }] }))}
                >
                  <i className="ph ph-plus" style={{ fontSize: 16 }} aria-hidden /> Legg til alternativ
                </button>
                {!sq.options.some((o) => o.correct) ? (
                  <div style={{ display: 'flex', gap: 12, padding: 20, background: 'var(--efkt-blush)', borderRadius: 20 }}>
                    <i className="ph ph-warning-circle" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
                    <div style={{ minWidth: 0, flex: 1, fontSize: 14, fontWeight: 500, textWrap: 'pretty' }}>Mark at least one correct answer, or the question can never be passed.</div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
          {questions.length === 0 ? (
            <div style={{ padding: 48, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
              <i className="ph ph-list-checks" style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
              <div style={{ fontSize: 20, fontWeight: 600 }}>How the quiz gates the course</div>
              <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.6, textWrap: 'pretty' }}>
                The learner opens the linked module, then takes this quiz. Passing it marks both the module and the quiz complete, and unlocks the next module. Failing it keeps the module open for another attempt.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {bankOpen ? (
        <BankPicker
          bank={bank}
          already={new Set(questions.map((q) => q.bankItemId).filter((x): x is string => !!x))}
          onClose={() => setBankOpen(false)}
          onAdd={(items) => {
            append(items.map((b) => ({ text: b.text, multi: b.multi, options: b.options.map((o) => ({ ...o })), bankItemId: b.id })));
            setBankOpen(false);
            toast(`${items.length} spørsmål hentet fra banken`);
          }}
        />
      ) : null}
    </div>
  );
}
