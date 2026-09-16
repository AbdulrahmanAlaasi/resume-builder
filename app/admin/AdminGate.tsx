'use client';

/**
 * AdminGate — magic-link authentication wrapper for /admin.
 *
 * Renders its children only for a signed-in user who has a row in the
 * `admins` table. This is a convenience layer, NOT the security boundary:
 * the real enforcement is Row-Level Security in Postgres, so even someone
 * who bypasses this UI cannot publish a template or read analytics.
 *
 * When Supabase isn't configured the gate steps aside and renders the
 * dashboard, so the setup instructions remain reachable.
 */

import { useCallback, useEffect, useState } from 'react';
import { getSupabase, isSupabaseConfigured, TABLES } from '../lib/supabase';

type GateState = 'loading' | 'unconfigured' | 'signed-out' | 'not-admin' | 'admin';

const shell: React.CSSProperties = {
  minHeight: '100vh', background: 'var(--bg)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', padding: 20,
};

const card: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 14, padding: 28, width: '100%', maxWidth: 420,
  boxShadow: '0 18px 48px rgba(20,23,43,0.10)',
};

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GateState>('loading');
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setState('unconfigured'); return; }

    let active = true;
    let unsub: (() => void) | undefined;

    void (async () => {
      const sb = await getSupabase();
      if (!active) return;
      if (!sb) { setState('unconfigured'); return; }

      const check = async () => {
        const { data: { session } } = await sb.auth.getSession();
        if (!active) return;

        if (!session) { setUserEmail(''); setState('signed-out'); return; }
        setUserEmail(session.user.email ?? '');

        // RLS lets a user see only their own admins row (matched on the
        // verified email claim), so an empty result means
        // "signed in, but not an admin".
        const { data, error } = await sb
          .from(TABLES.admins)
          .select('email')
          .limit(1)
          .maybeSingle();

        if (!active) return;
        if (error) { setErr(error.message); setState('not-admin'); return; }
        setState(data ? 'admin' : 'not-admin');
      };

      await check();
      const { data: sub } = sb.auth.onAuthStateChange(() => { void check(); });
      unsub = () => sub.subscription.unsubscribe();
    })();

    return () => { active = false; unsub?.(); };
  }, []);

  const signIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const sb = await getSupabase();
      if (!sb) throw new Error('Supabase is not available.');
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [email]);

  const signOut = useCallback(async () => {
    const sb = await getSupabase();
    await sb?.auth.signOut();
    setSent(false);
    setState('signed-out');
  }, []);

  // ---- no backend: let the dashboard show its own setup instructions ----
  if (state === 'unconfigured') return <>{children}</>;

  if (state === 'loading') {
    return (
      <div style={shell}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Checking access…</div>
      </div>
    );
  }

  // ---- signed in and allowed ----
  if (state === 'admin') {
    return (
      <>
        <div style={{
          background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
          padding: '6px 20px', fontSize: 12, color: 'var(--text-secondary)',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10,
        }}>
          <span>Signed in as <strong>{userEmail}</strong></span>
          <button className="btn-ghost" type="button" onClick={() => void signOut()}
            style={{ padding: '3px 10px', fontSize: 12 }}>Sign out</button>
        </div>
        {children}
      </>
    );
  }

  // ---- signed in, but not on the allowlist ----
  if (state === 'not-admin') {
    return (
      <div style={shell}>
        <div style={card}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Not authorised</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            You&apos;re signed in as <strong>{userEmail}</strong>, but that account isn&apos;t on
            the admin allowlist.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            An existing admin can grant access by running this in the Supabase SQL editor:
          </p>
          <pre style={{
            fontSize: 11, background: 'var(--surface-soft)', padding: 10, borderRadius: 8,
            overflowX: 'auto', margin: '0 0 14px',
          }}>{`insert into public.admins (email, note)
values ('${userEmail || 'you@example.com'}', 'Career Center')
on conflict (email) do nothing;`}</pre>
          {err && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 10 }}>{err}</div>}
          <button className="btn-ghost" type="button" onClick={() => void signOut()}>Sign out</button>
        </div>
      </div>
    );
  }

  // ---- signed out ----
  return (
    <div style={shell}>
      <div style={card}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Admin sign in</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 0 }}>
          Resume Builder dashboard. We&apos;ll email you a one-time sign-in link — no password.
        </p>

        {sent ? (
          <div role="status" style={{
            border: '1px solid rgba(22,164,116,0.35)', background: 'rgba(22,164,116,0.08)',
            color: 'var(--success)', borderRadius: 8, padding: '10px 13px', fontSize: 13, lineHeight: 1.5,
          }}>
            Check <strong>{email}</strong> for a sign-in link. You can close this tab —
            the link opens the dashboard directly.
          </div>
        ) : (
          <form onSubmit={signIn}>
            <label className="form-label" htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              className="form-input"
              type="email"
              required
              autoComplete="email"
              placeholder="you@yu.edu.sa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {err && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{err}</div>
            )}
            <button className="btn-primary" type="submit" disabled={busy || !email.trim()}
              style={{ marginTop: 14, width: '100%' }}>
              {busy ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.6 }}>
          Publishing and analytics are enforced by database policies, so this page
          exposes nothing without an authorised account.
        </p>
      </div>
    </div>
  );
}
