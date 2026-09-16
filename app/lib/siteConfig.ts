/**
 * siteConfig.ts
 *
 * The editable "live template". Everything the Career Center can change from
 * /admin lives in this one object: default formatting, the section list, the
 * headings printed on the CV, every placeholder, and the app's branding copy.
 *
 * DEFAULT_TEMPLATE below is the built-in YU template. It is the fallback the
 * app renders when Supabase is unconfigured, unreachable, or has never been
 * published to — so the site always works, even with no backend at all.
 */

import type { ActiveSection, ResumeSettings } from '../types/resume';
import { FORM_PLACEHOLDER_DEFAULTS } from './placeholders';

/** Bump when the shape changes in a way old stored configs can't satisfy. */
export const TEMPLATE_SCHEMA_VERSION = 2;

export interface SectionConfig {
  id: ActiveSection;
  /** Label in the left-hand section nav. */
  navLabel: string;
  /** Heading printed on the CV / PDF / DOCX (rendered uppercase). */
  cvHeading: string;
  /** Hidden sections disappear from the nav and never render on the CV. */
  enabled: boolean;
}

/** Inline labels the CV renderer prints alongside content. */
export interface CvLabels {
  expectedGraduation: string;
  relevantCoursework: string;
  clubs: string;
  interests: string;
  linkedinText: string;
  namePlaceholder: string;
  contactPlaceholder: string;
}

/** App chrome copy — not part of the CV itself. */
export interface BrandingConfig {
  appTitle: string;
  appSubtitle: string;
  creditPrefix: string;
  creditName: string;
  creditUrl: string;
  creditSuffix: string;
  pageLimitWarning: string;
}

/**
 * A Word-style "paragraph style": one of these per kind of line on the CV.
 * Changing it re-styles every line of that kind, in the preview, the PDF and
 * the Word export at once.
 *
 * Sentinels: fontSize 0, fontFamily '' and color '' all mean "inherit from
 * the page style", so an element only overrides what it explicitly sets.
 */
export interface ElementStyle {
  fontFamily: string;
  fontSize: number;          // pt, 0 = inherit
  bold: boolean;
  italic: boolean;
  underline: boolean;
  uppercase: boolean;
  color: string;             // hex, '' = inherit
  align: 'left' | 'center' | 'right' | 'justify';
  spaceBefore: number;       // pt
  spaceAfter: number;        // pt
}

/** Document-wide defaults, like Word's page setup + Normal style. */
export interface PageStyle {
  fontFamily: string;
  fontSize: number;          // pt
  lineHeight: number;
  marginV: number;           // inches
  marginH: number;           // inches
  ruleColor: string;
  ruleWidth: number;         // px
}

export type ElementKey =
  | 'name' | 'contact' | 'sectionHeading' | 'institution' | 'location'
  | 'roleTitle' | 'dates' | 'body' | 'bullet' | 'inlineLabel' | 'university';

/** Human names shown in the admin style picker. */
export const ELEMENT_LABELS: Record<ElementKey, string> = {
  name:           'Full name',
  contact:        'Contact line',
  sectionHeading: 'Section heading',
  institution:    'Institution / employer',
  university:     'University / school',
  location:       'Location',
  roleTitle:      'Job title / degree',
  dates:          'Dates',
  body:           'Paragraph text',
  bullet:         'Bullet text',
  inlineLabel:    'Inline labels (Clubs, Coursework)',
};

export const ELEMENT_KEYS = Object.keys(ELEMENT_LABELS) as ElementKey[];

const BASE_EL: ElementStyle = {
  fontFamily: '', fontSize: 0, bold: false, italic: false, underline: false,
  uppercase: false, color: '', align: 'left', spaceBefore: 0, spaceAfter: 0,
};

export interface TemplateConfig {
  schemaVersion: number;
  defaults: ResumeSettings;
  sections: SectionConfig[];
  page: PageStyle;
  elements: Record<ElementKey, ElementStyle>;
  cvLabels: CvLabels;
  branding: BrandingConfig;
  placeholders: Record<string, string>;
  fontChoices: { label: string; value: string }[];
  accentChoices: string[];
}

// ---------------------------------------------------------------------------
// The built-in YU template (fallback + "Reset to default" target)
// ---------------------------------------------------------------------------

