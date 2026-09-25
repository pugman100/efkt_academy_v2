'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { Country } from '@prisma/client';
import { Button, Checkbox, Dialog, Input, Select, Textarea, useToast } from '@/components/ui';
import { createCourse } from '@/app/(admin)/admin/courses/actions';

const COUNTRY_OPTIONS = [
  { value: 'Both', label: 'Both' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Norway', label: 'Norway' },
];

export function NewCourseDialog({
  open,
  onClose,
  categories,
  defaultCountry,
}: {
  open: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
  defaultCountry: Country;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [picked, setPicked] = useState<string[]>(categories[0] ? [categories[0].id] : []);
  const [country, setCountry] = useState<Country>(defaultCountry);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  function submit() {
    start(async () => {
      const res = await createCourse({ title, description, categoryIds: picked, country: country as 'Both' | 'Denmark' | 'Norway' });
      if (!res.ok) return toast(res.error, 'error');
      toast('Course created as a draft');
      router.push(`/admin/courses/${res.id}`);
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="New course"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>Create course</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Course title" placeholder="e.g. Drone footage basics" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Kategorier</div>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>
              {picked.length ? (picked.length === 1 ? 'Én kategori valgt' : `${picked.length} kategorier valgt`) : 'Velg minst én kategori'}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 240, overflowY: 'auto', paddingRight: 4 }}>
            {categories.map((k) => (
              <Checkbox key={k.id} checked={picked.includes(k.id)} onChange={() => toggle(k.id)} label={k.name} />
            ))}
          </div>
        </div>
        <Select label="Country" options={COUNTRY_OPTIONS} value={country} onChange={(e) => setCountry(e.target.value as Country)} />
      </div>
    </Dialog>
  );
}
