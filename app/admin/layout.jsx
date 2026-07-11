import './admin.css';
import AdminShell from './AdminShell';

// Admin pages query Postgres at request time — never prerender during build.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
