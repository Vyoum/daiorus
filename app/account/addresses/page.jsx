import { getSessionUser } from '../../../lib/admin/auth';
import { getAccountAddresses } from '../../../lib/account/addresses';
import AccountAddresses from '../../../components/AccountAddresses';

export const metadata = { title: 'Addresses | DAIORUS' };

export default async function AccountAddressesPage() {
  const session = await getSessionUser();
  const addresses = await getAccountAddresses(session.dbUser?.id || null);

  return <AccountAddresses initialAddresses={addresses} />;
}
