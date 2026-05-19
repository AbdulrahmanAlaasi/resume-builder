'use client';

import { useResumeStore } from '../../store/resumeStore';
import { SECTIONS } from '../../lib/constants';

import ContactForm         from '../form/ContactForm';
import ObjectiveForm       from '../form/ObjectiveForm';
import EducationForm       from '../form/EducationForm';
import SkillsForm          from '../form/SkillsForm';
import ExperienceForm      from '../form/ExperienceForm';
import VolunteerForm       from '../form/VolunteerForm';
import CertificationsForm  from '../form/CertificationsForm';
import ExtracurricularForm from '../form/ExtracurricularForm';
import type { ActiveSection } from '../../types/resume';

const FORM_BY_SECTION: Record<ActiveSection, React.ComponentType> = {
  contact:         ContactForm,
  objective:       ObjectiveForm,
  education:       EducationForm,
  skills:          SkillsForm,
  experience:      ExperienceForm,
  projects:        ExperienceForm,
  volunteer:       VolunteerForm,
  certifications:  CertificationsForm,
  extracurricular: ExtracurricularForm,
};

/**
 * Detail panel — slides out next to SectionNav showing the form for the
 * active section. Closes when its X button is clicked, or when the user
 * clicks the currently-active section in the nav.
 */
export default function BuilderPanel() {
  const { activeSection, closeDetailPanel } = useResumeStore();
  const FormComp  = FORM_BY_SECTION[activeSection];
  const label     = activeSection === 'projects'
    ? 'Experience & Projects'
    : SECTIONS.find((s) => s.id === activeSection)?.label ?? 'Section';

  return (
    <aside className="builder-panel" style={{
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column',
    }}>
      <div className="builder-panel-head">
        <div className="builder-panel-title">{label}</div>
        <button
          type="button"
          className="icon-btn"
          onClick={closeDetailPanel}
          aria-label="Close detail panel"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="builder-panel-body fade-in-up" key={activeSection}>
        <FormComp />
      </div>
    </aside>
  );
}
