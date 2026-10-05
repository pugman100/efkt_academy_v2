import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { portfolioImagePath } from '@/lib/portfolio';
import { Logo } from '@/components/ui/Logo';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import '@/components/portfolio/portfolio.css';

// Public page: anyone with the link. Kept out of search engines.
export const dynamic = 'force-dynamic';

async function load(token: string) {
  if (!/^[a-z0-9]{16,64}$/.test(token)) return null;
  return db.user.findFirst({
    where: { portfolioToken: token, status: 'ACTIVE' },
    select: { name: true, portfolio: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }], select: { id: true, width: true, height: true } } },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const user = await load((await params).token);
  return { title: user ? `Portfolio: ${user.name}` : 'Portfolio', robots: { index: false, follow: false } };
}

export default async function PortfolioPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const user = await load(token);
  if (!user) notFound();
  const images = user.portfolio.map((p) => ({ src: portfolioImagePath(token, p.id), width: p.width, height: p.height }));

  return (
    <main className="pf-page">
      <header className="pf-head">
        <Logo variant="white" width={88} />
        <h1 className="pf-title">
          Portfolio: <span style={{ fontWeight: 800 }}>{user.name}</span>
        </h1>
      </header>
      {images.length ? (
        <PortfolioGallery name={user.name} images={images} />
      ) : (
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 300 }}>No images yet.</p>
      )}
    </main>
  );
}
