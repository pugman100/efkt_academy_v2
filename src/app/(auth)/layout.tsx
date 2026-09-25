/* eslint-disable @next/next/no-img-element */
import { Logo } from '@/components/ui/Logo';

/** Split layout: interior photo on the left, form on the right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: 'var(--efkt-font)', color: 'var(--text-body)', minHeight: '100vh', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))' }}>
      <aside style={{ position: 'relative', minHeight: 680, overflow: 'hidden', background: 'var(--surface-dark)' }} className="efkt-auth-photo">
        <img src="/assets/photo-hero.webp" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(12,14,57,0.72) 0%, rgba(12,14,57,0.38) 40%, rgba(12,14,57,0.88) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', height: '100%', padding: 48, display: 'flex', flexDirection: 'column', gap: 32 }}>
          <Logo variant="white" width={120} />
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
            <h1 style={{ margin: 0, fontSize: 54, lineHeight: 1.05, letterSpacing: '-0.06em', fontWeight: 300, color: 'var(--efkt-white)' }}>
              Photographer <span style={{ fontWeight: 800 }}>Dashboard</span>
            </h1>
            <div style={{ fontSize: 20, fontWeight: 300, color: 'rgba(255,255,255,0.9)', textWrap: 'pretty' }}>
              Kurs, nyheter og alt du trenger for oppdragene dine.
            </div>
          </div>
        </div>
      </aside>
      <main style={{ padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }} className="efkt-auth-main">
        <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>{children}</div>
      </main>
      <style>{`@media (max-width: 960px) { .efkt-auth-photo { min-height: 320px !important; } .efkt-auth-photo h1 { font-size: 40px !important; } .efkt-auth-main { padding: 32px 16px !important; } }`}</style>
    </div>
  );
}
