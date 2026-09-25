'use client';

import Link from 'next/link';
import { useTransition, type ReactNode } from 'react';
import type { Role } from '@prisma/client';
import { Dialog, CloseButton } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Checkbox, Select } from '@/components/ui/Field';
import { useToast } from '@/components/ui/Toast';
import { COURSE_STATUS_LABEL, ROLE_LABEL, ROLES, USER_COUNTRIES } from '@/lib/labels';
import { impersonate, sendPasswordReset, setDirectCourse, setUserActive, setUserGroup, updateUser } from '@/app/(admin)/admin/users/actions';
import { EmptyNote, Initials, MUTED, ProgressLine, SECTION } from './bits';
import type { ActionResult, CourseLine, GroupOption, RegionOption, UserDetail } from './types';

export function UserDrawer({ user, groups, regions, onClose }: { user: UserDetail; groups: GroupOption[]; regions: RegionOption[]; onClose: () => void }) {
  const toast = useToast();
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<ActionResult>, ok: string) =>
    start(async () => {
      const r = await fn();
      toast(r.ok ? ok : r.error, r.ok ? 'ok' : 'error');
    });

  const memberOf = new Set(user.groupIds);
  const groupNames = groups.filter((g) => memberOf.has(g.id)).map((g) => g.name).join(', ') || 'No group';
  const regionName = regions.find((r) => r.id === user.regionId)?.name;
  const tracked = user.courses.filter((c) => !c.reference);
  const done = tracked.filter((c) => c.total > 0 && c.pct === 100).length;

  return (
    <Dialog open drawer onClose={onClose} style={{ opacity: pending ? 0.85 : 1, transition: 'opacity 180ms' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
        <Initials name={user.name} size={64} fontSize={20} bg="var(--efkt-mint)" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{user.name}</div>
            {!user.active ? <Badge tone="neutral">Deaktivert</Badge> : null}
          </div>
          <div style={{ ...MUTED, marginTop: 4, overflowWrap: 'anywhere' }}>
            {user.jobTitle ? `${user.jobTitle} · ` : ''}{user.email}
          </div>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 16 }}>
        <Tile label="Group" value={groupNames} sub={user.country + (regionName ? ` · ${regionName}` : '')} />
        <Tile label="Activity" value={user.last} sub={user.joined} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Select
          label="Role"
          options={ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
          value={user.role}
          disabled={user.isSelf || pending}
          hint={user.isSelf ? 'You cannot change your own role.' : undefined}
          onChange={(e) => {
            const role = e.target.value as Role;
            run(() => updateUser(user.id, { role }), `${user.name} er nå ${ROLE_LABEL[role].toLowerCase()}`);
          }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          <Select
            label="Country"
            options={USER_COUNTRIES}
            value={user.country}
            disabled={pending}
            onChange={(e) => {
              const country = e.target.value as 'Denmark' | 'Norway';
              run(() => updateUser(user.id, { country }), `${user.name} moved to ${country}`);
            }}
          />
          <Select
            label="Region"
            options={[{ value: '', label: 'No region' }, ...regions.filter((r) => r.country === user.country).map((r) => ({ value: r.id, label: r.name }))]}
            value={user.regionId ?? ''}
            disabled={pending}
            onChange={(e) => {
              const regionId = e.target.value || null;
              run(() => updateUser(user.id, { regionId }), 'Region saved');
            }}
          />
        </div>
      </div>

      <Section title="Groups" aside={`${user.groupIds.length} of ${groups.length}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groups.map((g) => {
            const on = memberOf.has(g.id);
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <Checkbox
                  checked={on}
                  disabled={pending}
                  label={g.name}
                  onChange={() => run(() => setUserGroup(user.id, g.id, !on), on ? `Removed from ${g.name}` : `Added to ${g.name}`)}
                />
                <span style={{ ...MUTED, whiteSpace: 'nowrap' }}>{g.inScope} in scope</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Courses">
        <div style={MUTED}>
          {tracked.length ? `${done} of ${tracked.length} assigned courses completed` : 'No courses assigned yet'}
        </div>
        {user.courses.length === 0 && user.hiddenDirect.length === 0 ? (
          <EmptyNote>Nothing assigned yet. Add this person to a group, or assign a course directly from the course page.</EmptyNote>
        ) : null}
        {user.courses.map((c) => (
          <CourseCard key={c.id} c={c} disabled={pending} onUnassign={() => run(() => setDirectCourse(user.id, c.id, false), `Direct assignment removed`)} />
        ))}
        {user.hiddenDirect.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 20, border: '1px dashed var(--border-dashed)', borderRadius: 20 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Link href={`/admin/courses/${c.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)', textDecoration: 'none' }}>{c.title}</Link>
              <div style={{ ...MUTED, marginTop: 4 }}>Assigned directly · {c.why}</div>
            </div>
            <UnassignButton disabled={pending} onClick={() => run(() => setDirectCourse(user.id, c.id, false), 'Direct assignment removed')} />
          </div>
        ))}
        {user.assignable.length ? (
          <Select
            label="Assign a course directly"
            options={[
              { value: '', label: 'Choose a course' },
              ...user.assignable.map((c) => ({ value: c.id, label: c.status === 'PUBLISHED' ? c.title : `${c.title} (${COURSE_STATUS_LABEL[c.status]})` })),
            ]}
            value=""
            disabled={pending}
            onChange={(e) => {
              const courseId = e.target.value;
              if (courseId) run(() => setDirectCourse(user.id, courseId, true), 'Course assigned');
            }}
          />
        ) : null}
      </Section>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <ActionCard
          icon="key"
          note={
            user.resetSent
              ? `Reset link sent ${user.resetSent}. Valid for 60 minutes — they set the password themselves; you never see it.`
              : `Sends a link to ${user.email}. Valid for 60 minutes, and signs them out of other devices once used.`
          }
        >
          <Button variant="secondary" disabled={pending || !user.active} onClick={() => run(() => sendPasswordReset(user.id), `Password reset sent to ${user.email}`)}>
            {user.resetSent ? 'Send again' : 'Send password reset'}
          </Button>
        </ActionCard>
        {!user.isSelf ? (
          <ActionCard
            icon="prohibit"
            note={
              user.active
                ? 'Sperrer innlogging og fjerner personen fra rapportene. Fullføringene beholdes.'
                : `${user.name} kan ikke logge inn. Fullføringer er bevart og kommer tilbake ved reaktivering.`
            }
          >
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => run(() => setUserActive(user.id, !user.active), user.active ? `${user.name} er deaktivert` : `${user.name} er reaktivert`)}
            >
              {user.active ? 'Deaktiver' : 'Reaktiver'}
            </Button>
          </ActionCard>
        ) : null}
        {user.canImpersonate ? (
          <Button iconRight="sign-in" disabled={pending} onClick={() =>
              start(async () => {
                // Redirects to the learner dashboard on success.
                const r = await impersonate(user.id);
                if (r && !r.ok) toast(r.error, 'error');
              })
            } style={{ alignSelf: 'flex-start' }}>
            Log in as {user.name}
          </Button>
        ) : null}
      </div>
    </Dialog>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 500 }}>{value}</div>
      <div style={{ ...MUTED, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Section({ title, aside, children }: { title: string; aside?: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
        <div style={SECTION}>{title}</div>
        {aside ? <div style={MUTED}>{aside}</div> : null}
      </div>
      {children}
    </div>
  );
}

function ActionCard({ icon, note, children }: { icon: string; note: string; children: ReactNode }) {
  return (
    <div style={{ padding: 20, background: 'var(--efkt-offwhite)', borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <i className={`ph ph-${icon}`} style={{ fontSize: 24, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ minWidth: 0, flex: 1, ...MUTED, textWrap: 'pretty' }}>{note}</div>
      </div>
      {children}
    </div>
  );
}

function UnassignButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button type="button" className="pp-softbtn" title="Remove direct assignment" aria-label="Remove direct assignment" onClick={onClick} disabled={disabled}>
      <i className="ph ph-x" style={{ fontSize: 16 }} aria-hidden />
    </button>
  );
}

function CourseCard({ c, onUnassign, disabled }: { c: CourseLine; onUnassign: () => void; disabled: boolean }) {
  const complete = c.total > 0 && c.pct === 100;
  const status = c.reference ? 'Reference' : complete ? 'Completed' : c.started ? 'In progress' : 'Not started';
  const tone = c.reference ? 'neutral' : complete ? 'mint' : c.started ? 'sand' : 'neutral';
  return (
    <div className="pp-hoverbg" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 20, border: '1px solid var(--border-default)', borderRadius: 20, background: 'var(--efkt-white)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={`/admin/courses/${c.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-body)', textDecoration: 'none' }}>{c.title}</Link>
          <div style={{ ...MUTED, marginTop: 4 }}>{c.via}</div>
        </div>
        <Badge tone={tone}>{status}</Badge>
        {c.direct ? <UnassignButton onClick={onUnassign} disabled={disabled} /> : null}
      </div>
      {!c.reference ? <ProgressLine label={c.pct + '%'} counter={`${c.passed} / ${c.total} modules`} pct={c.pct} done={complete} /> : null}
    </div>
  );
}
