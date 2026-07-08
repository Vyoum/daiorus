import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '../../../components/SiteShell';
import { LEGAL_PAGES } from '../../../lib/data';

const NAV = [
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'payment', label: 'Payment Information' },
  { slug: 'returns', label: 'Returns & Exchanges' },
];

export function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) return { title: 'Legal | DAIORUS' };
  return {
    title: `${page.title} | DAIORUS`,
    description: page.sections[0]?.body?.slice(0, 140),
  };
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) notFound();

  return (
    <SiteShell>
      <div className="legal-page">
        <nav className="legal-nav" aria-label="Legal pages">
          {NAV.map((item) => (
            <Link
              key={item.slug}
              href={`/legal/${item.slug}`}
              className={slug === item.slug ? 'active' : ''}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article className="legal-content">
          <h1>{page.title}</h1>
          {page.sections.map((section) => (
            <section key={section.heading} className="legal-section">
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </article>
      </div>
    </SiteShell>
  );
}
