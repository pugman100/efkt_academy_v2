'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { enrol } from '@/app/(learner)/catalog/actions';

export function EnrolButton({ courseId }: { courseId: string }) {
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <Button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await enrol(courseId);
          if (!res.ok) return toast(res.error, 'error');
          toast('Påmeldt ' + res.title);
          router.push(`/courses/${courseId}`);
        })
      }
    >
      {pending ? 'Melder på…' : 'Meld meg på'}
    </Button>
  );
}
