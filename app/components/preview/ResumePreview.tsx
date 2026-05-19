'use client';
import { ResumeData, ResumeSettings } from '../../types/resume';
import { DEFAULT_SETTINGS } from '../../lib/constants';

interface Props {
  data: ResumeData;
  settings?: ResumeSettings;
}

/**
 * YU-template-faithful renderer. Sections appear ONLY when they have content;
 * the empty preview shows just the header (name + contact placeholders).
 */

function buildStyles(settings: ResumeSettings) {
  const densityMap = {
    compact: { lineHeight: 1.18, padding: '0.55in 0.7in', sectionGap: 2, bodySize: '10.5pt' },
    normal:  { lineHeight: 1.3,  padding: '0.75in 0.9in', sectionGap: 4, bodySize: '11pt'   },
    roomy:   { lineHeight: 1.5,  padding: '0.85in 1in',   sectionGap: 6, bodySize: '11.5pt' },
  } as const;
  const d = densityMap[settings.density];
  const paper = settings.paperSize === 'a4'
    ? { width: '210mm', minHeight: '297mm' }
    : { width: '8.5in', minHeight: '11in' };

  return {
    page: {
      fontFamily: settings.fontFamily,
      fontSize: d.bodySize,
      color: '#000',
      lineHeight: d.lineHeight,
      padding: d.padding,
      background: 'white',
      boxSizing: 'border-box',
      ...paper,
    } as React.CSSProperties,
    name: { fontSize: '16pt', fontWeight: 700, textAlign: 'center' as const, marginBottom: 2 },
    contactLine: { textAlign: 'center' as const, fontSize: '10.5pt', marginBottom: 6 },
    rule: settings.showRules
      ? { borderTop: '1px solid #000', margin: '6px 0' }
      : { margin: '6px 0' },
    sectionHeader: {
      fontSize: '11pt', fontWeight: 700, textTransform: 'uppercase' as const,
      color: settings.accentColor,
      marginTop: d.sectionGap, marginBottom: d.sectionGap,
    },
    row: {
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'baseline', gap: 12,
    } as React.CSSProperties,
    leftBoldUnderline: { fontWeight: 700, textDecoration: 'underline' as const },
    rightBold:         { fontWeight: 700 },
    italicLeft:        { fontStyle: 'italic' as const },
    italicRight:       { fontStyle: 'italic' as const, whiteSpace: 'nowrap' as const },
    bulletList: { margin: '2px 0 6px 0', paddingLeft: '0.35in' } as React.CSSProperties,
    bulletItem: { marginBottom: 2 },
    link:        { color: '#000', textDecoration: 'underline' } as React.CSSProperties,
    placeholder: { color: '#888' } as React.CSSProperties,
  };
}
type S = ReturnType<typeof buildStyles>;

function BulletList({ items, s }: { items: string[]; s: S }) {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (clean.length === 0) return null;
  return (
    <ul style={s.bulletList}>
      {clean.map((t, i) => <li key={i} style={s.bulletItem}>{t}</li>)}
    </ul>
  );
}

function LabelledBullet({ label, text, s }: { label: string; text: string; s: S }) {
  const clean = text.trim();
  if (!clean) return null;
  return (
    <ul style={s.bulletList}>
      <li style={s.bulletItem}>
        <span style={{ fontWeight: 700 }}>{label}</span>{' '}
        {clean}
      </li>
    </ul>
  );
}

function normalizeLinkedIn(url: string): { href: string; label: string } | null {
  const raw = url.trim();
  if (!raw) return null;
  const href = raw.startsWith('http') ? raw : `https://${raw}`;
  const label = 'LinkedIn';
  return { href, label };
}

