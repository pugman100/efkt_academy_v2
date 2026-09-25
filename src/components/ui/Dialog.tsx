'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';

/**
 * Modal dialog (centered card) or side drawer (`drawer`), on a Deep Navy 45% backdrop.
 * Closes on backdrop click and Escape.
 */
export function Dialog({
  open,
  onClose,
  eyebrow,
  title,
  icon,
  subtitle,
  children,
  footer,
  width = 520,
  drawer,
  style,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title?: ReactNode;
  icon?: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
  drawer?: boolean;
  style?: CSSProperties;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(12,14,57,0.45)', zIndex: 70, display: 'flex',
        ...(drawer ? { justifyContent: 'flex-end' } : { alignItems: 'center', justifyContent: 'center', padding: 24 }),
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          width, maxWidth: '100%', overflowY: 'auto', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', gap: drawer ? 32 : 24,
          ...(drawer
            ? { height: '100%', padding: 40 }
            : { maxHeight: 'calc(100vh - 48px)', borderRadius: 20, boxShadow: '0 24px 64px rgba(12,14,57,0.18)', padding: 32 }),
          ...style,
        }}
      >
        {title || eyebrow ? (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {icon ? <i className={`ph ph-${icon}`} style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden /> : null}
            <div style={{ minWidth: 0, flex: 1 }}>
              {eyebrow ? <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--efkt-coral)', marginBottom: 8 }}>{eyebrow}</div> : null}
              {title ? <h3 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</h3> : null}
              {subtitle ? <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</div> : null}
            </div>
            <CloseButton onClick={onClose} />
          </div>
        ) : null}
        {children}
        {footer ? <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>{footer}</div> : null}
      </div>
    </div>
  );
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{ width: 40, height: 40, minWidth: 40, borderRadius: '50%', border: 'none', background: 'var(--efkt-offwhite)', cursor: 'pointer', color: 'var(--efkt-navy)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <i className="ph ph-x" style={{ fontSize: 16 }} aria-hidden />
    </button>
  );
}
