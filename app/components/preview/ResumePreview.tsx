'use client';
import { ResumeData } from '../../types/resume';

interface Props {
  data: ResumeData;
}

const s = {
  page: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '10pt',
    color: '#1a1a2e',
    lineHeight: 1.35,
    padding: '0.75in 0.9in',
    background: 'white',
    minHeight: '11in',
    width: '8.5in',
  } as React.CSSProperties,
  name: {
    fontSize: '18pt',
    fontWeight: 700,
    textAlign: 'center' as const,
    marginBottom: 4,
    color: '#0a1628',
    letterSpacing: '-0.02em',
  },
  contactLine: {
    textAlign: 'center' as const,
    fontSize: '9.5pt',
    color: '#333355',
    marginBottom: 12,
  },
  divider: {
    borderTop: '2px solid #1a3a6b',
    margin: '8px 0',
  },
  thinDivider: {
    borderTop: '1px solid #c8d4e8',
    margin: '6px 0',
  },
  sectionHeader: {
    fontSize: '10.5pt',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    color: '#1a3a6b',
    marginBottom: 6,
    marginTop: 14,
  },
  institutionLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  institutionName: {
    fontWeight: 700,
    fontSize: '10pt',
    textDecoration: 'underline',
  },
  subLine: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontStyle: 'italic',
    fontSize: '9.5pt',
    color: '#2a2a4a',
    marginBottom: 4,
  },
  bullet: {
    display: 'flex',
    gap: 6,
    marginBottom: 3,
    fontSize: '9.5pt',
  },
  bulletDot: {
    flexShrink: 0,
    marginTop: 1,
  },
};

function Bullet({ text }: { text: string }) {
  if (!text.trim()) return null;
  return (
    <div style={s.bullet}>
      <span style={s.bulletDot}>•</span>
      <span>{text}</span>
    </div>
  );
}

