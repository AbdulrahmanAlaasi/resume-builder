/**
 * yamamerBridge.ts
 *
 * Pure logic for the Yamamer ↔ resume-builder postMessage bridge.
 * No React, no store imports — just types, validators, and helpers.
 * The actual event wiring lives in app/hooks/useYamamerBridge.ts.
 */

import { ResumeData, ResumeSettings } from '../types/resume';

// ---------------------------------------------------------------------------
// Origin allowlist
// ---------------------------------------------------------------------------

const BASE_ALLOWED_ORIGINS: readonly string[] = [
  'https://yamamer.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

/**
 * Returns the full set of allowed origins.
 * Extra origins can be appended at build time via the env var
 * NEXT_PUBLIC_YAMAMER_ORIGINS (comma-separated list).
 */
function getAllowedOrigins(): string[] {
  const extra = (process.env.NEXT_PUBLIC_YAMAMER_ORIGINS ?? '').trim();
  const extras = extra ? extra.split(',').map((s) => s.trim()).filter(Boolean) : [];
  return [...BASE_ALLOWED_ORIGINS, ...extras];
}

export function isAllowedOrigin(origin: string): boolean {
  return getAllowedOrigins().includes(origin);
}

// ---------------------------------------------------------------------------
// Message types
// ---------------------------------------------------------------------------

export type InboundMessageType =
  | 'YAMAMER_RESUME_GET_STATE'
  | 'YAMAMER_RESUME_PREFILL_PROFILE'
  | 'YAMAMER_RESUME_UPDATE_FIELD'
  | 'YAMAMER_RESUME_REPLACE_STATE';

export type OutboundMessageType =
  | 'RESU_READY'
  | 'RESU_STATE'
  | 'RESU_CHANGED'
  | 'RESU_ERROR';

const INBOUND_TYPES = new Set<InboundMessageType>([
  'YAMAMER_RESUME_GET_STATE',
  'YAMAMER_RESUME_PREFILL_PROFILE',
  'YAMAMER_RESUME_UPDATE_FIELD',
  'YAMAMER_RESUME_REPLACE_STATE',
]);

export function isKnownInboundType(type: unknown): type is InboundMessageType {
  return typeof type === 'string' && INBOUND_TYPES.has(type as InboundMessageType);
}

// ---------------------------------------------------------------------------
// Outbound payload helpers
// ---------------------------------------------------------------------------

export function buildStatePayload(data: ResumeData, settings: ResumeSettings) {
  return {
    resume: data,
    meta: {
      density: settings.density,
      updatedAt: new Date().toISOString(),
    },
  };
}

// ---------------------------------------------------------------------------
// YAMAMER_RESUME_UPDATE_FIELD — path resolution
// ---------------------------------------------------------------------------

/** Segments that could enable prototype pollution — always rejected. */
const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

function safeSegments(path: string): string[] | null {
  const parts = path.split('.');
  if (parts.some((p) => !p || FORBIDDEN_SEGMENTS.has(p))) return null;
  return parts;
}

/** Valid contact field keys. */
const CONTACT_FIELDS = new Set<keyof ResumeData['contact']>([
  'fullName', 'phone', 'email', 'city', 'country', 'linkedin',
]);

/** Valid per-entry field keys for education and experience updates. */
const EDUCATION_FIELDS = new Set<string>([
  'university', 'location', 'degree', 'graduationDate', 'relevantCoursework', 'awards',
]);
const EXPERIENCE_FIELDS = new Set<string>([
  'institution', 'institutionDesc', 'location', 'jobTitle', 'startDate', 'endDate',
]);

/** Strict non-negative array index parser — rejects "5abc", "1.5", "", "-1". */
function parseIndex(segment: string): number | null {
  if (!/^\d+$/.test(segment)) return null;
  return Number(segment);
}

export type FieldUpdate =
  | { kind: 'contact';            field: keyof ResumeData['contact']; value: string }
  | { kind: 'objective';          value: string }
  | { kind: 'education';          idx: number; field: string; value: string }
  | { kind: 'skill';              idx: number; value: string }
  | { kind: 'experience';         idx: number; field: string; value: string }
  | { kind: 'experienceBullet';   idx: number; bulletIdx: number; value: string }
  | { kind: 'volunteer';          idx: number; value: string }
  | { kind: 'certification';      idx: number; value: string }
  | { kind: 'extracurricular';    idx: number; value: string }
  | { kind: 'error';              reason: string };

/**
 * Parses a dot-path like "education.0.degree" into a typed update descriptor.
 * Returns { kind: 'error' } on invalid or unsafe paths.
 */
export function resolveFieldUpdate(path: string, value: string): FieldUpdate {
  const segments = safeSegments(path);
  if (!segments) return { kind: 'error', reason: `Forbidden path: "${path}"` };

  const [root, ...rest] = segments;

  // contact.*
  if (root === 'contact') {
    const field = rest[0] as keyof ResumeData['contact'];
    if (!CONTACT_FIELDS.has(field)) {
      return { kind: 'error', reason: `Unknown contact field: "${rest[0]}"` };
    }
    return { kind: 'contact', field, value };
  }

  // objective
  if (root === 'objective') {
    return { kind: 'objective', value };
  }

  // education.{idx}.{field}
  if (root === 'education') {
    const idx = parseIndex(rest[0]);
    if (idx === null) return { kind: 'error', reason: `Invalid education index: "${rest[0]}"` };
    if (!rest[1]) return { kind: 'error', reason: 'Missing education field' };
    if (!EDUCATION_FIELDS.has(rest[1])) {
      return { kind: 'error', reason: `Unknown education field: "${rest[1]}"` };
    }
    return { kind: 'education', idx, field: rest[1], value };
  }

  // skills.{idx}
  if (root === 'skills') {
    const idx = parseIndex(rest[0]);
    if (idx === null) return { kind: 'error', reason: `Invalid skills index: "${rest[0]}"` };
    return { kind: 'skill', idx, value };
  }

  // experiences.{idx}.{field|bullets.{bulletIdx}}
  // Also accepts "projects" as a legacy alias for "experiences".
  if (root === 'experiences' || root === 'projects') {
    const idx = parseIndex(rest[0]);
    if (idx === null) return { kind: 'error', reason: `Invalid experience index: "${rest[0]}"` };
    if (rest[1] === 'bullets') {
      const bulletIdx = parseIndex(rest[2]);
      if (bulletIdx === null) return { kind: 'error', reason: `Invalid bullet index: "${rest[2]}"` };
      return { kind: 'experienceBullet', idx, bulletIdx, value };
    }
    if (!rest[1]) return { kind: 'error', reason: 'Missing experience field' };
    if (!EXPERIENCE_FIELDS.has(rest[1])) {
      return { kind: 'error', reason: `Unknown experience field: "${rest[1]}"` };
    }
    return { kind: 'experience', idx, field: rest[1], value };
  }

  // volunteers.{idx}
  if (root === 'volunteers') {
    const idx = parseIndex(rest[0]);
    if (idx === null) return { kind: 'error', reason: `Invalid volunteer index: "${rest[0]}"` };
    return { kind: 'volunteer', idx, value };
  }

  // certifications.{idx}
  if (root === 'certifications') {
    const idx = parseIndex(rest[0]);
    if (idx === null) return { kind: 'error', reason: `Invalid certification index: "${rest[0]}"` };
    return { kind: 'certification', idx, value };
  }

  // extracurriculars.{idx}
  if (root === 'extracurriculars') {
    const idx = parseIndex(rest[0]);
    if (idx === null) return { kind: 'error', reason: `Invalid extracurricular index: "${rest[0]}"` };
    return { kind: 'extracurricular', idx, value };
  }

  return { kind: 'error', reason: `Unknown path root: "${root}"` };
}

// ---------------------------------------------------------------------------
// YAMAMER_RESUME_REPLACE_STATE — shape validation
// ---------------------------------------------------------------------------

/**
 * Loose structural check — enough to confirm the payload is a ResumeData
 * object before we clone and load it. Individual missing fields will just
 * render as empty strings inside the builder.
 */
export function isValidResumeDataShape(obj: unknown): obj is ResumeData {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;
  const d = obj as Record<string, unknown>;
  return (
    typeof d.contact === 'object' && d.contact !== null &&
    typeof d.objective === 'object' && d.objective !== null &&
    Array.isArray(d.education) &&
    Array.isArray(d.skills) &&
    Array.isArray(d.experiences)
  );
}
