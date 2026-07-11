import { redirect } from 'next/navigation';
import SiteShell from '../../components/SiteShell';
import AccountShell from '../../components/AccountShell';
import { getSessionUser } from '../../lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }) {
  let session = null;
  try {
    session = await getSessionUser();
  } catch (err) {
    console.error('[account:layout]', err?.message || err);
  }

  if (!session?.authUser) {
    redirect('/?login=1');
  }

  const profile = {
    id: session.dbUser?.id || null,
    email: session.dbUser?.email || session.authUser.email,
    name:
      session.dbUser?.name ||
      session.authUser.user_metadata?.full_name ||
      session.authUser.user_metadata?.name ||
      '',
    phone: session.dbUser?.phone || '',
    avatarUrl:
      session.authUser.user_metadata?.avatar_url ||
      session.authUser.user_metadata?.picture ||
      null,
  };

  return (
    <SiteShell showNewsletter={false}>
      <AccountShell profile={profile}>{children}</AccountShell>
    </SiteShell>
  );
}
