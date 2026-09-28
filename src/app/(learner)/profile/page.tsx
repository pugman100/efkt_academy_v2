import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { fileUrl } from '@/lib/blocks';
import { Avatar } from '@/components/ui/Avatar';
import { PasswordForm } from '@/components/learner/PasswordForm';
import { ProfileForm } from '@/components/learner/ProfileForm';
import { myCourses } from '@/components/learner/server';

export const metadata: Metadata = { title: 'Min profil' };

const MONTHS = ['januar', 'februar', 'mars', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'desember'];
const COUNTRY_NO = { Norway: 'Norge', Denmark: 'Danmark', Both: 'Norge og Danmark' } as const;

export default async function Profile() {
  const user = await requireUser();
  const tracked = (await myCourses(user)).filter((m) => !m.course.reference);
  const done = tracked.filter((m) => m.progress.complete).length;
  const modulesPassed = tracked.reduce((a, m) => a + m.progress.passed, 0);
  const groups = user.groups.map((g) => g.name);
  const stats = [
    { label: 'Fullførte kurs', value: String(done), sub: `av ${tracked.length} tildelte` },
    { label: 'Moduler bestått', value: String(modulesPassed), sub: 'med quiz bestått' },
    { label: 'Gruppene dine', value: String(groups.length), sub: groups.join(' · ') || '—' },
  ];

  return (
    <>
      <section className="lr-x" style={{ paddingTop: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <Avatar name={user.name} src={fileUrl(user.photoId)} size={96} style={{ fontSize: 32 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>
              Medlem siden {MONTHS[user.createdAt.getMonth()]} {user.createdAt.getFullYear()} · {COUNTRY_NO[user.country]}
            </div>
            <h1 className="lr-page-title" style={{ margin: 0, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.065em', fontWeight: 300 }}>
              Min <span style={{ fontWeight: 800 }}>profil</span>
            </h1>
          </div>
        </div>
      </section>

      <section className="lr-x" style={{ paddingTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--efkt-offwhite)', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12 }}>{s.label}</div>
            <div style={{ fontSize: 40, lineHeight: 1, fontWeight: 800, letterSpacing: '-0.045em' }}>{s.value}</div>
            <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 8, textWrap: 'pretty' }}>{s.sub}</div>
          </div>
        ))}
      </section>

      <section className="lr-x" style={{ paddingTop: 32, paddingBottom: 96, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 24, alignItems: 'start' }}>
        <ProfileForm
          initial={{ name: user.name, jobTitle: user.jobTitle, phone: user.phone, bio: user.bio, photoId: user.photoId }}
          email={user.email}
          region={user.region?.name ?? ''}
          teamleader={user.region?.leadName ?? ''}
          groups={groups}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          <PasswordForm />
        </div>
      </section>
    </>
  );
}