export default function ResumePreview({ data }: Props) {
  const { contact, objective, education, skills, experiences, projects, volunteers, certifications, extracurriculars } = data;

  const hasContent = (arr: { text?: string }[]) => arr.some((i) => i.text?.trim());
  const contactParts = [contact.phone, contact.email,
    [contact.city, contact.country].filter(Boolean).join(', '), contact.linkedin].filter(Boolean);

  const clubs = extracurriculars.filter((e) => e.type === 'club' && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());

  return (
    <div id="resume-preview" style={s.page}>
      {/* Header */}
      <div style={s.name}>{contact.fullName || '[Your Name]'}</div>
      <div style={s.contactLine}>
        {contactParts.length > 0 ? contactParts.join(' | ') : '[Phone] | [Email] | [City, Country] | [LinkedIn]'}
      </div>
      <div style={s.divider} />

      {/* Objective */}
      {objective.text.trim() && (
        <>
          <div style={s.sectionHeader}>Objective:</div>
          <div style={{ fontSize: '9.5pt', marginBottom: 4, lineHeight: 1.5 }}>{objective.text}</div>
          <div style={s.thinDivider} />
        </>
      )}

      {/* Education */}
      {education.some((e) => e.university.trim() || e.degree.trim()) && (
        <>
          <div style={s.sectionHeader}>Education:</div>
          {education.map((edu) => (
            edu.university.trim() || edu.degree.trim() ? (
              <div key={edu.id} style={{ marginBottom: 8 }}>
                <div style={s.institutionLine}>
                  <span style={{ fontWeight: 700, fontSize: '10pt' }}>{edu.university || '[University Name]'}</span>
                  <span style={{ fontSize: '9.5pt', color: '#444' }}>{edu.location}</span>
                </div>
                <div style={s.subLine}>
                  <span>{edu.degree || '[Degree Program]'}{edu.graduationDate ? ` — Expected Graduation: ${edu.graduationDate}` : ''}</span>
                </div>
                {edu.relevantCoursework.trim() && (
                  <Bullet text={`Relevant Coursework: ${edu.relevantCoursework}`} />
                )}
                {edu.awards.trim() && <Bullet text={edu.awards} />}
              </div>
            ) : null
          ))}
          <div style={s.thinDivider} />
        </>
      )}

      {/* Skills */}
      {hasContent(skills) && (
        <>
          <div style={s.sectionHeader}>Skills:</div>
          {skills.filter((sk) => sk.text.trim()).map((sk) => (
            <Bullet key={sk.id} text={sk.text} />
          ))}
          <div style={s.thinDivider} />
        </>
      )}

      {/* Professional & Project Experience */}
      {(experiences.some((e) => e.institution.trim()) || projects.some((p) => p.title.trim())) && (
        <>
          <div style={s.sectionHeader}>Professional & Project Experience:</div>

          {experiences.filter((e) => e.institution.trim()).map((exp) => (
            <div key={exp.id} style={{ marginBottom: 10 }}>
              <div style={s.institutionLine}>
                <span>
                  <span style={s.institutionName}>{exp.institution}</span>
                  {exp.institutionDesc.trim() && (
                    <span style={{ fontStyle: 'italic', fontSize: '9pt', fontWeight: 400 }}> ({exp.institutionDesc})</span>
                  )}
                </span>
                <span style={{ fontSize: '9.5pt', color: '#444' }}>{exp.location}</span>
              </div>
              <div style={s.subLine}>
                <span>{exp.jobTitle || '[Job Title]'}</span>
                <span>{[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}</span>
              </div>
              {exp.bullets.filter((b) => b.trim()).map((bullet, i) => (
                <Bullet key={i} text={bullet} />
              ))}
            </div>
          ))}

          {projects.filter((p) => p.title.trim()).map((proj) => (
            <div key={proj.id} style={{ marginBottom: 10 }}>
              <div style={s.institutionLine}>
                <span style={s.institutionName}>{proj.institution || '[Organization]'}</span>
                <span style={{ fontSize: '9.5pt', color: '#444' }}>{proj.location}</span>
              </div>
              <div style={s.subLine}>
                <span>{proj.title}</span>
                <span>{[proj.startDate, proj.endDate].filter(Boolean).join(' – ')}</span>
              </div>
              {proj.bullets.filter((b) => b.trim()).map((bullet, i) => (
                <Bullet key={i} text={bullet} />
              ))}
            </div>
          ))}
          <div style={s.thinDivider} />
        </>
      )}

      {/* Volunteer Leadership */}
      {hasContent(volunteers) && (
        <>
          <div style={s.sectionHeader}>Volunteer Leadership: <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>[Optional]</span></div>
          {volunteers.filter((v) => v.text.trim()).map((v) => (
            <Bullet key={v.id} text={v.text} />
          ))}
          <div style={s.thinDivider} />
        </>
      )}

      {/* Certifications */}
      {hasContent(certifications) && (
        <>
          <div style={s.sectionHeader}>Certifications: <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>[If Applicable]</span></div>
          {certifications.filter((c) => c.text.trim()).map((c) => (
            <Bullet key={c.id} text={c.text} />
          ))}
          <div style={s.thinDivider} />
        </>
      )}

      {/* Extracurricular */}
      {(clubs.length > 0 || interests.length > 0) && (
        <>
          <div style={s.sectionHeader}>Extracurricular Activities & Interests:</div>
          {clubs.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: 700, fontSize: '9.5pt' }}>Clubs: </span>
              {clubs.map((c, i) => (
                <span key={c.id} style={{ fontSize: '9.5pt' }}>
                  {c.text}{i < clubs.length - 1 ? '; ' : ''}
                </span>
              ))}
            </div>
          )}
          {interests.length > 0 && (
            <div>
              <span style={{ fontWeight: 700, fontSize: '9.5pt' }}>Interests: </span>
              {interests.map((c, i) => (
                <span key={c.id} style={{ fontSize: '9.5pt' }}>
                  {c.text}{i < interests.length - 1 ? '; ' : ''}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
