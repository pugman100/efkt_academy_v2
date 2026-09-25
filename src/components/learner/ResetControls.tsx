'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { resetCourse, resetModule } from '@/app/(learner)/courses/[id]/actions';

export function ResetModuleButton({ courseId, moduleId, title, isLast, passed }: { courseId: string; moduleId: string; title: string; isLast: boolean; passed: boolean }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const label = passed ? 'Ta modulen om igjen' : 'Nullstill';
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={pending}
      className="lr-reset"
      onClick={() =>
        start(async () => {
          const res = await resetModule(courseId, moduleId);
          if (!res.ok) return toast(res.error, 'error');
          toast(isLast ? `«${title}» er nullstilt` : `«${title}» og modulene etter er nullstilt`);
          router.refresh();
        })
      }
      style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, border: 'none', background: 'var(--efkt-offwhite)', cursor: 'pointer', color: 'var(--efkt-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 18 }} aria-hidden />
    </button>
  );
}

export function ResetCourse({ courseId, title, moduleCount }: { courseId: string; title: string; moduleCount: number }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <div style={{ marginTop: 20, padding: 24, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <i className="ph ph-arrow-counter-clockwise" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
      <div style={{ minWidth: 0, flex: '1 1 240px', fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
        Vil du ta hele kurset om igjen? Du kan også nullstille én enkelt modul med knappen til høyre i hver rad.
      </div>
      <Button variant="secondary" onClick={() => setOpen(true)}>Nullstill kurset</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        width={480}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Avbryt</Button>
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await resetCourse(courseId);
                  if (!res.ok) return toast(res.error, 'error');
                  setOpen(false);
                  toast(`Fremdriften i «${title}» er nullstilt`);
                  router.refresh();
                })
              }
            >
              Nullstill kurset
            </Button>
          </>
        }
      >
        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Nullstille kurset?</h3>
        <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Alle {moduleCount} moduler settes til ikke startet. Quizresultatene dine slettes, og du starter kurset forfra.
        </div>
      </Dialog>
    </div>
  );
}