export const DEFAULT_TEMPLATE: TemplateConfig = {
  schemaVersion: TEMPLATE_SCHEMA_VERSION,

  defaults: {
    paperSize: 'letter',
    density: 'compact',
    fontFamily: '"Times New Roman", Times, serif',
    accentColor: '#000000',
    showRules: true,
  },

  sections: [
    { id: 'contact',         navLabel: 'Contact Information',             cvHeading: 'Contact',                                enabled: true },
    { id: 'objective',       navLabel: 'Objective',                       cvHeading: 'Objective',                              enabled: true },
    { id: 'education',       navLabel: 'Education',                       cvHeading: 'Education',                              enabled: true },
    { id: 'skills',          navLabel: 'Skills',                          cvHeading: 'Skills',                                 enabled: true },
    { id: 'experience',      navLabel: 'Experience & Projects',           cvHeading: 'Professional & Project Experience',      enabled: true },
    { id: 'volunteer',       navLabel: 'Volunteer Leadership (Optional)', cvHeading: 'Volunteer Leadership',                   enabled: true },
    { id: 'certifications',  navLabel: 'Certifications (If Applicable)',  cvHeading: 'Certifications',                         enabled: true },
    { id: 'extracurricular', navLabel: 'Extracurricular',                 cvHeading: 'Extracurricular Activities & Interests', enabled: true },
  ],

  // Page setup. These reproduce today's "compact" look exactly; choosing
  // "normal" density adds a little size, leading and margin on top.
  page: {
    fontFamily: '',
    fontSize: 10.5,
    lineHeight: 1.18,
    marginV: 0.55,
    marginH: 0.7,
    ruleColor: '#000000',
    ruleWidth: 1,
  },

  elements: {
    name:           { ...BASE_EL, fontSize: 16, bold: true, align: 'center', spaceAfter: 2 },
    contact:        { ...BASE_EL, fontSize: 10.5, align: 'center', spaceAfter: 6 },
    sectionHeading: { ...BASE_EL, fontSize: 11, bold: true, uppercase: true, spaceBefore: 2, spaceAfter: 2 },
    institution:    { ...BASE_EL, bold: true, underline: true },
    university:     { ...BASE_EL, bold: true },
    location:       { ...BASE_EL, bold: true, align: 'right' },
    roleTitle:      { ...BASE_EL, italic: true },
    dates:          { ...BASE_EL, italic: true, align: 'right' },
    body:           { ...BASE_EL, align: 'justify', spaceAfter: 2 },
    bullet:         { ...BASE_EL, align: 'justify', spaceAfter: 2 },
    inlineLabel:    { ...BASE_EL, bold: true },
  },

  cvLabels: {
    expectedGraduation: 'Expected Graduation',
    relevantCoursework: 'Relevant Coursework',
    clubs: 'Clubs',
    interests: 'Interests',
    linkedinText: 'LinkedIn',
    namePlaceholder: '[Your Name]',
    contactPlaceholder: '[Phone] | [Email] | [City, Country] | [LinkedIn]',
  },

  branding: {
    appTitle: 'Resume Builder',
    appSubtitle: 'YU Career Center · Student Template',
    creditPrefix: 'Built with',
    creditName: 'Abdulrahman Alaasi',
    creditUrl: 'https://abdulrahman.alaasi.dev/',
    creditSuffix: 'Supervised by the Career Center at YU',
    pageLimitWarning: 'YU usually requires a 1-page CV',
  },

  placeholders: { ...FORM_PLACEHOLDER_DEFAULTS },

  fontChoices: [
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Georgia',         value: 'Georgia, "Times New Roman", serif' },
    { label: 'Garamond',        value: '"EB Garamond", Garamond, serif' },
    { label: 'Cambria',         value: 'Cambria, Georgia, serif' },
  ],

  accentChoices: ['#000000', '#1a3a6b', '#4f6ef7', '#7c5cfc', '#0f766e', '#9a2540'],
};

// ---------------------------------------------------------------------------
// Merge / validation
// ---------------------------------------------------------------------------

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Merge a stored (possibly older / partial / hand-edited) config over the
 * built-in defaults. Unknown keys are dropped and missing keys fall back, so
 * a config saved before a new field existed still loads cleanly.
 */
