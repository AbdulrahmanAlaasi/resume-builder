'use client';
import { ResumeData, ResumeSettings } from '../../types/resume';
import { DEFAULT_SETTINGS } from '../../lib/constants';
import { hasSkillContent, splitSkillLabel } from '../../lib/skills';
import { useConfigStore } from '../../store/configStore';
import { headingFor, isSectionEnabled, DEFAULT_TEMPLATE,
  type TemplateConfig, type ElementKey } from '../../lib/siteConfig';

interface Props {
  data: ResumeData;
  settings?: ResumeSettings;
}

/**
 * YU-template-faithful renderer. Sections appear ONLY when they have content;
 * the empty preview shows just the header (name + contact placeholders).
 */

function buildStyles(settings: ResumeSettings, config: TemplateConfig) {
  // The admin's page setup is the baseline. Choosing "normal" density adds a
  // little size, leading and margin on top of it; "compact" uses it as-is.
  const adj = settings.density === 'normal'
    ? { size: 0.5, lh: 0.12, margin: 0.2, gap: 2 }
    : { size: 0,   lh: 0,    margin: 0,   gap: 0 };

  const pg        = config.page;
  const baseFont  = pg.fontFamily || settings.fontFamily;
  const baseSize  = pg.fontSize + adj.size;
  const paper     = settings.paperSize === 'a4'
    ? { width: '210mm', minHeight: '297mm' }
    : { width: '8.5in', minHeight: '11in' };

  /** Turn one configured element style into CSS. */
  const css = (key: ElementKey, extra: React.CSSProperties = {}): React.CSSProperties => {
    const el = config.elements?.[key] ?? DEFAULT_TEMPLATE.elements[key];
    return {
      fontFamily:     el.fontFamily || undefined,
      // An explicit size is absolute; only inherited sizes follow density.
      fontSize:       `${el.fontSize || baseSize}pt`,
      fontWeight:     el.bold ? 700 : 400,
      fontStyle:      el.italic ? 'italic' : 'normal',
      textDecoration: el.underline ? 'underline' : 'none',
      textTransform:  el.uppercase ? 'uppercase' : 'none',
      color:          el.color || undefined,
      textAlign:      el.align,
      marginTop:      el.spaceBefore ? `${el.spaceBefore}pt` : undefined,
      marginBottom:   el.spaceAfter  ? `${el.spaceAfter}pt`  : undefined,
      ...extra,
    };
  };

  const sh = config.elements?.sectionHeading ?? DEFAULT_TEMPLATE.elements.sectionHeading;

  return {
    page: {
      fontFamily: baseFont,
      fontSize: `${baseSize}pt`,
      color: '#000',
      lineHeight: pg.lineHeight + adj.lh,
      padding: `${pg.marginV + adj.margin}in ${pg.marginH + adj.margin}in`,
      background: 'white',
      boxSizing: 'border-box',
      ...paper,
    } as React.CSSProperties,

    rule: settings.showRules
      ? { borderTop: `${pg.ruleWidth}px solid ${pg.ruleColor}`, margin: '6px 0' }
      : { margin: '6px 0' },

    name:        css('name'),
    contactLine: css('contact'),
    sectionHeader: css('sectionHeading', {
      // Accent colour still drives headings unless a colour is set explicitly.
      color: sh.color || settings.accentColor,
      marginTop:    `${sh.spaceBefore + adj.gap}pt`,
      marginBottom: `${sh.spaceAfter  + adj.gap}pt`,
    }),
    university:        css('university',  { textAlign: 'left', whiteSpace: 'normal' }),
    leftBoldUnderline: css('institution'),
    rightBold:         css('location',    { whiteSpace: 'nowrap' }),
    italicLeft:        css('roleTitle'),
    italicRight:       css('dates',       { whiteSpace: 'nowrap' }),
    body:              css('body'),
    bulletItem:        css('bullet'),
    inlineLabel:       css('inlineLabel', { textAlign: undefined }),

    row: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) max-content',
      alignItems: 'baseline',
      columnGap: 12,
    } as React.CSSProperties,
    leftCell: { minWidth: 0 } as React.CSSProperties,
    bulletList: { margin: '2px 0 6px 0', paddingLeft: '0.35in' } as React.CSSProperties,
    link:        { color: 'inherit', textDecoration: 'underline' } as React.CSSProperties,
    placeholder: { color: '#888' } as React.CSSProperties,
  };
}

type S = ReturnType<typeof buildStyles>;

