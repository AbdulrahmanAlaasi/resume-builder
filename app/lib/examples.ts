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
    id: 'abdulrahman-alaasi-cv',
    title: 'Software Engineering CV',
    subtitle: 'Software engineering student example',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'Abdulrahman Alaasi',
        phone: '+966 554305610',
        email: 'Abdulrahmanalaasi24@gmail.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://www.linkedin.com/in/abdulrahman',
      },
      objective: {
        text: 'Software Engineer Specialist skilled in Python, Django, Java, HTML, CSS, full-stack development and RAG-based AI systems, with experience building scalable applications and AI powered systems. Strong background in system design, backend architecture, and modern web technologies, with a passion for delivering efficient and user-focused solutions. Experienced in working on real world projects and hackathons, including chatbot Assistant development and AI driven solutions.',
      },
      education: [
        {
          id: 'edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Science in Software Engineering',
          graduationDate: 'January 2027',
          relevantCoursework: 'Data Structures & Algorithms, Software Architecture & Design',
          awards: "First Class Honor with two consecutive years in the Dean's List for maintaining perfect academic GPA.",
        },
        {
          id: 'edu-2',
          university: 'INTERLINK International Institutes at YU',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Equivalent to 5.5 IELTS Score',
          graduationDate: '2022',
          relevantCoursework: '',
          awards: '',
        },
      ],
      skills: [
        {
          id: 'skill-1',
          text: 'Technical Skills Python, Django, Java, JavaScript, TypeScript, HTML, CSS3, Node.js, React, Next.js, SQL, OOP, Anthropic Claude API',
        },
        {
          id: 'skill-2',
          text: 'Soft Skills Problem Solving, Analytical Thinking, Leadership, Team Collaboration, Critical Thinking, Adaptability, Attention to Detail',
        },
      ],
      experiences: [
        {
          id: 'exp-1',
          institution: 'Yamamer AI Assistant',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Lead Software Engineer & System Architect https://yamamer.com',
          startDate: '2025',
          endDate: '2026',
          bullets: [
            'Engineered a RAG-based AI university assistant for Al Yamamah University covering 50+ academic workflows, backed by a 300+ article pgvector knowledge base with cosine similarity search.',
            'Built with Django REST Framework, React (Vite), Supabase, PostgreSQL, and Gemini API for embeddings and Anthropic Claude API (Haiku) as the core language model.',
          ],
        },
        {
          id: 'exp-2',
          institution: 'Resume Builder Web Application',
          institutionDesc: '',
          location: 'Riyadh Saudi Arabia',
          jobTitle: 'Full Stack Development',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Built a production-ready, multi-section resume builder web application from scratch using Next.js (App Router), TypeScript, and Tailwind CSS with a live real-time preview panel developed using Claude.',
          ],
        },
        {
          id: 'exp-3',
          institution: 'Personal Portfolio Website',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Full-Stack Developer https://abdulrahman.alaasi.dev',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Engineered a custom portfolio experience with a top-down SVG desk interface, interactive navigation elements, animated project previews, and responsive layouts across desktop and mobile.',
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
        {
          id: 'extra-1',
          type: 'club',
          text: 'Google Developer Group at Al Yamamah University. Engaged in collaborative coding challenges, technical seminars, and peer-led innovation sessions.',
        },
        {
          id: 'extra-2',
          type: 'interest',
          text: 'Software architecture & system design, AI/ML applications, open-source contribution, competitive programming, UI/UX design, tech entrepreneurship, and product building',
        },
      ],
    },
  },
  {
    id: 'network-engineering-cv',
    title: 'Network Engineering CV',
    subtitle: 'Network infrastructure and cybersecurity example',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'Network Engineering Student',
        phone: '+966 5XXXXXXXX',
        email: 'network.student@example.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://www.linkedin.com/in/network-student',
      },
      objective: {
        text: 'Network engineering student with strong interest in routing, switching, network security, and cloud infrastructure. Skilled in configuring Cisco-based networks, troubleshooting connectivity issues, and documenting technical solutions for reliable operations.',
      },
      education: [
        {
          id: 'net-edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Science in Network Engineering',
          graduationDate: 'May 2027',
          relevantCoursework: 'Computer Networks, Network Security, Cloud Computing, Linux Administration',
          awards: '',
        },
      ],
      skills: [
        { id: 'net-skill-1', text: 'Technical Skills Cisco Packet Tracer, TCP/IP, VLANs, Routing, Switching, Firewalls, Linux, Wireshark, Microsoft Azure Fundamentals' },
        { id: 'net-skill-2', text: 'Soft Skills Troubleshooting, Documentation, Team Collaboration, Analytical Thinking, Communication' },
      ],
      experiences: [
        {
          id: 'net-exp-1',
          institution: 'Campus Network Lab Project',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Network Design Student Project',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Designed a small enterprise network topology with VLAN segmentation, router-on-a-stick configuration, and basic access control rules.',
            'Documented IP addressing, device roles, and troubleshooting steps to support clear handoff and review.',
          ],
        },
      ],
      projects: emptyProjects,
      volunteers: [{ id: 'net-vol-1', text: 'Member, Cybersecurity and Networking Club at Al Yamamah University' }],
      certifications: [
        { id: 'net-cert-1', text: 'Cisco Networking Basics, Cisco Networking Academy' },
        { id: 'net-cert-2', text: 'Introduction to Cybersecurity, Cisco Networking Academy' },
      ],
      extracurriculars: [
        { id: 'net-extra-1', type: 'club', text: 'Participated in networking labs, technical workshops, and peer troubleshooting sessions.' },
        { id: 'net-extra-2', type: 'interest', text: 'Network automation, cloud networking, cybersecurity, Linux systems, and infrastructure monitoring' },
      ],
    },
  },
  {
    id: 'industrial-engineering-cv',
    title: 'Industrial Engineering CV',
    subtitle: 'Operations, quality, and process improvement example',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'Industrial Engineering Student',
        phone: '+966 5XXXXXXXX',
        email: 'industrial.student@example.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://www.linkedin.com/in/industrial-student',
      },
      objective: {
        text: 'Industrial engineering student interested in process improvement, operations analysis, and quality management. Experienced in using data-driven methods to identify inefficiencies, improve workflows, and support practical business decisions.',
      },
      education: [
        {
          id: 'ie-edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Science in Industrial Engineering',
          graduationDate: 'May 2027',
          relevantCoursework: 'Operations Research, Quality Control, Supply Chain Management, Engineering Economy',
          awards: '',
        },
      ],
      skills: [
        { id: 'ie-skill-1', text: 'Technical Skills Excel, Power BI, Process Mapping, Lean Six Sigma Concepts, Data Analysis, Simulation Basics' },
        { id: 'ie-skill-2', text: 'Soft Skills Problem Solving, Continuous Improvement, Presentation, Teamwork, Attention to Detail' },
      ],
      experiences: [
        {
          id: 'ie-exp-1',
          institution: 'Warehouse Process Improvement Project',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Industrial Engineering Student Project',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Mapped a receiving and inventory workflow to identify bottlenecks, duplicated steps, and opportunities for cycle-time reduction.',
            'Built a simple dashboard to summarize processing time, order volume, and improvement recommendations for class presentation.',
          ],
        },
      ],
      projects: emptyProjects,
      volunteers: [{ id: 'ie-vol-1', text: 'Volunteer, university events operations team' }],
      certifications: [
        { id: 'ie-cert-1', text: 'Lean Six Sigma White Belt' },
        { id: 'ie-cert-2', text: 'Data Analysis with Excel, Coursera' },
      ],
      extracurriculars: [
        { id: 'ie-extra-1', type: 'club', text: 'Participated in engineering case discussions and student-led process improvement activities.' },
        { id: 'ie-extra-2', type: 'interest', text: 'Supply chain, quality systems, operations analytics, lean management, and business process design' },
      ],
    },
  },
  {
    id: 'finance-cv',
    title: 'Finance CV',
    subtitle: 'Financial analysis and investment example',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'Finance Student',
        phone: '+966 5XXXXXXXX',
        email: 'finance.student@example.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://www.linkedin.com/in/finance-student',
      },
      objective: {
        text: 'Finance student with interest in financial analysis, valuation, and investment research. Skilled in Excel modeling, market research, and preparing concise financial summaries to support decision-making.',
      },
      education: [
        {
          id: 'fin-edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Science in Finance',
          graduationDate: 'May 2027',
          relevantCoursework: 'Corporate Finance, Investment Analysis, Financial Accounting, Risk Management',
          awards: '',
        },
      ],
      skills: [
        { id: 'fin-skill-1', text: 'Technical Skills Excel, Financial Modeling, PowerPoint, Ratio Analysis, Valuation Basics, Market Research' },
        { id: 'fin-skill-2', text: 'Soft Skills Analytical Thinking, Communication, Business Writing, Presentation, Time Management' },
      ],
      experiences: [
        {
          id: 'fin-exp-1',
          institution: 'Saudi Stock Market Analysis Project',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Finance Research Student Project',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Analyzed selected listed companies using profitability, liquidity, and leverage ratios to compare financial performance.',
            'Prepared a short investment brief summarizing industry trends, key risks, and recommendation rationale.',
          ],
        },
      ],
      projects: emptyProjects,
      volunteers: [{ id: 'fin-vol-1', text: 'Volunteer, Finance Club event coordination team' }],
      certifications: [
        { id: 'fin-cert-1', text: 'Bloomberg Market Concepts, in progress' },
        { id: 'fin-cert-2', text: 'Excel Skills for Business, Coursera' },
      ],
      extracurriculars: [
        { id: 'fin-extra-1', type: 'club', text: 'Member of the Finance Club, attending market updates, guest talks, and student investment discussions.' },
        { id: 'fin-extra-2', type: 'interest', text: 'Equity research, financial planning, fintech, valuation, and capital markets' },
      ],
    },
  },
  {
    id: 'mis-cv',
    title: 'MIS CV',
    subtitle: 'Business systems and data example',
    settings: DEFAULT_SETTINGS,
    data: {
      contact: {
        fullName: 'MIS Student',
        phone: '+966 5XXXXXXXX',
        email: 'mis.student@example.com',
        city: 'Riyadh',
        country: 'Saudi Arabia',
        linkedin: 'https://www.linkedin.com/in/mis-student',
      },
      objective: {
        text: 'Management Information Systems student interested in business analysis, data reporting, and digital transformation. Skilled in translating business needs into system requirements and creating dashboards that make operational data easier to understand.',
      },
      education: [
        {
          id: 'mis-edu-1',
          university: 'Al Yamamah University',
          location: 'Riyadh, Saudi Arabia',
          degree: 'Bachelor of Science in Management Information Systems',
          graduationDate: 'May 2027',
          relevantCoursework: 'Database Management, Systems Analysis and Design, Business Intelligence, Project Management',
          awards: '',
        },
      ],
      skills: [
        { id: 'mis-skill-1', text: 'Technical Skills SQL, Excel, Power BI, Requirements Gathering, ERD Design, Business Process Modeling, Basic Python' },
        { id: 'mis-skill-2', text: 'Soft Skills Stakeholder Communication, Problem Solving, Documentation, Team Collaboration, Critical Thinking' },
      ],
      experiences: [
        {
          id: 'mis-exp-1',
          institution: 'Student Services Dashboard Project',
          institutionDesc: '',
          location: 'Riyadh, Saudi Arabia',
          jobTitle: 'Business Analyst Student Project',
          startDate: '2026',
          endDate: '',
          bullets: [
            'Collected sample student service requirements and converted them into user stories, process flows, and dashboard metrics.',
            'Built a Power BI prototype to track request categories, response status, and monthly service trends.',
          ],
        },
      ],
      projects: emptyProjects,
      volunteers: [{ id: 'mis-vol-1', text: 'Volunteer, student technology support booth during university events' }],
      certifications: [
        { id: 'mis-cert-1', text: 'Microsoft Power BI Data Analyst learning path' },
        { id: 'mis-cert-2', text: 'SQL for Data Analysis, DataCamp' },
      ],
      extracurriculars: [
        { id: 'mis-extra-1', type: 'club', text: 'Participated in MIS and business technology workshops focused on analytics and digital tools.' },
        { id: 'mis-extra-2', type: 'interest', text: 'Business intelligence, ERP systems, data visualization, process automation, and product management' },
      ],
    },
  },
];
