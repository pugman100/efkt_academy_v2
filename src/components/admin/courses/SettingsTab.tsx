'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { Country, CourseStatus } from '@prisma/client';
import { Button, Checkbox, Dialog, ImageCropField, Input, Select, Switch, Textarea, useToast, type Crop } from '@/components/ui';
import { deleteCourse, setCoursePassPercent, setCourseStatus, updateCourse } from '@/app/(admin)/admin/courses/actions';

type CourseSettings = {
  id: string;
  title: string;
  description: string;
  country: Country;
  categoryIds: string[];
  thumbnailId: string | null;
  thumbX: number;
  thumbY: number;
  thumbScale: number;
  reference: boolean;
  icon: string;
  status: CourseStatus;
};

const COUNTRIES = ['Denmark', 'Norway', 'Both'];

/** Course settings. Every field saves on its own (blur for text, immediately for toggles). */
export function SettingsTab({
  course,
  categories,
  pass,
  quizCount,
}: {
  course: CourseSettings;
  categories: { id: string; name: string; count: number }[];
  pass: number;
  quizCount: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [, start] = useTransition();
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [passRaw, setPassRaw] = useState(String(pass));
  const [icon, setIcon] = useState(course.icon);
  const [crop, setCrop] = useState<Crop>({ imageId: course.thumbnailId, x: course.thumbX, y: course.thumbY, scale: course.thumbScale });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cropTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = (data: Parameters<typeof updateCourse>[1], msg = 'Saved') =>
    start(async () => {
      const res = await updateCourse(course.id, data);
      toast(res.ok ? msg : res.error, res.ok ? 'ok' : 'error');
    });

  // The cropper reports every drag step; save once the admin pauses.
  function changeCrop(next: Crop) {
    setCrop(next);
    if (cropTimer.current) clearTimeout(cropTimer.current);
    cropTimer.current = setTimeout(
      () => save({ thumbnailId: next.imageId, thumbX: next.x, thumbY: next.y, thumbScale: next.scale }, 'Thumbnail saved'),
      700,
    );
  }
  useEffect(() => () => { if (cropTimer.current) clearTimeout(cropTimer.current); }, []);

  function toggleCategory(id: string) {
    const has = course.categoryIds.includes(id);
    if (has && course.categoryIds.length === 1) return toast('Et kurs må ligge i minst én kategori', 'error');
    save({ categoryIds: has ? course.categoryIds.filter((x) => x !== id) : [...course.categoryIds, id] });
  }

  function commitPass() {
    const n = parseInt(passRaw, 10);
    if (!n || n === pass) return setPassRaw(String(pass));
    start(async () => {
      const res = await setCoursePassPercent(course.id, n);
      if (!res.ok) {
        setPassRaw(String(pass));
        return toast(res.error, 'error');
      }
      toast(`Pass score set to ${n}% on ${quizCount} ${quizCount === 1 ? 'quiz' : 'quizzes'}`);
    });
  }

  function remove() {
    start(async () => {
      const res = await deleteCourse(course.id);
      if (!res.ok) return toast(res.error, 'error');
      toast('Course deleted');
      router.push('/admin/courses');
    });
  }

  const catCount = course.categoryIds.length;

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>Thumbnail</div>
        <ImageCropField
          value={crop}
          onChange={changeCrop}
          height={300}
          overlay={
            <>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0) 30%, rgba(12,14,57,0.72) 100%)' }} />
              <div style={{ position: 'absolute', inset: 0, padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--efkt-white)', textWrap: 'pretty' }}>{title}</div>
              </div>
            </>
          }
          hint="Dra bildet for å flytte utsnittet. Samme bilde brukes på dashboardet, i kategorilisten og som toppbilde på kurssiden."
        />
      </div>

      <Input label="Course title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => title.trim() !== course.title && save({ title })} />
      <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => description.trim() !== course.description && save({ description })} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>Kategorier</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {categories.map((k) => (
            <div key={k.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <Checkbox checked={course.categoryIds.includes(k.id)} onChange={() => toggleCategory(k.id)} label={k.name} />
              <span style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{k.count} kurs</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          {catCount === 1
            ? 'Kurset ligger i én kategori. Legg til flere hvis det hører hjemme i mer enn én.'
            : `Kurset ligger i ${catCount} kategorier og når alle gruppene som har tilgang til dem.`}
        </div>
      </div>

      <Select
        label="Country"
        options={COUNTRIES}
        value={course.country}
        onChange={(e) => save({ country: e.target.value as 'Both' | 'Denmark' | 'Norway' })}
        hint="Which team sees this course. Both means Denmark and Norway."
      />
      <Input
        label="Quiz pass score"
        type="number"
        min={1}
        max={100}
        value={passRaw}
        disabled={!quizCount}
        onChange={(e) => setPassRaw(e.target.value)}
        onBlur={commitPass}
        hint={
          quizCount
            ? `Percentage of correct answers needed to complete a module. Applies to all ${quizCount} ${quizCount === 1 ? 'quiz' : 'quizzes'} in this course.`
            : 'Percentage of correct answers needed to complete a module. This course has no quizzes yet.'
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Switch checked={course.reference} onChange={() => save({ reference: !course.reference })} label="Reference material" />
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Reference material is shown in its own section on the dashboard, without progress or quizzes.
        </div>
        {course.reference ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
            <span style={{ width: 50, height: 50, minWidth: 50, borderRadius: 10, background: 'var(--efkt-offwhite)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ph ph-${icon || 'books'}`} style={{ fontSize: 26, color: 'var(--efkt-coral)' }} aria-hidden />
            </span>
            <Input
              label="Icon"
              placeholder="e.g. camera"
              value={icon}
              onChange={(e) => setIcon(e.target.value.trim().toLowerCase())}
              onBlur={() => icon !== course.icon && save({ icon })}
              style={{ flex: 1 }}
            />
          </div>
        ) : null}
        {course.reference ? (
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: -8 }}>
            A Phosphor icon name — browse them at phosphoricons.com.
          </div>
        ) : null}
      </div>

      <div style={{ height: 1, background: 'var(--border-default)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', maxWidth: 360, textWrap: 'pretty' }}>
          Deleting a course also deletes its modules, quizzes and everyone&rsquo;s progress. Archive it to hide it and keep the completion records.
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {course.status !== 'ARCHIVED' ? (
            <Button
              variant="ghost"
              onClick={() => start(async () => {
                const res = await setCourseStatus(course.id, 'ARCHIVED');
                toast(res.ok ? 'Course archived' : res.error, res.ok ? 'ok' : 'error');
              })}
            >
              Archive
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => setConfirmDelete(true)}>Delete course</Button>
        </div>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete course?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button onClick={remove}>Delete course</Button>
          </>
        }
      >
        <div style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, textWrap: 'pretty' }}>
          «{course.title}» and all its modules, quizzes and progress records are deleted permanently. This cannot be undone.
        </div>
      </Dialog>
    </div>
  );
}
