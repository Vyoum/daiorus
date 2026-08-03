import Link from 'next/link';
import SiteShell from '../../components/SiteShell';
import { getAboutPage, getAboutProcess } from '../../lib/site-content';
import { DEFAULT_ABOUT, DEFAULT_PROCESS } from '../../lib/site-content-defaults';

export const metadata = {
  title: 'Our Story | DAIORUS',
  description: 'The story of Daiorus — fine jewellery crafted for everyday wear.',
};

export const revalidate = 60;

export default async function AboutPage() {
  const about = (await getAboutPage()) || DEFAULT_ABOUT;
  const processContent = (await getAboutProcess()) || DEFAULT_PROCESS;
  const values =
    Array.isArray(about.values) && about.values.length
      ? about.values
      : DEFAULT_ABOUT.values;
  const trustItems =
    Array.isArray(about.trustItems) && about.trustItems.length
      ? about.trustItems
      : DEFAULT_ABOUT.trustItems;
  const stats =
    Array.isArray(processContent.stats) && processContent.stats.length
      ? processContent.stats
      : DEFAULT_PROCESS.stats;

  return (
    <SiteShell>
      <section className="about-hero">
        <img src={about.heroImageUrl} alt={about.heroImageAlt} />
      </section>

      <section className="about-quote">
        <blockquote>&ldquo;{about.quote}&rdquo;</blockquote>
        <cite>{about.quoteCite}</cite>
      </section>

      <section className="about-split">
        <img src={about.beginningImageUrl} alt={about.beginningImageAlt} />
        <div className="about-split-copy">
          <span className="section-label">{about.beginningLabel}</span>
          <h2 className="section-title">{about.beginningTitle}</h2>
          <p className="vermeil-desc" style={{ marginTop: 20 }}>
            {about.beginningBody1}
          </p>
          {about.beginningBody2 ? (
            <p className="vermeil-desc">{about.beginningBody2}</p>
          ) : null}
        </div>
      </section>

      <section className="about-values">
        <span className="section-label">{about.valuesLabel}</span>
        <h2 className="section-title">{about.valuesTitle}</h2>
        <div className="about-values-grid">
          {values.map((item) => (
            <article key={`${item.num}-${item.title}`}>
              <p className="value-num">{item.num}</p>
              <h3 className="value-title">{item.title}</h3>
              <p className="value-desc">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-process">
        <div>
          <span className="section-label">{processContent.label}</span>
          <h2 className="section-title">
            {processContent.titleLine1}
            {processContent.titleLine2 ? (
              <>
                <br />
                {processContent.titleLine2}
              </>
            ) : null}
          </h2>
          <p className="vermeil-desc" style={{ marginTop: 20 }}>
            {processContent.body1}
          </p>
          {processContent.body2 ? (
            <p className="vermeil-desc">{processContent.body2}</p>
          ) : null}
          <div className="about-process-stats">
            {stats.map((stat) => (
              <div key={`${stat.label}-${stat.value}`} className="process-stat">
                <strong>{stat.label}</strong>
                <span>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="about-process-mosaic">
          <img src={processContent.imageUrl1} alt={processContent.imageAlt1} />
          <img src={processContent.imageUrl2} alt={processContent.imageAlt2} />
          <img src={processContent.imageUrl3} alt={processContent.imageAlt3} />
        </div>
      </section>

      <section className="about-cta">
        <h2 className="section-title">{about.ctaTitle}</h2>
        <p>{about.ctaBody}</p>
        <Link href={about.ctaUrl || '/shop'} className="btn-dark">
          {about.ctaLabel}
        </Link>
      </section>

      <section className="trust-bar">
        <div className="trust-grid">
          {trustItems.map((item) => (
            <div key={item.title} className="trust-item">
              <h4 className="trust-title">{item.title}</h4>
              <p className="trust-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
