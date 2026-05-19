'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function ObjectiveForm() {
  const { data, updateObjective } = useResumeStore();
  return (
    <div className="fade-in-up">
      <p className="form-caption">A brief statement about your career goals and what you hope to achieve.</p>
      <label className="form-label">Career Objective</label>
      <textarea className="form-textarea" rows={5}
        placeholder={P.objectiveText}
        value={data.objective.text}
        onChange={(e) => updateObjective(e.target.value)}
        style={{ minHeight: 110 }}
      />
    </div>
  );
}
