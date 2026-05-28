import { createClient, type SupabaseClient } from '@supabase/supabase-js';

interface ClientConfig {
  url: string;
  anonKey: string;
}

/**
 * Browser/mobile client. Use this on the client side (anon key only).
 * For server-side actions that need elevated privileges, use createServiceClient.
 */
export function createBrowserClient({ url, anonKey }: ClientConfig): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Service-role client. ONLY use on the server (API routes, edge functions).
 * Never ship the service role key to the client.
 */
export function createServiceClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
