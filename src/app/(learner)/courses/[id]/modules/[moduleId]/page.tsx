import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getSession, requireUser } from '@/lib/auth';
import { embedUrl, parseBlocks } from '@/lib/blocks';
import { Player } from '@/components/learner/Player';
import { linkedCourses, loadCourse, recordOpen } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Modul' };

export default async function ModulePlayer({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const { id, moduleId } = await params;
  const user = await requireUser();
  const before = await loadCourse(user, id);
  const item = before.progress.items.find((i) => i.module.id === moduleId);
  if (!item) notFound();
  // Locked modules are rejected server-side, not just hidden.
  if (item.state === 'locked') redirect(`/courses/${id}`);

  await recordOpen(user.id, item.module);
  const { course, progress, row } = await loadCourse(user, id);
  const it = progress.items[item.index];
  const m = it.module;
  const next = progress.items[it.index + 1];
  const blocks = m.source === 'BUILT' ? parseBlocks(m.blocks) : [];
  const session = await getSession();

  return (
    <Player
      key={m.id}
      courseId={course.id}
      courseTitle={course.title}
      module={{
        id: m.id,
        title: m.title,
        source: m.source,
        url: m.url,
        embed: embedUrl(m.url),
        blocks,
        minSeconds: m.minSeconds,
        quiz: m.quiz ? { questions: m.quiz._count.questions, passPercent: m.quiz.passPercent } : null,
      }}
      index={it.index}
      steps={progress.items.map((s) => ({ id: s.module.id, title: s.module.title, state: s.state }))}
      prevId={progress.items[it.index - 1]?.module.id ?? null}
      nextId={next && next.state !== 'locked' ? next.module.id : null}
      nextTitle={next?.module.title ?? null}
      passed={it.state === 'passed'}
      failed={it.state === 'failed'}
      dwellSeconds={row.get(m.id)?.dwellSeconds ?? 0}
      confirmed={row.get(m.id)?.confirmedAllSlides ?? false}
      courses={await linkedCourses(user, blocks)}
      impersonating={session?.impersonatorId ? user.name : null}
    />
  );
}
