import type { Metadata } from 'next';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: { default: 'EFKT Academy', template: '%s · EFKT Academy' },
  description: 'Kurs, nyheter og alt du trenger for oppdragene dine.',
  icons: { icon: '/assets/logo/efkt-maerke.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
