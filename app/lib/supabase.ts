'use client';

/**
 * supabase.ts
 *
 * Lazily-created browser Supabase client.
 *
 * The app is a static export with no server, so the browser talks to Supabase
 * directly using the public anon key. Access is controlled by Row-Level
 * Security policies (see supabase/schema.sql), never by hiding the key —
 * the anon key is *meant* to be public.
 *
 * Every consumer must tolerate `null`: when the env vars are absent the app
 * falls back to the built-in template and silently skips analytics, so the
 * site keeps working with no backend configured at all.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when both env vars were present at build time. */
export const isSupabaseConfigured = Boolean(URL && ANON);

/**
 * The in-flight (or settled) client promise.
 *
 * This is memoised as a *promise*, not a boolean flag: several callers hit
 * getSupabase() concurrently on first paint (config load + page-view event),
 * and a flag would make every caller after the first receive null while the
 * dynamic import was still resolving.
 */
let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Returns the shared client, or null when Supabase isn't configured.
 * Import is dynamic so the SDK stays out of the initial bundle.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);

  if (!clientPromise) {
    clientPromise = (async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        return createClient(URL!, ANON!, {
          auth: {
            // Admins sign in with a magic link, so the session must survive
            // the redirect back from the email and subsequent reloads.
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      } catch {
        return null;
      }
    })();
  }

  return clientPromise;
}

/** Table names, centralised so the schema and the code can't drift apart. */
export const TABLES = {
  siteConfig: 'site_config',
  usageEvents: 'usage_events',
  admins: 'admins',
} as const;

/** The single config row's primary key (the table is constrained to id = 1). */
export const SITE_CONFIG_ID = 1;
