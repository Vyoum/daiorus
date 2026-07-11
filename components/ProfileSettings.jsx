'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../lib/supabase/client';
import { useAccountProfile } from './AccountShell';
import { useCurrency } from './CurrencyProvider';
import styles from './ProfileSettings.module.css';

const CURRENCY_OPTIONS = [
  { code: 'INR', label: 'INR (₹)' },
  { code: 'USD', label: 'USD ($)' },
  { code: 'GBP', label: 'GBP (£)' },
  { code: 'AED', label: 'AED (د.إ)' },
  { code: 'AUD', label: 'AUD (A$)' },
  { code: 'SGD', label: 'SGD (S$)' },
];

const PREFS_KEY = 'daiorus_account_prefs';

function readPrefs() {
  if (typeof window === 'undefined') return { newsletter: true, sms: false };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return { newsletter: true, sms: false };
    return { newsletter: true, sms: false, ...JSON.parse(raw) };
  } catch {
    return { newsletter: true, sms: false };
  }
}

export default function ProfileSettings() {
  const router = useRouter();
  const profile = useAccountProfile();
  const { currencyCode, setPreferredCurrency } = useCurrency();

  const [name, setName] = useState(profile?.name || '');
  const [email] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [sms, setSms] = useState(false);
  const [preferredCurrency, setPreferredCurrencyLocal] = useState(currencyCode || 'INR');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const prefs = readPrefs();
    setNewsletter(Boolean(prefs.newsletter));
    setSms(Boolean(prefs.sms));
  }, []);

  useEffect(() => {
    if (currencyCode) setPreferredCurrencyLocal(currencyCode);
  }, [currencyCode]);

  const displayName = name.trim() || email.split('@')[0] || 'Member';
  const avatarUrl = useMemo(() => {
    if (profile?.avatarUrl) return profile.avatarUrl;
    return `https://i.pravatar.cc/160?u=${encodeURIComponent(email || displayName)}`;
  }, [profile?.avatarUrl, email, displayName]);

  const resetForm = () => {
    setName(profile?.name || '');
    setPhone(profile?.phone || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    const prefs = readPrefs();
    setNewsletter(Boolean(prefs.newsletter));
    setSms(Boolean(prefs.sms));
    setPreferredCurrencyLocal(currencyCode || 'INR');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        setError('Enter your current password to change it.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not update profile');

      if (currentPassword && newPassword) {
        const supabase = createClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (signInError) throw new Error('Current password is incorrect.');

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) throw updateError;
      }

      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ newsletter, sms })
      );

      if (typeof setPreferredCurrency === 'function') {
        await setPreferredCurrency(preferredCurrency);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Your preferences have been saved.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.wrap} onSubmit={handleSave}>
      <header className={styles.header}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.lead}>
          Manage your personal information, security preferences, and communication
          settings to ensure a seamless experience.
        </p>
      </header>

      {error ? <div className={styles.error}>{error}</div> : null}
      {message ? <div className={styles.success}>{message}</div> : null}

      <div className={styles.grid}>
        <div className={styles.colMain}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Personal Information</h2>

            <label className={styles.field}>
              <span>Full Name</span>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>

            <label className={styles.field}>
              <span>Email Address</span>
              <div className={styles.emailRow}>
                <input className={styles.input} value={email} readOnly />
                <button type="button" className={styles.changeBtn} disabled title="Coming soon">
                  Change
                </button>
              </div>
            </label>

            <label className={styles.field}>
              <span>Phone Number</span>
              <input
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+91"
              />
            </label>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Security</h2>

            <label className={styles.field}>
              <span>Current Password</span>
              <input
                type="password"
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>

            <label className={styles.field}>
              <span>New Password</span>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Enter new password"
              />
            </label>

            <label className={styles.field}>
              <span>Confirm New Password</span>
              <input
                type="password"
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />
            </label>
          </section>
        </div>

        <div className={styles.colSide}>
          <section className={`${styles.card} ${styles.profileCard}`}>
            <img src={avatarUrl} alt="" className={styles.avatar} />
            <h3 className={styles.profileName}>{displayName}</h3>
            <p className={styles.memberBadge}>Member</p>
            <button type="button" className={styles.avatarLink} disabled>
              Update Avatar
            </button>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Preferences</h2>

            <div className={styles.prefRow}>
              <div>
                <p className={styles.prefLabel}>Email Newsletter</p>
                <p className={styles.prefHint}>Exclusive collections and bespoke offers</p>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${newsletter ? styles.toggleOn : ''}`}
                onClick={() => setNewsletter((v) => !v)}
                aria-pressed={newsletter}
                aria-label="Email newsletter"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            <div className={styles.prefRow}>
              <div>
                <p className={styles.prefLabel}>SMS Notifications</p>
                <p className={styles.prefHint}>Updates on your orders</p>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${sms ? styles.toggleOn : ''}`}
                onClick={() => setSms((v) => !v)}
                aria-pressed={sms}
                aria-label="SMS notifications"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            <label className={styles.field}>
              <span>Preferred Currency</span>
              <select
                className={styles.select}
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrencyLocal(e.target.value)}
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </section>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.cancelBtn} onClick={resetForm} disabled={saving}>
          Cancel
        </button>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
