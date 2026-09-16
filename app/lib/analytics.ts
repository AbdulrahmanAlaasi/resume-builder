'use client';

/**
 * analytics.ts
 *
 * Anonymous, privacy-preserving usage tracking.
 *
 * PRIVACY CONTRACT — do not weaken this:
 *   • No resume content is ever sent. No names, emails, phones, employers,
 *     universities, or any field a student typed.
 *   • No cookies, no cross-site identifiers, no IP storage, no fingerprinting.
 *   • The session id is a random UUID held in sessionStorage. It dies when the
 *     tab closes and cannot be linked to a person or to another visit.
 *   • `meta` carries only small enums/counters (e.g. page count, section id).
 *
 * This matches the data-minimisation commitment made publicly on /proposal.
 *
 * Tracking is fire-and-forget and must never break the app: every failure is
 * swallowed, and everything no-ops when Supabase isn't configured.
 */

import { getSupabase, TABLES, isSupabaseConfigured } from './supabase';

export type UsageEvent =
  | 'page_view'
  | 'export_pdf'
  | 'export_docx'
  | 'import_pdf'
  | 'example_loaded'
  | 'reset_data'
  | 'section_opened'
  | 'over_page_limit'
  | 'template_published';

/** Only primitives — keeps free-text (and therefore PII) out by construction. */
export type EventMeta = Record<string, string | number | boolean>;

const SESSION_KEY = 'resume-builder-session-id';
const MAX_META_CHARS = 120;

function sessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function deviceClass(): string {
  if (typeof window === 'undefined') return 'unknown';
  return window.innerWidth <= 980 ? 'mobile' : 'desktop';
}

function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin iframe
  }
}

/**
 * Defensive scrub: keep primitives, truncate/drop long strings. Callers
 * shouldn't pass PII, and this makes doing so by accident much harder.
 */
function safeMeta(meta?: EventMeta): EventMeta {
  if (!meta) return {};
  const out: EventMeta = {};
  for (const [k, v] of Object.entries(meta)) {
    if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'string' && v.length <= MAX_META_CHARS) out[k] = v;
  }
  return out;
}

/** Events already sent this session, to avoid duplicate page views. */
const sentOnce = new Set<string>();

/**
 * Record a usage event. Never throws, never blocks, never awaited by callers.
 */
export function track(event: UsageEvent, meta?: EventMeta, opts?: { once?: boolean }): void {
  if (!isSupabaseConfigured || typeof window === 'undefined') return;

  if (opts?.once) {
    if (sentOnce.has(event)) return;
    sentOnce.add(event);
  }

  const sid = sessionId();
  if (!sid) return;

  // Deliberately not awaited — analytics must never delay the UI.
  void (async () => {
    try {
      const sb = await getSupabase();
      if (!sb) return;
      await sb.from(TABLES.usageEvents).insert({
        event,
        session_id: sid,
        device: deviceClass(),
        embedded: isEmbedded(),
        meta: safeMeta(meta),
      });
    } catch {
      // Swallowed by design.
    }
  })();
}

/** Convenience wrapper for the once-per-session page view. */
export function trackPageView(page: string): void {
  track('page_view', { page }, { once: true });
}
