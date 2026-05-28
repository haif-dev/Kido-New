// Auth helpers for the mobile app. Wraps the configured supabase client,
// exposes a session hook + actions, and holds the in-progress signup data
// as it flows across screens: auth → account-type → terms → verify-email.
import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import type { Session } from '@supabase/supabase-js';
import type { AccountRole } from '@app/lib/types';
import { supabase } from './supabase';

const LAST_NAME_KEY = 'kido.lastFirstName';

export interface PendingSignup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: AccountRole;   // 'parent' | 'sitter' (admin is never self-selected)
  isNanny?: boolean;    // nanny is a sitter variant; stored as metadata hint
  marketingOptIn?: boolean;
}

// Module-level store (single in-progress signup at a time). Simple and
// avoids threading params through every route; cleared on completion.
let pending: PendingSignup | null = null;
export const setPendingSignup = (p: PendingSignup) => { pending = p; };
export const patchPendingSignup = (p: Partial<PendingSignup>) => {
  pending = { ...(pending ?? ({} as PendingSignup)), ...p };
};
export const getPendingSignup = (): PendingSignup | null => pending;
export const clearPendingSignup = () => { pending = null; };

/** Reactive session state. Use to gate authed routes. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return { session, loading };
}

export function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Finalizes a signup. Role + names + locale are written to user metadata,
 *  which the `handle_new_user` DB trigger reads to create the profile row. */
export async function signUpWithEmail(p: PendingSignup, locale: string) {
  // NOTE: emailRedirectTo is intentionally omitted for now. In Expo Go the
  // deep link (exp://.../--/verify-email) is rejected by Supabase as an
  // invalid redirect path, and it's unused while email confirmation is off.
  // It will be re-added as a registered kido:// link when deep links are wired.
  const res = await supabase.auth.signUp({
    email: p.email,
    password: p.password,
    options: {
      data: {
        role: p.role ?? 'parent',
        first_name: p.firstName,
        last_name: p.lastName,
        locale,
        is_nanny: p.isNanny ?? false,
      },
    },
  });
  if (!res.error) {
    try { await SecureStore.setItemAsync(LAST_NAME_KEY, p.firstName); } catch { /* noop */ }
  }
  return res;
}

export function resendConfirmation(email: string) {
  return supabase.auth.resend({ type: 'signup', email });
}

/** Sends a password-reset email. The deep-link redirect is omitted for now
 *  (same Expo Go invalid-path issue as signup); the email will use the
 *  project's Site URL until kido:// deep links are wired. */
export function sendPasswordReset(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export async function signOut() {
  // Forget the remembered name so the "welcome back" greeting doesn't show
  // after an explicit sign-out.
  try { await SecureStore.deleteItemAsync(LAST_NAME_KEY); } catch { /* noop */ }
  return supabase.auth.signOut();
}

/** Starts an OAuth flow. Requires the provider to be enabled in Supabase.
 *  Note: a production-grade flow should use expo-web-browser's
 *  openAuthSessionAsync for an in-app browser + reliable redirect capture. */
export async function signInWithProvider(provider: 'google' | 'facebook') {
  const redirectTo = Linking.createURL('/');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) return { error };
  if (data?.url) await Linking.openURL(data.url);
  return { error: null };
}

export async function getLastFirstName(): Promise<string | null> {
  try { return await SecureStore.getItemAsync(LAST_NAME_KEY); } catch { return null; }
}