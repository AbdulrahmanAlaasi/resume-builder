'use client';

/**
 * configStore.ts
 *
 * Holds the live template the public site renders.
 *
 * Load order, designed so the site is never blank or broken:
 *   1. Built-in DEFAULT_TEMPLATE renders immediately (zero latency).
 *   2. A cached copy from localStorage is applied on first load, so returning
 *      visitors see the published template with no flash of default content.
 *   3. The published config is fetched from Supabase and applied when it lands.
 *
 * If Supabase is unconfigured or unreachable the app simply keeps the
 * built-in template. Publishing is handled by the admin page, not here.
 */

import { create } from 'zustand';
import {
  DEFAULT_TEMPLATE, mergeTemplate, type TemplateConfig,
} from '../lib/siteConfig';
import { getSupabase, TABLES, SITE_CONFIG_ID, isSupabaseConfigured } from '../lib/supabase';
import { setLivePlaceholders } from '../lib/placeholders';

const CACHE_KEY = 'resume-builder-template-cache';

/** Where the currently-rendered template came from. */
export type ConfigSource = 'default' | 'cache' | 'remote' | 'error';

interface ConfigState {
  config: TemplateConfig;
  source: ConfigSource;
  loading: boolean;
  /** Fetch the published config. Safe to call repeatedly. */
  loadConfig: () => Promise<void>;
  /** Apply a config locally (admin live preview) without publishing it. */
  applyLocal: (config: TemplateConfig) => void;
}

function readCache(): TemplateConfig | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return mergeTemplate(JSON.parse(raw));
  } catch {
    return null;
  }
}

function writeCache(config: TemplateConfig) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(config));
  } catch {
    // Private mode / quota — the cache is an optimisation, never required.
  }
}

export const useConfigStore = create<ConfigState>()((set) => ({
  config: DEFAULT_TEMPLATE,
  source: 'default',
  loading: false,

  loadConfig: async () => {
    // Step 2 — instant paint from cache.
    const cached = typeof window !== 'undefined' ? readCache() : null;
    if (cached) {
      setLivePlaceholders(cached.placeholders);
      set({ config: cached, source: 'cache' });
    }

    if (!isSupabaseConfigured) return;

    set({ loading: true });
    try {
      const sb = await getSupabase();
      if (!sb) {
        set({ loading: false });
        return;
      }

      const { data, error } = await sb
        .from(TABLES.siteConfig)
        .select('config')
        .eq('id', SITE_CONFIG_ID)
        .maybeSingle();

      if (error) {
        set({ loading: false, source: cached ? 'cache' : 'error' });
        return;
      }

      if (data?.config) {
        const merged = mergeTemplate(data.config);
        writeCache(merged);
        setLivePlaceholders(merged.placeholders);
        set({ config: merged, source: 'remote', loading: false });
      } else {
        // Table exists but nothing published yet — built-in template stands.
        set({ loading: false });
      }
    } catch {
      set({ loading: false, source: cached ? 'cache' : 'error' });
    }
  },

  applyLocal: (config) => {
    setLivePlaceholders(config.placeholders);
    set({ config, source: 'cache' });
  },
}));

/** Cache helper reused by the admin page after a successful publish. */
export function cachePublishedConfig(config: TemplateConfig) {
  writeCache(config);
}
