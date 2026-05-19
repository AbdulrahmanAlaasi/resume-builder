'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function ProjectsForm() {
  const { data, updateProject, addProject, removeProject,
    updateProjectBullet, addProjectBullet, removeProjectBullet } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Academic, personal, or freelance projects that showcase your skills.</p>

      {data.projects.map((proj, i) => (
        <div key={proj.id} className="section-card">
          <div className="card-head">
            <span>Project {i + 1}</span>
            {data.projects.length > 1 && (
              <button className="btn-danger" onClick={() => removeProject(proj.id)} type="button">Remove</button>
            )}
          </div>

          <div className="form-grid">
            <div className="full">
              <label className="form-label">Project Title</label>
              <input className="form-input" placeholder={P.projTitle} value={proj.title}
                onChange={(e) => updateProject(proj.id, { title: e.target.value })} />
            </div>
            <div className="full">
              <label className="form-label">Institution / Organization</label>
              <input className="form-input" placeholder={P.projInstitution} value={proj.institution}
                onChange={(e) => updateProject(proj.id, { institution: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className="form-input" placeholder={P.projLocation} value={proj.location}
                onChange={(e) => updateProject(proj.id, { location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input className="form-input" placeholder={P.projStartDate} value={proj.startDate}
                onChange={(e) => updateProject(proj.id, { startDate: e.target.value })} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input className="form-input" placeholder={P.projEndDate} value={proj.endDate}
                onChange={(e) => updateProject(proj.id, { endDate: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label className="form-label">Project Description</label>
            {proj.bullets.map((bullet, bi) => (
              <div key={bi} className="bullet-row">
                <span className="bullet-dot">•</span>
                <textarea className="form-textarea" rows={2}
                  placeholder={P.projBullet}
                  value={bullet}
                  onChange={(e) => updateProjectBullet(proj.id, bi, e.target.value)}
                  style={{ minHeight: 56 }}
                />
                {proj.bullets.length > 1 && (
                  <button className="btn-danger" onClick={() => removeProjectBullet(proj.id, bi)}
                    type="button" style={{ marginTop: 8, flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={() => addProjectBullet(proj.id)}
              type="button" style={{ marginTop: 4 }}>+ Add Bullet Point</button>
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addProject} type="button">+ Add Another Project</button>
    </div>
  );
}
