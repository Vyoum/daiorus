import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/admin/auth';

export async function GET() {
  const auth = await requireAdminApi({ allowBootstrap: true });
  if (auth.error) return auth.error;

  const { dbUser, bootstrap } = auth.admin;
  return NextResponse.json({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role,
    bootstrap: Boolean(bootstrap),
  });
}
