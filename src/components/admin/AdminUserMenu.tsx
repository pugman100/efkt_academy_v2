'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';

/** Top-right avatar menu in the admin panel, matching the learner top bar's menu. */
export function AdminUserMenu({ name, photo, role }: { name: string; photo: string | null; role: string }) {
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
    <header className="efkt-admin__top">
      <div ref={box} style={{ position: 'relative' }}>
        <button type="button" className="adm-me" title="Your account" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <Avatar name={name} src={photo} size={34} />
          <span className="adm-me__name">
            <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
            <span style={{ fontSize: 12, fontWeight: 300, color: 'var(--text-muted)' }}>{role}</span>
          </span>
          <i className="ph ph-caret-down" style={{ fontSize: 14, color: 'var(--text-muted)' }} aria-hidden />
        </button>
        {open ? (
          <div role="menu" className="adm-menu">
            <Link href="/" role="menuitem" className="adm-menuitem">
              <i className="ph ph-graduation-cap" aria-hidden /> Learner view
            </Link>
            <Link href="/profile" role="menuitem" className="adm-menuitem">
              <i className="ph ph-user-circle" aria-hidden /> My profile
            </Link>
            <Link href="/admin" role="menuitem" className="adm-menuitem" aria-current={path === '/admin' ? 'page' : undefined}>
              <i className="ph ph-gear-six" aria-hidden /> Admin overview
            </Link>
            <div style={{ height: 1, background: 'var(--border-default)', margin: '6px 8px' }} />
            <form method="post" action="/logout">
              <button type="submit" role="menuitem" className="adm-menuitem">
                <i className="ph ph-sign-out" aria-hidden /> Log out
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </header>
  );
}
