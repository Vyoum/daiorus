import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Account | DAIORUS',
};

export default function AccountIndexPage() {
  redirect('/account/profile');
}
