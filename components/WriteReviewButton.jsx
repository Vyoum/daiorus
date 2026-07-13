'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './WriteReviewButton.module.css';

export default function WriteReviewButton({ productId, productName, existingRating }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (existingRating) {
    return (
      <span className={styles.done}>
        Reviewed · {existingRating}★
      </span>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit review');
      setOpen(false);
      setTitle('');
      setBody('');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not submit review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => setOpen(true)}>
        Write a review
      </button>

      {open ? (
        <div className={styles.overlay} role="presentation" onClick={() => setOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-title"
            onClick={(e) => e.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <h2 id="review-title" className={styles.modalTitle}>
                  Write a review
                </h2>
                <p className={styles.modalLead}>{productName}</p>
              </div>
              <button type="button" className={styles.close} onClick={() => setOpen(false)}>
                Close
              </button>
            </header>

            <form className={styles.form} onSubmit={submit}>
              <fieldset className={styles.ratingField}>
                <legend>Rating</legend>
                <div className={styles.ratingRow}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`${styles.starBtn} ${rating >= value ? styles.starActive : ''}`}
                      onClick={() => setRating(value)}
                      aria-label={`${value} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className={styles.field}>
                <span>Title (optional)</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What stood out?"
                  maxLength={120}
                />
              </label>

              <label className={styles.field}>
                <span>Your review</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share how the piece feels, looks, and wears…"
                  rows={4}
                  required
                  minLength={8}
                  maxLength={2000}
                />
              </label>

              {error ? <p className={styles.error}>{error}</p> : null}

              <div className={styles.footer}>
                <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submit} disabled={saving}>
                  {saving ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
