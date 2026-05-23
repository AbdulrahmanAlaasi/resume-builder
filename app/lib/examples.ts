import type { ResumeData, ResumeSettings } from '../types/resume';
import { DEFAULT_SETTINGS } from './constants';

export interface CvExample {
  id: string;
  title: string;
  subtitle: string;
  data: ResumeData;
  settings: ResumeSettings;
}

const emptyProjects: ResumeData['projects'] = [
  { id: 'legacy-project', institution: '', location: '', title: '', startDate: '', endDate: '', bullets: [''] },
];

export const CV_EXAMPLES: CvExample[] = [
  {
    id: 'software-ai',
    title: 'Software / AI CV',
    subtitle: 'Technical student with AI and web projects',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'Abdulrahman Alaasi',
        phone: '+966 55 430 5610',
        email: 'Abdulrahmanalaasi24@gmail.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://www.linkedin.com/in/abdulrahman',
      },
      objective: {
        text: 'Software engineering student skilled in Python, Django, Java, full-stack development, and AI systems. Strong background in backend architecture, modern web technologies, and delivering efficient user-focused solutions through real projects and hackathons.',
      },
      education: [
        {
          id: 'edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Science in Software Engineering',
          graduationDate: 'January 2027',
          relevantCoursework: 'Data Structures & Algorithms, Software Architecture & Design',
          awards: "First Class Honor with two consecutive years in the Dean's List.",
        },
      ],
      skills: [
        { id: 'skill-1', text: 'Technical Skills Python, Django, Java, JavaScript, TypeScript, React, Next.js, SQL, OOP, APIs' },
        { id: 'skill-2', text: 'Soft Skills Problem Solving, Analytical Thinking, Leadership, Team Collaboration, Critical Thinking' },
      ],
      experiences: [
        {
          id: 'exp-1',
          institution: 'Yamamer AI Assistant',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Lead Software Engineer & System Architect',
          startDate: '2025',
          endDate: '2026',
          bullets: [
            'Engineered a RAG-based AI university assistant covering academic workflows with a structured knowledge base.',
            'Built with Django REST Framework, React, Supabase, PostgreSQL, Gemini embeddings, and Anthropic Claude API.',
          ],
        },
        {
          id: 'exp-2',
          institution: 'Resume Builder Web Application',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Full Stack Development',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Built a production-ready multi-section resume builder using Next.js, TypeScript, and Tailwind CSS.',
          ],
        },
      ],
      projects: emptyProjects,
      volunteers: [{ id: 'vol-1', text: '' }],
      certifications: [
        { id: 'cert-1', text: 'Build an AI Agent, IBM SkillsBuild 2026' },
        { id: 'cert-2', text: 'Web Development Fundamentals, IBM SkillsBuild 2026' },
      ],
      extracurriculars: [
        { id: 'extra-1', type: 'club', text: 'Google Developer Group at Al Yamamah University' },
        { id: 'extra-2', type: 'interest', text: 'Software architecture, AI applications, open-source contribution, UI/UX design' },
      ],
    },
  },
  {
    id: 'business-admin',
    title: 'Business Student CV',
    subtitle: 'Co-op example for operations or administration',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'Student Name',
        phone: '+966 55 123 4567',
        email: 'student@email.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://linkedin.com/in/student',
      },
      objective: {
        text: 'Business administration student seeking a cooperative training opportunity to apply analytical, communication, and organizational skills in a professional environment.',
      },
      education: [
        {
          id: 'edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Business Administration',
          graduationDate: 'May 2027',
          relevantCoursework: 'Principles of Management, Marketing, Business Analytics, Accounting',
          awards: "Dean's List for academic achievement.",
        },
      ],
      skills: [
        { id: 'skill-1', text: 'Microsoft Excel, PowerPoint, business research, data analysis, report writing' },
        { id: 'skill-2', text: 'Presentation skills, teamwork, problem solving, time management, communication' },
      ],
      experiences: [
        {
          id: 'exp-1',
          institution: 'Market Analysis Project',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Student Researcher',
          startDate: '2025',
          endDate: '2025',
          bullets: [
            'Analyzed customer behavior and competitor positioning for a local service business.',
            'Prepared a presentation with recommendations for pricing, promotion, and customer retention.',
          ],
        },
      ],
      projects: emptyProjects,
      volunteers: [
        { id: 'vol-1', text: 'Organized student club events and supported attendee registration.' },
      ],
      certifications: [
        { id: 'cert-1', text: 'Excel for Business, 2025' },
      ],
      extracurriculars: [
        { id: 'extra-1', type: 'club', text: 'Business Club member' },
        { id: 'extra-2', type: 'interest', text: 'Entrepreneurship, public speaking, business strategy' },
      ],
    },
  },
];
