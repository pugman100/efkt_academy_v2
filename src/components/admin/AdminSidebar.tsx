'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Logo } from '@/components/ui/Logo';
import { setScope } from '@/app/(admin)/admin/actions';
import type { Scope } from '@/lib/labels';

const NAV = [
  { label: 'Courses', icon: 'graduation-cap', href: '/admin/courses' },
  { label: 'Categories', icon: 'squares-four', href: '/admin/categories' },
  { label: 'Question bank', icon: 'list-checks', href: '/admin/question-bank' },
  { label: 'Users', icon: 'users-three', href: '/admin/users' },
  { label: 'Groups', icon: 'users-four', href: '/admin/groups' },
  { label: 'Bulk assign', icon: 'stack', href: '/admin/bulk-assign' },
  { label: 'Invitations', icon: 'envelope-simple', href: '/admin/invitations' },
  { label: 'Completion', icon: 'chart-line-up', href: '/admin/completion' },
  { label: 'News', icon: 'newspaper', href: '/admin/news' },
  { label: 'Teamleaders', icon: 'user-focus', href: '/admin/teamleaders' },
];

const COUNTRIES: { value: Scope; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Denmark', label: 'Denmark' },
  { value: 'Norway', label: 'Norway' },
];

export function AdminSidebar({ scope, user }: { scope: Scope; user: { name: string; initials: string; role: string } }) {
  const path = usePathname();
  const [pending, start] = useTransition();
  return (
    <aside className="efkt-admin__side">
      <Link href="/admin" aria-label="EFKT Academy admin" style={{ alignSelf: 'flex-start' }}>
        <Logo variant="white" width={120} />
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: pending ? 0.7 : 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', padding: '0 4px' }}>Country</div>
        <div className="efkt-country">
          {COUNTRIES.map((c) => (
            <button key={c.value} type="button" aria-pressed={scope === c.value} onClick={() => start(() => setScope(c.value))}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.6)', padding: '0 16px 12px' }}>Learning</div>
        {NAV.map((n) => {
          const on = path === n.href || path.startsWith(n.href + '/');
          return (
            <Link key={n.href} href={n.href} className="efkt-nav" aria-current={on ? 'page' : undefined}>
              <i className={`ph ph-${n.icon}`} style={on ? { color: 'var(--efkt-coral)' } : undefined} aria-hidden />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Link href="/" className="efkt-nav" style={{ fontSize: 14 }}>
          <i className="ph ph-house" aria-hidden /> Photographer Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'rgba(255,255,255,0.08)', borderRadius: 20 }}>
          <div style={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', background: 'var(--efkt-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'var(--efkt-navy)' }}>
            {user.initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--efkt-white)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>{user.role}</div>
          </div>
          <form action="/logout" method="post">
            <button type="submit" aria-label="Log out" title="Log out" style={{ border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 4 }}>
              <i className="ph ph-sign-out" style={{ fontSize: 20 }} aria-hidden />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
