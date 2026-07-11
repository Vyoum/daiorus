'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from './customers.module.css';

export default function RoleSelect({ userId, initialRole }) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole || 'CUSTOMER');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  const handleChange = (e) => {
    const nextRole = e.target.value;
    const previous = role;
    setRole(nextRole);
    setError('');

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: nextRole }),
        });
        const data = await res.json();
        if (!res.ok) {
          setRole(previous);
          setError(data.error || 'Could not update role');
          return;
        }
        router.refresh();
      } catch {
        setRole(previous);
        setError('Could not update role');
      }
    });
  };

  return (
    <div className={styles.roleControl} onClick={(e) => e.stopPropagation()}>
      <select
        className={`${styles.roleSelect} ${role === 'ADMIN' ? styles.roleAdmin : styles.roleCustomer}`}
        value={role}
        onChange={handleChange}
        disabled={pending}
        aria-label="User access role"
      >
        <option value="CUSTOMER">Customer</option>
        <option value="ADMIN">Admin</option>
      </select>
      {pending ? <span className={styles.roleSaving}>Saving…</span> : null}
      {error ? <span className={styles.roleError}>{error}</span> : null}
    </div>
  );
}
