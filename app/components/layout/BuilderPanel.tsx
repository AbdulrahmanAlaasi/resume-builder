'use client';

import { useState } from 'react';
import { useResumeStore } from '../../store/resumeStore';
import { SECTIONS } from '../../lib/constants';

import ContactForm from '../form/ContactForm';
import ObjectiveForm from '../form/ObjectiveForm';
import EducationForm from '../form/EducationForm';
import SkillsForm from '../form/SkillsForm';
import ExperienceForm from '../form/ExperienceForm';
import ProjectsForm from '../form/ProjectsForm';
import VolunteerForm from '../form/VolunteerForm';
import CertificationsForm from '../form/CertificationsForm';
import ExtracurricularForm from '../form/ExtracurricularForm';
import type { ActiveSection } from '../../types/resume';

const FORM_BY_SECTION: Record<ActiveSection, React.ComponentType> = {
  contact:         ContactForm,
  objective:       ObjectiveForm,
  education:       EducationForm,
  skills:          SkillsForm,
  experience:      ExperienceForm,
  projects:        ProjectsForm,
  volunteer:       VolunteerForm,
  certifications:  CertificationsForm,
  extracurricular: ExtracurricularForm,
};

export default function BuilderPanel() {
  const { expandedSections, toggleSection } = useResumeStore();
  const [topTab, setTopTab] = useState<'builder' | 'templates'>('builder');

  return (
    <aside className="builder-panel" style={{
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '16px 16px 12px' }}>
        <div className="toptab-group">
          <button
            className={`toptab ${topTab === 'builder' ? 'active' : ''}`}
            onClick={() => setTopTab('builder')}
            type="button"
          >Builder</button>
          <button
            className={`toptab ${topTab === 'templates' ? 'active' : ''}`}
            onClick={() => setTopTab('templates')}
            type="button"
          >Templates</button>
        </div>
      </div>

      {topTab === 'builder' ? (
        <div style={{ flex: 1 }}>
          {SECTIONS.map(({ id, label }) => {
            const FormComp = FORM_BY_SECTION[id];
            const open = expandedSections.includes(id);
            return (
              <div className="accordion-item" key={id}>
                <button
                  className={`accordion-trigger${open ? ' active' : ''}`}
                  onClick={() => toggleSection(id)}
                  aria-expanded={open}
                  type="button"
                >
                  <span>{label}</span>
                  <span className={`accordion-chevron${open ? ' open' : ''}`}>+</span>
                </button>
                {open && (
                  <div className="accordion-body fade-in-up">
                    <FormComp />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 24, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
            YU Student Template
          </div>
          <p style={{ margin: 0 }}>
            This builder currently ships only the official YU Career Center template.
            Additional approved templates may be added by the Career Center in future updates.
          </p>
        </div>
      )}
    </aside>
  );
}
