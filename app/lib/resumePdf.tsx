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

const FONT = 'Times-Roman';

function normalizeLinkedIn(url: string): { href: string; label: string } | null {
  const raw = url.trim();
  if (!raw) return null;
  return { href: raw.startsWith('http') ? raw : `https://${raw}`, label: 'LinkedIn' };
}

export async function exportToPDF(data: ResumeData, settingsArg?: ResumeSettings) {
  const settings = settingsArg ?? DEFAULT_SETTINGS;

  const {
    Document, Page, View, Text, Link, StyleSheet, pdf,
  } = await import('@react-pdf/renderer');

  // ---- density-driven metrics (points; 1in = 72pt) ----
  const d = settings.density === 'compact'
    ? { padV: 39.6, padH: 50.4, body: 10.5, line: 1.18, gap: 4 }
    : { padV: 54,   padH: 64.8, body: 11,   line: 1.30, gap: 7 };

  const accent = /^#[0-9a-fA-F]{6}$/.test(settings.accentColor) ? settings.accentColor : '#000000';

  const styles = StyleSheet.create({
    page: {
      fontFamily: FONT, fontSize: d.body, lineHeight: d.line, color: '#000',
      paddingTop: d.padV, paddingBottom: d.padV, paddingLeft: d.padH, paddingRight: d.padH,
    },
    name: { fontSize: 16, fontFamily: FONT, fontWeight: 'bold', textAlign: 'center', marginBottom: 2 },
    contactLine: { fontSize: 10.5, textAlign: 'center', marginBottom: 4 },
    link: { color: '#000', textDecoration: 'underline' },
    rule: { borderBottomWidth: settings.showRules ? 1 : 0, borderBottomColor: '#000', marginTop: 6, marginBottom: 6 },
    sectionHeader: {
      fontSize: 11, fontFamily: FONT, fontWeight: 'bold', textTransform: 'uppercase',
      color: accent, marginTop: d.gap, marginBottom: 2,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    left: { flexGrow: 1, flexShrink: 1, paddingRight: 8 },
    right: { flexShrink: 0, textAlign: 'right' },
    rightItalic: { flexShrink: 0, textAlign: 'right', fontStyle: 'italic' },
    bold: { fontFamily: FONT, fontWeight: 'bold' },
    boldUnderline: { fontFamily: FONT, fontWeight: 'bold', textDecoration: 'underline' },
    italic: { fontFamily: FONT, fontStyle: 'italic' },
    entry: { marginBottom: 6 },
    para: { marginBottom: 2 },
    bulletRow: { flexDirection: 'row', paddingLeft: 18, marginBottom: 2 },
    bulletDot: { width: 10 },
    bulletText: { flexGrow: 1, flexShrink: 1 },
  });

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
    contactParts.push(<Link key={key()} style={styles.link} src={linkedin.href}>{linkedin.label}</Link>);
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
  if (objective.text.trim()) {
    push(<Header text="Objective" />);
    push(<Text style={styles.para}>{objective.text.trim()}</Text>);
    push(<Rule />);
  }

  // Education
  const filledEdu = education.filter((e) => e.university.trim() || e.degree.trim());
  if (filledEdu.length) {
    push(<Header text="Education" />);
    filledEdu.forEach((edu) => {
      push(
        <View style={styles.entry}>
          <TwoCol left={<Text style={styles.bold}>{edu.university.trim()}</Text>} right={edu.location.trim()} />
          <TwoCol
            left={<Text style={styles.italic}>{edu.degree.trim()}</Text>}
            right={edu.graduationDate.trim() ? `Expected Graduation ${edu.graduationDate.trim()}` : ''}
            rightItalic
          />
          {edu.relevantCoursework.trim() ? (
            <Bullet><Text style={styles.bold}>Relevant Coursework </Text>{edu.relevantCoursework.trim()}</Bullet>
          ) : null}
          {edu.awards.trim() ? <Bullet>{edu.awards.trim()}</Bullet> : null}
        </View>,
      );
    });
    push(<Rule />);
  }

  // Skills
  const filledSkills = skills.map((s) => s.text).filter(hasSkillContent);
  if (filledSkills.length) {
    push(<Header text="Skills" />);
    filledSkills.forEach((text) => {
      const labelled = splitSkillLabel(text.trim());
      push(labelled
        ? <Bullet><Text style={styles.bold}>{labelled.label} </Text>{labelled.value}</Bullet>
        : <Bullet>{text.trim()}</Bullet>);
    });
    push(<Rule />);
  }

  // Professional & Project Experience
  const filledExp = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  if (filledExp.length) {
    push(<Header text="Professional & Project Experience" />);
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
  if (filledVol.length) {
    push(<Header text="Volunteer Leadership" />);
    filledVol.forEach((v) => push(<Bullet>{v.text.trim()}</Bullet>));
    push(<Rule />);
  }

  // Certifications
  const filledCerts = certifications.filter((c) => c.text.trim());
  if (filledCerts.length) {
    push(<Header text="Certifications" />);
    filledCerts.forEach((c) => push(<Bullet>{c.text.trim()}</Bullet>));
    push(<Rule />);
  }

  // Extracurricular
  const clubs     = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  if (clubs.length || interests.length) {
    push(<Header text="Extracurricular Activities & Interests" />);
    if (clubs.length) {
      push(<Bullet><Text style={styles.bold}>Clubs </Text>{clubs.map((c) => c.text.trim()).join('; ')}</Bullet>);
    }
    if (interests.length) {
      push(<Bullet><Text style={styles.bold}>Interests </Text>{interests.map((i) => i.text.trim()).join('; ')}</Bullet>);
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
