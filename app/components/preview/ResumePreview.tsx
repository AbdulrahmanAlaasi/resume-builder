'use client';
import { ResumeData, ResumeSettings } from '../../types/resume';
import { DEFAULT_SETTINGS } from '../../lib/constants';

interface Props {
  data: ResumeData;
  settings?: ResumeSettings;
}

function buildStyles(settings: ResumeSettings) {
  const densityMap = {
    compact: { lineHeight: 1.18, padding: '0.5in 0.6in',  sectionGap: 2, bodySize: '10.5pt' },
    normal:  { lineHeight: 1.3,  padding: '0.6in 0.7in',  sectionGap: 4, bodySize: '11pt'   },
    roomy:   { lineHeight: 1.5,  padding: '0.75in 0.85in', sectionGap: 6, bodySize: '11.5pt' },
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
    name: {
      fontSize: '16pt',
      fontWeight: 700,
      textAlign: 'center' as const,
      marginBottom: 2,
    },
    contactLine: {
      textAlign: 'center' as const,
      fontSize: '10.5pt',
      marginBottom: 6,
    },
    rule: settings.showRules
      ? { borderTop: '1px solid #000', margin: '6px 0' }
      : { margin: '6px 0' },
    sectionHeader: {
      fontSize: '11pt',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      color: settings.accentColor,
      marginTop: d.sectionGap,
      marginBottom: d.sectionGap,
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12,
    } as React.CSSProperties,
    leftBoldUnderline: { fontWeight: 700, textDecoration: 'underline' as const },
    rightBold: { fontWeight: 700 },
    italicLeft: { fontStyle: 'italic' as const },
    italicRight: { fontStyle: 'italic' as const, whiteSpace: 'nowrap' as const },
    bulletList: {
      margin: '2px 0 6px 0',
      paddingLeft: '0.35in',
    } as React.CSSProperties,
    bulletItem: { marginBottom: 2 },
    link: { color: '#000', textDecoration: 'underline' } as React.CSSProperties,
    placeholder: { color: '#888' } as React.CSSProperties,
  };
}

type S = ReturnType<typeof buildStyles>;

function BulletList({ items, s }: { items: string[]; s: S }) {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (clean.length === 0) return null;
  return (
    <ul style={s.bulletList}>
      {clean.map((t, i) => (
        <li key={i} style={s.bulletItem}>{t}</li>
      ))}
    </ul>
  );
}

