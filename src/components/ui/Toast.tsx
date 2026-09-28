'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

const ToastContext = createContext<(msg: string, tone?: 'ok' | 'error') => void>(() => {});

/** `const toast = useToast(); toast('Saved')` — bottom-centre pill, 2.6s. */
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((text: string, tone: 'ok' | 'error' = 'ok') => {
    setMsg({ text, tone });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg ? (
        <div
          role="status"
          style={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12,
            padding: '20px 28px', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 25,
            boxShadow: '0 8px 32px rgba(12,14,57,0.10)', fontSize: 16, fontWeight: 500, zIndex: 90, maxWidth: 'calc(100vw - 32px)',
          }}
        >
          <span style={{ width: 8, height: 8, minWidth: 8, borderRadius: '50%', background: msg.tone === 'ok' ? 'var(--efkt-green)' : 'var(--efkt-coral)' }} />
          {msg.text}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
