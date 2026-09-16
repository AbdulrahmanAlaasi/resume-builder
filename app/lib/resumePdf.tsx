/**
 * resumePdf.tsx
 *
 * Structured (vector) PDF export using @react-pdf/renderer.
 *
 * Unlike the old html2pdf screenshot approach, this produces real, selectable,
 * ATS-parseable text with working email/LinkedIn hyperlinks. It mirrors the
 * YU template laid out in ResumePreview.tsx, and follows the DOCX rule of
 * rendering only real content (no grey "[placeholder]" text).
 *
 * Font note: the PDF embeds the standard Times-Roman family for every serif
 * choice. Times New Roman is the YU default; Georgia / Garamond / Cambria are
 * proprietary and cannot be embedded without shipping TTF files, so they map
 * to Times-Roman in the PDF. The on-screen preview and DOCX still honour the
 * chosen face.
 */

import * as React from 'react';
import { ResumeData, ResumeSettings } from '../types/resume';
import { DEFAULT_SETTINGS } from './constants';
import { hasSkillContent, splitSkillLabel } from './skills';
import {
  DEFAULT_TEMPLATE, headingFor, isSectionEnabled,
  type TemplateConfig, type ElementKey,
} from './siteConfig';

const FONT = 'Times-Roman';

function normalizeLinkedIn(url: string): { href: string; label: string } | null {
  const raw = url.trim();
  if (!raw) return null;
  return { href: raw.startsWith('http') ? raw : `https://${raw}`, label: 'LinkedIn' };
}

