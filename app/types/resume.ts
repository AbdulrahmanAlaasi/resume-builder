export interface ContactInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  linkedin: string;
}

export interface Objective {
  text: string;
}

export interface Education {
  id: string;
  university: string;
  location: string;
  degree: string;
  graduationDate: string;
  relevantCoursework: string;
  awards: string;
}

export interface Skill {
  id: string;
  text: string;
}

export interface Experience {
  id: string;
  institution: string;
  institutionDesc: string;
  location: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Project {
  id: string;
  institution: string;
  location: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface VolunteerItem {
  id: string;
  text: string;
}

export interface Certification {
  id: string;
  text: string;
}

export interface ExtracurricularItem {
  id: string;
  type: 'club' | 'interest';
  text: string;
}

export interface ResumeData {
  contact: ContactInfo;
  objective: Objective;
  education: Education[];
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
  volunteers: VolunteerItem[];
  certifications: Certification[];
  extracurriculars: ExtracurricularItem[];
}

export type PaperSize = 'letter' | 'a4';
export type Density = 'compact' | 'normal';

export interface ResumeSettings {
  paperSize: PaperSize;
  density: Density;
  fontFamily: string;
  accentColor: string;
  showRules: boolean;
}

export type ActiveSection =
  | 'contact'
  | 'objective'
  | 'education'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'volunteer'
  | 'certifications'
  | 'extracurricular';
