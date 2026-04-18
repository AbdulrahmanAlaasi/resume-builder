import { ResumeData } from '../types/resume';

export async function exportToPDF() {
  const element = document.getElementById('resume-preview');
  if (!element) return;

  // @ts-ignore
  const html2pdf = (await import('html2pdf.js')).default;

  const opt = {
    margin: 0,
    filename: 'resume.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
  };

  html2pdf().set(opt).from(element).save();
}

export async function exportToDOCX(data: ResumeData) {
  const {
    Document, Packer, Paragraph, TextRun, AlignmentType,
    LevelFormat, BorderStyle, UnderlineType,
  } = await import('docx');

  const { contact, objective, education, skills, experiences, projects,
    volunteers, certifications, extracurriculars } = data;

  const contactParts = [contact.phone, contact.email,
    [contact.city, contact.country].filter(Boolean).join(', '),
    contact.linkedin].filter(Boolean);

  const HR = () => new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '1a3a6b', space: 1 } },
    spacing: { before: 60, after: 60 },
    children: [],
  });

  const thinHR = () => new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'c8d4e8', space: 1 } },
    spacing: { before: 40, after: 40 },
    children: [],
  });

  const sectionTitle = (text: string, suffix = '') =>
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({ text: text.toUpperCase(), bold: true, size: 20, font: 'Times New Roman', color: '1a3a6b', allCaps: true }),
        ...(suffix ? [new TextRun({ text: suffix, bold: false, size: 19, font: 'Times New Roman', color: '555577' })] : []),
      ],
    });

  const bullet = (text: string) =>
    new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text, size: 19, font: 'Times New Roman' })],
    });

  const children: (typeof Paragraph.prototype)[] = [];

  // Name
  if (contact.fullName) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: contact.fullName, bold: true, size: 36, font: 'Times New Roman' })],
    }));
  }

  // Contact line
  if (contactParts.length) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: contactParts.join(' | '), size: 19, font: 'Times New Roman' })],
    }));
  }

  children.push(HR());

  // Objective
  if (objective.text.trim()) {
    children.push(sectionTitle('Objective:'));
    children.push(new Paragraph({
      spacing: { before: 20, after: 40 },
      children: [new TextRun({ text: objective.text, size: 19, font: 'Times New Roman' })],
    }));
    children.push(thinHR());
  }

  // Education
  const hasEdu = education.some((e) => e.university.trim() || e.degree.trim());
  if (hasEdu) {
    children.push(sectionTitle('Education:'));
    education.filter((e) => e.university.trim() || e.degree.trim()).forEach((edu) => {
      children.push(new Paragraph({
        spacing: { before: 40, after: 0 },
        children: [
          new TextRun({ text: edu.university, bold: true, size: 20, font: 'Times New Roman' }),
          new TextRun({ text: edu.location ? `\t${edu.location}` : '', size: 19, font: 'Times New Roman' }),
        ],
        tabStops: [{ type: 'right' as any, position: 9360 }],
      }));
      children.push(new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [
          new TextRun({ text: edu.degree + (edu.graduationDate ? ` — Expected Graduation: ${edu.graduationDate}` : ''), italics: true, size: 19, font: 'Times New Roman' }),
        ],
      }));
      if (edu.relevantCoursework.trim()) children.push(bullet(`Relevant Coursework: ${edu.relevantCoursework}`));
      if (edu.awards.trim()) children.push(bullet(edu.awards));
    });
    children.push(thinHR());
  }

  // Skills
  const hasSkills = skills.some((s) => s.text.trim());
  if (hasSkills) {
    children.push(sectionTitle('Skills:'));
    skills.filter((s) => s.text.trim()).forEach((sk) => children.push(bullet(sk.text)));
    children.push(thinHR());
  }

  // Experience & Projects
  const hasExp = experiences.some((e) => e.institution.trim());
  const hasProj = projects.some((p) => p.title.trim());
  if (hasExp || hasProj) {
    children.push(sectionTitle('Professional & Project Experience:'));
    experiences.filter((e) => e.institution.trim()).forEach((exp) => {
      children.push(new Paragraph({
        spacing: { before: 60, after: 0 },
        children: [
          new TextRun({ text: exp.institution, bold: true, underline: { type: UnderlineType.SINGLE }, size: 20, font: 'Times New Roman' }),
          ...(exp.institutionDesc.trim() ? [new TextRun({ text: ` (${exp.institutionDesc})`, italics: true, size: 18, font: 'Times New Roman' })] : []),
          new TextRun({ text: exp.location ? `\t${exp.location}` : '', size: 19, font: 'Times New Roman' }),
        ],
        tabStops: [{ type: 'right' as any, position: 9360 }],
      }));
      children.push(new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [
          new TextRun({ text: exp.jobTitle, italics: true, size: 19, font: 'Times New Roman' }),
          new TextRun({ text: [exp.startDate, exp.endDate].filter(Boolean).join(' – ') ? `\t${[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}` : '', italics: true, size: 19, font: 'Times New Roman' }),
        ],
        tabStops: [{ type: 'right' as any, position: 9360 }],
      }));
      exp.bullets.filter((b) => b.trim()).forEach((b) => children.push(bullet(b)));
    });
    projects.filter((p) => p.title.trim()).forEach((proj) => {
      children.push(new Paragraph({
        spacing: { before: 60, after: 0 },
        children: [
          new TextRun({ text: proj.institution, bold: true, underline: { type: UnderlineType.SINGLE }, size: 20, font: 'Times New Roman' }),
          new TextRun({ text: proj.location ? `\t${proj.location}` : '', size: 19, font: 'Times New Roman' }),
        ],
        tabStops: [{ type: 'right' as any, position: 9360 }],
      }));
      children.push(new Paragraph({
        spacing: { before: 0, after: 20 },
        children: [
          new TextRun({ text: proj.title, italics: true, size: 19, font: 'Times New Roman' }),
          new TextRun({ text: [proj.startDate, proj.endDate].filter(Boolean).join(' – ') ? `\t${[proj.startDate, proj.endDate].filter(Boolean).join(' – ')}` : '', italics: true, size: 19, font: 'Times New Roman' }),
        ],
        tabStops: [{ type: 'right' as any, position: 9360 }],
      }));
      proj.bullets.filter((b) => b.trim()).forEach((b) => children.push(bullet(b)));
    });
    children.push(thinHR());
  }

  // Volunteer
  if (volunteers.some((v) => v.text.trim())) {
    children.push(sectionTitle('Volunteer Leadership:', ' [Optional]'));
    volunteers.filter((v) => v.text.trim()).forEach((v) => children.push(bullet(v.text)));
    children.push(thinHR());
  }

  // Certifications
  if (certifications.some((c) => c.text.trim())) {
    children.push(sectionTitle('Certifications:', ' [If Applicable]'));
    certifications.filter((c) => c.text.trim()).forEach((c) => children.push(bullet(c.text)));
    children.push(thinHR());
  }

  // Extracurricular
  const clubs = extracurriculars.filter((e) => e.type === 'club' && e.text.trim());
  const interests = extracurriculars.filter((e) => e.type === 'interest' && e.text.trim());
  if (clubs.length || interests.length) {
    children.push(sectionTitle('Extracurricular Activities & Interests:'));
    if (clubs.length) {
      children.push(new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: 'Clubs: ', bold: true, size: 19, font: 'Times New Roman' }),
          new TextRun({ text: clubs.map((c) => c.text).join('; '), size: 19, font: 'Times New Roman' }),
        ],
      }));
    }
    if (interests.length) {
      children.push(new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({ text: 'Interests: ', bold: true, size: 19, font: 'Times New Roman' }),
          new TextRun({ text: interests.map((i) => i.text).join('; '), size: 19, font: 'Times New Roman' }),
        ],
      }));
    }
  }

  const doc = new Document({
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
          size: { width: 12240, height: 15840 },
          margin: { top: 1080, right: 1296, bottom: 1080, left: 1296 },
        },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.contact.fullName || 'resume'}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
