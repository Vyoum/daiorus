import './admin.css';

// Admin pages query Postgres at request time — never prerender during build.
export const dynamic = 'force-dynamic';

export default function AdminRootLayout({ children }) {
  return children;
}
