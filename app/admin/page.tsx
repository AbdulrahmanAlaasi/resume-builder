'use client';

/**
 * /admin — Career Center dashboard.
 *
 * Two jobs:
 *   1. Show anonymous usage of the builder (no student data, ever).
 *   2. Edit the live template and publish it to the public site instantly —
 *      either by editing fields here, or by uploading a template JSON file.
 *
 * Everything degrades gracefully: with no Supabase configured the page still
 * loads, explains the setup, and lets you edit + download a template file.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_TEMPLATE, mergeTemplate, type TemplateConfig, type SectionConfig,
} from '../lib/siteConfig';
import { useConfigStore, cachePublishedConfig } from '../store/configStore';
import { getSupabase, TABLES, SITE_CONFIG_ID, isSupabaseConfigured } from '../lib/supabase';
import { track } from '../lib/analytics';
import { CV_EXAMPLES } from '../lib/examples';
import ResumePreview from '../components/preview/ResumePreview';
import type { Density, PaperSize } from '../types/resume';

// ---------------------------------------------------------------------------
// Usage types
// ---------------------------------------------------------------------------

interface DailyRow {
  day: string;
  event: string;
  device: string | null;
  embedded: boolean;
  events: number;
  sessions: number;
}

interface Totals {
  visits: number;
  pageViews: number;
  pdf: number;
  docx: number;
  imports: number;
  examples: number;
  overLimit: number;
  mobile: number;
  desktop: number;
  embedded: number;
  direct: number;
}

const EMPTY_TOTALS: Totals = {
  visits: 0, pageViews: 0, pdf: 0, docx: 0, imports: 0, examples: 0,
  overLimit: 0, mobile: 0, desktop: 0, embedded: 0, direct: 0,
};

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 12, padding: '14px 16px', minWidth: 0,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
      }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, marginTop: 4 }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function Field({ label, value, onChange, multiline }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {multiline
        ? <textarea className="form-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
        : <input className="form-input" value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}

function Panel({ title, caption, children }: {
  title: string; caption?: string; children: React.ReactNode;
}) {
  return (
    <section className="section-card" style={{ marginBottom: 16 }}>
      <div className="card-head" style={{ marginBottom: caption ? 4 : 12 }}>{title}</div>
      {caption && <p className="form-caption">{caption}</p>}
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const applyLocal = useConfigStore((s) => s.applyLocal);

  const [tab, setTab] = useState<'usage' | 'template' | 'transfer'>('usage');
  const [draft, setDraft] = useState<TemplateConfig>(DEFAULT_TEMPLATE);
  const [publishedJson, setPublishedJson] = useState<string>(JSON.stringify(DEFAULT_TEMPLATE));
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const [range, setRange] = useState<Range>(30);
  const [rows, setRows] = useState<DailyRow[] | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== publishedJson,
    [draft, publishedJson],
  );

  // Live-preview the draft in the embedded ResumePreview.
  useEffect(() => { applyLocal(draft); }, [draft, applyLocal]);

  // ---- load published config ------------------------------------------------
  const loadPublished = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setLoadingConfig(true);
    try {
      const sb = await getSupabase();
      if (!sb) return;
      const { data, error } = await sb
        .from(TABLES.siteConfig).select('config').eq('id', SITE_CONFIG_ID).maybeSingle();
      if (error) throw error;
      const merged = mergeTemplate(data?.config);
      setDraft(merged);
      setPublishedJson(JSON.stringify(merged));
    } catch (e) {
      setNotice({ kind: 'err', text: `Could not load published template: ${(e as Error).message}` });
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  // ---- load usage -----------------------------------------------------------
  const loadUsage = useCallback(async (days: Range) => {
    if (!isSupabaseConfigured) return;
    setLoadingUsage(true);
    setUsageError(null);
    try {
      const sb = await getSupabase();
      if (!sb) return;
      const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
      const { data, error } = await sb
        .from('usage_daily').select('*').gte('day', since).order('day', { ascending: true });
      if (error) throw error;
      setRows((data ?? []) as DailyRow[]);
    } catch (e) {
      setUsageError((e as Error).message);
      setRows([]);
    } finally {
      setLoadingUsage(false);
    }
  }, []);

  useEffect(() => { void loadPublished(); }, [loadPublished]);
  useEffect(() => { void loadUsage(range); }, [range, loadUsage]);

  // ---- aggregate ------------------------------------------------------------
  const totals: Totals = useMemo(() => {
    if (!rows) return EMPTY_TOTALS;
    const t = { ...EMPTY_TOTALS };
    for (const r of rows) {
      if (r.event === 'page_view') {
        t.pageViews += r.events;
        t.visits += r.sessions;
        if (r.device === 'mobile') t.mobile += r.sessions;
        if (r.device === 'desktop') t.desktop += r.sessions;
        if (r.embedded) t.embedded += r.sessions; else t.direct += r.sessions;
      }
      if (r.event === 'export_pdf') t.pdf += r.events;
      if (r.event === 'export_docx') t.docx += r.events;
      if (r.event === 'import_pdf') t.imports += r.events;
      if (r.event === 'example_loaded') t.examples += r.events;
      if (r.event === 'over_page_limit') t.overLimit += r.events;
    }
    return t;
  }, [rows]);

  /** Daily visit series for the bar chart. */
  const series = useMemo(() => {
    if (!rows) return [] as { day: string; visits: number }[];
    const byDay = new Map<string, number>();
    for (const r of rows) {
      if (r.event !== 'page_view') continue;
      byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.sessions);
    }
    return [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, visits]) => ({ day, visits }));
  }, [rows]);

  const exportRate = totals.visits > 0
    ? Math.round(((totals.pdf + totals.docx) / totals.visits) * 100) : 0;

  // ---- publish --------------------------------------------------------------
  const publish = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setNotice({ kind: 'err', text: 'Supabase is not configured — see the Setup notice above.' });
      return;
    }
    setPublishing(true);
    setNotice(null);
    try {
      const sb = await getSupabase();
      if (!sb) throw new Error('Supabase client unavailable');
      const { error } = await sb.from(TABLES.siteConfig).upsert({
        id: SITE_CONFIG_ID,
        config: draft,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;

      cachePublishedConfig(draft);
      setPublishedJson(JSON.stringify(draft));
      track('template_published');
      setNotice({ kind: 'ok', text: 'Published. The live site now uses this template.' });
    } catch (e) {
      setNotice({ kind: 'err', text: `Publish failed: ${(e as Error).message}` });
    } finally {
      setPublishing(false);
    }
  }, [draft]);

  // ---- import / export ------------------------------------------------------
  const downloadJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume-template-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [draft]);

  const importJson = useCallback((text: string) => {
    try {
      const parsed = JSON.parse(text);
      const merged = mergeTemplate(parsed);
      setDraft(merged);
      setNotice({ kind: 'ok', text: 'Template loaded. Review it, then press Publish to go live.' });
      setTab('template');
    } catch (e) {
      setNotice({ kind: 'err', text: `Not a valid template file: ${(e as Error).message}` });
    }
  }, []);

  const onFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => importJson(String(reader.result ?? ''));
    reader.onerror = () => setNotice({ kind: 'err', text: 'Could not read that file.' });
    reader.readAsText(file);
  }, [importJson]);

  // ---- section helpers ------------------------------------------------------
  const patchSection = (idx: number, patch: Partial<SectionConfig>) =>
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));

  const moveSection = (idx: number, dir: -1 | 1) =>
    setDraft((d) => {
      const next = [...d.sections];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return d;
      [next[idx], next[to]] = [next[to], next[idx]];
      return { ...d, sections: next };
    });

  const sampleData = CV_EXAMPLES[0]?.data;

  // -------------------------------------------------------------------------

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Admin Dashboard</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Resume Builder · usage &amp; live template
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a className="btn-ghost" href="/" style={{ textDecoration: 'none' }}>← Back to builder</a>
        </div>
      </header>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 20px 120px' }}>

        {/* Security notice — unauthenticated by request */}
        <div role="note" style={{
          border: '1px solid rgba(224, 64, 94, 0.35)', background: 'rgba(224, 64, 94, 0.08)',
          borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13,
          color: 'var(--text-primary)', lineHeight: 1.5,
        }}>
          <strong>This page has no login.</strong> Anyone who knows the URL can publish a new
          template to the live site. Don&apos;t share the link publicly. To lock it down, see
          section 5 of <code>supabase/schema.sql</code>.
        </div>

        {/* Setup notice */}
        {!isSupabaseConfigured && (
          <div style={{
            border: '1px solid var(--border)', background: 'var(--surface)',
            borderRadius: 10, padding: '14px 16px', marginBottom: 14, fontSize: 13, lineHeight: 1.6,
          }}>
            <strong>Setup needed — analytics and publishing are offline.</strong>
            <ol style={{ margin: '8px 0 0 18px', padding: 0 }}>
              <li>Create a project at supabase.com.</li>
              <li>SQL Editor → paste <code>supabase/schema.sql</code> → Run.</li>
              <li>Cloudflare Pages → Settings → Environment variables, add
                {' '}<code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.</li>
              <li>Redeploy.</li>
            </ol>
            <div style={{ marginTop: 8, color: 'var(--text-secondary)' }}>
              You can still edit and download a template file below.
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="segmented" style={{ maxWidth: 420, marginBottom: 16 }}>
          {([['usage', 'Usage'], ['template', 'Template'], ['transfer', 'Import / Export']] as const)
            .map(([id, label]) => (
              <button key={id} type="button" className={tab === id ? 'active' : ''}
                onClick={() => setTab(id)}>{label}</button>
            ))}
        </div>

        {notice && (
          <div role="status" style={{
            borderRadius: 8, padding: '9px 13px', marginBottom: 14, fontSize: 13,
            border: `1px solid ${notice.kind === 'ok' ? 'rgba(22,164,116,0.35)' : 'rgba(224,64,94,0.35)'}`,
            background: notice.kind === 'ok' ? 'rgba(22,164,116,0.08)' : 'rgba(224,64,94,0.08)',
            color: notice.kind === 'ok' ? 'var(--success)' : 'var(--danger)',
          }}>{notice.text}</div>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'usage' && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="segmented" style={{ width: 240 }}>
                {RANGES.map((r) => (
                  <button key={r} type="button" className={range === r ? 'active' : ''}
                    onClick={() => setRange(r)}>{r}d</button>
                ))}
              </div>
              <button className="btn-ghost" type="button" onClick={() => void loadUsage(range)}
                disabled={loadingUsage}>
                {loadingUsage ? 'Loading…' : 'Refresh'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Anonymous counts only — no student data is collected.
              </span>
            </div>

            {usageError && (
              <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 12 }}>
                Could not load usage: {usageError}
              </div>
            )}

            <div style={{
              display: 'grid', gap: 10, marginBottom: 18,
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            }}>
              <Card label="Visits" value={totals.visits} hint={`${totals.pageViews} page views`} />
              <Card label="PDF exports" value={totals.pdf} />
              <Card label="Word exports" value={totals.docx} />
              <Card label="Export rate" value={`${exportRate}%`} hint="visits that exported" />
              <Card label="PDF imports" value={totals.imports} />
              <Card label="Examples used" value={totals.examples} />
              <Card label="Over 1 page" value={totals.overLimit} hint="CVs exceeding a page" />
              <Card label="Mobile / Desktop" value={`${totals.mobile} / ${totals.desktop}`} />
              <Card label="Embedded / Direct" value={`${totals.embedded} / ${totals.direct}`}
                hint="iframe vs direct visits" />
            </div>

            <Panel title="Daily visits" caption={`Distinct sessions per day over the last ${range} days.`}>
              {series.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isSupabaseConfigured ? 'No usage recorded yet.' : 'Connect Supabase to see usage.'}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 140 }}>
                  {series.map(({ day, visits }) => {
                    const max = Math.max(...series.map((s) => s.visits), 1);
                    return (
                      <div key={day} title={`${day}: ${visits} visit(s)`}
                        style={{ flex: 1, display: 'flex', flexDirection: 'column',
                                 justifyContent: 'flex-end', height: '100%' }}>
                        <div style={{
                          height: `${Math.max(2, (visits / max) * 100)}%`,
                          background: 'var(--accent)', borderRadius: '3px 3px 0 0', minHeight: 2,
                        }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'template' && (
          <div className="admin-grid"
            style={{ display: 'grid', gap: 16, gridTemplateColumns: showPreview ? '1fr 420px' : '1fr' }}>
            <div style={{ minWidth: 0 }}>
              <Panel title="Default formatting" caption="What every new student CV starts with.">
                <div className="form-grid">
                  <div>
                    <label className="form-label">Paper size</label>
                    <select className="form-input" value={draft.defaults.paperSize}
                      onChange={(e) => setDraft((d) => ({
                        ...d, defaults: { ...d.defaults, paperSize: e.target.value as PaperSize } }))}>
                      <option value="letter">US Letter</option>
                      <option value="a4">A4</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Density</label>
                    <select className="form-input" value={draft.defaults.density}
                      onChange={(e) => setDraft((d) => ({
                        ...d, defaults: { ...d.defaults, density: e.target.value as Density } }))}>
                      <option value="compact">Compact</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Font</label>
                    <select className="form-input" value={draft.defaults.fontFamily}
                      onChange={(e) => setDraft((d) => ({
                        ...d, defaults: { ...d.defaults, fontFamily: e.target.value } }))}>
                      {draft.fontChoices.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Heading colour</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={draft.defaults.accentColor}
                        onChange={(e) => setDraft((d) => ({
                          ...d, defaults: { ...d.defaults, accentColor: e.target.value } }))}
                        style={{ width: 44, height: 38, padding: 2, border: '1px solid var(--border)',
                                 borderRadius: 8, background: 'var(--surface)' }} />
                      <input className="form-input" value={draft.defaults.accentColor}
                        onChange={(e) => setDraft((d) => ({
                          ...d, defaults: { ...d.defaults, accentColor: e.target.value } }))} />
                    </div>
                  </div>
                  <div className="full">
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                      <input type="checkbox" checked={draft.defaults.showRules}
                        onChange={(e) => setDraft((d) => ({
                          ...d, defaults: { ...d.defaults, showRules: e.target.checked } }))} />
                      Show horizontal rules between sections
                    </label>
                  </div>
                </div>
              </Panel>

              <Panel title="Sections"
                caption="Reorder, rename, hide. “Nav label” is the sidebar text students see; “CV heading” is printed on the CV, PDF and Word file.">
                {draft.sections.map((s, i) => (
                  <div key={s.id} style={{
                    border: '1px solid var(--border)', borderRadius: 10, padding: 12,
                    marginBottom: 8, background: s.enabled ? 'var(--surface)' : 'var(--surface-soft)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <strong style={{ fontSize: 12, flex: 1 }}>{s.id}</strong>
                      <button className="btn-ghost" type="button" onClick={() => moveSection(i, -1)}
                        disabled={i === 0} aria-label={`Move ${s.navLabel} up`}>↑</button>
                      <button className="btn-ghost" type="button" onClick={() => moveSection(i, 1)}
                        disabled={i === draft.sections.length - 1}
                        aria-label={`Move ${s.navLabel} down`}>↓</button>
                      <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                        <input type="checkbox" checked={s.enabled}
                          onChange={(e) => patchSection(i, { enabled: e.target.checked })} />
                        Visible
                      </label>
                    </div>
                    <div className="form-grid">
                      <Field label="Nav label" value={s.navLabel}
                        onChange={(v) => patchSection(i, { navLabel: v })} />
                      <Field label="CV heading" value={s.cvHeading}
                        onChange={(v) => patchSection(i, { cvHeading: v })} />
                    </div>
                  </div>
                ))}
              </Panel>

              <Panel title="CV labels" caption="Wording printed on the CV itself.">
                <div className="form-grid">
                  {(Object.keys(draft.cvLabels) as (keyof typeof draft.cvLabels)[]).map((k) => (
                    <Field key={k} label={k.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      value={draft.cvLabels[k]}
                      onChange={(v) => setDraft((d) => ({ ...d, cvLabels: { ...d.cvLabels, [k]: v } }))} />
                  ))}
                </div>
              </Panel>

              <Panel title="Branding &amp; copy" caption="App title, credit banner and the page-limit warning.">
                <div className="form-grid">
                  {(Object.keys(draft.branding) as (keyof typeof draft.branding)[]).map((k) => (
                    <Field key={k} label={k.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      value={draft.branding[k]}
                      onChange={(v) => setDraft((d) => ({ ...d, branding: { ...d.branding, [k]: v } }))} />
                  ))}
                </div>
              </Panel>

              <Panel title="Placeholders" caption="The grey example text inside each form field.">
                <div className="form-grid">
                  {Object.keys(draft.placeholders).sort().map((k) => (
                    <Field key={k} label={k} value={draft.placeholders[k]}
                      onChange={(v) => setDraft((d) => ({
                        ...d, placeholders: { ...d.placeholders, [k]: v } }))} />
                  ))}
                </div>
              </Panel>
            </div>

            {showPreview && sampleData && (
              <aside style={{ minWidth: 0 }}>
                <div style={{ position: 'sticky', top: 16 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8,
                  }}>Live preview</div>
                  <div style={{
                    background: 'var(--preview-bg)', padding: 12, borderRadius: 10,
                    border: '1px solid var(--border)', overflow: 'hidden',
                  }}>
                    <div style={{ width: 816, transform: 'scale(0.47)', transformOrigin: 'top left',
                                  height: 1056 * 0.47 }}>
                      <ResumePreview data={sampleData} settings={draft.defaults} />
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {tab === 'transfer' && (
          <>
            <Panel title="Download current template"
              caption="Saves everything on the Template tab as a .json file you can keep as a backup or hand to someone else.">
              <button className="btn-primary" type="button" onClick={downloadJson}>
                ⬇ Download template JSON
              </button>
            </Panel>

            <Panel title="Upload a template"
              caption="Load a .json file exported from this page. It is validated and merged against the built-in template, so an old or partial file still works. Nothing goes live until you press Publish.">
              <input ref={fileRef} type="file" accept="application/json,.json"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
                style={{ display: 'block', marginBottom: 12, fontSize: 13 }} />
              <details>
                <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  …or paste JSON directly
                </summary>
                <PasteBox onLoad={importJson} />
              </details>
            </Panel>

            <Panel title="Reset"
              caption="Restore the built-in YU template. This only changes the draft — press Publish to make it live.">
              <button className="btn-ghost" type="button"
                onClick={() => { setDraft(DEFAULT_TEMPLATE); setNotice({ kind: 'ok', text: 'Draft reset to the built-in template.' }); }}>
                Reset draft to built-in template
              </button>
            </Panel>
          </>
        )}
      </div>

      {/* Sticky publish bar */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        padding: '10px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        boxShadow: '0 -4px 16px rgba(20,23,43,0.06)',
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {loadingConfig ? 'Loading published template…'
            : dirty ? <strong style={{ color: 'var(--accent)' }}>Unsaved changes</strong>
            : 'No changes'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={showPreview}
              onChange={(e) => setShowPreview(e.target.checked)} />
            Preview
          </label>
          <button className="btn-ghost" type="button" onClick={() => void loadPublished()}
            disabled={loadingConfig || publishing}>Revert</button>
          <button className="btn-primary" type="button" onClick={() => void publish()}
            disabled={publishing || !dirty}>
            {publishing ? 'Publishing…' : 'Publish to live site'}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 1000px) {
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/** Paste-JSON fallback for when uploading a file isn't convenient. */
function PasteBox({ onLoad }: { onLoad: (text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div style={{ marginTop: 10 }}>
      <textarea className="form-textarea" value={text} onChange={(e) => setText(e.target.value)}
        placeholder='{ "schemaVersion": 1, ... }' style={{ minHeight: 140, fontFamily: 'monospace' }} />
      <button className="btn-ghost" type="button" style={{ marginTop: 8 }}
        onClick={() => onLoad(text)} disabled={!text.trim()}>Load pasted JSON</button>
    </div>
  );
}
