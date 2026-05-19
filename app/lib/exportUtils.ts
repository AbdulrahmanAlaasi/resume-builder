import { ResumeData, ResumeSettings } from '../types/resume';
import { DEFAULT_SETTINGS } from './constants';

export async function exportToPDF() {
  const element = document.getElementById('resume-preview');
  if (!element) return;

  // @ts-ignore — html2pdf has no types
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: 0,
    filename: 'resume.pdf',
    image:    { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF:    { unit: 'in', format: 'letter', orientation: 'portrait' as const },
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
  const label = raw.replace(/^https?:\/\//, '');
  return { href, label };
}

export async function exportToDOCX(data: ResumeData, settingsArg?: ResumeSettings) {
  const settings = settingsArg ?? DEFAULT_SETTINGS;
  const accent   = toDocxHex(settings.accentColor);

  const {
    Document, Packer, Paragraph, TextRun, AlignmentType,
    LevelFormat, BorderStyle, UnderlineType, ExternalHyperlink,
    TabStopType, TabStopPosition,
  } = await import('docx');

  // docx uses Times New Roman in the .docx XML; "font" string just sets it.
  // Density only affects on-screen preview; the .docx stays consistent.
  const FONT = settings.fontFamily.includes('Garamond') ? 'EB Garamond'
             : settings.fontFamily.includes('Cambria')  ? 'Cambria'
             : settings.fontFamily.includes('Georgia')  ? 'Georgia'
             :                                            'Times New Roman';

  const { contact, objective, education, skills, experiences, projects,
    volunteers, certifications, extracurriculars } = data;

  // ---------- helpers ----------

  /** Thin black horizontal rule between sections. */
  const HR = () => new Paragraph({
    border: settings.showRules
      ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 1 } }
      : undefined,
    spacing: { before: 60, after: 60 },
    children: [],
  });

  /** Section heading: BOLD UPPERCASE in the chosen accent colour, with trailing colon. */
  const sectionTitle = (text: string, suffix = '') => new Paragraph({
    spacing: { before: 80, after: 60 },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 22, font: FONT, color: accent }),
      ...(suffix ? [new TextRun({ text: ' ' + suffix, bold: false, size: 22, font: FONT, color: accent })] : []),
    ],
  });

  const bullet = (text: string) => new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing:   { before: 20, after: 20 },
    children:  [new TextRun({ text, size: 22, font: FONT })],
  });

  const RIGHT_TAB = TabStopPosition.MAX;
  const tabStops  = [{ type: TabStopType.RIGHT, position: RIGHT_TAB }];

  /** Row with bold-left and bold-right (institution + location). */
  const boldRow = (left: string, leftDescItalic: string, right: string, underline = false) =>
    new Paragraph({
      tabStops,
      spacing: { before: 80, after: 0 },
      children: [
        new TextRun({
          text: left, bold: true, size: 22, font: FONT,
          ...(underline ? { underline: { type: UnderlineType.SINGLE } } : {}),
        }),
        ...(leftDescItalic ? [new TextRun({ text: ' (' + leftDescItalic + ')', italics: true, size: 20, font: FONT })] : []),
        new TextRun({ text: right ? `\t${right}` : '', bold: true, size: 22, font: FONT }),
      ],
    });

  /** Row with italic-left and italic-right (title + dates). */
  const italicRow = (left: string, right: string) => new Paragraph({
    tabStops,
    spacing: { before: 0, after: 40 },
    children: [
      new TextRun({ text: left,  italics: true, size: 22, font: FONT }),
      new TextRun({ text: right ? `\t${right}` : '', italics: true, size: 22, font: FONT }),
    ],
  });

  // ---------- build document ----------

  const children: InstanceType<typeof Paragraph>[] = [];

  // Name (centred, bold, larger)
  if (contact.fullName.trim()) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: contact.fullName, bold: true, size: 32, font: FONT })],
    }));
  }

  // Contact line — pipe-separated; LinkedIn rendered as a real hyperlink.
  const linkedin = normalizeLinkedIn(contact.linkedin);
  const cityCountry = [contact.city, contact.country].filter(Boolean).join(', ');
  const contactRuns: any[] = [];
  const sep = () => new TextRun({ text: ' | ', size: 21, font: FONT });

  if (contact.phone.trim()) contactRuns.push(new TextRun({ text: contact.phone, size: 21, font: FONT }));
  if (contact.email.trim()) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new ExternalHyperlink({
      link: `mailto:${contact.email.trim()}`,
      children: [new TextRun({ text: contact.email, size: 21, font: FONT, style: 'Hyperlink' })],
    }));
  }
  if (cityCountry) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new TextRun({ text: cityCountry, size: 21, font: FONT }));
  }
  if (linkedin) {
    if (contactRuns.length) contactRuns.push(sep());
    contactRuns.push(new ExternalHyperlink({
      link: linkedin.href,
      children: [new TextRun({ text: linkedin.label, size: 21, font: FONT, style: 'Hyperlink' })],
    }));
  }
  if (contactRuns.length) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: contactRuns,
    }));
  }

  if (contact.fullName.trim() || contactRuns.length) children.push(HR());

  // Objective
  if (objective.text.trim()) {
    children.push(sectionTitle('Objective:'));
    children.push(new Paragraph({
      spacing: { before: 20, after: 40 },
      children: [new TextRun({ text: objective.text, size: 22, font: FONT })],
    }));
    children.push(HR());
  }

  // Education
  const filledEdu = education.filter((e) => e.university.trim() || e.degree.trim());
  if (filledEdu.length) {
    children.push(sectionTitle('Education:'));
    filledEdu.forEach((edu) => {
      children.push(boldRow(edu.university, '', edu.location));
      children.push(italicRow(
        edu.degree,
        edu.graduationDate ? `Expected Graduation: ${edu.graduationDate}` : '',
      ));
      if (edu.relevantCoursework.trim()) children.push(bullet(`Relevant Coursework: ${edu.relevantCoursework}`));
      if (edu.awards.trim()) children.push(bullet(edu.awards));
    });
    children.push(HR());
  }

  // Skills
  const filledSkills = skills.filter((s) => s.text.trim());
  if (filledSkills.length) {
    children.push(sectionTitle('Skills:'));
    filledSkills.forEach((s) => children.push(bullet(s.text)));
    children.push(HR());
  }

  // Experience & Projects
  const filledExp  = experiences.filter((e) => e.institution.trim() || e.jobTitle.trim());
  const filledProj = projects.filter((p) => p.title.trim() || p.institution.trim());
  if (filledExp.length || filledProj.length) {
    children.push(sectionTitle('Professional & Project Experience:'));
    filledExp.forEach((exp) => {
      children.push(boldRow(exp.institution, exp.institutionDesc, exp.location, true));
      children.push(italicRow(
        exp.jobTitle,
        [exp.startDate, exp.endDate].filter(Boolean).join(' – '),
      ));
      exp.bullets.filter((b) => b.trim()).forEach((b) => children.push(bullet(b)));
    });
    filledProj.forEach((proj) => {
      children.push(boldRow(proj.institution, '', proj.location, true));
      children.push(italicRow(
        proj.title,
        [proj.startDate, proj.endDate].filter(Boolean).join(' – '),
      ));
      proj.bullets.filter((b) => b.trim()).forEach((b) => children.push(bullet(b)));
    });
    children.push(HR());
  }

  // Volunteer
  const filledVol = volunteers.filter((v) => v.text.trim());
  if (filledVol.length) {
    children.push(sectionTitle('Volunteer Leadership:', '[Optional]'));
    filledVol.forEach((v) => children.push(bullet(v.text)));
    children.push(HR());
  }

  // Certifications
  const filledCerts = certifications.filter((c) => c.text.trim());
  if (filledCerts.length) {
    children.push(sectionTitle('Certifications:', '[If Applicable]'));
    filledCerts.forEach((c) => children.push(bullet(c.text)));
    children.push(HR());
  }

  // Extracurricular
  const clubs     = extracurriculars.filter((e) => e.type === 'club'     && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  if (clubs.length || interests.length) {
    children.push(sectionTitle('Extracurricular Activities & Interests:'));
    if (clubs.length) {
      children.push(new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: 'Clubs: ',                       bold: true, size: 22, font: FONT }),
          new TextRun({ text: clubs.map((c) => c.text).join('; '), size: 22, font: FONT }),
        ],
      }));
    }
    if (interests.length) {
      children.push(new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: 'Interests: ',                       bold: true, size: 22, font: FONT }),
          new TextRun({ text: interests.map((i) => i.text).join('; '), size: 22, font: FONT }),
        ],
      }));
    }
  }

  // ---------- assemble ----------

  const doc = new Document({
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
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
          size:   { width: 12240, height: 15840 },              // US Letter
          margin: { top: 1080, right: 1296, bottom: 1080, left: 1296 },
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
