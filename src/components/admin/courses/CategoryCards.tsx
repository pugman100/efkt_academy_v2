'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { CourseStatus } from '@prisma/client';
import { Badge, Button, Checkbox, Dialog, Input, Tag, Textarea, useToast } from '@/components/ui';
import { PageHeader } from '@/components/admin/PageHeader';
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE } from '@/lib/labels';
import { deleteCategory, saveCategory } from '@/app/(admin)/admin/categories/actions';
import './courses.css';

export type CategoryCard = {
  id: string;
  name: string;
  description: string;
  icon: string;
  groups: { id: string; name: string }[];
  reach: number;
  courses: { id: string; title: string; status: CourseStatus; alsoIn: string[] }[];
};
type GroupOption = { id: string; name: string; count: number };
type Form = { id: string | null; name: string; description: string; icon: string; groupIds: string[] };

const ICON_IDEAS = ['camera', 'paper-plane-tilt', 'video-camera', 'blueprint', 'megaphone', 'headset', 'buildings', 'books', 'lightbulb', 'shield-check'];

export function CategoryCards({ cards, groups, eyebrow }: { cards: CategoryCard[]; groups: GroupOption[]; eyebrow: string }) {
  const [form, setForm] = useState<Form | null>(null);

  return (
    <div className="efkt-page" style={{ gap: 0, paddingBottom: 64 }}>
      <PageHeader
        eyebrow={<span style={{ display: 'block', marginBottom: 4 }}>{eyebrow}</span>}
        thin="Course"
        fat="categories"
        actions={<Button iconRight="plus" onClick={() => setForm({ id: null, name: '', description: '', icon: '', groupIds: [] })}>New category</Button>}
      />
      <div style={{ paddingTop: 20, maxWidth: 720, fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        A group assigned to a category is enrolled in every course inside it, including courses added later.
      </div>

      <div style={{ paddingTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap: 20, alignItems: 'stretch' }}>
        {cards.map((k) => {
          const drafts = k.courses.filter((c) => c.status === 'DRAFT').length;
          return (
            <div key={k.id} style={{ height: '100%', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: '0 4px 24px rgba(12,14,57,0.06)', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <i className={`ph ph-${k.icon}`} style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{k.name}</div>
                  <div style={{ minHeight: 44, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4, textWrap: 'pretty' }}>{k.description}</div>
                </div>
                <button
                  type="button"
                  className="ac-sq"
                  title="Edit category"
                  aria-label={`Edit ${k.name}`}
                  onClick={() => setForm({ id: k.id, name: k.name, description: k.description, icon: k.icon, groupIds: k.groups.map((g) => g.id) })}
                >
                  <i className="ph ph-pencil-simple" aria-hidden />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 14 }}>
                <span style={{ fontWeight: 600 }}>{k.courses.length} {k.courses.length === 1 ? 'course' : 'courses'}</span>
                <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>{drafts ? `${drafts} draft` : 'All published'}</span>
                <span style={{ fontWeight: 300, color: 'var(--text-muted)' }}>{k.groups.length ? `${k.reach} learners reached` : 'No groups assigned'}</span>
              </div>

              <div style={{ height: 1, background: 'var(--border-default)' }} />

              <div style={{ minHeight: 88, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Groups with access</div>
                {k.groups.length === 0 ? (
                  <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Nobody yet. Courses here reach only their own assignees.</div>
                ) : null}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {k.groups.map((g) => <Tag key={g.id}>{g.name}</Tag>)}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Courses</div>
                {k.courses.length === 0 ? <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>No courses in this category yet.</div> : null}
                <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
                  {k.courses.map((c) => (
                    <Link key={c.id} href={`/admin/courses/${c.id}`} className="ac-listbtn">
                      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span>{c.title}</span>
                        {c.alsoIn.length ? <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Også i {c.alsoIn.join(', ')}</span> : null}
                      </span>
                      <Badge tone={COURSE_STATUS_TONE[c.status]}>{COURSE_STATUS_LABEL[c.status]}</Badge>
                      <i className="ph ph-arrow-up-right" style={{ fontSize: 16, color: 'var(--efkt-coral)' }} aria-hidden />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {form ? <CategoryDialog initial={form} groups={groups} courseCount={cards.find((k) => k.id === form.id)?.courses.length ?? 0} onClose={() => setForm(null)} /> : null}
    </div>
  );
}

function CategoryDialog({ initial, groups, courseCount, onClose }: { initial: Form; groups: GroupOption[]; courseCount: number; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();
  const [f, setF] = useState(initial);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (patch: Partial<Form>) => setF((x) => ({ ...x, ...patch }));

  const submit = () =>
    start(async () => {
      const res = await saveCategory(f.id, { name: f.name, description: f.description, icon: f.icon, groupIds: f.groupIds });
      if (!res.ok) return toast(res.error, 'error');
      toast(f.id ? 'Category saved' : 'Category created');
      onClose();
    });

  const remove = () =>
    start(async () => {
      const res = await deleteCategory(f.id!);
      if (!res.ok) {
        setConfirmDelete(false);
        return toast(res.error, 'error');
      }
      toast('Category deleted');
      onClose();
    });

  if (confirmDelete)
    return (
      <Dialog
        open
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${initial.name}?`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button onClick={remove} disabled={pending}>Delete category</Button>
          </>
        }
      >
        <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, textWrap: 'pretty' }}>
          The {courseCount} {courseCount === 1 ? 'course' : 'courses'} in it stay, but groups lose the access they had through this category. Bank questions tagged with it become uncategorised.
        </div>
      </Dialog>
    );

  return (
    <Dialog
      open
      onClose={onClose}
      title={f.id ? 'Edit category' : 'New category'}
      footer={
        <>
          {f.id ? (
            <Button variant="danger" onClick={() => setConfirmDelete(true)} style={{ marginRight: 'auto' }}>Delete</Button>
          ) : null}
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={pending}>{f.id ? 'Save category' : 'Create category'}</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Input label="Category name" placeholder="e.g. Foto" value={f.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
        <Textarea label="Description" value={f.description} onChange={(e) => set({ description: e.target.value })} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <span style={{ width: 50, height: 50, minWidth: 50, borderRadius: 10, background: 'var(--efkt-offwhite)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ph ph-${f.icon || 'squares-four'}`} style={{ fontSize: 26, color: 'var(--efkt-coral)' }} aria-hidden />
            </span>
            <Input label="Icon" placeholder="squares-four" value={f.icon} onChange={(e) => set({ icon: e.target.value.trim().toLowerCase() })} style={{ flex: 1 }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ICON_IDEAS.map((ic) => (
              <button key={ic} type="button" className="ac-sq" title={ic} aria-label={ic} aria-pressed={f.icon === ic} onClick={() => set({ icon: ic })} style={f.icon === ic ? { background: 'var(--efkt-blush)' } : undefined}>
                <i className={`ph ph-${ic}`} aria-hidden />
              </button>
            ))}
          </div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)' }}>Any Phosphor icon name — browse them at phosphoricons.com.</div>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Groups with access</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {groups.map((g) => {
              const on = f.groupIds.includes(g.id);
              return (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <Checkbox checked={on} label={g.name} onChange={() => set({ groupIds: on ? f.groupIds.filter((x) => x !== g.id) : [...f.groupIds, g.id] })} />
                  <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{g.count} in scope</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
