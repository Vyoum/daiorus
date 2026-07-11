import Link from 'next/link';
import SiteShell from '../../components/SiteShell';

export const metadata = {
  title: 'Our Story | DAIORUS',
  description: 'The story of Daiorus — fine jewellery crafted for everyday wear.',
};

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="about-hero">
        <img src="/images/ui1/brand-story.jpg" alt="Daiorus studio story" />
      </section>

      <section className="about-quote">
        <blockquote>
          &ldquo;We believe that fine jewellery should be worn every day — not saved
          for special occasions.&rdquo;
        </blockquote>
        <cite>— Priya Malhotra, Founder of Daiorus</cite>
      </section>

      <section className="about-split">
        <img src="/images/ui1/coll-everyday.jpg" alt="Founding story of Daiorus" />
        <div className="about-split-copy">
          <span className="section-label">The Beginning</span>
          <h2 className="section-title">Born from a simple question</h2>
          <p className="vermeil-desc" style={{ marginTop: 20 }}>
            Daiorus began when our founder Priya asked a jeweller friend to make a
            delicate gold chain she could wear every day — not to a wedding, not to a
            dinner party, but just to a Tuesday. The friend laughed. &ldquo;Fine gold
            isn&apos;t for every day,&rdquo; he said.
          </p>
          <p className="vermeil-desc">
            That conversation changed everything. Priya spent the next two years
            sourcing certified goldsmiths who understood the new Indian woman —
            educated, ambitious, and done with the idea that beautiful things need to
            be saved.
          </p>
        </div>
      </section>

      <section className="about-values">
        <span className="section-label">What We Stand For</span>
        <h2 className="section-title">Our Values</h2>
        <div className="about-values-grid">
          <article>
            <p className="value-num">01</p>
            <h3 className="value-title">Craftsmanship</h3>
            <p className="value-desc">
              Every Daiorus piece passes through the hands of certified goldsmiths
              with decades of experience. We refuse to compromise on the quality of
              our finishes, closures, or stones.
            </p>
          </article>
          <article>
            <p className="value-num">02</p>
            <h3 className="value-title">Transparency</h3>
            <p className="value-desc">
              We tell you exactly what your jewellery is made of, where it comes from,
              and what it&apos;s worth. BIS Hallmarked gold on every piece. No
              surprises, no greenwashing.
            </p>
          </article>
          <article>
            <p className="value-num">03</p>
            <h3 className="value-title">Accessibility</h3>
            <p className="value-desc">
              Fine jewellery for women at every stage of life. Quality shouldn&apos;t
              be reserved for milestones. Wear it on a Wednesday. Wear it to the
              office. Wear it always.
            </p>
          </article>
        </div>
      </section>

      <section className="about-process">
        <div>
          <span className="section-label">The Process</span>
          <h2 className="section-title">
            BIS Hallmarked.
            <br />
            Made for Keeps.
          </h2>
          <p className="vermeil-desc" style={{ marginTop: 20 }}>
            Every Daiorus piece carries a Bureau of Indian Standards hallmark — the
            gold standard for gold purity in India. Our 18K gold meets BIS 916
            certification, and our 14K gold meets BIS 585.
          </p>
          <p className="vermeil-desc">
            We work with a small network of master goldsmiths in Jaipur and Mumbai who
            have been crafting fine jewellery for generations. No factories. No
            shortcuts.
          </p>
          <div className="about-process-stats">
            <div className="process-stat">
              <strong>18K Gold</strong>
              <span>BIS 916</span>
            </div>
            <div className="process-stat">
              <strong>14K Gold</strong>
              <span>BIS 585</span>
            </div>
            <div className="process-stat">
              <strong>Silver</strong>
              <span>925 Sterling</span>
            </div>
          </div>
        </div>
        <div className="about-process-mosaic">
          <img src="/images/ui1/prod-eclipse.jpg" alt="Gold earring detail" />
          <img src="/images/ui1/prod-coin.jpg" alt="Pendant detail" />
          <img src="/images/ui1/coll-fine-gold.jpg" alt="Fine gold craftsmanship" />
        </div>
      </section>

      <section className="about-cta">
        <h2 className="section-title">Start Your Collection</h2>
        <p>
          Every fine collection begins with a single piece you reach for without
          thinking.
        </p>
        <Link href="/shop" className="btn-dark">
          Shop the Collection
        </Link>
      </section>

      <section className="trust-bar">
        <div className="trust-grid">
          <div className="trust-item">
            <h4 className="trust-title">Free Shipping</h4>
            <p className="trust-desc">On all orders across India</p>
          </div>
          <div className="trust-item">
            <h4 className="trust-title">7-Day Returns</h4>
            <p className="trust-desc">Hassle-free exchanges</p>
          </div>
          <div className="trust-item">
            <h4 className="trust-title">BIS Hallmarked</h4>
            <p className="trust-desc">Certified authentic gold</p>
          </div>
          <div className="trust-item">
            <h4 className="trust-title">Gift Packaging</h4>
            <p className="trust-desc">Signature luxury box</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
