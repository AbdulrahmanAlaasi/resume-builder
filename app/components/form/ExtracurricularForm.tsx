'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function ExtracurricularForm() {
  const { data, updateExtracurricular, addExtracurricular, removeExtracurricular } = useResumeStore();
  const clubs = data.extracurriculars.filter((e) => e.type === 'club');
  const interests = data.extracurriculars.filter((e) => e.type === 'interest');

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
          Extracurricular Activities & Interests
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Clubs, organizations, hobbies, and interests that show your personality.
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Clubs
        </div>
        {clubs.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: 'var(--accent)', fontSize: 14, flexShrink: 0 }}>•</span>
            <input className="form-input"
              placeholder="Robotics Club — Vice President; managed weekly sessions for 30+ members"
              value={item.text}
              onChange={(e) => updateExtracurricular(item.id, e.target.value)} />
            {clubs.length > 1 && (
              <button className="btn-danger" onClick={() => removeExtracurricular(item.id)}>✕</button>
            )}
          </div>
        ))}
        <button className="btn-add" onClick={() => addExtracurricular('club')} style={{ marginTop: 4 }}>
          + Add Club
        </button>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Interests
        </div>
        {interests.map((item) => (
          <div key={item.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: 'var(--accent)', fontSize: 14, flexShrink: 0 }}>•</span>
            <input className="form-input"
              placeholder="Competitive programming, open-source contribution, Arabic calligraphy"
              value={item.text}
              onChange={(e) => updateExtracurricular(item.id, e.target.value)} />
            {interests.length > 1 && (
              <button className="btn-danger" onClick={() => removeExtracurricular(item.id)}>✕</button>
            )}
          </div>
        ))}
        <button className="btn-add" onClick={() => addExtracurricular('interest')} style={{ marginTop: 4 }}>
          + Add Interest
        </button>
      </div>
    </div>
  );
}
