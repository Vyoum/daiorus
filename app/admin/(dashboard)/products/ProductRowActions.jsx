'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import styles from './products.module.css';

export default function ProductRowActions({ productId, productName }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (deleting) return;
    const confirmed = window.confirm(
      `Delete “${productName}”? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not delete product');
      router.refresh();
    } catch (err) {
      window.alert(err.message || 'Could not delete product');
      setDeleting(false);
    }
  };

  return (
    <div className={styles.rowActions}>
      <Link
        href={`/admin/products/${productId}/edit`}
        className={styles.editBtn}
        aria-label={`Edit ${productName}`}
      >
        <Pencil size={14} />
        Edit
      </Link>
      <button
        type="button"
        className={styles.deleteBtn}
        onClick={handleDelete}
        disabled={deleting}
        aria-label={`Delete ${productName}`}
      >
        <Trash2 size={14} />
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
    </div>
  );
}
