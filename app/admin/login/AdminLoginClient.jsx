'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

function errorMessage(code) {
  if (code === 'forbidden') {
    return 'This account does not have admin access. Ask an existing admin to grant you the Admin role.';
  }
  if (code === 'config') {
    return 'Auth is not configured. Add Supabase environment variables and try again.';
  }
  return '';
}

export default function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/admin';
  const initialError = useMemo(
    () => errorMessage(searchParams.get('error')),
    [searchParams]
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;

      await fetch('/api/auth/ensure-user', { method: 'POST' });

      const meRes = await fetch('/api/admin/me');
      if (meRes.status === 403) {
        await supabase.auth.signOut();
        setError(
          'This account does not have admin access. Ask an existing admin to grant you the Admin role.'
        );
        return;
      }
      if (!meRes.ok) {
        const data = await meRes.json().catch(() => ({}));
        throw new Error(data.error || 'Could not verify admin access');
      }

      const me = await meRes.json();

      if (me.bootstrap && me.role !== 'ADMIN') {
        const promote = await fetch(`/api/admin/users/${me.id}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'ADMIN' }),
        });
        if (!promote.ok) {
          const data = await promote.json().catch(() => ({}));
          throw new Error(data.error || 'Could not create the first admin');
        }
      }

      const safeNext =
        nextPath.startsWith('/admin') && !nextPath.startsWith('/admin/login')
          ? nextPath
          : '/admin';
      router.replace(safeNext);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <p className={styles.eyebrow}>Daiorus</p>
          <h1 className={styles.title}>Admin sign in</h1>
          <p className={styles.subtitle}>
            Only users with the Admin role can access the dashboard.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error ? <div className={styles.error}>{error}</div> : null}

          <label className={styles.label}>
            Email
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="you@daiorus.com"
            />
          </label>

          <label className={styles.label}>
            Password
            <div className={styles.passwordRow}>
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                className={styles.showBtn}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          <Link href="/">← Back to store</Link>
          {initialError ? (
            <>
              {' · '}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={async () => {
                  try {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                  } catch {
                    // ignore
                  }
                  setError('');
                  router.replace('/admin/login');
                }}
              >
                Sign out & try another account
              </button>
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
