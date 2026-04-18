'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function EducationForm() {
  const { data, updateEducation, addEducation, removeEducation } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Education</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Your academic background and qualifications.</p>
      </div>

      {data.education.map((edu, i) => (
        <div key={edu.id} className="section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Education {i + 1}</span>
            {data.education.length > 1 && (
              <button className="btn-danger" onClick={() => removeEducation(edu.id)}>Remove</button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">University / Institution Name</label>
              <input className="form-input" placeholder="Yemeni University" value={edu.university}
                onChange={(e) => updateEducation(edu.id, { university: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location (City, Country)</label>
              <input className="form-input" placeholder="Sana'a, Yemen" value={edu.location}
                onChange={(e) => updateEducation(edu.id, { location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Expected Graduation (Month, Year)</label>
              <input className="form-input" placeholder="May 2026" value={edu.graduationDate}
                onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Degree Program / Major</label>
              <input className="form-input" placeholder="Bachelor of Science in Computer Engineering" value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Relevant Coursework</label>
              <input className="form-input" placeholder="Data Structures, Algorithms, Machine Learning, Database Systems" value={edu.relevantCoursework}
                onChange={(e) => updateEducation(edu.id, { relevantCoursework: e.target.value })} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Scholarships, Awards & Achievements</label>
              <input className="form-input" placeholder="Dean's List (3 consecutive semesters), Merit Scholarship" value={edu.awards}
                onChange={(e) => updateEducation(edu.id, { awards: e.target.value })} />
            </div>
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addEducation}>+ Add Another Education</button>
    </div>
  );
}
