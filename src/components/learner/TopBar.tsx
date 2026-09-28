'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';

const TABS = [
  { href: '/', label: 'Mine kurs', match: (p: string) => p === '/' || p.startsWith('/courses') || p.startsWith('/news') },
  { href: '/catalog', label: 'Kurskatalog', match: (p: string) => p.startsWith('/catalog') },
];

/** Deep-navy learner top bar: logo, tabs, "Log in SPA" and the avatar menu. */
export function TopBar({ name, photo, isAdmin }: { name: string; photo: string | null; isAdmin: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <header className="lr-header">
      <Link href="/" aria-label="EFKT Academy" style={{ flexShrink: 0 }}>
        <Logo variant="white" width={110} />
      </Link>
      <nav style={{ display: 'flex', gap: 24, marginLeft: 12, flexShrink: 0 }}>
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className="lr-tab" aria-current={t.match(path) ? 'page' : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <a href="https://sp.efkt.com/" target="_blank" rel="noopener noreferrer" className="lr-spa">
          <i className="ph ph-sign-in" style={{ fontSize: 20 }} aria-hidden /> Log in SPA
        </a>
        <div ref={box} style={{ position: 'relative' }}>
          <button type="button" className="lr-me" title="Min profil" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <Avatar name={name} src={photo} size={34} />
            <span className="lr-me__name" style={{ fontSize: 14, fontWeight: 500, color: 'var(--efkt-white)', whiteSpace: 'nowrap' }}>{name}</span>
            <i className="ph ph-caret-down" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} aria-hidden />
          </button>
          {open ? (
            <div
              role="menu"
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 220, padding: 8, background: 'var(--surface-card)',
                borderRadius: 20, border: '1px solid var(--border-default)', boxShadow: '0 8px 32px rgba(12,14,57,0.10)', zIndex: 30,
              }}
            >
              <Link href="/profile" role="menuitem" className="lr-menuitem">
                <i className="ph ph-user-circle" aria-hidden /> Profil
              </Link>
              {isAdmin ? (
                <Link href="/admin" role="menuitem" className="lr-menuitem">
                  <i className="ph ph-gear-six" aria-hidden /> Admin
                </Link>
              ) : null}
              <div style={{ height: 1, background: 'var(--border-default)', margin: '6px 8px' }} />
              <form method="post" action="/logout">
                <button type="submit" role="menuitem" className="lr-menuitem">
                  <i className="ph ph-sign-out" aria-hidden /> Logg ut
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
