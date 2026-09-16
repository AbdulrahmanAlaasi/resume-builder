import { ResumeData, ResumeSettings } from '../types/resume';
import { DEFAULT_SETTINGS } from './constants';
import { hasSkillContent, splitSkillLabel } from './skills';
import {
  DEFAULT_TEMPLATE, headingFor, isSectionEnabled,
  type TemplateConfig, type ElementKey,
} from './siteConfig';

// PDF export now lives in ./resumePdf.tsx — structured vector output with
// selectable text and real hyperlinks. This file handles DOCX only.

/**
 * Map a CSS hex like "#000000" to docx hex like "000000".
 * Falls back to pure black for malformed input.
 */
function toDocxHex(cssColor: string): string {
  const m = cssColor.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return m ? m[1].toUpperCase() : '000000';
}

function normalizeLinkedIn(url: string): { href: string; label: string } | null {
  const raw = url.trim();
  if (!raw) return null;
  const href  = raw.startsWith('http') ? raw : `https://${raw}`;
  const label = 'LinkedIn';
  return { href, label };
}

export async function exportToDOCX(
  data: ResumeData,
  settingsArg?: ResumeSettings,
  configArg?: TemplateConfig,
) {
  const settings = settingsArg ?? DEFAULT_SETTINGS;
  const config   = configArg ?? DEFAULT_TEMPLATE;
  const L        = config.cvLabels;
  const on       = (id: Parameters<typeof isSectionEnabled>[1]) => isSectionEnabled(config, id);
  const accent   = toDocxHex(settings.accentColor);

  const {
    Document, Packer, Paragraph, TextRun, AlignmentType,
    LevelFormat, BorderStyle, UnderlineType, ExternalHyperlink,
    TabStopType,
  } = await import('docx');

  // docx uses Times New Roman in the .docx XML; "font" string just sets it.
  const FONT = settings.fontFamily.includes('Garamond') ? 'EB Garamond'
             : settings.fontFamily.includes('Cambria')  ? 'Cambria'
             : settings.fontFamily.includes('Georgia')  ? 'Georgia'
             :                                            'Times New Roman';

  const DOCX_DENSITY = {
    compact: {
      body: 21, heading: 21, contact: 20, name: 30, desc: 19,
      hrBefore: 35, hrAfter: 35,
      sectionBefore: 45, sectionAfter: 35,
      bulletBefore: 0, bulletAfter: 0,
      rowBefore: 40, italicAfter: 20,
      contactAfter: 35, objectiveAfter: 20, nameAfter: 25,
      margin: { top: 792, right: 1008, bottom: 792, left: 1008 },
    },
    normal: {
      body: 22, heading: 22, contact: 21, name: 32, desc: 20,
      hrBefore: 60, hrAfter: 60,
      sectionBefore: 80, sectionAfter: 60,
      bulletBefore: 20, bulletAfter: 20,
      rowBefore: 80, italicAfter: 40,
      contactAfter: 60, objectiveAfter: 40, nameAfter: 40,
      margin: { top: 1080, right: 1296, bottom: 1080, left: 1296 },
    },
  } as const;
  const density = DOCX_DENSITY[settings.density] ?? DOCX_DENSITY.normal;

  // ---- published element styles -> docx run/paragraph props ----
  const adjPt  = settings.density === 'normal' ? 0.5 : 0;
  const basePt = config.page.fontSize + adjPt;
  const el = (k: ElementKey) => config.elements?.[k] ?? DEFAULT_TEMPLATE.elements[k];

  /** docx sizes are half-points, colours are RRGGBB with no leading '#'. */
  const runOf = (k: ElementKey, extra: Record<string, unknown> = {}) => {
    const e = el(k);
    return {
      font: FONT,
      size: Math.round((e.fontSize || basePt) * 2),
      bold: e.bold,
      italics: e.italic,
      underline: e.underline ? { type: UnderlineType.SINGLE } : undefined,
      allCaps: e.uppercase,
      color: (e.color || '#000000').replace('#', '').toUpperCase(),
      ...extra,
    };
  };

  const alignOf = (k: ElementKey) => ({
    left:    AlignmentType.LEFT,
    center:  AlignmentType.CENTER,
    right:   AlignmentType.RIGHT,
    justify: AlignmentType.JUSTIFIED,
  }[el(k).align]);

  const pageMargin = {
    top:    Math.round(config.page.marginV * 1440),
    bottom: Math.round(config.page.marginV * 1440),
    left:   Math.round(config.page.marginH * 1440),
    right:  Math.round(config.page.marginH * 1440),
  };
  const pageSize = settings.paperSize === 'a4'
    ? { width: 11906, height: 16838 }
    : { width: 12240, height: 15840 };
  const textWidth = pageSize.width - pageMargin.left - pageMargin.right;

  const { contact, objective, education, skills, experiences,
    volunteers, certifications, extracurriculars } = data;

  // ---------- helpers ----------

  /** Thin black horizontal rule between sections. */
  const HR = () => new Paragraph({
    border: settings.showRules
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } }
      : undefined,
    spacing: { before: density.hrBefore, after: density.hrAfter },
    children: [],
  });

  /** Section heading: BOLD UPPERCASE in the chosen accent colour. */
  const sectionTitle = (text: string, suffix = '') => new Paragraph({
    spacing: { before: density.sectionBefore, after: density.sectionAfter },
    children: [
      new TextRun({ ...runOf('sectionHeading', { color: (el('sectionHeading').color || accent).replace('#', '').toUpperCase() }), text }),
      ...(suffix ? [new TextRun({ ...runOf('sectionHeading', { bold: false, color: (el('sectionHeading').color || accent).replace('#', '').toUpperCase() }), text: ' ' + suffix })] : []),
    ],
  });

  const bullet = (text: string) => new Paragraph({
    alignment: alignOf('bullet'),
    numbering: { reference: 'bullets', level: 0 },
    spacing:   { before: density.bulletBefore, after: density.bulletAfter },
    children:  [new TextRun({ ...runOf('bullet'), text })],
  });

  const labelledBullet = (label: string, text: string) => new Paragraph({
    alignment: alignOf('bullet'),
    numbering: { reference: 'bullets', level: 0 },
    spacing:   { before: density.bulletBefore, after: density.bulletAfter },
    children: [
      new TextRun({ ...runOf('inlineLabel'), text: label + ' ' }),
      new TextRun({ ...runOf('bullet'), text }),
    ],
  });

  const skillBullet = (text: string) => {
    const labelled = splitSkillLabel(text);
    if (!labelled) return bullet(text);

    return new Paragraph({
      alignment: alignOf('bullet'),
      numbering: { reference: 'bullets', level: 0 },
      spacing:   { before: density.bulletBefore, after: density.bulletAfter },
      children: [
        new TextRun({ ...runOf('inlineLabel'), text: labelled.label + ' ' }),
        new TextRun({ ...runOf('bullet'), text: labelled.value }),
      ],
    });
  };

  const RIGHT_TAB = textWidth;
  const tabStops  = [{ type: TabStopType.RIGHT, position: RIGHT_TAB }];

  /** Row with bold-left and bold-right (institution + location). */
  const boldRow = (left: string, leftDescItalic: string, right: string, underline = false) =>
    new Paragraph({
      tabStops,
      spacing: { before: density.rowBefore, after: 0 },
      children: [
        new TextRun({
          ...runOf(underline ? 'institution' : 'university'), text: left,
          ...(underline ? { underline: { type: UnderlineType.SINGLE } } : {}),
        }),
        ...(leftDescItalic ? [new TextRun({ text: ' (' + leftDescItalic + ')', italics: true, size: density.desc, font: FONT })] : []),
        new TextRun({ ...runOf('location'), text: right ? `	${right}` : '' }),
      ],
    });

  /** Row with italic-left and italic-right (title + dates). */
  const italicRow = (left: string, right: string) => new Paragraph({
    tabStops,
    spacing: { before: 0, after: density.italicAfter },
    children: [
      new TextRun({ ...runOf('roleTitle'), text: left }),
      new TextRun({ ...runOf('dates'), text: right ? `	${right}` : '' }),
    ],
  });

  // ---------- build document ----------

  const children: InstanceType<typeof Paragraph>[] = [];

  // Name (centred, bold, larger)
  if (contact.fullName.trim()) {
    children.push(new Paragraph({
      alignment: alignOf('name'),
      spacing: { before: 0, after: density.nameAfter },
      children: [new TextRun({ ...runOf('name'), text: contact.fullName })],
    }));
  }

  // Contact line — pipe-separated; LinkedIn rendered as a real hyperlink.
  const linkedin = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');
  const contactRuns: any[] = [];
  const sep = () => new TextRun({ ...runOf('contact'), text: ' | ' });

  if (contact.phone.trim()) contactRuns.push(new TextRun({ ...runOf('contact'), text: contact.phone }));
  if (contact.email.trim()) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new ExternalHyperlink({
      link: `mailto:${contact.email.trim()}`,
      children: [new TextRun({ ...runOf('contact'), text: contact.email, style: 'Hyperlink' })],
    }));
  }
  if (cityCountry) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new TextRun({ ...runOf('contact'), text: cityCountry }));
  }
  if (linkedin) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new ExternalHyperlink({
      link: linkedin.href,
      children: [new TextRun({ ...runOf('contact'), text: L.linkedinText || linkedin.label, style: 'Hyperlink' })],
    }));
  }
  if (contactRuns.length) {
    children.push(new Paragraph({
      alignment: alignOf('contact'),
      spacing: { before: 0, after: density.contactAfter },
      children: contactRuns,
    }));
  }

  if (contact.fullName.trim() || contactRuns.length) children.push(HR());

  // Objective
  if (on('objective') && objective.text.trim()) {
    children.push(sectionTitle(headingFor(config, 'objective')));
    children.push(new Paragraph({
      alignment: alignOf('bullet'),
      spacing: { before: density.bulletBefore, after: density.objectiveAfter },
      children: [new TextRun({ ...runOf('body'), text: objective.text })],
    }));
    children.push(HR());
  }

  // Education
  const filledEdu = education.filter((e) => e.university.trim() || e.degree.trim());
  if (on('education') && filledEdu.length) {
    children.push(sectionTitle(headingFor(config, 'education')));
    filledEdu.forEach((edu) => {
      children.push(boldRow(edu.university, '', edu.location));
      children.push(italicRow(
        edu.degree,
        edu.graduationDate ? `${L.expectedGraduation} ${edu.graduationDate}` : '',
      ));
      if (edu.relevantCoursework.trim()) children.push(labelledBullet(L.relevantCoursework, edu.relevantCoursework));
      if (edu.awards.trim()) children.push(bullet(edu.awards));
    });
    children.push(HR());
  }

  // Skills
  const filledSkills = skills.filter((s) => hasSkillContent(s.text));
  if (on('skills') && filledSkills.length) {
    children.push(sectionTitle(headingFor(config, 'skills')));
    filledSkills.forEach((s) => children.push(skillBullet(s.text)));
    children.push(HR());
  }

  // Experience & Projects
  const filledExp  = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  if (on('experience') && filledExp.length) {
    children.push(sectionTitle(headingFor(config, 'experience')));
    filledExp.forEach((exp) => {
      children.push(boldRow(exp.institution, exp.institutionDesc, exp.location, true));
      children.push(italicRow(
        exp.jobTitle,
        [exp.startDate, exp.endDate].filter(Boolean).join(' – '),
      ));
      exp.bullets.filter((b) => b.trim()).forEach((b) => children.push(bullet(b)));
    });
    children.push(HR());
  }

  // Volunteer
  const filledVol = volunteers.filter((v) => v.text.trim());
  if (on('volunteer') && filledVol.length) {
    children.push(sectionTitle(headingFor(config, 'volunteer')));
    filledVol.forEach((v) => children.push(bullet(v.text)));
    children.push(HR());
  }

  // Certifications
  const filledCerts = certifications.filter((c) => c.text.trim());
  if (on('certifications') && filledCerts.length) {
    children.push(sectionTitle(headingFor(config, 'certifications')));
    filledCerts.forEach((c) => children.push(bullet(c.text)));
    children.push(HR());
  }

  // Extracurricular
  const clubs     = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  if (on('extracurricular') && (clubs.length || interests.length)) {
    children.push(sectionTitle(headingFor(config, 'extracurricular')));
    if (clubs.length) {
      children.push(new Paragraph({
        alignment: alignOf('bullet'),
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: density.bulletBefore, after: density.bulletAfter },
        children: [
          new TextRun({ ...runOf('inlineLabel'), text: `${L.clubs} ` }),
          new TextRun({ ...runOf('bullet'), text: clubs.map((c) => c.text).join('; ') }),
        ],
      }));
    }
    if (interests.length) {
      children.push(new Paragraph({
        alignment: alignOf('bullet'),
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: density.bulletBefore, after: density.bulletAfter },
        children: [
          new TextRun({ ...runOf('inlineLabel'), text: `${L.interests} ` }),
          new TextRun({ ...runOf('bullet'), text: interests.map((i) => i.text).join('; ') }),
        ],
      }));
    }
  }

  // ---------- assemble ----------

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: Math.round(basePt * 2) } } },
    },
    numbering: {
      config: [{
        reference: 'bullets',
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: '•',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 240 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: pageSize,
          margin: pageMargin,
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.contact.fullName.trim() || 'resume'}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
