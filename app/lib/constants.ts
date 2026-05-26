import type { ActiveSection, ResumeSettings } from '../types/resume';

/**
 * Single source of truth for the section list shown in the builder accordion.
 * The order here is the order students see in the UI.
 */
export const SECTIONS: { id: ActiveSection; label: string }[] = [
  { id: 'contact',         label: 'Contact Information'  },
  { id: 'objective',       label: 'Objective'            },
  { id: 'education',       label: 'Education'            },
  { id: 'skills',          label: 'Skills'               },
  { id: 'experience',      label: 'Experience & Projects' },
  { id: 'volunteer',       label: 'Volunteer Leadership (Optional)' },
  { id: 'certifications',  label: 'Certifications (If Applicable)' },
  { id: 'extracurricular', label: 'Extracurricular'      },
];

/**
 * Serif-only by design — the YU template requires a serif body face.
 * Adding sans-serif options would break template fidelity.
 */
export const FONT_CHOICES: { label: string; value: string }[] = [
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia',         value: 'Georgia, "Times New Roman", serif' },
  { label: 'Garamond',        value: '"EB Garamond", Garamond, serif' },
  { label: 'Cambria',         value: 'Cambria, Georgia, serif' },
];

/**
 * Section-heading colour swatches. Black is the YU default.
 */
export const ACCENT_CHOICES: string[] = [
  '#000000', '#1a3a6b', '#4f6ef7', '#7c5cfc', '#0f766e', '#9a2540',
];

/**
 * YU-approved defaults. `resetSettings()` in the store restores these.
 */
export const DEFAULT_SETTINGS: ResumeSettings = {
  paperSize:   'letter',
  density:     'compact',
  fontFamily:  '"Times New Roman", Times, serif',
  accentColor: '#000000',
  showRules:   true,
};