export async function exportToPDF(
  data: ResumeData,
  settingsArg?: ResumeSettings,
  configArg?: TemplateConfig,
) {
  const settings = settingsArg ?? DEFAULT_SETTINGS;
  const config   = configArg ?? DEFAULT_TEMPLATE;
  const L        = config.cvLabels;
  const on       = (id: Parameters<typeof isSectionEnabled>[1]) => isSectionEnabled(config, id);

  const {
    Document, Page, View, Text, Link, StyleSheet, pdf,
  } = await import('@react-pdf/renderer');

  // ---- metrics + styles from the published template (points; 1in = 72pt) ----
  const adj = settings.density === 'normal'
    ? { size: 0.5, lh: 0.12, margin: 0.2, gap: 2 }
    : { size: 0,   lh: 0,    margin: 0,   gap: 0 };

  const pg     = config.page;
  const basePt = pg.fontSize + adj.size;
  const padV   = (pg.marginV + adj.margin) * 72;
  const padH   = (pg.marginH + adj.margin) * 72;
  const accent = /^#[0-9a-fA-F]{6}$/.test(settings.accentColor) ? settings.accentColor : '#000000';

  const el = (k: ElementKey) => config.elements?.[k] ?? DEFAULT_TEMPLATE.elements[k];

  /**
   * Map one configured element style onto react-pdf style props.
   * fontFamily is deliberately pinned to the embedded Times family — see the
   * font note at the top of this file.
   */
  const st = (k: ElementKey, extra: Record<string, unknown> = {}) => {
    const e = el(k);
    return {
      fontFamily: FONT,
      fontSize: e.fontSize || basePt,
      fontWeight: e.bold ? 'bold' : 'normal',
      fontStyle: e.italic ? 'italic' : 'normal',
      textDecoration: e.underline ? 'underline' : 'none',
      textTransform: e.uppercase ? 'uppercase' : 'none',
      color: e.color || '#000',
      textAlign: e.align,
      marginTop: e.spaceBefore || 0,
      marginBottom: e.spaceAfter || 0,
      ...extra,
    } as Record<string, unknown>;
  };

  const shEl = el('sectionHeading');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const styles = StyleSheet.create({
    page: {
      fontFamily: FONT, fontSize: basePt, lineHeight: pg.lineHeight + adj.lh, color: '#000',
      paddingTop: padV, paddingBottom: padV, paddingLeft: padH, paddingRight: padH,
    },
    name:        st('name'),
    contactLine: st('contact'),
    link: { color: '#000', textDecoration: 'underline' },
    rule: {
      borderBottomWidth: settings.showRules ? pg.ruleWidth : 0,
      borderBottomColor: pg.ruleColor, marginTop: 6, marginBottom: 6,
    },
    sectionHeader: st('sectionHeading', {
      color: shEl.color || accent,
      marginTop: shEl.spaceBefore + adj.gap + 2,
      marginBottom: shEl.spaceAfter,
    }),
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    left: { flexGrow: 1, flexShrink: 1, paddingRight: 8 },
    right:         st('location', { flexShrink: 0 }),
    rightItalic:   st('dates',    { flexShrink: 0 }),
    university:    st('university'),
    inlineLabel:   st('inlineLabel', { marginTop: 0, marginBottom: 0 }),
    boldUnderline: st('institution'),
    italic:        st('roleTitle'),
    entry: { marginBottom: 6 },
    para:  st('body'),
    bulletRow: { flexDirection: 'row', paddingLeft: 18, marginBottom: 2 },
    bulletDot: { width: 10 },
    bulletText: st('bullet', { flexGrow: 1, flexShrink: 1, marginTop: 0, marginBottom: 0 }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  // ---- small building blocks ----
  let k = 0;
  const key = () => `n${k++}`;

  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );

  const TwoCol = ({ left, right, rightItalic }: {
    left: React.ReactNode; right: string; rightItalic?: boolean;
  }) => (
    <View style={styles.row}>
      <Text style={styles.left}>{left}</Text>
      {right ? <Text style={rightItalic ? styles.rightItalic : styles.right}>{right}</Text> : null}
    </View>
  );

  const Rule = () => <View style={styles.rule} />;
  const Header = ({ text }: { text: string }) => <Text style={styles.sectionHeader}>{text}</Text>;

  // ---- assemble body ----
  const { contact, objective, education, skills, experiences,
    volunteers, certifications, extracurriculars } = data;
  const body: React.ReactNode[] = [];
  const push = (node: React.ReactNode) => body.push(<React.Fragment key={key()}>{node}</React.Fragment>);

  // Header — name + contact line
  if (contact.fullName.trim()) {
    push(<Text style={styles.name}>{contact.fullName.trim()}</Text>);
  }

  const linkedin    = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');
  const contactParts: React.ReactNode[] = [];
  if (contact.phone.trim()) contactParts.push(<Text key={key()}>{contact.phone.trim()}</Text>);
  if (contact.email.trim()) {
    contactParts.push(<Link key={key()} style={styles.link} src={`mailto:${contact.email.trim()}`}>{contact.email.trim()}</Link>);
  }
  if (cityCountry) contactParts.push(<Text key={key()}>{cityCountry}</Text>);
  if (linkedin) {
    contactParts.push(<Link key={key()} style={styles.link} src={linkedin.href}>{L.linkedinText || linkedin.label}</Link>);
  }
  if (contactParts.length) {
    const withSeps: React.ReactNode[] = [];
    contactParts.forEach((part, i) => {
      if (i > 0) withSeps.push(<Text key={key()}> | </Text>);
      withSeps.push(part);
    });
    push(<Text style={styles.contactLine}>{withSeps}</Text>);
  }
  if (contact.fullName.trim() || contactParts.length) push(<Rule />);

  // Objective
  if (on('objective') && objective.text.trim()) {
    push(<Header text={headingFor(config, 'objective')} />);
    push(<Text style={styles.para}>{objective.text.trim()}</Text>);
    push(<Rule />);
  }

  // Education
  const filledEdu = education.filter((e) => e.university.trim() || e.degree.trim());
  if (on('education') && filledEdu.length) {
    push(<Header text={headingFor(config, 'education')} />);
    filledEdu.forEach((edu) => {
      push(
        <View style={styles.entry}>
          <TwoCol left={<Text style={styles.university}>{edu.university.trim()}</Text>} right={edu.location.trim()} />
          <TwoCol
            left={<Text style={styles.italic}>{edu.degree.trim()}</Text>}
            right={edu.graduationDate.trim() ? `${L.expectedGraduation} ${edu.graduationDate.trim()}` : ''}
            rightItalic
          />
          {edu.relevantCoursework.trim() ? (
            <Bullet><Text style={styles.inlineLabel}>{L.relevantCoursework} </Text>{edu.relevantCoursework.trim()}</Bullet>
          ) : null}
          {edu.awards.trim() ? <Bullet>{edu.awards.trim()}</Bullet> : null}
        </View>,
      );
    });
    push(<Rule />);
  }

  // Skills
  const filledSkills = skills.map((s) => s.text).filter(hasSkillContent);
  if (on('skills') && filledSkills.length) {
    push(<Header text={headingFor(config, 'skills')} />);
    filledSkills.forEach((text) => {
      const labelled = splitSkillLabel(text.trim());
      push(labelled
        ? <Bullet><Text style={styles.inlineLabel}>{labelled.label} </Text>{labelled.value}</Bullet>
        : <Bullet>{text.trim()}</Bullet>);
    });
    push(<Rule />);
  }

  // Professional & Project Experience
  const filledExp = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  if (on('experience') && filledExp.length) {
    push(<Header text={headingFor(config, 'experience')} />);
    filledExp.forEach((exp) => {
      push(
        <View style={styles.entry}>
          <TwoCol
            left={
              <Text>
                <Text style={styles.boldUnderline}>{exp.institution.trim()}</Text>
                {exp.institutionDesc.trim() ? <Text style={styles.italic}> ({exp.institutionDesc.trim()})</Text> : null}
              </Text>
            }
            right={exp.location.trim()}
          />
          <TwoCol
            left={<Text style={styles.italic}>{exp.jobTitle.trim()}</Text>}
            right={[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
            rightItalic
          />
          {exp.bullets.filter((b) => b.trim()).map((b) => <Bullet key={key()}>{b.trim()}</Bullet>)}
        </View>,
      );
    });
    push(<Rule />);
  }

  // Volunteer
  const filledVol = volunteers.filter((v) => v.text.trim());
  if (on('volunteer') && filledVol.length) {
    push(<Header text={headingFor(config, 'volunteer')} />);
    filledVol.forEach((v) => push(<Bullet>{v.text.trim()}</Bullet>));
    push(<Rule />);
  }

  // Certifications
  const filledCerts = certifications.filter((c) => c.text.trim());
  if (on('certifications') && filledCerts.length) {
    push(<Header text={headingFor(config, 'certifications')} />);
    filledCerts.forEach((c) => push(<Bullet>{c.text.trim()}</Bullet>));
    push(<Rule />);
  }

  // Extracurricular
  const clubs     = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  if (on('extracurricular') && (clubs.length || interests.length)) {
    push(<Header text={headingFor(config, 'extracurricular')} />);
    if (clubs.length) {
      push(<Bullet><Text style={styles.inlineLabel}>{L.clubs} </Text>{clubs.map((c) => c.text.trim()).join('; ')}</Bullet>);
    }
    if (interests.length) {
      push(<Bullet><Text style={styles.inlineLabel}>{L.interests} </Text>{interests.map((i) => i.text.trim()).join('; ')}</Bullet>);
    }
  }

  // ---- render & save ----
  const doc = (
    <Document>
      <Page size={settings.paperSize === 'a4' ? 'A4' : 'LETTER'} style={styles.page}>
        {body}
      </Page>
    </Document>
  );

  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${contact.fullName.trim() || 'resume'}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
