'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function EducationForm() {
  const { data, updateEducation, addEducation, removeEducation } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Your academic background and qualifications.</p>

      {data.education.map((edu, i) => (
        <div key={edu.id} className="section-card">
          <div className="card-head">
            <span>Education {i + 1}</span>
            {data.education.length > 1 && (
              <button className="btn-danger" onClick={() => removeEducation(edu.id)} type="button">Remove</button>
            )}
          </div>

          <div className="form-grid">
            <div className="full">
              <label className="form-label">University / Institution</label>
              <input className="form-input" placeholder={P.eduUniversity} value={edu.university}
                onChange={(e) => updateEducation(edu.id, { university: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Location</label>
              <input className="form-input" placeholder={P.eduLocation} value={edu.location}
                onChange={(e) => updateEducation(edu.id, { location: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Expected Graduation</label>
              <input className="form-input" placeholder={P.eduGraduationDate} value={edu.graduationDate}
                onChange={(e) => updateEducation(edu.id, { graduationDate: e.target.value })} />
            </div>
            <div className="full">
              <label className="form-label">Degree Program</label>
              <input className="form-input" placeholder={P.eduDegree} value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} />
            </div>
            <div className="full">
              <label className="form-label">Relevant Coursework</label>
              <input className="form-input" placeholder={P.eduCoursework} value={edu.relevantCoursework}
                onChange={(e) => updateEducation(edu.id, { relevantCoursework: e.target.value })} />
            </div>
            <div className="full">
              <label className="form-label">Scholarships, Awards & Achievements</label>
              <input className="form-input" placeholder={P.eduAwards} value={edu.awards}
                onChange={(e) => updateEducation(edu.id, { awards: e.target.value })} />
            </div>
          </div>
        </div>
      ))}

      <button className="btn-add" onClick={addEducation} type="button">+ Add Another Education</button>
    </div>
  );
}
