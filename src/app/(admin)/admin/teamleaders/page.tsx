import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { getScope, scopeLine } from '@/lib/scope';
import { Heading } from '@/components/ui';
import { Eyebrow } from '@/components/admin/tracking/ui';
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
      <div>
        <Eyebrow>Access · {scopeLine(scope)}</Eyebrow>
        {/* "Team" thin + "leaders" bold, one word, as in the prototype. */}
        <Heading fat={<><span style={{ fontWeight: 300 }}>Team</span>leaders</>} />
        <div style={{ marginTop: 20, maxWidth: 720, fontSize: 16, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Regions are fixed. Replacing the person holding a region updates the contact details everywhere — the learner dashboard, the profile page and Kontakt oss.
        </div>
      </div>
      <TeamleaderCards
        regions={regions.map((r) => ({ id: r.id, region: r.name, country: r.country, name: r.leadName, email: r.leadEmail, mobile: r.leadMobile }))}
      />
    </div>
  );
}