export default function ResumePreview({ data, settings }: Props) {
  const s = buildStyles(settings ?? DEFAULT_SETTINGS);
  const { contact, objective, education, skills, experiences, projects,
    volunteers, certifications, extracurriculars } = data;

  const linkedin    = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');

  // Build only filled contact pieces.
  const contactNodes: React.ReactNode[] = [];
  if (contact.phone.trim()) contactNodes.push(<span key="p">{contact.phone}</span>);
  if (contact.email.trim()) contactNodes.push(
    <a key="e" style={s.link} href={`mailto:${contact.email}`}>{contact.email}</a>
  );
  if (cityCountry) contactNodes.push(<span key="c">{cityCountry}</span>);
  if (linkedin) contactNodes.push(
    <a key="l" style={s.link} href={linkedin.href} target="_blank" rel="noopener noreferrer">{linkedin.label}</a>
  );

  const showObjective = !!objective.text.trim();
  const showEducation = education.some((e) => e.university.trim() || e.degree.trim());
  const showSkills    = skills.some((sk) => sk.text.trim());
  const filledExp     = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  const filledProj    = projects.filter((p) => p.institution.trim() || p.title.trim());
  const showExpProj   = filledExp.length > 0 || filledProj.length > 0;
  const showVolunteer = volunteers.some((v) => v.text.trim());
  const showCerts     = certifications.some((c) => c.text.trim());
  const clubs         = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests     = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  const showExtra     = clubs.length > 0 || interests.length > 0;

  const headerEmpty = !contact.fullName.trim() && contactNodes.length === 0;

  return (
    <div id="resume-preview" style={s.page}>

      {/* HEADER */}
      <div style={s.name}>
        {contact.fullName.trim() || <span style={s.placeholder}>[Your Name]</span>}
      </div>
      {contactNodes.length > 0 ? (
        <div style={s.contactLine}>
          {contactNodes.map((node, i) => (
            <span key={i}>{node}{i < contactNodes.length - 1 ? <span> | </span> : null}</span>
          ))}
        </div>
      ) : (
        <div style={{ ...s.contactLine, ...s.placeholder }}>
          [Phone] | [Email] | [City, Country] | [LinkedIn]
        </div>
      )}
      {!headerEmpty && <div style={s.rule} />}

      {/* OBJECTIVE */}
      {showObjective && (
        <>
          <div style={s.sectionHeader}>OBJECTIVE</div>
          <div>{objective.text}</div>
          <div style={s.rule} />
        </>
      )}

      {/* EDUCATION */}
      {showEducation && (
        <>
          <div style={s.sectionHeader}>EDUCATION</div>
          {education.filter((e) => e.university.trim() || e.degree.trim()).map((edu) => (
            <div key={edu.id} style={{ marginBottom: 6 }}>
              <div style={s.row}>
                <span style={s.rightBold}>{edu.university || '[University Name]'}</span>
                <span style={s.rightBold}>{edu.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={s.italicLeft}>{edu.degree || '[Your Degree Program]'}</span>
                <span style={s.italicRight}>
                  {edu.graduationDate ? `Expected Graduation ${edu.graduationDate}` : ''}
                </span>
              </div>
              <LabelledBullet s={s} label="Relevant Coursework" text={edu.relevantCoursework} />
              <BulletList s={s} items={[edu.awards]} />
            </div>
          ))}
          <div style={s.rule} />
        </>
      )}

      {/* SKILLS */}
      {showSkills && (
        <>
          <div style={s.sectionHeader}>SKILLS</div>
          <BulletList s={s} items={skills.map((sk) => sk.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* PROFESSIONAL & PROJECT EXPERIENCE */}
      {showExpProj && (
        <>
          <div style={s.sectionHeader}>PROFESSIONAL &amp; PROJECT EXPERIENCE</div>

          {filledExp.map((exp) => (
            <div key={exp.id} style={{ marginBottom: 8 }}>
              <div style={s.row}>
                <span>
                  <span style={s.leftBoldUnderline}>{exp.institution || '[Name of Institution]'}</span>
                  {exp.institutionDesc.trim() && (
                    <span style={s.italicLeft}> ({exp.institutionDesc})</span>
                  )}
                </span>
                <span style={s.rightBold}>{exp.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={s.italicLeft}>{exp.jobTitle || '[Job Title]'}</span>
                <span style={s.italicRight}>
                  {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList s={s} items={exp.bullets} />
            </div>
          ))}

          {filledProj.map((proj) => (
            <div key={proj.id} style={{ marginBottom: 8 }}>
              <div style={s.row}>
                <span style={s.leftBoldUnderline}>{proj.institution || '[Organization]'}</span>
                <span style={s.rightBold}>{proj.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={s.italicLeft}>{proj.title || '[Project Title]'}</span>
                <span style={s.italicRight}>
                  {[proj.startDate, proj.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList s={s} items={proj.bullets} />
            </div>
          ))}
          <div style={s.rule} />
        </>
      )}

      {/* VOLUNTEER */}
      {showVolunteer && (
        <>
          <div style={s.sectionHeader}>VOLUNTEER LEADERSHIP</div>
          <BulletList s={s} items={volunteers.map((v) => v.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* CERTIFICATIONS */}
      {showCerts && (
        <>
          <div style={s.sectionHeader}>CERTIFICATIONS</div>
          <BulletList s={s} items={certifications.map((c) => c.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* EXTRACURRICULAR */}
      {showExtra && (
        <>
          <div style={s.sectionHeader}>EXTRACURRICULAR ACTIVITIES &amp; INTERESTS</div>
          <ul style={s.bulletList}>
            {clubs.length > 0 && (
              <li style={s.bulletItem}>
                <span style={{ fontWeight: 700 }}>Clubs</span>{' '}
                {clubs.map((c) => c.text).join('; ')}
              </li>
            )}
            {interests.length > 0 && (
              <li style={s.bulletItem}>
                <span style={{ fontWeight: 700 }}>Interests</span>{' '}
                {interests.map((i) => i.text).join('; ')}
              </li>
            )}
          </ul>
        </>
      )}

    </div>
  );
}
