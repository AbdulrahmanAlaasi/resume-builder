'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function ObjectiveForm() {
  const { data, updateObjective } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Objective
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          A brief statement about your career goals and what you hope to achieve.
        </p>
      </div>
      <label className="form-label">Career Objective</label>
      <textarea className="form-textarea" rows={5}
        placeholder="Insert a brief statement about your career objective and what you hope to achieve through the co-op experience."
        value={data.objective.text}
        onChange={(e) => updateObjective(e.target.value)}
        style={{ minHeight: 120 }}
      />
    </div>
  );
}
