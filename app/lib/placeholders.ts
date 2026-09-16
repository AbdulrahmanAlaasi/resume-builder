/**
 * Centralised placeholder copy for every form field in the builder.
 * Edit text here — changes propagate to every form input automatically.
 *
 * The keys are stable identifiers (not display labels), so renaming a
 * form label doesn't require updating these.
 */

const DEFAULTS = {
  // Contact
  contactFullName: 'Abdulrahman Alaasi',
  contactPhone: '+966 55 123 4567',
  contactEmail: 'Email@gmail.com',
  contactCity: 'Riyadh',
  contactCountry: 'Saudi Arabia',
  contactLinkedIn: 'https://linkedin.com/in/yourprofile',

  // Objective
  objectiveText: 'A brief statement about your career objective and what you hope to achieve through the co-op experience.',

  // Education
  eduUniversity: 'Al Yamamah University',
  eduLocation: 'Riyadh, Saudi Arabia',
  eduDegree: 'BSc Computer Science',
  eduGraduationDate: 'May 2027',
  eduCoursework: 'Data Structures, Algorithms, Operating Systems',
  eduAwards: "Dean's List, scholarship name, etc.",

  // Skills
  skillText: 'Python, leadership, communication',

  // Experience
  expInstitution: 'Saudi Aramco or Personal Portfolio Website',
  expInstitutionDesc: 'Global energy company, academic project, or portfolio project',
  expLocation: 'Riyadh, Saudi Arabia',
  expJobTitle: 'Software Engineering Intern or Full-Stack Developer',
  expStartDate: 'June 2024',
  expEndDate: 'August 2024 (or Present)',
  expBullet: 'Quantify your achievements, responsibilities, project scope, technologies used, or outcomes.',

  // Projects
  projInstitution: 'Al Yamamah University',
  projLocation: 'Riyadh, Saudi Arabia',
  projTitle: 'Resume Builder - Website',
  projStartDate: 'September 2025',
  projEndDate: 'May 2026',
  projBullet: 'Describe the project scope, technologies used, and outcomes.',

  // Volunteer
  volunteerText: 'Google Developer Group Vice-President — organised campus-wide career fair (300+ attendees).',

  // Certifications
  certificationText: 'AWS Cloud Practitioner, June 2024.',

  // Extracurricular
  extracurricularClub: "Coding Club — organiser of monthly hackathons; member since 2023.",
  extracurricularInterest: 'Reading, basketball, learning Mandarin.',
} as const;

export type FormPlaceholderKey = keyof typeof DEFAULTS;

/** The built-in placeholder set — the fallback and the "reset" target. */
export const FORM_PLACEHOLDER_DEFAULTS: Record<string, string> = { ...DEFAULTS };

/**
 * The currently-live placeholder set. Starts as the built-ins and is replaced
 * by `setLivePlaceholders()` when the published template loads.
 */
let live: Record<string, string> = { ...DEFAULTS };

/**
 * Called by the config store whenever the published template changes.
 * Keeping this a one-way push (configStore → here) avoids a circular import.
 */
export function setLivePlaceholders(next: Record<string, string> | undefined): void {
  live = next ? { ...DEFAULTS, ...next } : { ...DEFAULTS };
}

/**
 * Forms keep importing this as `P` and reading `P.contactCity`. The proxy
 * resolves each read against the live set, so publishing new placeholder text
 * from /admin updates every form without touching a single form component.
 */
export const FORM_PLACEHOLDERS: Record<FormPlaceholderKey, string> = new Proxy(
  {} as Record<FormPlaceholderKey, string>,
  {
    get: (_t, key: string | symbol) =>
      (typeof key === 'string' ? live[key] : undefined) ?? '',
    has: (_t, key) => typeof key === 'string' && key in live,
    ownKeys: () => Reflect.ownKeys(live),
    getOwnPropertyDescriptor: (_t, key) =>
      typeof key === 'string' && key in live
        ? { value: live[key], enumerable: true, configurable: true, writable: false }
        : undefined,
  },
);
