'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function VolunteerForm() {
  const { data, updateVolunteer, addVolunteer, removeVolunteer } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Volunteer & Leadership <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Extracurricular activities, clubs, volunteer work, and leadership roles.
        </p>
      </div>

      {data.volunteers.map((v, i) => (
        <div key={v.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)', fontSize: 14, marginTop: 12, flexShrink: 0 }}>•</span>
          <textarea className="form-textarea" rows={2}
            placeholder="Student Council President — Led 12-person team to organize annual university tech fair reaching 800+ attendees."
            value={v.text}
            onChange={(e) => updateVolunteer(v.id, e.target.value)}
            style={{ minHeight: 60 }}
          />
          {data.volunteers.length > 1 && (
            <button className="btn-danger" onClick={() => removeVolunteer(v.id)}
              style={{ marginTop: 8, flexShrink: 0 }}>✕</button>
          )}
        </div>
      ))}

      <button className="btn-add" onClick={addVolunteer} style={{ marginTop: 4 }}>+ Add Activity</button>
    </div>
  );
}
