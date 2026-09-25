import { getSession, requireUser } from '@/lib/auth';
import { fileUrl } from '@/lib/blocks';
import { ROLE_LABEL } from '@/lib/labels';
import { TopBar } from '@/components/learner/TopBar';
import './learner.css';

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const session = await getSession();
  const impersonating = !!session?.impersonatorId;

  return (
    <div className="lr-root" style={{ fontFamily: 'var(--efkt-font)', color: 'var(--text-body)', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'clip' }}>
      {impersonating ? (
        <div className="lr-x" style={{ background: 'var(--surface-dark)', paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
          <i className="ph ph-eye" style={{ fontSize: 20, color: 'var(--efkt-coral)' }} aria-hidden />
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--efkt-white)', minWidth: 0, flex: '1 1 240px' }}>
            Viewing EFKT Academy as {user.name} · {ROLE_LABEL[user.role]}
            {user.groups[0] ? ` · ${user.groups[0].name}` : ''}
          </div>
          <form method="post" action="/impersonate/stop" style={{ marginLeft: 'auto' }}>
            <button
              type="submit"
              className="lr-back"
              style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'none' }}
            >
              <i className="ph ph-sign-out" style={{ fontSize: 14 }} aria-hidden /> Back to admin
            </button>
          </form>
        </div>
      ) : null}
      <TopBar name={user.name} photo={fileUrl(user.photoId)} isAdmin={user.role === 'ADMIN' && !impersonating} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>{children}</main>
    </div>
  );
}
