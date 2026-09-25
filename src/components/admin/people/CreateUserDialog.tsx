'use client';

import { useEffect, useState, useTransition } from 'react';
import type { Role } from '@prisma/client';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { ROLE_LABEL, ROLES, USER_COUNTRIES } from '@/lib/labels';
// Mirrors PASSWORD_MIN in @/lib/password (not imported: it pulls bcrypt into the client bundle).
const PASSWORD_MIN = 8;
import { createUser, generatePassword } from '@/app/(admin)/admin/users/actions';
import { MUTED, PickPill } from './bits';
import type { GroupOption, RegionOption } from './types';

type Country = 'Denmark' | 'Norway';
type Form = { name: string; email: string; jobTitle: string; country: Country; regionId: string; role: Role; groupIds: string[]; password: string; show: boolean };
type Created = { id: string; name: string; email: string; password: string; role: Role; country: Country; groups: string };

const EMPTY: Form = { name: '', email: '', jobTitle: '', country: 'Norway', regionId: '', role: 'LEARNER', groupIds: [], password: '', show: true };

/** "ola nordmann" → "ola.nordmann" (strips accents, maps æøå). */
function emailLocal(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/ø/g, 'o').replace(/æ/g, 'ae').replace(/å/g, 'a')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/\s+/).filter(Boolean).join('.');
}

export function CreateUserDialog({ groups, regions, onClose, onOpenUser }: { groups: GroupOption[]; regions: RegionOption[]; onClose: () => void; onOpenUser: (id: string) => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [f, setF] = useState<Form>(EMPTY);
  const [created, setCreated] = useState<Created | null>(null);
  const set = (patch: Partial<Form>) => setF((prev) => ({ ...prev, ...patch }));

  const newPassword = () => start(async () => set({ password: await generatePassword(), show: true }));
  useEffect(newPassword, []);

  const setName = (name: string) => {
    // Keep suggesting name@efkt.com until the admin types their own address.
    const prevAuto = emailLocal(f.name) ? emailLocal(f.name) + '@efkt.com' : '';
    const local = emailLocal(name);
    set({ name, email: !f.email || f.email === prevAuto ? (local ? local + '@efkt.com' : '') : f.email });
  };

  const pwOk = f.password.length >= PASSWORD_MIN;

  const submit = () =>
    start(async () => {
      const r = await createUser({
        name: f.name, email: f.email, jobTitle: f.jobTitle, country: f.country, regionId: f.regionId || null,
        role: f.role, groupIds: f.groupIds, password: f.password,
      });
      if (!r.ok) return toast(r.error, 'error');
      setCreated({
        id: r.id, name: f.name.trim(), email: f.email.trim().toLowerCase(), password: f.password, role: f.role, country: f.country,
        groups: groups.filter((g) => f.groupIds.includes(g.id)).map((g) => g.name).join(', ') || 'Ingen grupper',
      });
    });

  const copy = async () => {
    if (!created) return;
    const txt = `EFKT Academy\nE-post: ${created.email}\nPassord: ${created.password}\nLogg inn: ${window.location.origin}/login`;
    try {
      await navigator.clipboard.writeText(txt);
      toast('Innloggingen er kopiert');
    } catch {
      toast('Kunne ikke kopiere — marker teksten manuelt', 'error');
    }
  };

  const another = () => {
    setCreated(null);
    setF(EMPTY);
    newPassword();
  };

  return (
    <Dialog open onClose={onClose} width={600} eyebrow="Uten e-postutsending" title="Create user">
      {created ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, fontWeight: 600 }}>
            <i className="ph-fill ph-check-circle" style={{ fontSize: 24, color: 'var(--efkt-green)' }} aria-hidden />
            {created.name} er opprettet
          </div>
          <div style={{ padding: 24, border: '1px dashed var(--border-dashed)', borderRadius: 20, background: 'var(--efkt-offwhite)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Innlogging å gi til brukeren</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '8px 20px', fontSize: 16 }}>
              <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>E-post</span>
              <span style={{ fontWeight: 600, wordBreak: 'break-all' }}>{created.email}</span>
              <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>Passord</span>
              <span style={{ fontWeight: 600, fontFamily: 'ui-monospace,Menlo,monospace', wordBreak: 'break-all' }}>{created.password}</span>
              <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>Rolle</span>
              <span style={{ fontWeight: 300 }}>{ROLE_LABEL[created.role]} · {created.country}</span>
              <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>Grupper</span>
              <span style={{ fontWeight: 300 }}>{created.groups}</span>
            </div>
          </div>
          <div style={{ ...MUTED, textWrap: 'pretty' }}>Passordet vises bare nå. Brukeren kan bytte det selv via «Glemt passord?» når e-post er koblet opp.</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="tertiary" onClick={another}>Opprett en til</Button>
            <Button variant="secondary" iconRight="copy" onClick={copy}>Kopier innlogging</Button>
            <Button iconRight="arrow-right" onClick={() => onOpenUser(created.id)}>Åpne brukeren</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ padding: '16px 20px', background: 'var(--efkt-offwhite)', borderRadius: 16, ...MUTED, textWrap: 'pretty' }}>
            Kontoen er aktiv med en gang. Det sendes ingen e-post — du gir e-post og passord til brukeren selv.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap: 16 }}>
            <Input label="Navn" placeholder="Fornavn Etternavn" value={f.name} onChange={(e) => setName(e.target.value)} autoFocus />
            <Input label="E-post" placeholder="navn@efkt.com" type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} />
            <Input label="Stilling" value={f.jobTitle} onChange={(e) => set({ jobTitle: e.target.value })} />
            <Select label="Land" options={USER_COUNTRIES} value={f.country} onChange={(e) => set({ country: e.target.value as Country, regionId: '' })} />
            <Select
              label="Region"
              options={[{ value: '', label: 'Ingen region' }, ...regions.filter((r) => r.country === f.country).map((r) => ({ value: r.id, label: r.name }))]}
              value={f.regionId}
              onChange={(e) => set({ regionId: e.target.value })}
            />
            <Select label="Rolle" options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))} value={f.role} onChange={(e) => set({ role: e.target.value as Role })} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Grupper</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {groups.map((g) => {
                const on = f.groupIds.includes(g.id);
                return (
                  <PickPill key={g.id} on={on} onClick={() => set({ groupIds: on ? f.groupIds.filter((x) => x !== g.id) : [...f.groupIds, g.id] })}>
                    {g.name}
                  </PickPill>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input
              label="Passord"
              type={f.show ? 'text' : 'password'}
              value={f.password}
              autoComplete="new-password"
              onChange={(e) => set({ password: e.target.value })}
              hint={pwOk ? 'Minst 8 tegn · du gir passordet til brukeren selv' : undefined}
              error={pwOk || !f.password ? undefined : 'Passordet må ha minst 8 tegn'}
            />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button variant="secondary" iconRight="arrows-clockwise" onClick={newPassword} disabled={pending}>Lag nytt passord</Button>
              <Button variant="tertiary" onClick={() => set({ show: !f.show })}>{f.show ? 'Skjul' : 'Vis'}</Button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={onClose}>Avbryt</Button>
            <Button iconRight="check" onClick={submit} disabled={pending || !pwOk || !f.name.trim() || !f.email.trim()}>Opprett bruker</Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
