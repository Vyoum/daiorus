'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginDrawer from '@/components/LoginDrawer';

function errorMessage(code) {
  if (code === 'forbidden') {
    return 'This account is signed in, but Access is Customer — not Admin. An existing admin can set your Access to Admin on Customers, then try again.';
  }
  if (code === 'config') {
    return 'Auth is not configured. Add Supabase environment variables and try again.';
  }
  return '';
}

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';
  const initialError = useMemo(
    () => errorMessage(searchParams.get('error')),
    [searchParams],
  );

  return (
    <div className="admin-login-page">
      <LoginDrawer
        open
        adminMode
        adminNextPath={nextPath}
        initialError={initialError}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
