'use client';

import { useResumeStore } from '../../store/resumeStore';
import { SECTIONS } from '../../lib/constants';

import ContactForm        from '../form/ContactForm';
import ObjectiveForm      from '../form/ObjectiveForm';
import EducationForm      from '../form/EducationForm';
import SkillsForm         from '../form/SkillsForm';
import ExperienceForm     from '../form/ExperienceForm';
import ProjectsForm       from '../form/ProjectsForm';
import VolunteerForm      from '../form/VolunteerForm';
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

/**
 * Single-column builder sidebar.
 * Top: navigation list of section names — one is always active.
 * Below: the active section's form fills the rest of the column.
 */
export default function BuilderPanel() {
  const { activeSection, setActiveSection, toggleBuilderPanel } = useResumeStore();
  const FormComp  = FORM_BY_SECTION[activeSection];
  const activeLabel = SECTIONS.find((s) => s.id === activeSection)?.label ?? '';

  return (
    <aside className="builder-panel" style={{
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <div className="builder-panel-head">
        <div className="builder-panel-title">Resume Sections</div>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleBuilderPanel}
          aria-label="Hide sections panel"
          title="Hide panel"
        >
          ‹
        </button>
      </div>

      <nav className="section-nav">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`section-nav-btn${activeSection === id ? ' active' : ''}`}
            onClick={() => setActiveSection(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="builder-panel-body fade-in-up" key={activeSection}>
        <div className="builder-panel-form-title">{activeLabel}</div>
        <FormComp />
      </div>
    </aside>
  );
}
