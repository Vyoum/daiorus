import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentAdmin } from '../../../lib/admin/auth';
import AdminLoginClient from './AdminLoginClient';

export const metadata = {
  title: 'Admin Sign In | DAIORUS',
};

export default async function AdminLoginRoute({ searchParams }) {
  try {
    const admin = await getCurrentAdmin();
    if (admin) {
      const params = await searchParams;
      const next = typeof params?.next === 'string' ? params.next : '/admin';
      const safeNext =
        next.startsWith('/admin') && !next.startsWith('/admin/login')
          ? next
          : '/admin';
      redirect(safeNext);
    }
  } catch {
    // DB unavailable — still show login
  }

  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            color: '#6b7280',
          }}
        >
          Loading…
        </div>
      }
    >
      <AdminLoginClient />
    </Suspense>
  );
}
