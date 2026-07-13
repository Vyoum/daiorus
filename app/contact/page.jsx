'use client';

import { useState } from 'react';
import SiteShell from '../../components/SiteShell';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../lib/social';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <SiteShell>
      <section className="contact-v2">
        <div className="contact-v2-inner">
          <div className="contact-v2-grid">
            <div className="contact-v2-main">
              <p className="contact-v2-eyebrow">Reach Us</p>
              <h1 className="contact-v2-title">Contact Us</h1>
              <p className="contact-v2-lead">
                We&apos;d love to hear from you. Our team responds within 24 hours, Monday to
                Saturday.
              </p>

              {sent ? (
                <p className="contact-v2-success">
                  Thank you — we&apos;ll get back to you within 24 hours.
                </p>
              ) : (
                <form className="contact-v2-form" onSubmit={handleSubmit}>
                  <div className="contact-v2-field">
                    <label htmlFor="name">Full Name</label>
                    <input id="name" name="name" type="text" required />
                  </div>

                  <div className="contact-v2-row">
                    <div className="contact-v2-field">
                      <label htmlFor="email">Email Address</label>
                      <input id="email" name="email" type="email" required />
                    </div>
                    <div className="contact-v2-field">
                      <label htmlFor="phone">
                        Phone Number<span className="contact-v2-optional">(optional)</span>
                      </label>
                      <input id="phone" name="phone" type="tel" />
                    </div>
                  </div>

                  <div className="contact-v2-field">
                    <label htmlFor="subject">Subject</label>
                    <select id="subject" name="subject" defaultValue="general" required>
                      <option value="general">General enquiry</option>
                      <option value="order">Order support</option>
                      <option value="returns">Returns &amp; exchanges</option>
                      <option value="product">Product availability</option>
                      <option value="wholesale">Wholesale</option>
                    </select>
                  </div>

                  <div className="contact-v2-field">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      placeholder="How can we help you?"
                      rows={5}
                    />
                  </div>

                  <button type="submit" className="contact-v2-submit">
                    Send Message
                  </button>
                </form>
              )}
            </div>

            <aside className="contact-v2-aside">
              <div className="contact-v2-hours">
                <p className="contact-v2-aside-label">Studio Hours</p>
                <div className="contact-v2-hour-row">
                  <span>Monday – Friday</span>
                  <span>10:00 – 18:00 IST</span>
                </div>
                <div className="contact-v2-hour-row">
                  <span>Saturday</span>
                  <span>10:00 – 14:00 IST</span>
                </div>
                <div className="contact-v2-hour-row">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>

              <div className="contact-v2-social-block">
                <p className="contact-v2-aside-label">Follow Us</p>
                <div className="contact-v2-socials">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-v2-social-btn"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                    {INSTAGRAM_HANDLE}
                  </a>
                  <a
                    href="https://facebook.com/daiorus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-v2-social-btn"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4V10c0-.6.4-1 1-1z" />
                    </svg>
                    Daiorus
                  </a>
                  <a
                    href="https://pinterest.com/daiorus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-v2-social-btn"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.3-.1-.8-.2-2 0-2.9.2-.8 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.5 1.9 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.8-4.2-4.3-4.2-2.9 0-4.6 2.2-4.6 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.1c0 .2-.2.2-.3.1-1.3-.6-2.1-2.5-2.1-4 0-3.3 2.4-6.3 6.8-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2.9-.9 2-1.3 2.7 1 .3 2 .5 3.1.5 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                    </svg>
                    Daiorus
                  </a>
                </div>
              </div>

              <div className="contact-v2-support">
                <p className="contact-v2-aside-label">Quick Support</p>
                <p className="contact-v2-support-text">
                  For quick queries about orders, returns, or product availability, reach us on
                  WhatsApp.
                </p>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-v2-whatsapp"
                >
                  <span className="contact-v2-whatsapp-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.2.1-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.7 2.5.8 3.4.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3 0-.1-.2-.2-.5-.3z" />
                      <path d="M12 2C6.5 2 2 6.4 2 11.9c0 1.8.5 3.5 1.4 5L2 22l5.3-1.4c1.4.8 3 .2 4.7.2 5.5 0 10-4.4 10-9.9S17.5 2 12 2zm0 18c-1.5 0-3-.4-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3C4.2 14.8 3.8 13.4 3.8 12 3.8 7.5 7.5 3.8 12 3.8S20.2 7.5 20.2 12 16.5 20 12 20z" />
                    </svg>
                  </span>
                  +91 98765 43210
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="contact-v2-trust" aria-label="Our promises">
        <div className="contact-v2-trust-inner">
          <div className="contact-v2-trust-item">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <h4>Free Shipping</h4>
            <p>On all orders across India</p>
          </div>
          <div className="contact-v2-trust-item">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
            <h4>7-Day Returns</h4>
            <p>Hassle-free exchanges</p>
          </div>
          <div className="contact-v2-trust-item">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h4>BIS Hallmarked</h4>
            <p>Certified authentic gold</p>
          </div>
          <div className="contact-v2-trust-item">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h4>Gift Packaging</h4>
            <p>Signature luxury box</p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
