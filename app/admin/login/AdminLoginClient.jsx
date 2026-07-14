'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

function errorMessage(code) {
  if (code === 'forbidden') {
    return 'This account is signed in, but Access is Customer — not Admin. An existing admin can set your Access to Admin on Customers, then try again.';
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
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      if (signInError) throw signInError;

      // Ensure the browser session/cookies are ready before server calls
      if (!signInData.session) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError || !sessionData.session) {
          throw new Error('Signed in, but session was not established. Try again.');
        }
      }

      await fetch('/api/auth/ensure-user', { method: 'POST' });

      const meRes = await fetch('/api/admin/me', { cache: 'no-store' });
      const me = await meRes.json().catch(() => ({}));

      if (meRes.status === 401) {
        throw new Error('Signed in, but the server could not read your session. Refresh and try again.');
      }
      if (!meRes.ok) {
        throw new Error(me.error || 'Could not verify admin access');
      }

      if (!me.isAdmin && me.role !== 'ADMIN') {
        await supabase.auth.signOut();
        setError(
          `Signed in as ${me.email || 'this account'}, but Access is Customer — not Admin. Ask an admin to set Access → Admin on the Customers page, then try again.`
        );
        return;
      }

      const safeNext =
        nextPath.startsWith('/admin') && !nextPath.startsWith('/admin/login')
          ? nextPath
          : '/admin';

      window.location.assign(safeNext);
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
            Use your store email and password. Accounts with Admin access open the dashboard after
            sign-in.
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
