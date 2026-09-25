import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { PageHeader } from '@/components/admin/PageHeader';
import { TeamleaderCards } from './TeamleaderCards';

export const metadata: Metadata = { title: 'Teamleaders' };

export default async function TeamleadersPage() {
  await requireAdmin();
  const scope = await getScope();
  const regions = await db.region.findMany({
    where: scope === 'All' ? {} : { country: scope },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
  return (
    <div className="efkt-page">
      <PageHeader eyebrow={`Access · ${scopeLine(scope)}`} fat="Team" thinAfter="leaders" />
      <TeamleaderCards
        regions={regions.map((r) => ({ id: r.id, region: r.name, country: r.country, name: r.leadName, email: r.leadEmail, mobile: r.leadMobile }))}
      />
    </div>
  );
}