export function mergeTemplate(stored: unknown): TemplateConfig {
  if (!isPlainObject(stored)) return DEFAULT_TEMPLATE;

  const d = DEFAULT_TEMPLATE;
  const s = stored as Partial<TemplateConfig>;

  // Sections: keep the stored order, but only ids the app actually knows,
  // and append any built-in section the stored config is missing.
  const knownIds = new Set(d.sections.map((x) => x.id));
  const storedSections = Array.isArray(s.sections) ? s.sections : [];
  const seen = new Set<string>();
  const sections: SectionConfig[] = [];

  for (const raw of storedSections) {
    if (!isPlainObject(raw)) continue;
    const id = raw.id as ActiveSection;
    if (!knownIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    const fallback = d.sections.find((x) => x.id === id)!;
    sections.push({
      id,
      navLabel:  typeof raw.navLabel  === 'string'  ? raw.navLabel  : fallback.navLabel,
      cvHeading: typeof raw.cvHeading === 'string'  ? raw.cvHeading : fallback.cvHeading,
      enabled:   typeof raw.enabled   === 'boolean' ? raw.enabled   : fallback.enabled,
    });
  }
  for (const fallback of d.sections) {
    if (!seen.has(fallback.id)) sections.push({ ...fallback });
  }

  // Placeholders: only keys the app knows about.
  const placeholders: Record<string, string> = { ...d.placeholders };
  if (isPlainObject(s.placeholders)) {
    for (const key of Object.keys(d.placeholders)) {
      const v = (s.placeholders as Record<string, unknown>)[key];
      if (typeof v === 'string') placeholders[key] = v;
    }
  }

  const fontChoices = Array.isArray(s.fontChoices)
    ? s.fontChoices.filter(
        (f): f is { label: string; value: string } =>
          isPlainObject(f) && typeof f.label === 'string' && typeof f.value === 'string',
      )
    : d.fontChoices;

  const accentChoices = Array.isArray(s.accentChoices)
    ? s.accentChoices.filter((c): c is string => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c))
    : d.accentChoices;

  return {
    schemaVersion: TEMPLATE_SCHEMA_VERSION,
    defaults: { ...d.defaults, ...(isPlainObject(s.defaults) ? s.defaults : {}) },
    page: { ...d.page, ...(isPlainObject(s.page) ? s.page : {}) },
    elements: mergeElements(s.elements),
    cvLabels: { ...d.cvLabels, ...(isPlainObject(s.cvLabels) ? s.cvLabels : {}) },
    branding: { ...d.branding, ...(isPlainObject(s.branding) ? s.branding : {}) },
    sections: sections.length ? sections : d.sections,
    placeholders,
    fontChoices:   fontChoices.length   ? fontChoices   : d.fontChoices,
    accentChoices: accentChoices.length ? accentChoices : d.accentChoices,
  };
}


/** Merge stored element styles over the built-ins, key by key. */
function mergeElements(stored: unknown): Record<ElementKey, ElementStyle> {
  const out = {} as Record<ElementKey, ElementStyle>;
  const src = isPlainObject(stored) ? stored : {};
  for (const key of ELEMENT_KEYS) {
    const raw = (src as Record<string, unknown>)[key];
    out[key] = { ...DEFAULT_TEMPLATE.elements[key], ...(isPlainObject(raw) ? raw : {}) };
  }
  return out;
}

/** Resolve an element's effective style against the page style. */
export function resolveStyle(config: TemplateConfig, key: ElementKey) {
  const el = config.elements[key] ?? DEFAULT_TEMPLATE.elements[key];
  return {
    ...el,
    fontFamily: el.fontFamily || config.page.fontFamily,
    fontSize: el.fontSize || config.page.fontSize,
  };
}

/** Sections that are enabled, in configured order. */
export function visibleSections(config: TemplateConfig): SectionConfig[] {
  return config.sections.filter((s) => s.enabled);
}

/** Look up a CV heading by section id, falling back to the built-in text. */
export function headingFor(config: TemplateConfig, id: ActiveSection): string {
  const found = config.sections.find((s) => s.id === id);
  if (found) return found.cvHeading;
  return DEFAULT_TEMPLATE.sections.find((s) => s.id === id)?.cvHeading ?? '';
}

/** True when a section is enabled (unknown ids default to visible). */
export function isSectionEnabled(config: TemplateConfig, id: ActiveSection): boolean {
  const found = config.sections.find((s) => s.id === id);
  return found ? found.enabled : true;
}
