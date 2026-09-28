'use client';

import { useState, useTransition } from 'react';
import type { Country } from '@prisma/client';
import { Button, Dialog, Input, useToast } from '@/components/ui';
import { EMPTY_STYLE, Initials, PlateButton } from '@/components/admin/tracking/ui';
import { initials } from '@/lib/format';
import { updateTeamleader } from './actions';

type Lead = { id: string; region: string; country: Country; name: string; email: string; mobile: string };

export function TeamleaderCards({ regions }: { regions: Lead[] }) {
  const toast = useToast();
  const [busy, start] = useTransition();
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState({ name: '', email: '', mobile: '' });

  const open = (l: Lead) => { setEditing(l); setForm({ name: l.name, email: l.email, mobile: l.mobile }); };
  const close = () => setEditing(null);

  function save() {
    if (!editing) return;
    if (!form.name.trim()) return toast('Give the region a teamleader name', 'error');
    const ed = editing;
    start(async () => {
      const r = await updateTeamleader({ regionId: ed.id, ...form });
      if (!r.ok) return toast(r.error, 'error');
      toast(`${ed.region} is now handled by ${form.name.trim()}`);
      close();
    });
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 20, alignItems: 'stretch' }}>
        {regions.map((l) => (
          <div key={l.id} style={{ height: '100%', boxSizing: 'border-box', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 4px 24px rgba(12,14,57,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <Initials text={initials(l.name || l.region)} size={48} fontSize={16} bg="var(--efkt-mint)" />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)' }}>{l.region}</div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4, textWrap: 'pretty' }}>{l.name || 'No teamleader'}</div>
                <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4 }}>{l.country}</div>
              </div>
              <PlateButton icon="pencil-simple" title="Change teamleader" aria-label={`Change teamleader for ${l.region}`} onClick={() => open(l)} />
            </div>

            <div style={{ height: 1, background: 'var(--border-default)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="ph ph-envelope-simple" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                {l.email ? (
                  <a href={`mailto:${l.email}`} className="efkt-link" style={{ fontWeight: 300 }}>{l.email}</a>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Ikke oppgitt</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="ph ph-phone" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
                <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>mob: {l.mobile || 'Ikke oppgitt'}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '16px 20px', background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              Vises for alle fotografer med region {l.region}.
            </div>
          </div>
        ))}
      </div>
      {regions.length === 0 ? <div style={EMPTY_STYLE}>No regions in this country scope.</div> : null}

      <Dialog
        open={!!editing}
        onClose={close}
        eyebrow={editing ? `${editing.region} · ${editing.country}` : undefined}
        title="Change teamleader"
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save teamleader'}</Button>
          </>
        }
      >
        {editing ? (
          <>
            <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
              Regionen beholdes som den er. {editing.name || 'Nåværende kontaktperson'} erstattes som kontaktperson for {editing.region}.
            </div>
            <Input label="Navn" placeholder="e.g. Nanna Hegaard Rødtnes" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="E-post" type="email" placeholder="XXX@efkt.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Mobil" placeholder="900 00 000" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} hint="Vises under Kontakt oss på dashboardet." />
          </>
        ) : null}
      </Dialog>
    </>
  );
}
