import { requireAdmin } from '@/lib/auth';
import { getScope } from '@/lib/scope';
import { initials } from '@/lib/format';
import { ROLE_LABEL } from '@/lib/labels';
import { fileUrl } from '@/lib/blocks';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminUserMenu } from '@/components/admin/AdminUserMenu';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const scope = await getScope();
  return (
    <div className="efkt-admin" style={{ fontFamily: 'var(--efkt-font)', color: 'var(--text-body)' }}>
      <AdminSidebar scope={scope} user={{ name: user.name, initials: initials(user.name), role: ROLE_LABEL[user.role] }} />
      <main className="efkt-admin__main">
        <AdminUserMenu name={user.name} photo={fileUrl(user.photoId)} role={ROLE_LABEL[user.role]} />
        {children}
      </main>
    </div>
  );
}
