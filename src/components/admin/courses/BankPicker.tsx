'use client';

import { useState } from 'react';
import { Button, Dialog, Input, Select } from '@/components/ui';
import type { QuizOption } from '@/lib/blocks';
import './courses.css';

export type BankItem = { id: string; text: string; multi: boolean; options: QuizOption[]; category: string; uses: number };

/** "Spørsmålsbanken" dialog: pick bank questions to copy into the quiz. */
export function BankPicker({ bank, already, onClose, onAdd }: { bank: BankItem[]; already: Set<string>; onClose: () => void; onAdd: (items: BankItem[]) => void }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Alle kategorier');
  const [picks, setPicks] = useState<string[]>([]);

  const q = search.trim().toLowerCase();
  const shown = bank.filter((b) => (!q || b.text.toLowerCase().includes(q)) && (cat === 'Alle kategorier' || b.category === cat));
  const available = shown.filter((b) => !already.has(b.id));

  return (
    <Dialog
      open
      onClose={onClose}
      width={720}
      title="Spørsmålsbanken"
      subtitle="Gjenbruk spørsmål på tvers av kurs. Endringer i en quiz påvirker ikke banken."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Avbryt</Button>
          <Button disabled={!picks.length} onClick={() => onAdd(bank.filter((b) => picks.includes(b.id)))}>
            {picks.length ? `Legg til ${picks.length} spørsmål` : 'Velg spørsmål'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input icon="magnifying-glass" placeholder="Søk i spørsmål" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} aria-label="Søk i spørsmål" />
        <Select options={['Alle kategorier', ...new Set(bank.map((b) => b.category))]} value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: 220 }} aria-label="Kategori" />
        <button
          type="button"
          className="efkt-link"
          style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
          onClick={() => setPicks(picks.length ? [] : available.map((b) => b.id))}
        >
          {picks.length ? 'Fjern alle' : 'Velg alle i visningen'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', maxHeight: 440, paddingRight: 4 }}>
        {shown.map((b) => {
          const has = already.has(b.id);
          const picked = picks.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              className="ac-pick"
              disabled={has}
              aria-pressed={picked}
              onClick={() => setPicks(picked ? picks.filter((x) => x !== b.id) : [...picks, b.id])}
            >
              <i className={`ph-bold ph-${has ? 'check-circle' : picked ? 'check-square' : 'square'}`} style={{ fontSize: 22, color: picked ? 'var(--efkt-navy)' : 'var(--efkt-muted)', flexShrink: 0, marginTop: 2 }} aria-hidden />
              <span style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-body)', textWrap: 'pretty' }}>{b.text}</span>
                <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
                  {b.category} · {b.options.length} alternativer · {b.multi ? 'flervalg' : 'ett riktig'} · brukt i {b.uses} {b.uses === 1 ? 'quiz' : 'quizer'}
                </span>
                {has ? <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Allerede i denne quizen</span> : null}
              </span>
            </button>
          );
        })}
        {shown.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', fontSize: 16, fontWeight: 300, color: 'var(--text-muted)' }}>Ingen spørsmål matcher søket.</div>
        ) : null}
      </div>
    </Dialog>
  );
}
