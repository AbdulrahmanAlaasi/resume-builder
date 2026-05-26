import { ResumeData, ResumeSettings } from '../types/resume';
import { DEFAULT_SETTINGS } from './constants';
import { hasSkillContent, splitSkillLabel } from './skills';

export async function exportToPDF(settingsArg?: ResumeSettings) {
  const element = document.getElementById('resume-preview');
  if (!element) return;
  const settings = settingsArg ?? DEFAULT_SETTINGS;

  // @ts-ignore — html2pdf has no types
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: 0,
    filename: 'resume.pdf',
    image:    { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:    { unit: 'in', format: settings.paperSize === 'a4' ? 'a4' : 'letter', orientation: 'portrait' as const },
  };

  html2pdf().set(opt).from(element).save();
}

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

export async function exportToDOCX(data: ResumeData, settingsArg?: ResumeSettings) {
  const settings = settingsArg ?? DEFAULT_SETTINGS;
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
  const pageSize = settings.paperSize === 'a4'
    ? { width: 11906, height: 16838 }
    : { width: 12240, height: 15840 };
  const textWidth = pageSize.width - density.margin.left - density.margin.right;

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
      new TextRun({ text: text.toUpperCase(), bold: true, size: density.heading, font: FONT, color: accent }),
      ...(suffix ? [new TextRun({ text: ' ' + suffix, bold: false, size: density.heading, font: FONT, color: accent })] : []),
    ],
  });

  const bullet = (text: string) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    numbering: { reference: 'bullets', level: 0 },
    spacing:   { before: density.bulletBefore, after: density.bulletAfter },
    children:  [new TextRun({ text, size: density.body, font: FONT })],
  });

  const labelledBullet = (label: string, text: string) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    numbering: { reference: 'bullets', level: 0 },
    spacing:   { before: density.bulletBefore, after: density.bulletAfter },
    children: [
      new TextRun({ text: label + ' ', bold: true, size: density.body, font: FONT }),
      new TextRun({ text, size: density.body, font: FONT }),
    ],
  });

  const skillBullet = (text: string) => {
    const labelled = splitSkillLabel(text);
    if (!labelled) return bullet(text);

    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      numbering: { reference: 'bullets', level: 0 },
      spacing:   { before: density.bulletBefore, after: density.bulletAfter },
      children: [
        new TextRun({ text: labelled.label + ' ', bold: true, size: density.body, font: FONT }),
        new TextRun({ text: labelled.value, size: density.body, font: FONT }),
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
          text: left, bold: true, size: density.body, font: FONT,
          ...(underline ? { underline: { type: UnderlineType.SINGLE } } : {}),
        }),
        ...(leftDescItalic ? [new TextRun({ text: ' (' + leftDescItalic + ')', italics: true, size: density.desc, font: FONT })] : []),
        new TextRun({ text: right ? `\t${right}` : '', bold: true, size: density.body, font: FONT }),
      ],
    });

  /** Row with italic-left and italic-right (title + dates). */
  const italicRow = (left: string, right: string) => new Paragraph({
    tabStops,
    spacing: { before: 0, after: density.italicAfter },
    children: [
      new TextRun({ text: left,  italics: true, size: density.body, font: FONT }),
      new TextRun({ text: right ? `\t${right}` : '', italics: true, size: density.body, font: FONT }),
    ],
  });

  // ---------- build document ----------

  const children: InstanceType<typeof Paragraph>[] = [];

  // Name (centred, bold, larger)
  if (contact.fullName.trim()) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: density.nameAfter },
      children: [new TextRun({ text: contact.fullName, bold: true, size: density.name, font: FONT })],
    }));
  }

  // Contact line — pipe-separated; LinkedIn rendered as a real hyperlink.
  const linkedin = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');
  const contactRuns: any[] = [];
  const sep = () => new TextRun({ text: ' | ', size: density.contact, font: FONT });

  if (contact.phone.trim()) contactRuns.push(new TextRun({ text: contact.phone, size: density.contact, font: FONT }));
  if (contact.email.trim()) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new ExternalHyperlink({
      link: `mailto:${contact.email.trim()}`,
      children: [new TextRun({ text: contact.email, size: density.contact, font: FONT, style: 'Hyperlink' })],
    }));
  }
  if (cityCountry) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new TextRun({ text: cityCountry, size: density.contact, font: FONT }));
  }
  if (linkedin) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new ExternalHyperlink({
      link: linkedin.href,
      children: [new TextRun({ text: linkedin.label, size: density.contact, font: FONT, style: 'Hyperlink' })],
    }));
  }
  if (contactRuns.length) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: density.contactAfter },
      children: contactRuns,
    }));
  }

  if (contact.fullName.trim() || contactRuns.length) children.push(HR());

  // Objective
  if (objective.text.trim()) {
    children.push(sectionTitle('Objective'));
    children.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: density.bulletBefore, after: density.objectiveAfter },
      children: [new TextRun({ text: objective.text, size: density.body, font: FONT })],
    }));
    children.push(HR());
  }

  // Education
  const filledEdu = education.filter((e) => e.university.trim() || e.degree.trim());
  if (filledEdu.length) {
    children.push(sectionTitle('Education'));
    filledEdu.forEach((edu) => {
      children.push(boldRow(edu.university, '', edu.location));
      children.push(italicRow(
        edu.degree,
        edu.graduationDate ? `Expected Graduation ${edu.graduationDate}` : '',
      ));
      if (edu.relevantCoursework.trim()) children.push(labelledBullet('Relevant Coursework', edu.relevantCoursework));
      if (edu.awards.trim()) children.push(bullet(edu.awards));
    });
    children.push(HR());
  }

  // Skills
  const filledSkills = skills.filter((s) => hasSkillContent(s.text));
  if (filledSkills.length) {
    children.push(sectionTitle('Skills'));
    filledSkills.forEach((s) => children.push(skillBullet(s.text)));
    children.push(HR());
  }

  // Experience & Projects
  const filledExp  = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  if (filledExp.length) {
    children.push(sectionTitle('Professional & Project Experience'));
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
  if (filledVol.length) {
    children.push(sectionTitle('Volunteer Leadership'));
    filledVol.forEach((v) => children.push(bullet(v.text)));
    children.push(HR());
  }

  // Certifications
  const filledCerts = certifications.filter((c) => c.text.trim());
  if (filledCerts.length) {
    children.push(sectionTitle('Certifications'));
    filledCerts.forEach((c) => children.push(bullet(c.text)));
    children.push(HR());
  }

  // Extracurricular
  const clubs     = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  if (clubs.length || interests.length) {
    children.push(sectionTitle('Extracurricular Activities & Interests'));
    if (clubs.length) {
      children.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: density.bulletBefore, after: density.bulletAfter },
        children: [
          new TextRun({ text: 'Clubs ',                        bold: true, size: density.body, font: FONT }),
          new TextRun({ text: clubs.map((c) => c.text).join('; '), size: density.body, font: FONT }),
        ],
      }));
    }
    if (interests.length) {
      children.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: density.bulletBefore, after: density.bulletAfter },
        children: [
          new TextRun({ text: 'Interests ',                        bold: true, size: density.body, font: FONT }),
          new TextRun({ text: interests.map((i) => i.text).join('; '), size: density.body, font: FONT }),
        ],
      }));
    }
  }

  // ---------- assemble ----------

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: density.body } } },
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
          margin: density.margin,
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
