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

let client: SupabaseClient | null = null;
let attempted = false;

/**
 * Returns the shared client, or null when Supabase isn't configured.
 * Import is dynamic so the SDK stays out of the initial bundle.
 */
export async function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  if (client) return client;
  if (attempted && !client) return null;

  attempted = true;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    client = createClient(URL!, ANON!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return client;
  } catch {
    return null;
  }
}

/** Table names, centralised so the schema and the code can't drift apart. */
export const TABLES = {
  siteConfig: 'site_config',
  usageEvents: 'usage_events',
} as const;

/** The single config row's primary key (the table is constrained to id = 1). */
export const SITE_CONFIG_ID = 1;