function normalizeLinkedIn(url: string): { href: string; label: string } | null {
  const raw = url.trim();
  if (!raw) return null;
  const href = raw.startsWith('http') ? raw : `https://${raw}`;
  const label = raw.replace(/^https?:\/\//, '');
  return { href, label };
}

export default function ResumePreview({ data, settings }: Props) {
  const s = buildStyles(settings ?? DEFAULT_SETTINGS);
  const { contact, objective, education, skills, experiences, projects, volunteers, certifications, extracurriculars } = data;

  const linkedin = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');

  const contactNodes: React.ReactNode[] = [];
  contactNodes.push(contact.phone.trim()
    ? <span key="p">{contact.phone}</span>
    : <span key="p" style={s.placeholder}>[Your Phone Number]</span>);
  contactNodes.push(contact.email.trim()
    ? <a key="e" style={s.link} href={`mailto:${contact.email}`}>{contact.email}</a>
    : <span key="e" style={s.placeholder}>[Your Email Address]</span>);
  contactNodes.push(cityCountry
    ? <span key="c">{cityCountry}</span>
    : <span key="c" style={s.placeholder}>[Your City, Country]</span>);
  contactNodes.push(linkedin
    ? <a key="l" style={s.link} href={linkedin.href} target="_blank" rel="noopener noreferrer">{linkedin.label}</a>
    : <span key="l" style={s.placeholder}>[Your LinkedIn Profile]</span>);

  const eduHasContent     = education.some((e) => e.university.trim() || e.degree.trim());
  const expHasContent     = experiences.some((e) => e.institution.trim() || e.jobTitle.trim());
  const projHasContent    = projects.some((p) => p.institution.trim() || p.title.trim());
  const skillsHasContent  = skills.some((sk) => sk.text.trim());
  const volunteersContent = volunteers.some((v) => v.text.trim());
  const certsContent      = certifications.some((c) => c.text.trim());

  const clubs     = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());

  return (
    <div id="resume-preview" style={s.page}>

      {/* HEADER */}
      <div style={s.name}>
        {contact.fullName.trim() || <span style={s.placeholder}>[Your Name]</span>}
      </div>
      <div style={s.contactLine}>
        {contactNodes.map((node, i) => (
          <span key={i}>{node}{i < contactNodes.length - 1 ? <span> | </span> : null}</span>
        ))}
      </div>
      <div style={s.rule} />

      {/* OBJECTIVE */}
      <div style={s.sectionHeader}>OBJECTIVE:</div>
      <div>
        {objective.text.trim() || (
          <span style={s.placeholder}>
            [Insert a brief statement about your career objective and what you hope to achieve through the co-op experience.]
          </span>
        )}
      </div>
      <div style={s.rule} />

      {/* EDUCATION */}
      <div style={s.sectionHeader}>EDUCATION:</div>
      {!eduHasContent ? (
        <div style={s.placeholder}>[Add your university, degree, and graduation date.]</div>
      ) : (
        education.filter((e) => e.university.trim() || e.degree.trim()).map((edu) => (
          <div key={edu.id} style={{ marginBottom: 6 }}>
            <div style={s.row}>
              <span style={s.rightBold}>{edu.university || '[University Name]'}</span>
              <span style={s.rightBold}>{edu.location || ''}</span>
            </div>
            <div style={s.row}>
              <span style={s.italicLeft}>{edu.degree || '[Your Degree Program]'}</span>
              <span style={s.italicRight}>
                {edu.graduationDate ? `Expected Graduation: ${edu.graduationDate}` : ''}
              </span>
            </div>
            <BulletList s={s} items={[
              edu.relevantCoursework.trim() ? `Relevant Coursework: ${edu.relevantCoursework}` : '',
              edu.awards,
            ]} />
          </div>
        ))
      )}
      <div style={s.rule} />

      {/* SKILLS */}
      <div style={s.sectionHeader}>SKILLS:</div>
      {skillsHasContent ? (
        <BulletList s={s} items={skills.map((sk) => sk.text)} />
      ) : (
        <div style={s.placeholder}>
          [List your relevant technical and soft skills — keep this section to 3–4 bullets total.]
        </div>
      )}
      <div style={s.rule} />

      {/* PROFESSIONAL & PROJECT EXPERIENCE */}
      <div style={s.sectionHeader}>PROFESSIONAL &amp; PROJECT EXPERIENCE:</div>
      {!expHasContent && !projHasContent && (
        <div style={s.placeholder}>[Add at least one role or project. Three bullets per item is the minimum.]</div>
      )}

      {experiences.filter((e) => e.institution.trim() || e.jobTitle.trim()).map((exp) => (
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
            <span style={s.italicLeft}>{exp.jobTitle || '[Job Title — full or part-time]'}</span>
            <span style={s.italicRight}>
              {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
            </span>
          </div>
          <BulletList s={s} items={exp.bullets} />
        </div>
      ))}

      {projects.filter((p) => p.institution.trim() || p.title.trim()).map((proj) => (
        <div key={proj.id} style={{ marginBottom: 8 }}>
          <div style={s.row}>
            <span style={s.leftBoldUnderline}>{proj.institution || '[Name of Institution]'}</span>
            <span style={s.rightBold}>{proj.location || ''}</span>
          </div>
          <div style={s.row}>
            <span style={s.italicLeft}>{proj.title || '[Project Title — part-time]'}</span>
            <span style={s.italicRight}>
              {[proj.startDate, proj.endDate].filter(Boolean).join(' – ')}
            </span>
          </div>
          <BulletList s={s} items={proj.bullets} />
        </div>
      ))}
      <div style={s.rule} />

      {/* VOLUNTEER */}
      <div style={s.sectionHeader}>
        VOLUNTEER LEADERSHIP: <span style={{ fontWeight: 400, textTransform: 'none' }}>[OPTIONAL]</span>
      </div>
      {volunteersContent ? (
        <BulletList s={s} items={volunteers.map((v) => v.text)} />
      ) : (
        <div style={s.placeholder}>[List clubs, organizations, or volunteer work. Highlight leadership roles.]</div>
      )}
      <div style={s.rule} />

      {/* CERTIFICATIONS */}
      <div style={s.sectionHeader}>
        CERTIFICATIONS: <span style={{ fontWeight: 400, textTransform: 'none' }}>[IF APPLICABLE]</span>
      </div>
      {certsContent ? (
        <BulletList s={s} items={certifications.map((c) => c.text)} />
      ) : (
        <div style={s.placeholder}>[List relevant certifications, workshops, or online course certificates.]</div>
      )}
      <div style={s.rule} />

      {/* EXTRACURRICULAR */}
      <div style={s.sectionHeader}>EXTRACURRICULAR ACTIVITIES &amp; INTERESTS:</div>
      <ul style={s.bulletList}>
        <li style={s.bulletItem}>
          <span style={{ fontWeight: 700 }}>Clubs:</span>{' '}
          {clubs.length > 0
            ? clubs.map((c) => c.text).join('; ')
            : <span style={s.placeholder}>[What clubs are you in? What&apos;s your role?]</span>}
        </li>
        <li style={s.bulletItem}>
          <span style={{ fontWeight: 700 }}>Interests:</span>{' '}
          {interests.length > 0
            ? interests.map((i) => i.text).join('; ')
            : <span style={s.placeholder}>[What do you do with your free time that is relevant to an employer?]</span>}
        </li>
      </ul>

    </div>
  );
}
