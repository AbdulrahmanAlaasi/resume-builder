'use client';
import { ResumeData } from '../../types/resume';

interface Props {
  data: ResumeData;
}

/**
 * Mirror of the official YU Career Center CV template (approved).
 * Black bold uppercase section heads with a colon, thin horizontal rules
 * between sections, two-column rows for institution/location + title/dates,
 * Times New Roman throughout. LinkedIn rendered as a real hyperlink.
 */

const INK = '#000';
const RULE = '#000';

const s = {
  page: {
    fontFamily: '"Times New Roman", Times, serif',
    fontSize: '11pt',
    color: INK,
    lineHeight: 1.3,
    padding: '0.6in 0.7in',
    background: 'white',
    minHeight: '11in',
    width: '8.5in',
    boxSizing: 'border-box',
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

  rule: {
    borderTop: `1px solid ${RULE}`,
    margin: '6px 0',
  },

  sectionHeader: {
    fontSize: '11pt',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    marginTop: 4,
    marginBottom: 4,
  },
  sectionHeaderSub: {
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    fontSize: '11pt',
  },

  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  } as React.CSSProperties,

  leftBoldUnderline: {
    fontWeight: 700,
    textDecoration: 'underline',
  },
  rightBold: {
    fontWeight: 700,
  },

  italicLeft: { fontStyle: 'italic' as const },
  italicRight: { fontStyle: 'italic' as const, whiteSpace: 'nowrap' as const },

  bulletList: {
    margin: '2px 0 6px 0',
    paddingLeft: '0.35in',
  } as React.CSSProperties,
  bulletItem: {
    marginBottom: 2,
  },

  link: {
    color: INK,
    textDecoration: 'underline',
  } as React.CSSProperties,
};

