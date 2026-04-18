'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function ProjectsForm() {
  const { data, updateProject, addProject, removeProject,
    updateProjectBullet, addProjectBullet, removeProjectBullet } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Projects</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Academic, personal, or freelance projects that showcase your skills.
        </p>
      </div>

      {data.projects.map((proj, i) => (
        <div key={proj.id} className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Project {i + 1}</span>
            {data.projects.length > 1 && (
              <button className="btn-danger" onClick={() => removeProject(proj.id)}>Remove</button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Project Title</label>
              <input className="form-input" placeholder="AI-Powered Inventory Management System" value={proj.title}
                onChange={(e) => updateProject(proj.id, { title: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Institution / Organization</label>
              <input className="form-input" placeholder="University Capstone Project / Personal" value={proj.institution}
                onChange={(e) => updateProject(proj.id, { institution: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input className="form-input" placeholder="Sep 2024" value={proj.startDate}
                onChange={(e) => updateProject(proj.id, { startDate: e.target.value })} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input className="form-input" placeholder="Dec 2024" value={proj.endDate}
                onChange={(e) => updateProject(proj.id, { endDate: e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="form-label">Project Description</label>
            {proj.bullets.map((bullet, bi) => (
              <div key={bi} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ color: 'var(--accent)', fontSize: 14, marginTop: 12, flexShrink: 0 }}>•</span>
                <textarea className="form-textarea" rows={2}
                  placeholder="Describe the project scope, your role, technologies used, and impact."
                  value={bullet}
                  onChange={(e) => updateProjectBullet(proj.id, bi, e.target.value)}
                  style={{ minHeight: 60 }}
                />
                {proj.bullets.length > 1 && (
                  <button className="btn-danger" onClick={() => removeProjectBullet(proj.id, bi)}
                    style={{ marginTop: 8, flexShrink: 0 }}>✕</button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={() => addProjectBullet(proj.id)}
              style={{ marginTop: 4 }}>+ Add Bullet Point</button>
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addProject}>+ Add Another Project</button>
    </div>
  );
}
