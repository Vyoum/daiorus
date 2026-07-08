'use client';

import { useState } from 'react';
import SiteShell from '../../components/SiteShell';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <SiteShell>
      <div className="contact-page">
        <h1>Contact Us</h1>
        <p>
          Questions about an order, materials, or styling advice? We&apos;d love to
          hear from you.
        </p>

        {sent ? (
          <p className="newsletter-success" style={{ color: 'var(--gold)' }}>
            Thank you — we&apos;ll get back to you within 1–2 business days.
          </p>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" required placeholder="Your name" />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="subject">Subject</label>
              <select id="subject" name="subject" defaultValue="general">
                <option value="general">General enquiry</option>
                <option value="order">Order support</option>
                <option value="returns">Returns & exchanges</option>
                <option value="wholesale">Wholesale</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                required
                placeholder="How can we help?"
              />
            </div>
            <button type="submit" className="btn-dark" style={{ alignSelf: 'flex-start' }}>
              Send Message
            </button>
          </form>
        )}

        <div className="contact-details">
          <div className="contact-detail">
            <h4>Email</h4>
            <p>hello@daiorus.com</p>
          </div>
          <div className="contact-detail">
            <h4>Studio</h4>
            <p>Mumbai, India</p>
          </div>
          <div className="contact-detail">
            <h4>Hours</h4>
            <p>Mon–Sat, 10am–6pm IST</p>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