function BulletList({ items }: { items: string[] }) {
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
  // Display the URL without the protocol for a cleaner look.
  const label = raw.replace(/^https?:\/\//, '');
  return { href, label };
}

export default function ResumePreview({ data }: Props) {
  const { contact, objective, education, skills, experiences, projects, volunteers, certifications, extracurriculars } = data;

  const linkedin = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');

  // Build contact pieces in order: phone | email | city, country | linkedin
  const contactNodes: React.ReactNode[] = [];
  if (contact.phone.trim()) contactNodes.push(<span key="p">{contact.phone}</span>);
  else contactNodes.push(<span key="p" style={{ color: '#888' }}>[Your Phone Number]</span>);

  if (contact.email.trim()) contactNodes.push(<a key="e" style={s.link} href={`mailto:${contact.email}`}>{contact.email}</a>);
  else contactNodes.push(<span key="e" style={{ color: '#888' }}>[Your Email Address]</span>);

  if (cityCountry) contactNodes.push(<span key="c">{cityCountry}</span>);
  else contactNodes.push(<span key="c" style={{ color: '#888' }}>[Your City, Country]</span>);

  if (linkedin) contactNodes.push(<a key="l" style={s.link} href={linkedin.href} target="_blank" rel="noopener noreferrer">{linkedin.label}</a>);
  else contactNodes.push(<span key="l" style={{ color: '#888' }}>[Your LinkedIn Profile]</span>);

  const eduHasContent = education.some((e) => e.university.trim() || e.degree.trim());
  const expHasContent = experiences.some((e) => e.institution.trim() || e.jobTitle.trim());
  const projHasContent = projects.some((p) => p.institution.trim() || p.title.trim());
  const skillsHasContent = skills.some((sk) => sk.text.trim());
  const volunteersHasContent = volunteers.some((v) => v.text.trim());
  const certsHasContent = certifications.some((c) => c.text.trim());

  const clubs = extracurriculars.filter((e) => e.type === 'club' && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());

  return (
    <div id="resume-preview" style={s.page}>

      {/* ── HEADER ── */}
      <div style={s.name}>
        {contact.fullName.trim() || <span style={{ color: '#888' }}>[Your Name]</span>}
      </div>
      <div style={s.contactLine}>
        {contactNodes.map((node, i) => (
          <span key={i}>
            {node}
            {i < contactNodes.length - 1 ? <span> | </span> : null}
          </span>
        ))}
      </div>
      <div style={s.rule} />

      {/* ── OBJECTIVE ── */}
      <div style={s.sectionHeader}>OBJECTIVE:</div>
      <div>
        {objective.text.trim() || (
          <span style={{ color: '#888' }}>
            [Insert a brief statement about your career objective and what you hope to achieve through the co-op experience.]
          </span>
        )}
      </div>
      <div style={s.rule} />

      {/* ── EDUCATION ── */}
      <div style={s.sectionHeader}>EDUCATION:</div>
      {!eduHasContent ? (
        <div style={{ color: '#888' }}>[Add your university, degree, and graduation date.]</div>
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
            <BulletList items={[
              edu.relevantCoursework.trim() ? `Relevant Coursework: ${edu.relevantCoursework}` : '',
              edu.awards,
            ]} />
          </div>
        ))
      )}
      <div style={s.rule} />

      {/* ── SKILLS ── */}
      <div style={s.sectionHeader}>SKILLS:</div>
      {skillsHasContent ? (
        <BulletList items={skills.map((sk) => sk.text)} />
      ) : (
        <div style={{ color: '#888' }}>
          [List your relevant technical and soft skills — keep this section to 3–4 bullets total.]
        </div>
      )}
      <div style={s.rule} />

      {/* ── PROFESSIONAL & PROJECT EXPERIENCE ── */}
      <div style={s.sectionHeader}>PROFESSIONAL &amp; PROJECT EXPERIENCE:</div>

      {!expHasContent && !projHasContent && (
        <div style={{ color: '#888' }}>[Add at least one role or project. Three bullets per item is the minimum.]</div>
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
          <BulletList items={exp.bullets} />
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
          <BulletList items={proj.bullets} />
        </div>
      ))}
      <div style={s.rule} />

      {/* ── VOLUNTEER LEADERSHIP ── */}
      <div style={s.sectionHeader}>
        VOLUNTEER LEADERSHIP: <span style={{ fontWeight: 400, textTransform: 'none' }}>[OPTIONAL]</span>
      </div>
      {volunteersHasContent ? (
        <BulletList items={volunteers.map((v) => v.text)} />
      ) : (
        <div style={{ color: '#888' }}>[List clubs, organizations, or volunteer work. Highlight leadership roles.]</div>
      )}
      <div style={s.rule} />

      {/* ── CERTIFICATIONS ── */}
      <div style={s.sectionHeader}>
        CERTIFICATIONS: <span style={{ fontWeight: 400, textTransform: 'none' }}>[IF APPLICABLE]</span>
      </div>
      {certsHasContent ? (
        <BulletList items={certifications.map((c) => c.text)} />
      ) : (
        <div style={{ color: '#888' }}>[List relevant certifications, workshops, or online course certificates.]</div>
      )}
      <div style={s.rule} />

      {/* ── EXTRACURRICULAR ── */}
      <div style={s.sectionHeader}>EXTRACURRICULAR ACTIVITIES &amp; INTERESTS:</div>
      <ul style={s.bulletList}>
        <li style={s.bulletItem}>
          <span style={{ fontWeight: 700 }}>Clubs:</span>{' '}
          {clubs.length > 0
            ? clubs.map((c) => c.text).join('; ')
            : <span style={{ color: '#888' }}>[What clubs are you in? What&apos;s your role?]</span>}
        </li>
        <li style={s.bulletItem}>
          <span style={{ fontWeight: 700 }}>Interests:</span>{' '}
          {interests.length > 0
            ? interests.map((i) => i.text).join('; ')
            : <span style={{ color: '#888' }}>[What do you do with your free time that is relevant to an employer?]</span>}
        </li>
      </ul>

    </div>
  );
}
