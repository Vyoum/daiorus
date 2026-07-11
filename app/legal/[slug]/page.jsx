import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteShell from '../../../components/SiteShell';
import { LEGAL_PAGES } from '../../../lib/data';

const NAV = [
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'returns', label: 'Return & Exchange' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms & Conditions' },
  { slug: 'payment', label: 'Payment Information' },
];

function firstText(page) {
  const section = page.sections?.[0];
  if (!section) return '';
  if (typeof section.body === 'string') return section.body;
  if (Array.isArray(section.body) && section.body[0]) return section.body[0];
  if (section.items?.[0]) return section.items[0];
  if (section.ordered?.[0]) return section.ordered[0];
  return '';
}

function Paragraphs({ text }) {
  if (!text) return null;
  const lines = Array.isArray(text) ? text : [text];
  return lines.map((line, index) => <p key={index}>{line}</p>);
}

export function generateStaticParams() {
  return Object.keys(LEGAL_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = LEGAL_PAGES[slug];
  if (!page) return { title: 'Legal | DAIORUS' };
  return {
    title: `${page.title} | DAIORUS`,
    description: firstText(page).slice(0, 140),
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
          <header className="legal-header">
            <span className="section-label">Policies</span>
            <h1>{page.title}</h1>
          </header>

          {page.sections.map((section) => (
            <section key={section.heading} className="legal-section">
              <h2>{section.heading}</h2>
              <Paragraphs text={section.body} />
              {section.items?.length > 0 && (
                <ul className="legal-list">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.ordered?.length > 0 && (
                <ol className="legal-list legal-list--ordered">
                  {section.ordered.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
              <Paragraphs text={section.after} />
              {section.note && <p className="legal-note">{section.note}</p>}
            </section>
          ))}
        </article>
      </div>
    </SiteShell>
  );
}
