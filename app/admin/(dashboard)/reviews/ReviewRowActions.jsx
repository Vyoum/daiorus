'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './reviews.module.css';

export default function ReviewRowActions({ reviewId, status }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const updateStatus = async (next) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      router.refresh();
    } catch (err) {
      alert(err.message || 'Could not update review');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (busy) return;
    if (!window.confirm('Delete this review permanently?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      router.refresh();
    } catch (err) {
      alert(err.message || 'Could not delete review');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.actions}>
      {status !== 'APPROVED' ? (
        <button
          type="button"
          className={styles.actionBtn}
          disabled={busy}
          onClick={() => updateStatus('APPROVED')}
        >
          Approve
        </button>
      ) : null}
      {status !== 'HIDDEN' ? (
        <button
          type="button"
          className={styles.actionBtn}
          disabled={busy}
          onClick={() => updateStatus('HIDDEN')}
        >
          Hide
        </button>
      ) : null}
      <button
        type="button"
        className={`${styles.actionBtn} ${styles.danger}`}
        disabled={busy}
        onClick={remove}
      >
        Delete
      </button>
    </div>
  );
}
