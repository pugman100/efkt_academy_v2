'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageCropField, type Crop } from '@/components/ui/ImageCropField';
import { useToast } from '@/components/ui/Toast';
import { saveDashboardBanner } from '@/app/(admin)/admin/news/actions';

/** The learner dashboard's top banner. Saves automatically (debounced while dragging). */
export function DashboardBanner({ initial }: { initial: Crop }) {
  const toast = useToast();
  const [crop, setCrop] = useState(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  function change(next: Crop) {
    const replaced = next.imageId !== crop.imageId;
    setCrop(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveDashboardBanner(next);
      if (!res.ok) toast(res.error, 'error');
      else if (replaced) toast(next.imageId ? 'Dashboard banner updated' : 'Dashboard banner removed');
    }, replaced ? 0 : 700);
  }

  return (
    <div style={{ paddingTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 24, alignItems: 'center' }}>
      <ImageCropField value={crop} onChange={change} height={200} placeholder="Slipp et bredt interiørbilde her" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 20, fontWeight: 600 }}>Dashboard banner</div>
        <div style={{ fontSize: 14, fontWeight: 300, color: 'var(--text-muted)', textWrap: 'pretty' }}>
          Toppbildet alle fotografer ser på dashboardet. Dra bildet for å flytte utsnittet.
        </div>
      </div>
    </div>
  );
}
