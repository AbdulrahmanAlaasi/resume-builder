'use client';

/**
 * useYamamerBridge
 *
 * React hook that wires the Yamamer ↔ resume-builder postMessage bridge
 * to the Zustand store. Mount this once in the root page component.
 *
 * When the app is NOT embedded in an iframe (e.g. opened directly by a
 * student), the hook is completely inert — no listeners, no messages.
 */

import { useEffect, useRef, useCallback } from 'react';
import { useResumeStore } from '../store/resumeStore';
import {
  isAllowedOrigin,
  isKnownInboundType,
  buildStatePayload,
  resolveFieldUpdate,
  isValidResumeDataShape,
} from '../lib/yamamerBridge';
import { ResumeData } from '../types/resume';

/** How long to wait after the last data change before firing RESU_CHANGED. */
const CHANGED_DEBOUNCE_MS = 400;

/** Returns true when running inside a cross-origin iframe. */
function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    // Accessing window.top throws in cross-origin iframes — we're in one.
    return true;
  }
}

export function useYamamerBridge(): void {
  // Subscribe to data + settings so the RESU_CHANGED effect re-runs on changes.
  const data     = useResumeStore((s) => s.data);
  const settings = useResumeStore((s) => s.settings);

  /**
   * The origin of the first trusted parent message we received.
   * We use this for proactive sends (RESU_CHANGED) where we have no
   * event.origin to key off.
   */
  const parentOriginRef = useRef<string | null>(null);
  const debounceRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------------------------------------------------------------------
  // Send a postMessage to the parent window.
  // targetOrigin defaults to the stored parent origin, then '*' as a
  // last resort (only used for RESU_READY before any message is received).
  // ------------------------------------------------------------------
  const postToParent = useCallback(
    (type: string, payload?: unknown, targetOrigin?: string) => {
      const origin = targetOrigin ?? parentOriginRef.current ?? '*';
      try {
        window.parent.postMessage({ type, payload }, origin);
      } catch {
        // Swallow — window.parent may be same-window when not in iframe.
      }
    },
    [],
  );

  // ------------------------------------------------------------------
  // Inbound message handler
  // ------------------------------------------------------------------
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // 1. Origin guard
      if (!isAllowedOrigin(event.origin)) return;

      const msg = event.data as { type?: unknown; payload?: unknown } | null;
      if (!msg || !isKnownInboundType(msg.type)) return;

      // Track parent origin on first trusted contact
      if (!parentOriginRef.current) {
        parentOriginRef.current = event.origin;
      }

      const type    = msg.type;
      const payload = msg.payload;
      const reply   = (t: string, p?: unknown) => postToParent(t, p, event.origin);
      const err     = (reason: string) =>
        reply('RESU_ERROR', { reason, originalType: type });

      // Always read fresh state inside the handler to avoid stale closure.
      const s = useResumeStore.getState();

      switch (type) {
        // ----------------------------------------------------------------
        case 'YAMAMER_RESUME_GET_STATE': {
          reply('RESU_STATE', buildStatePayload(s.data, s.settings));
          break;
        }

        // ----------------------------------------------------------------
        case 'YAMAMER_RESUME_PREFILL_PROFILE': {
          if (typeof payload !== 'object' || payload === null) {
            err('payload must be an object');
            break;
          }
          const p         = payload as Record<string, unknown>;
          const overwrite = p.overwrite === true;
          const cur       = s.data.contact;

          const contactPatch: Partial<ResumeData['contact']> = {};
          const maybeSet = (
            field: keyof ResumeData['contact'],
            raw: unknown,
          ) => {
            if (typeof raw === 'string' && raw.trim() && (overwrite || !cur[field])) {
              contactPatch[field] = raw.trim();
            }
          };

          maybeSet('fullName', p.full_name);
          maybeSet('email',    p.email);
          maybeSet('phone',    p.phone);
          maybeSet('city',     p.city);
          maybeSet('country',  p.country);
          maybeSet('linkedin', p.linkedin_url);

          if (Object.keys(contactPatch).length) {
            s.updateContact(contactPatch);
          }

          // Map expected_graduation → first education entry
          const grad = p.expected_graduation;
          if (typeof grad === 'string' && grad.trim()) {
            const firstEdu = s.data.education[0];
            if (firstEdu && (overwrite || !firstEdu.graduationDate)) {
              s.updateEducation(firstEdu.id, { graduationDate: grad.trim() });
            }
          }
          break;
        }

        // ----------------------------------------------------------------
        case 'YAMAMER_RESUME_UPDATE_FIELD': {
          if (typeof payload !== 'object' || payload === null) {
            err('payload must be { path: string, value: string }');
            break;
          }
          const { path, value } = payload as { path?: unknown; value?: unknown };
          if (typeof path !== 'string' || typeof value !== 'string') {
            err('"path" and "value" must both be strings');
            break;
          }

          const update = resolveFieldUpdate(path, value);

          if (update.kind === 'error') {
            err(update.reason);
            break;
          }

          // Re-read state so index lookups are fresh
          const fresh = useResumeStore.getState();

          switch (update.kind) {
            case 'contact':
              fresh.updateContact({ [update.field]: update.value });
              break;

            case 'objective':
              fresh.updateObjective(update.value);
              break;

            case 'education': {
              const edu = fresh.data.education[update.idx];
              if (!edu) { err(`No education entry at index ${update.idx}`); break; }
              fresh.updateEducation(edu.id, { [update.field]: update.value });
              break;
            }

            case 'skill': {
              const skill = fresh.data.skills[update.idx];
              if (!skill) { err(`No skill at index ${update.idx}`); break; }
              fresh.updateSkill(skill.id, update.value);
              break;
            }

            case 'experience': {
              const exp = fresh.data.experiences[update.idx];
              if (!exp) { err(`No experience at index ${update.idx}`); break; }
              fresh.updateExperience(exp.id, { [update.field]: update.value });
              break;
            }

            case 'experienceBullet': {
              const exp = fresh.data.experiences[update.idx];
              if (!exp) { err(`No experience at index ${update.idx}`); break; }
              fresh.updateExperienceBullet(exp.id, update.bulletIdx, update.value);
              break;
            }

            case 'volunteer': {
              const vol = fresh.data.volunteers[update.idx];
              if (!vol) { err(`No volunteer at index ${update.idx}`); break; }
              fresh.updateVolunteer(vol.id, update.value);
              break;
            }

            case 'certification': {
              const cert = fresh.data.certifications[update.idx];
              if (!cert) { err(`No certification at index ${update.idx}`); break; }
              fresh.updateCertification(cert.id, update.value);
              break;
            }

            case 'extracurricular': {
              const extra = fresh.data.extracurriculars[update.idx];
              if (!extra) { err(`No extracurricular at index ${update.idx}`); break; }
              fresh.updateExtracurricular(extra.id, update.value);
              break;
            }
          }
          break;
        }

        // ----------------------------------------------------------------
        case 'YAMAMER_RESUME_REPLACE_STATE': {
          if (!isValidResumeDataShape(payload)) {
            err('payload must be a valid ResumeData object (contact, objective, education[], skills[], experiences[])');
            break;
          }
          // Deep-clone via JSON to strip any prototype tricks
          const safe = JSON.parse(JSON.stringify(payload)) as ResumeData;
          s.loadExample(safe);
          break;
        }
      }
    },
    [postToParent],
  );

  // ------------------------------------------------------------------
  // Mount: send RESU_READY, attach listener
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isInIframe()) return;

    postToParent('RESU_READY', { version: '1.0' });
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage, postToParent]);

  // ------------------------------------------------------------------
  // Send RESU_CHANGED whenever resume data changes (debounced)
  // Only fires after at least one trusted parent has made contact.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isInIframe()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (!parentOriginRef.current) return; // no parent connected yet
      postToParent('RESU_CHANGED', buildStatePayload(data, settings));
    }, CHANGED_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data, settings, postToParent]);
}
