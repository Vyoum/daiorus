'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '../lib/supabase/client';
import { useAuth } from './AuthProvider';

function getAppOrigin() {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export default function LoginDrawer({ open, onClose }) {
  const { user, signOut, configured } = useAuth();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setMessage('');
    setError('');
    setShowPassword(false);
    setForgotMode(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!configured) {
      setError('Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your env.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (forgotMode) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${getAppOrigin()}/auth/reset-password`,
        });
        if (resetError) throw resetError;
        setMessage('Check your email for a password reset link.');
        return;
      }

      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
        handleClose();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() },
          emailRedirectTo: `${getAppOrigin()}/auth/callback`,
        },
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        handleClose();
        return;
      }

      setMessage('Check your email to confirm your account, then sign in.');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setMessage('');

    if (!configured) {
      setError('Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_ANON_KEY to your env.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${getAppOrigin()}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || 'Could not start Google sign-in.');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      handleClose();
    } catch (err) {
      setError(err.message || 'Could not sign out.');
      setLoading(false);
    }
  };

  const title = user
    ? 'My Account'
    : forgotMode
      ? 'Reset Password'
      : mode === 'login'
        ? 'Log In'
        : 'Create an Account';

  return (
    <div
      className={`auth-overlay ${open ? 'open' : ''}`}
      onClick={handleClose}
      aria-hidden={!open}
    >
      <aside
        className="auth-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-drawer-title"
      >
        <div className="auth-drawer-header">
          <h2 id="auth-drawer-title" className="auth-drawer-title">
            {title}
          </h2>
          <button type="button" className="close-btn" aria-label="Close login" onClick={handleClose}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="auth-drawer-body">
          {user ? (
            <div className="auth-account">
              <p className="auth-account-label">Signed in as</p>
              <p className="auth-account-email">{user.email}</p>
              {user.user_metadata?.full_name && (
                <p className="auth-account-name">{user.user_metadata.full_name}</p>
              )}
              {error && <p className="auth-form-message auth-form-error">{error}</p>}
              <Link
                href="/account/profile"
                className="auth-submit-btn"
                onClick={handleClose}
                style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}
              >
                Manage Account
              </Link>
              <button
                type="button"
                className="auth-outline-btn"
                onClick={handleSignOut}
                disabled={loading}
              >
                {loading ? 'Signing out…' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <>
              {!forgotMode && (
                <div className="auth-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'login'}
                    className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setMessage('');
                    }}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === 'register'}
                    className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setMessage('');
                    }}
                  >
                    Create an Account
                  </button>
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === 'register' && !forgotMode && (
                  <div className="auth-field">
                    <label htmlFor="auth-name">Name *</label>
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="auth-field">
                  <label htmlFor="auth-email">Email *</label>
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="Email Id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                {!forgotMode && (
                  <div className="auth-field">
                    <label htmlFor="auth-password">Password *</label>
                    <div className="auth-password-row">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading
                    ? 'Please wait…'
                    : forgotMode
                      ? 'Send Reset Link'
                      : 'Submit'}
                </button>

                {!forgotMode && (
                  <button
                    type="button"
                    className="auth-google-btn"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="auth-google-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign In with Google
                  </button>
                )}

                {mode === 'login' && !forgotMode && (
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => {
                      setForgotMode(true);
                      setError('');
                      setMessage('');
                      setPassword('');
                    }}
                  >
                    Forgot your password?
                  </button>
                )}

                {forgotMode && (
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => {
                      setForgotMode(false);
                      setError('');
                      setMessage('');
                    }}
                  >
                    Back to log in
                  </button>
                )}

                {error && <p className="auth-form-message auth-form-error">{error}</p>}
                {message && <p className="auth-form-message auth-form-success">{message}</p>}
              </form>
            </>
          )}

          <div className="auth-help">
            <h3 className="auth-help-title">Any Questions?</h3>
            <p className="auth-help-text">Our client advisors would be delighted to assist you</p>
            <div className="auth-help-links">
              <Link href="/contact" className="auth-help-link" onClick={handleClose}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Contact Us
              </Link>
              <a href="mailto:hello@daiorus.com" className="auth-help-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                hello@daiorus.com
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
