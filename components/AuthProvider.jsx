'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '../lib/supabase/client';

const AuthContext = createContext({
  user: null,
  loading: true,
  configured: false,
  signOut: async () => {},
});

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
  );
}

async function ensureUserProfile() {
  try {
    await fetch('/api/auth/ensure-user', { method: 'POST' });
  } catch {
    // Non-blocking — admin sync can still pick users up later
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!mounted) return;
      setUser(currentUser ?? null);
      setLoading(false);
      if (currentUser) ensureUserProfile();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (
        session?.user &&
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')
      ) {
        ensureUserProfile();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [configured]);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      async signOut() {
        if (!configured) return;
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
      },
    }),
    [user, loading, configured]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
