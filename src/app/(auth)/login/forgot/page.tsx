import type { Metadata } from 'next';
import { ForgotForm } from '@/components/auth/ForgotForm';

export const metadata: Metadata = { title: 'Glemt passord' };

export default function ForgotPage() {
  return <ForgotForm />;
}
