'use client';

import { useTransition } from 'react';
import { Button, Select, Switch, useToast } from '@/components/ui';
import type { CourseReminderSettings } from '@/lib/course-reminders';
import { sendCourseRemindersNow, updateCourseReminderSettings } from './actions';

const NOT_STARTED = [3, 7, 14, 30].map((n) => ({ value: String(n), label: n === 7 ? 'After 1 week' : n === 14 ? 'After 2 weeks' : n === 30 ? 'After 30 days' : `After ${n} days` }));
const STALLED = [7, 14, 30].map((n) => ({ value: String(n), label: n === 7 ? 'After 1 week' : n === 14 ? 'After 2 weeks' : 'After 30 days' }));
const MAX = [1, 2, 3, 5].map((n) => ({ value: String(n), label: `${n} ${n === 1 ? 'reminder' : 'reminders'}` }));

const withCurrent = (opts: { value: string; label: string }[], n: number) =>
  opts.some((o) => o.value === String(n)) ? opts : [...opts, { value: String(n), label: `After ${n} days` }];

/** Automatic "not started / not finished" course reminders (Completion page). */
export function ReminderPanel({ settings, dueNow }: { settings: CourseReminderSettings; dueNow: { people: number; courses: number } }) {
  const toast = useToast();
  const [pending, start] = useTransition();

  const set = (patch: Partial<CourseReminderSettings>, msg = 'Reminder settings saved') =>
    start(async () => {
      const r = await updateCourseReminderSettings(patch);
      toast(r.ok ? msg : r.error, r.ok ? 'ok' : 'error');
    });

  const summary = settings.enabled
    ? `Learners get one email listing their waiting courses: when a course hasn't been started ${label(settings.notStartedDays)}, or a started course has had no progress ${span(settings.stalledDays)}. Up to ${settings.maxReminders} ${settings.maxReminders === 1 ? 'reminder' : 'reminders'} per course; progress starts the count over. Sent daily.`
    : 'Reminders are off. Turn them on to email learners about courses they haven’t started or finished.';

  return (
    <div style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <i className="ph ph-bell-ringing" style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Course reminders</div>
          <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>{summary}</div>
        </div>
        <Switch
          aria-label="Course reminders"
          checked={settings.enabled}
          disabled={pending}
          onChange={() => set({ enabled: !settings.enabled }, settings.enabled ? 'Course reminders off' : 'Course reminders on')}
        />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <Select label="Not started" options={withCurrent(NOT_STARTED, settings.notStartedDays)} value={String(settings.notStartedDays)} disabled={pending}
          onChange={(e) => set({ notStartedDays: Number(e.target.value) })} style={{ width: 200 }} />
        <Select label="Not finished, no progress" options={withCurrent(STALLED, settings.stalledDays)} value={String(settings.stalledDays)} disabled={pending}
          onChange={(e) => set({ stalledDays: Number(e.target.value) })} style={{ width: 220 }} />
        <Select label="Stop after" options={MAX} value={String(settings.maxReminders)} disabled={pending}
          onChange={(e) => set({ maxReminders: Number(e.target.value) })} style={{ width: 180 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20 }}>
        <div style={{ flex: 1, minWidth: 220, fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          {dueNow.people
            ? `${dueNow.people} ${dueNow.people === 1 ? 'person is' : 'people are'} due a reminder now (${dueNow.courses} ${dueNow.courses === 1 ? 'course' : 'courses'}).`
            : 'Nobody is due a reminder right now.'}
        </div>
        <Button
          variant="secondary"
          disabled={pending || !dueNow.people}
          onClick={() =>
            start(async () => {
              const r = await sendCourseRemindersNow();
              toast(r.ok ? `Reminder sent to ${r.people} ${r.people === 1 ? 'person' : 'people'}` : r.error, r.ok ? 'ok' : 'error');
            })
          }
        >
          Send now
        </Button>
      </div>
    </div>
  );
}

function span(days: number) {
  return days === 7 ? 'for a week' : days === 14 ? 'for two weeks' : `for ${days} days`;
}

function label(days: number) {
  return days === 7 ? 'after a week' : days === 14 ? 'after two weeks' : `after ${days} days`;
}
