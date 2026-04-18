'use client';
import { useResumeStore } from '../../store/resumeStore';

export default function SkillsForm() {
  const { data, updateSkill, addSkill, removeSkill } = useResumeStore();

  return (
    <div className="fade-in-up">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>Skills</h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          Technical skills, tools, languages, and soft skills. Keep to 3–4 bullets if you have extensive experience.
        </p>
      </div>

      {data.skills.map((skill, i) => (
        <div key={skill.id} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <input className="form-input"
              placeholder={i === 0 ? "Programming: Python, JavaScript, SQL, Java" : i === 1 ? "Tools: Git, VS Code, Figma, Excel" : "Communication, Teamwork, Problem-solving"}
              value={skill.text}
              onChange={(e) => updateSkill(skill.id, e.target.value)} />
          </div>
          {data.skills.length > 1 && (
            <button className="btn-danger" onClick={() => removeSkill(skill.id)}>✕</button>
          )}
        </div>
      ))}

      <button className="btn-add" onClick={addSkill} style={{ marginTop: 6 }}>+ Add Skill</button>
    </div>
  );
}
