'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';

export default function SkillsForm() {
  const { data, updateSkill, addSkill, removeSkill } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Technical skills, tools, languages, and soft skills. Keep to 3–4 bullets.</p>

      {data.skills.map((skill) => (
        <div key={skill.id} className="row-with-remove">
          <input className="form-input"
            placeholder={P.skillText}
            value={skill.text}
            onChange={(e) => updateSkill(skill.id, e.target.value)} />
          {data.skills.length > 1 && (
            <button className="btn-danger" onClick={() => removeSkill(skill.id)} type="button">✕</button>
          )}
        </div>
      ))}

      <button className="btn-add" onClick={addSkill} type="button" style={{ marginTop: 6 }}>+ Add Skill</button>
    </div>
  );
}
