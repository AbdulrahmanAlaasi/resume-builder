'use client';
import { ResumeData, ResumeSettings } from '../../types/resume';
import { DEFAULT_SETTINGS } from '../../lib/constants';
import { hasSkillContent, splitSkillLabel } from '../../lib/skills';
import { useConfigStore } from '../../store/configStore';
import { headingFor, isSectionEnabled } from '../../lib/siteConfig';

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
  } as const;
  const d = densityMap[settings.density] ?? densityMap.normal;
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
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) max-content',
      alignItems: 'baseline',
      columnGap: 12,
    } as React.CSSProperties,
    leftCell: { minWidth: 0 } as React.CSSProperties,
    leftBoldUnderline: { fontWeight: 700, textDecoration: 'underline' as const },
    rightBold:         { fontWeight: 700, textAlign: 'right' as const, whiteSpace: 'nowrap' as const },
    italicLeft:        { fontStyle: 'italic' as const },
    italicRight:       { fontStyle: 'italic' as const, textAlign: 'right' as const, whiteSpace: 'nowrap' as const },
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

function SkillBulletList({ items, s }: { items: string[]; s: S }) {
  const clean = items.map((i) => i.trim()).filter(hasSkillContent);
  if (clean.length === 0) return null;
  return (
    <ul style={s.bulletList}>
      {clean.map((text, i) => {
        const labelled = splitSkillLabel(text);
        return (
          <li key={i} style={s.bulletItem}>
            {labelled ? (
              <>
                <span style={{ fontWeight: 700 }}>{labelled.label}</span>{' '}
                {labelled.value}
              </>
            ) : text}
          </li>
        );
      })}
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
  // Published template (headings, labels, which sections are enabled).
  const config = useConfigStore((st) => st.config);
  const s = buildStyles(settings ?? DEFAULT_SETTINGS);
  const { contact, objective, education, skills, experiences,
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
    <a key="l" style={s.link} href={linkedin.href} target="_blank" rel="noopener noreferrer">{config.cvLabels.linkedinText || linkedin.label}</a>
  );

  // A section renders only when it has content AND the published template
  // still has it enabled.
  const on = (id: Parameters<typeof isSectionEnabled>[1]) => isSectionEnabled(config, id);

  const showObjective = on('objective') && !!objective.text.trim();
  const showEducation = on('education') && education.some((e) => e.university.trim() || e.degree.trim());
  const showSkills    = on('skills')    && skills.some((sk) => hasSkillContent(sk.text));
  const filledExp     = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  const showExpProj   = on('experience') && filledExp.length > 0;
  const showVolunteer = on('volunteer') && volunteers.some((v) => v.text.trim());
  const showCerts     = on('certifications') && certifications.some((c) => c.text.trim());
  const clubs         = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests     = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  const showExtra     = on('extracurricular') && (clubs.length > 0 || interests.length > 0);

  const headerEmpty = !contact.fullName.trim() && contactNodes.length === 0;

  return (
    <div id="resume-preview" style={s.page}>

      {/* HEADER */}
      <div style={s.name}>
        {contact.fullName.trim() || <span style={s.placeholder}>{config.cvLabels.namePlaceholder}</span>}
      </div>
      {contactNodes.length > 0 ? (
        <div style={s.contactLine}>
          {contactNodes.map((node, i) => (
            <span key={i}>{node}{i < contactNodes.length - 1 ? <span> | </span> : null}</span>
          ))}
        </div>
      ) : (
        <div style={{ ...s.contactLine, ...s.placeholder }}>
          {config.cvLabels.contactPlaceholder}
        </div>
      )}
      {!headerEmpty && <div style={s.rule} />}

      {/* OBJECTIVE */}
      {showObjective && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'objective')}</div>
          <div>{objective.text}</div>
          <div style={s.rule} />
        </>
      )}

      {/* EDUCATION */}
      {showEducation && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'education')}</div>
          {education.filter((e) => e.university.trim() || e.degree.trim()).map((edu) => (
            <div key={edu.id} style={{ marginBottom: 6 }}>
              <div style={s.row}>
                <span style={{ ...s.leftCell, ...s.rightBold, textAlign: 'left', whiteSpace: 'normal' }}>
                  {edu.university || '[University Name]'}
                </span>
                <span style={s.rightBold}>{edu.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={{ ...s.leftCell, ...s.italicLeft }}>{edu.degree || '[Your Degree Program]'}</span>
                <span style={s.italicRight}>
                  {edu.graduationDate ? `${config.cvLabels.expectedGraduation} ${edu.graduationDate}` : ''}
                </span>
              </div>
              <LabelledBullet s={s} label={config.cvLabels.relevantCoursework} text={edu.relevantCoursework} />
              <BulletList s={s} items={[edu.awards]} />
            </div>
          ))}
          <div style={s.rule} />
        </>
      )}

      {/* SKILLS */}
      {showSkills && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'skills')}</div>
          <SkillBulletList s={s} items={skills.map((sk) => sk.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* PROFESSIONAL & PROJECT EXPERIENCE */}
      {showExpProj && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'experience')}</div>

          {filledExp.map((exp) => (
            <div key={exp.id} style={{ marginBottom: 8 }}>
              <div style={s.row}>
                <span style={s.leftCell}>
                  <span style={s.leftBoldUnderline}>{exp.institution || '[Name of Institution]'}</span>
                  {exp.institutionDesc.trim() && (
                    <span style={s.italicLeft}> ({exp.institutionDesc})</span>
                  )}
                </span>
                <span style={s.rightBold}>{exp.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={{ ...s.leftCell, ...s.italicLeft }}>{exp.jobTitle || '[Job Title]'}</span>
                <span style={s.italicRight}>
                  {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                </span>
              </div>
              <BulletList s={s} items={exp.bullets} />
            </div>
          ))}

          <div style={s.rule} />
        </>
      )}

      {/* VOLUNTEER */}
      {showVolunteer && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'volunteer')}</div>
          <BulletList s={s} items={volunteers.map((v) => v.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* CERTIFICATIONS */}
      {showCerts && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'certifications')}</div>
          <BulletList s={s} items={certifications.map((c) => c.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* EXTRACURRICULAR */}
      {showExtra && (
        <>
          <div style={s.sectionHeader}>{headingFor(config, 'extracurricular')}</div>
          <ul style={s.bulletList}>
            {clubs.length > 0 && (
              <li style={s.bulletItem}>
                <span style={{ fontWeight: 700 }}>{config.cvLabels.clubs}</span>{' '}
                {clubs.map((c) => c.text).join('; ')}
              </li>
            )}
            {interests.length > 0 && (
              <li style={s.bulletItem}>
                <span style={{ fontWeight: 700 }}>{config.cvLabels.interests}</span>{' '}
                {interests.map((i) => i.text).join('; ')}
              </li>
            )}
          </ul>
        </>
      )}

    </div>
  );
}
