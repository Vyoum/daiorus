import { redirect } from 'next/navigation';
import AdminShell from '../AdminShell';
import { getSessionUser } from '../../../lib/admin/auth';

export default async function AdminDashboardLayout({ children }) {
  let admin = null;
  let sessionEmail = null;

  try {
    const session = await getSessionUser();
    sessionEmail = session.dbUser?.email || session.authUser?.email || null;
    if (session.dbUser?.role === 'ADMIN') {
      admin = { dbUser: session.dbUser, authUser: session.authUser };
    }
  } catch (err) {
    console.error('[admin:layout]', err?.message || err);
  }

  if (!admin) {
    const params = new URLSearchParams();
    if (sessionEmail) params.set('error', 'forbidden');
    const qs = params.toString();
    redirect(`/admin/login${qs ? `?${qs}` : ''}`);
  }

  return (
    <AdminShell
      adminName={admin.dbUser.name || 'Admin'}
      adminEmail={admin.dbUser.email}
    >
      {children}
    </AdminShell>
  );
}