function BulletList({ items, s }: { items: string[]; s: S }) {
  const clean = items.map((i) => i.trim()).filter(Boolean);
  if (clean.length === 0) return null;
  return (
    <ul style={s.bulletList}>
      {clean.map((t, i) => <li key={i} style={s.bulletItem} data-el="bullet">{t}</li>)}
    </ul>
  );
}

function LabelledBullet({ label, text, s }: { label: string; text: string; s: S }) {
  const clean = text.trim();
  if (!clean) return null;
  return (
    <ul style={s.bulletList}>
      <li style={s.bulletItem} data-el="bullet">
        <span style={s.inlineLabel} data-el="inlineLabel">{label}</span>{' '}
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
          <li key={i} style={s.bulletItem} data-el="bullet">
            {labelled ? (
              <>
                <span style={s.inlineLabel} data-el="inlineLabel">{labelled.label}</span>{' '}
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
  const s = buildStyles(settings ?? DEFAULT_SETTINGS, config);
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
      <div style={s.name} data-el="name">
        {contact.fullName.trim() || <span style={s.placeholder}>{config.cvLabels.namePlaceholder}</span>}
      </div>
      {contactNodes.length > 0 ? (
        <div style={s.contactLine} data-el="contact">
          {contactNodes.map((node, i) => (
            <span key={i}>{node}{i < contactNodes.length - 1 ? <span> | </span> : null}</span>
          ))}
        </div>
      ) : (
        <div style={{ ...s.contactLine, ...s.placeholder }} data-el="contact">
          {config.cvLabels.contactPlaceholder}
        </div>
      )}
      {!headerEmpty && <div style={s.rule} />}

      {/* OBJECTIVE */}
      {showObjective && (
        <>
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'objective')}</div>
          <div style={s.body} data-el="body">{objective.text}</div>
          <div style={s.rule} />
        </>
      )}

      {/* EDUCATION */}
      {showEducation && (
        <>
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'education')}</div>
          {education.filter((e) => e.university.trim() || e.degree.trim()).map((edu) => (
            <div key={edu.id} style={{ marginBottom: 6 }}>
              <div style={s.row}>
                <span style={{ ...s.leftCell, ...s.university }} data-el="university">
                  {edu.university || '[University Name]'}
                </span>
                <span style={s.rightBold} data-el="location">{edu.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={{ ...s.leftCell, ...s.italicLeft }} data-el="roleTitle">{edu.degree || '[Your Degree Program]'}</span>
                <span style={s.italicRight} data-el="dates">
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
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'skills')}</div>
          <SkillBulletList s={s} items={skills.map((sk) => sk.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* PROFESSIONAL & PROJECT EXPERIENCE */}
      {showExpProj && (
        <>
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'experience')}</div>

          {filledExp.map((exp) => (
            <div key={exp.id} style={{ marginBottom: 8 }}>
              <div style={s.row}>
                <span style={s.leftCell}>
                  <span style={s.leftBoldUnderline} data-el="institution">{exp.institution || '[Name of Institution]'}</span>
                  {exp.institutionDesc.trim() && (
                    <span style={s.italicLeft}> ({exp.institutionDesc})</span>
                  )}
                </span>
                <span style={s.rightBold} data-el="location">{exp.location || ''}</span>
              </div>
              <div style={s.row}>
                <span style={{ ...s.leftCell, ...s.italicLeft }} data-el="roleTitle">{exp.jobTitle || '[Job Title]'}</span>
                <span style={s.italicRight} data-el="dates">
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
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'volunteer')}</div>
          <BulletList s={s} items={volunteers.map((v) => v.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* CERTIFICATIONS */}
      {showCerts && (
        <>
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'certifications')}</div>
          <BulletList s={s} items={certifications.map((c) => c.text)} />
          <div style={s.rule} />
        </>
      )}

      {/* EXTRACURRICULAR */}
      {showExtra && (
        <>
          <div style={s.sectionHeader} data-el="sectionHeading">{headingFor(config, 'extracurricular')}</div>
          <ul style={s.bulletList}>
            {clubs.length > 0 && (
              <li style={s.bulletItem} data-el="bullet">
                <span style={s.inlineLabel} data-el="inlineLabel">{config.cvLabels.clubs}</span>{' '}
                {clubs.map((c) => c.text).join('; ')}
              </li>
            )}
            {interests.length > 0 && (
              <li style={s.bulletItem} data-el="bullet">
                <span style={s.inlineLabel} data-el="inlineLabel">{config.cvLabels.interests}</span>{' '}
                {interests.map((i) => i.text).join('; ')}
              </li>
            )}
          </ul>
        </>
      )}

    </div>
  );
}
