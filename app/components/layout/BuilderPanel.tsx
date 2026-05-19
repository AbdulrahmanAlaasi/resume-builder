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
 * Slide-out builder panel — shows the form for the active section only.
 * Triggered by the BuilderRail on the left. Has its own close button.
 */
export default function BuilderPanel() {
  const { activeSection, toggleBuilderPanel } = useResumeStore();
  const FormComp  = FORM_BY_SECTION[activeSection];
  const labelInfo = SECTIONS.find((s) => s.id === activeSection);
  const label     = labelInfo?.label ?? 'Section';

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
          onClick={toggleBuilderPanel}
          aria-label="Hide section panel"
          title="Hide panel"
        >
          ‹
        </button>
      </div>

      <div className="builder-panel-body fade-in-up" key={activeSection}>
        <FormComp />
      </div>
    </aside>
  );
}
