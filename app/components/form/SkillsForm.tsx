'use client';
import { useResumeStore } from '../../store/resumeStore';
import { FORM_PLACEHOLDERS as P } from '../../lib/placeholders';
import { applySkillLabel, SKILL_LABELS, stripSkillLabel } from '../../lib/skills';

export default function SkillsForm() {
  const { data, updateSkill, addSkill, removeSkill } = useResumeStore();

  return (
    <div className="fade-in-up">
      <p className="form-caption">Technical skills, tools, languages, and soft skills. Keep to 3-4 bullets.</p>

      {data.skills.map((skill, index) => {
        const readyLabel = SKILL_LABELS[index];
        const value = readyLabel ? stripSkillLabel(skill.text, readyLabel) : skill.text;

        return (
          <div key={skill.id} className="row-with-remove">
            <div style={{ flex: 1 }}>
              {readyLabel && <label className="form-label">{readyLabel}</label>}
              <input
                className="form-input"
                placeholder={readyLabel ? `Add ${readyLabel.toLowerCase()}` : P.skillText}
                value={value}
                onChange={(e) =>
                  updateSkill(
                    skill.id,
                    readyLabel ? applySkillLabel(readyLabel, e.target.value) : e.target.value,
                  )
                }
              />
            </div>
            {!readyLabel && data.skills.length > 1 && (
              <button className="btn-danger" onClick={() => removeSkill(skill.id)} type="button">x</button>
            )}
          </div>
        );
      })}

      <button className="btn-add" onClick={addSkill} type="button" style={{ marginTop: 6 }}>+ Add Skill</button>
    </div>
  );
}
