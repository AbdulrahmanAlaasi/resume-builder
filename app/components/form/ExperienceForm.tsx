'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function ExperienceForm() {
  const { data, updateExperience, addExperience, removeExperience,
    updateExperienceBullet, addExperienceBullet, removeExperienceBullet } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Professional Experience</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Work experience, internships, and co-op positions. Include at least 3 bullet points per role.
        </p>
      </div>

      {data.experiences.map((exp, i) => (
        <div key={exp.id} className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Experience {i + 1}</span>
            {data.experiences.length > 1 && (
              <button className="btn-danger" onClick={() => removeExperience(exp.id)}>Remove</button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Institution / Company Name</label>
              <input className="form-input" placeholder="Saudi Aramco" value={exp.institution}
                onChange={(e) => updateExperience(exp.id, { institution: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Brief Institution Description</label>
              <input className="form-input" placeholder="Global energy company and world's largest oil producer" value={exp.institutionDesc}
                onChange={(e) => updateExperience(exp.id, { institutionDesc: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="Dhahran, Saudi Arabia" value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Job Title</label>
              <input className="form-input" placeholder="Software Engineering Intern" value={exp.jobTitle}
                onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input className="form-input" placeholder="June 2024" value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input className="form-input" placeholder="August 2024 (or Present)" value={exp.endDate}
                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="form-label">Responsibilities & Achievements</label>
            {exp.bullets.map((bullet, bi) => (
              <div key={bi} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: 'var(--accent)', fontSize: 14, marginTop: 12, flexShrink: 0 }}>•</span>
                <textarea className="form-textarea" rows={2}
                  placeholder="Quantify your achievements — what impacts did you have on the organization?"
                  value={bullet}
                  onChange={(e) => updateExperienceBullet(exp.id, bi, e.target.value)}
                  style={{ minHeight: 60 }}
                />
                {exp.bullets.length > 1 && (
                  <button className="btn-danger" onClick={() => removeExperienceBullet(exp.id, bi)}
                    style={{ marginTop: 8, flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={() => addExperienceBullet(exp.id)}
              style={{ marginTop: 4 }}>+ Add Bullet Point</button>
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addExperience}>+ Add Another Experience</button>
    </div>
  );
}
