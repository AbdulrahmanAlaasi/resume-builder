'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function ExtracurricularForm() {
  const { data, updateExtracurricular, addExtracurricular, removeExtracurricular } = useResumeStore();
  const clubs     = data.extracurriculars.filter((e) => e.type === 'club');
  const interests = data.extracurriculars.filter((e) => e.type === 'interest');

  return (
    <div className="fade-in-up">
      <p className="form-caption">Clubs, organizations, hobbies, and interests that show your personality.</p>

      <div style={{ marginBottom: 16 }}>
        <div className="subhead">Clubs</div>
        {clubs.map((item) => (
          <div key={item.id} className="row-with-remove">
            <input className="form-input"
              placeholder={P.extracurricularClub}
              value={item.text}
              onChange={(e) => updateExtracurricular(item.id, e.target.value)} />
            {clubs.length > 1 && (
              <button className="btn-danger" onClick={() => removeExtracurricular(item.id)} type="button">✕</button>
            )}
          </div>
        ))}
        <button className="btn-add" onClick={() => addExtracurricular('club')} type="button" style={{ marginTop: 4 }}>+ Add Club</button>
      </div>

      <div>
        <div className="subhead">Interests</div>
        {interests.map((item) => (
          <div key={item.id} className="row-with-remove">
            <input className="form-input"
              placeholder={P.extracurricularInterest}
              value={item.text}
              onChange={(e) => updateExtracurricular(item.id, e.target.value)} />
            {interests.length > 1 && (
              <button className="btn-danger" onClick={() => removeExtracurricular(item.id)} type="button">✕</button>
            )}
          </div>
        ))}
        <button className="btn-add" onClick={() => addExtracurricular('interest')} type="button" style={{ marginTop: 4 }}>+ Add Interest</button>
      </div>
    </div>
  );
}
