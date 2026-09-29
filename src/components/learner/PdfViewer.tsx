'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

/**
 * Renders a PDF page by page with pdf.js, so it looks the same on every device
 * (mobile browsers can't show PDFs inside a frame). Pages are drawn as they scroll
 * into view, at the container's width.
 */
export function PdfViewer({ src, title }: { src: string; title: string }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let task: { destroy: () => Promise<void> } | null = null;
    (async () => {
      try {
        // Legacy build: supports older browsers (e.g. older iPads) that lack the newest JS features.
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
        if (cancelled) return;
        // The bucket doesn't expose Content-Range, so fetch the whole file rather than in ranges.
        const loading = pdfjs.getDocument({ url: src, disableRange: true });
        task = loading;
        const loaded = await loading.promise;
        if (!cancelled) setDoc(loaded);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [src]);

  if (error)
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 48, textAlign: 'center' }}>
        <i className="ph ph-file-pdf" style={{ fontSize: 40, color: 'var(--efkt-coral)' }} aria-hidden />
        <div style={{ fontSize: 20, fontWeight: 600 }}>PDF-en kunne ikke vises her</div>
        <a href={src} target="_blank" rel="noopener noreferrer" className="efkt-btn efkt-btn--primary">Åpne PDF-en <i className="ph ph-arrow-up-right" aria-hidden /></a>
      </div>
    );

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'var(--efkt-gray-100)' }}>
      <div ref={scroller} aria-label={title} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        {doc ? (
          Array.from({ length: doc.numPages }, (_, i) => <PdfPage key={i} doc={doc} number={i + 1} root={scroller} onVisible={setPage} />)
        ) : (
          <div style={{ margin: 'auto', fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Laster PDF …</div>
        )}
      </div>
      {doc ? (
        <div style={{ position: 'absolute', right: 16, bottom: 16, padding: '8px 14px', borderRadius: 25, background: 'rgba(12,14,57,0.75)', color: 'var(--efkt-white)', fontSize: 14, fontWeight: 500, pointerEvents: 'none' }}>
          Side {page} av {doc.numPages}
        </div>
      ) : null}
    </div>
  );
}

function PdfPage({ doc, number, root, onVisible }: { doc: PDFDocumentProxy; number: number; root: React.RefObject<HTMLDivElement | null>; onVisible: (n: number) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(1.294); // A4-ish until the page is measured
  const [near, setNear] = useState(number <= 2);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    // Draw pages shortly before they scroll into view; report the page in the middle of the view.
    const load = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { root: root.current, rootMargin: '600px 0px' });
    const seen = new IntersectionObserver(([e]) => e.isIntersecting && onVisible(number), { root: root.current, rootMargin: '-50% 0px -50% 0px' });
    load.observe(el);
    seen.observe(el);
    return () => {
      load.disconnect();
      seen.disconnect();
    };
  }, [root, number, onVisible]);

  useEffect(() => {
    if (!near) return;
    let task: { cancel: () => void } | null = null;
    let stop = false;
    (async () => {
      const page = await doc.getPage(number);
      if (stop || !canvas.current || !box.current) return;
      const base = page.getViewport({ scale: 1 });
      setRatio(base.height / base.width);
      const width = box.current.clientWidth;
      const viewport = page.getViewport({ scale: (width / base.width) * Math.min(window.devicePixelRatio || 1, 2) });
      canvas.current.width = viewport.width;
      canvas.current.height = viewport.height;
      const render = page.render({ canvas: canvas.current, viewport });
      task = render;
      await render.promise.catch(() => {});
    })();
    return () => {
      stop = true;
      task?.cancel();
    };
  }, [near, doc, number]);

  return (
    <div ref={box} style={{ width: '100%', maxWidth: 960, aspectRatio: `1 / ${ratio}`, background: 'var(--efkt-white)', borderRadius: 8, boxShadow: '0 4px 24px rgba(12,14,57,0.06)', overflow: 'hidden', flexShrink: 0 }}>
      <canvas ref={canvas} aria-label={`Side ${number}`} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
