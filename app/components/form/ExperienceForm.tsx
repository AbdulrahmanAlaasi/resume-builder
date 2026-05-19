'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function ExperienceForm() {
  const { data, updateExperience, addExperience, removeExperience,
    updateExperienceBullet, addExperienceBullet, removeExperienceBullet } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Work, internships, and co-op positions. Aim for 3+ bullets per role.</p>

      {data.experiences.map((exp, i) => (
        <div key={exp.id} className="section-card">
          <div className="card-head">
            <span>Experience {i + 1}</span>
            {data.experiences.length > 1 && (
              <button className="btn-danger" onClick={() => removeExperience(exp.id)} type="button">Remove</button>
            )}
          </div>

          <div className="form-grid">
            <div className="full">
              <label className="form-label">Institution / Company</label>
              <input className="form-input" placeholder={P.expInstitution} value={exp.institution}
                onChange={(e) => updateExperience(exp.id, { institution: e.target.value })} />
            </div>
            <div className="full">
              <label className="form-label">Brief Institution Description</label>
              <input className="form-input" placeholder={P.expInstitutionDesc} value={exp.institutionDesc}
                onChange={(e) => updateExperience(exp.id, { institutionDesc: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className="form-input" placeholder={P.expLocation} value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Job Title</label>
              <input className="form-input" placeholder={P.expJobTitle} value={exp.jobTitle}
                onChange={(e) => updateExperience(exp.id, { jobTitle: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input className="form-input" placeholder={P.expStartDate} value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input className="form-input" placeholder={P.expEndDate} value={exp.endDate}
                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="form-label">Responsibilities & Achievements</label>
            {exp.bullets.map((bullet, bi) => (
              <div key={bi} className="bullet-row">
                <span className="bullet-dot">•</span>
                <textarea className="form-textarea" rows={2}
                  placeholder={P.expBullet}
                  value={bullet}
                  onChange={(e) => updateExperienceBullet(exp.id, bi, e.target.value)}
                  style={{ minHeight: 56 }}
                />
                {exp.bullets.length > 1 && (
                  <button className="btn-danger" onClick={() => removeExperienceBullet(exp.id, bi)}
                    type="button" style={{ marginTop: 8, flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={() => addExperienceBullet(exp.id)}
              type="button" style={{ marginTop: 4 }}>+ Add Bullet Point</button>
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addExperience} type="button">+ Add Another Experience</button>
    </div>
  );
}
