'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ResumeData, ActiveSection, ResumeSettings } from '../types/resume';
import { DEFAULT_SETTINGS } from '../lib/constants';

const defaultData: ResumeData = {
  contact: {
    fullName: '',
    phone: '',
    email: '',
    city: '',
    country: '',
    linkedin: '',
  },
  objective: { text: '' },
  education: [
    {
      id: '1',
      university: '',
      location: '',
      degree: '',
      graduationDate: '',
      relevantCoursework: '',
      awards: '',
    },
  ],
  skills: [{ id: '1', text: '' }],
  experiences: [
    {
      id: '1',
      institution: '',
      institutionDesc: '',
      location: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      bullets: ['', '', ''],
    },
  ],
  projects: [
    {
      id: '1',
      institution: '',
      location: '',
      title: '',
      startDate: '',
      endDate: '',
      bullets: ['', ''],
    },
  ],
  volunteers: [{ id: '1', text: '' }],
  certifications: [{ id: '1', text: '' }],
  extracurriculars: [
    { id: '1', type: 'club', text: '' },
    { id: '2', type: 'interest', text: '' },
  ],
};

interface ResumeStore {
  data: ResumeData;
  settings: ResumeSettings;
  activeSection: ActiveSection;
  /** Whether the detail (form) panel is currently open beside the nav. */
  detailPanelOpen: boolean;
  setActiveSection: (s: ActiveSection) => void;
  /** Click in section nav: open detail with that section; clicking the
   *  currently-open active section closes the detail panel. */
  selectSection: (s: ActiveSection) => void;
  closeDetailPanel: () => void;
  updateSettings: (partial: Partial<ResumeSettings>) => void;
  resetSettings: () => void;
  updateContact: (contact: Partial<ResumeData['contact']>) => void;
  updateObjective: (text: string) => void;
  updateEducation: (id: string, fields: Partial<ResumeData['education'][0]>) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateSkill: (id: string, text: string) => void;
  addSkill: () => void;
  removeSkill: (id: string) => void;
  updateExperience: (id: string, fields: Partial<ResumeData['experiences'][0]>) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperienceBullet: (expId: string, idx: number, val: string) => void;
  addExperienceBullet: (expId: string) => void;
  removeExperienceBullet: (expId: string, idx: number) => void;
  updateProject: (id: string, fields: Partial<ResumeData['projects'][0]>) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
  updateProjectBullet: (projId: string, idx: number, val: string) => void;
  addProjectBullet: (projId: string) => void;
  removeProjectBullet: (projId: string, idx: number) => void;
  updateVolunteer: (id: string, text: string) => void;
  addVolunteer: () => void;
  removeVolunteer: (id: string) => void;
  updateCertification: (id: string, text: string) => void;
  addCertification: () => void;
  removeCertification: (id: string) => void;
  updateExtracurricular: (id: string, text: string) => void;
  addExtracurricular: (type: 'club' | 'interest') => void;
  removeExtracurricular: (id: string) => void;
  resetData: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: defaultData,
      settings: DEFAULT_SETTINGS,
      activeSection: 'contact',
      detailPanelOpen: true,
      setActiveSection: (s) => set({ activeSection: s, detailPanelOpen: true }),
      selectSection: (s) =>
        set((state) => {
          // Clicking the active row when the detail panel is open → close it.
          if (state.detailPanelOpen && state.activeSection === s) {
            return { detailPanelOpen: false };
          }
          return { activeSection: s, detailPanelOpen: true };
        }),
      closeDetailPanel: () => set({ detailPanelOpen: false }),
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
      updateContact: (contact) =>
        set((state) => ({ data: { ...state.data, contact: { ...state.data.contact, ...contact } } })),
      updateObjective: (text) =>
        set((state) => ({ data: { ...state.data, objective: { text } } })),
      updateEducation: (id, fields) =>
        set((state) => ({
          data: {
            ...state.data,
            education: state.data.education.map((e) => (e.id === id ? { ...e, ...fields } : e)),
          },
        })),
      addEducation: () =>
        set((state) => ({
          data: {
            ...state.data,
            education: [
              ...state.data.education,
              { id: uid(), university: '', location: '', degree: '', graduationDate: '', relevantCoursework: '', awards: '' },
            ],
          },
        })),
      removeEducation: (id) =>
        set((state) => ({
          data: { ...state.data, education: state.data.education.filter((e) => e.id !== id) },
        })),
      updateSkill: (id, text) =>
        set((state) => ({
          data: { ...state.data, skills: state.data.skills.map((s) => (s.id === id ? { ...s, text } : s)) },
        })),
      addSkill: () =>
        set((state) => ({
          data: { ...state.data, skills: [...state.data.skills, { id: uid(), text: '' }] },
        })),
      removeSkill: (id) =>
        set((state) => ({
          data: { ...state.data, skills: state.data.skills.filter((s) => s.id !== id) },
        })),
      updateExperience: (id, fields) =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((e) => (e.id === id ? { ...e, ...fields } : e)),
          },
        })),
      addExperience: () =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: [
              ...state.data.experiences,
              { id: uid(), institution: '', institutionDesc: '', location: '', jobTitle: '', startDate: '', endDate: '', bullets: ['', '', ''] },
            ],
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          data: { ...state.data, experiences: state.data.experiences.filter((e) => e.id !== id) },
        })),
      updateExperienceBullet: (expId, idx, val) =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((e) =>
              e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? val : b)) } : e
            ),
          },
        })),
      addExperienceBullet: (expId) =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((e) =>
              e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
            ),
          },
        })),
      removeExperienceBullet: (expId, idx) =>
        set((state) => ({
          data: {
            ...state.data,
            experiences: state.data.experiences.map((e) =>
              e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e
            ),
          },
        })),
      updateProject: (id, fields) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) => (p.id === id ? { ...p, ...fields } : p)),
          },
        })),
      addProject: () =>
        set((state) => ({
          data: {
            ...state.data,
            projects: [
              ...state.data.projects,
              { id: uid(), institution: '', location: '', title: '', startDate: '', endDate: '', bullets: ['', ''] },
            ],
          },
        })),
      removeProject: (id) =>
        set((state) => ({
          data: { ...state.data, projects: state.data.projects.filter((p) => p.id !== id) },
        })),
      updateProjectBullet: (projId, idx, val) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) =>
              p.id === projId ? { ...p, bullets: p.bullets.map((b, i) => (i === idx ? val : b)) } : p
            ),
          },
        })),
      addProjectBullet: (projId) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) =>
              p.id === projId ? { ...p, bullets: [...p.bullets, ''] } : p
            ),
          },
        })),
      removeProjectBullet: (projId, idx) =>
        set((state) => ({
          data: {
            ...state.data,
            projects: state.data.projects.map((p) =>
              p.id === projId ? { ...p, bullets: p.bullets.filter((_, i) => i !== idx) } : p
            ),
          },
        })),
      updateVolunteer: (id, text) =>
        set((state) => ({
          data: { ...state.data, volunteers: state.data.volunteers.map((v) => (v.id === id ? { ...v, text } : v)) },
        })),
      addVolunteer: () =>
        set((state) => ({
          data: { ...state.data, volunteers: [...state.data.volunteers, { id: uid(), text: '' }] },
        })),
      removeVolunteer: (id) =>
        set((state) => ({
          data: { ...state.data, volunteers: state.data.volunteers.filter((v) => v.id !== id) },
        })),
      updateCertification: (id, text) =>
        set((state) => ({
          data: {
            ...state.data,
            certifications: state.data.certifications.map((c) => (c.id === id ? { ...c, text } : c)),
          },
        })),
      addCertification: () =>
        set((state) => ({
          data: { ...state.data, certifications: [...state.data.certifications, { id: uid(), text: '' }] },
        })),
      removeCertification: (id) =>
        set((state) => ({
          data: { ...state.data, certifications: state.data.certifications.filter((c) => c.id !== id) },
        })),
      updateExtracurricular: (id, text) =>
        set((state) => ({
          data: {
            ...state.data,
            extracurriculars: state.data.extracurriculars.map((e) => (e.id === id ? { ...e, text } : e)),
          },
        })),
      addExtracurricular: (type) =>
        set((state) => ({
          data: {
            ...state.data,
            extracurriculars: [...state.data.extracurriculars, { id: uid(), type, text: '' }],
          },
        })),
      removeExtracurricular: (id) =>
        set((state) => ({
          data: { ...state.data, extracurriculars: state.data.extracurriculars.filter((e) => e.id !== id) },
        })),
      resetData: () => set({ data: defaultData }),
    }),
    { name: 'resume-builder-data' }
  )
);
