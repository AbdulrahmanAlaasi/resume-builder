'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function VolunteerForm() {
  const { data, updateVolunteer, addVolunteer, removeVolunteer } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Extracurricular activities, clubs, volunteer work, and leadership roles. Optional.</p>

      {data.volunteers.map((v) => (
        <div key={v.id} className="bullet-row">
          <span className="bullet-dot">•</span>
          <textarea className="form-textarea" rows={2}
            placeholder={P.volunteerText}
            value={v.text}
            onChange={(e) => updateVolunteer(v.id, e.target.value)}
            style={{ minHeight: 56 }}
          />
          {data.volunteers.length > 1 && (
            <button className="btn-danger" onClick={() => removeVolunteer(v.id)}
              type="button" style={{ marginTop: 8, flexShrink: 0 }}>✕</button>
          )}
        </div>
      ))}

      <button className="btn-add" onClick={addVolunteer} type="button" style={{ marginTop: 4 }}>+ Add Activity</button>
    </div>
  );
}
