/**
 * Centralised placeholder copy for every form field in the builder.
 * Edit text here — changes propagate to every form input automatically.
 *
 * The keys are stable identifiers (not display labels), so renaming a
 * form label doesn't require updating these.
 */

export const FORM_PLACEHOLDERS = {
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
  expInstitution: 'Saudi Aramco',
  expInstitutionDesc: 'Global energy company and world’s largest oil producer',
  expLocation: 'Dhahran, Saudi Arabia',
  expJobTitle: 'Software Engineering Intern',
  expStartDate: 'June 2024',
  expEndDate: 'August 2024 (or Present)',
  expBullet: 'Quantify your achievements — what impact did you have on the organization?',

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

export type FormPlaceholderKey = keyof typeof FORM_PLACEHOLDERS;
