import type { ResumeData } from '../types/resume';

type SectionKey =
  | 'objective'
  | 'education'
  | 'skills'
  | 'experience'
  | 'volunteer'
  | 'certifications'
  | 'extracurricular';

export interface PdfImportResult {
  data: ResumeData;
  warnings: string[];
  detected: {
    contactFields: number;
    educationEntries: number;
    skillEntries: number;
    experienceEntries: number;
    certifications: number;
  };
}

export interface PdfImportProgress {
  label: string;
  progress?: number;
}

const SECTION_ALIASES: Array<[SectionKey, string[]]> = [
  ['experience', ['professional & project experience', 'professional and project experience', 'professional experience', 'work experience', 'employment history', 'experience & projects', 'experience and projects', 'experience', 'projects', 'project']],
  ['extracurricular', ['extracurricular activities & interests', 'extracurricular activities and interests', 'activities & interests', 'activities and interests', 'extracurricular', 'interests']],
  ['certifications', ['certifications & licenses', 'certifications and licenses', 'licenses & certifications', 'licenses and certifications', 'certifications', 'certificates']],
  ['volunteer', ['volunteer leadership', 'volunteering experience', 'volunteer experience', 'community involvement', 'volunteering', 'volunteer']],
  ['education', ['education & qualifications', 'education and qualifications', 'academic background', 'education']],
  ['objective', ['professional summary', 'career objective', 'personal profile', 'summary', 'profile', 'objective', 'about me']],
  ['skills', ['technical skills', 'core competencies', 'skills & abilities', 'skills and abilities', 'skills']],
];

const cleanLine = (line: string) => line
  .replace(/\u00a0/g, ' ')
  .replace(/[\t ]+/g, ' ')
  .trim();

const stripBullet = (line: string) => cleanLine(line).replace(/^[•●▪◦◆■‣«*+-]\s*/, '').trim();
const isBullet = (line: string) => /^[•●▪◦◆■‣«*+-]\s*/.test(cleanLine(line));
const makeId = (group: string, index: number) => `pdf-${group}-${index + 1}`;

function matchSection(line: string): { key: SectionKey; remainder: string } | null {
  const clean = cleanLine(line);
  const normalized = clean.toLowerCase().replace(/[–—]/g, '-');

  for (const [key, aliases] of SECTION_ALIASES) {
    for (const alias of aliases) {
      if (normalized === alias || normalized === `${alias}:`) return { key, remainder: '' };
      if (normalized.startsWith(`${alias}:`)) {
        // "Technical Skills: ..." is content inside a Skills section, not a new heading.
        if (key === 'skills' && alias === 'technical skills') continue;
        return { key, remainder: clean.slice(alias.length + 1).trim() };
      }
    }
  }
  return null;
}

function splitSections(lines: string[]) {
  const preamble: string[] = [];
  const sections = new Map<SectionKey, string[]>();
  let current: SectionKey | null = null;

  for (const line of lines) {
    const heading = matchSection(line);
    if (heading) {
      current = heading.key;
      if (!sections.has(current)) sections.set(current, []);
      if (heading.remainder) sections.get(current)?.push(heading.remainder);
      continue;
    }
    if (current) sections.get(current)?.push(line);
    else preamble.push(line);
  }

  return { preamble, sections };
}

function parseContact(lines: string[]) {
  const text = lines.join(' | ');
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? '';
  const linkedInUrl = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Z0-9_%/?=&.-]+/i)?.[0];
  const linkedInPath = text.match(/\bin\/[A-Z0-9_-]+/i)?.[0];
  const linkedin = linkedInUrl ?? (linkedInPath ? `https://www.linkedin.com/${linkedInPath}` : '');
  const phone = text.match(/(?:\+?\d[\d\s().-]{7,}\d)/)?.[0]?.trim() ?? '';
  const fullName = lines.find((line) => {
    const value = cleanLine(line);
    if (!value || value.length > 70 || /@|https?:|linkedin|\d{4,}/i.test(value)) return false;
    const words = value.split(/\s+/);
    return words.length >= 2 && words.length <= 6 && words.every((word) => /^[\p{L}'-]+$/u.test(word));
  }) ?? '';

  let city = '';
  let country = '';
  const location = extractLocation(text);
  const locationMatch = location.match(/^(.+?),\s*(.+)$/);
  if (locationMatch) {
    city = locationMatch[1].trim();
    country = locationMatch[2].trim();
  } else if (/Saudi Arabia/i.test(text)) {
    country = 'Saudi Arabia';
    if (/Riyadh/i.test(text)) city = 'Riyadh';
    else if (/Jeddah/i.test(text)) city = 'Jeddah';
    else if (/Dammam/i.test(text)) city = 'Dammam';
  }

  return { fullName: cleanLine(fullName), phone, email, city, country, linkedin };
}

function findLocation(line: string): { raw: string; value: string } | null {
  const clean = cleanLine(line);
  const known = clean.match(/\b(Riyadh|Jeddah|Dammam|Khobar|Dhahran|Makkah|Mecca|Medina|Dubai|Abu Dhabi|Sharjah|Doha|Manama|Kuwait City)\s*,\s*(Saudi Arabia|United Arab Emirates|UAE|Qatar|Bahrain|Kuwait)\b/i);
  if (known) return { raw: known[0], value: known[0] };

  const reversed = clean.match(/\b(Saudi Arabia|United Arab Emirates|UAE|Qatar|Bahrain|Kuwait)\s*[-–—]\s*(Riyadh|Jeddah|Dammam|Khobar|Dhahran|Makkah|Mecca|Medina|Dubai|Abu Dhabi|Sharjah|Doha|Manama|Kuwait City)\b/i);
  if (reversed) return { raw: reversed[0], value: `${reversed[2]}, ${reversed[1]}` };

  const pipePart = clean.split('|').map((part) => part.trim()).find((part) => /^[\p{L}.' -]{2,30},\s*[\p{L}.' -]{2,30}$/u.test(part));
  return pipePart ? { raw: pipePart, value: pipePart } : null;
}

function extractLocation(line: string) {
  return findLocation(line)?.value ?? '';
}

function removeLocation(line: string) {
  const location = findLocation(line);
  return location ? line.replace(location.raw, '') : line;
}

function extractDate(line: string) {
  const clean = cleanLine(line);
  const range = clean.match(/(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)?\s*\d{4}\s*(?:[-–—]|to)\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)?\s*\d{4}|Present|Current)/i);
  if (range) return range[0];
  return clean.match(/(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}/i)?.[0] ?? '';
}

function parseEducation(lines: string[]) {
  const clean = lines.map(stripBullet).filter(Boolean);
  const institutionIndexes = clean
    .map((line, index) => /\b(university|college|institute|school|academy)\b/i.test(line) ? index : -1)
    .filter((index) => index >= 0);
  const starts = institutionIndexes.length ? institutionIndexes : [0];

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? clean.length;
    const block = clean.slice(start, end);
    const institutionLine = block[0] ?? '';
    const location = block.map(extractLocation).find(Boolean) ?? '';
    const degreeLine = block.find((line) => /\b(bachelor|master|diploma|degree|b\.?sc|b\.?s\.?|b\.?a\.?|mba|ph\.?d)\b/i.test(line)) ?? '';
    const graduationLine = block.find((line) => /graduat|expected|class of|\b20\d{2}\b/i.test(line)) ?? '';
    const courseworkLine = block.find((line) => /relevant coursework|coursework|courses/i.test(line)) ?? '';
    const awardsLine = block.find((line) => /award|honou?r|dean'?s list|scholarship|gpa/i.test(line)) ?? '';

    return {
      id: makeId('education', index),
      university: cleanLine(removeLocation(institutionLine).replace(/[|,-]+\s*$/, '')),
      location,
      degree: cleanLine(removeLocation(degreeLine).replace(/(?:expected\s+)?graduation.*$/i, '')),
      graduationDate: cleanLine(graduationLine.replace(/^.*?(?:expected\s+graduation|graduation|class of)\s*:?[\s]*/i, '').match(/(?:[A-Za-z]+\s+)?20\d{2}/)?.[0] ?? graduationLine.match(/20\d{2}/)?.[0] ?? ''),
      relevantCoursework: cleanLine(courseworkLine.replace(/^(?:relevant\s+)?coursework|^courses/i, '').replace(/^\s*:\s*/, '')),
      awards: awardsLine,
    };
  }).filter((entry) => entry.university || entry.degree);
}

function parseSkills(lines: string[]) {
  const joined = lines.map(stripBullet).filter(Boolean).join(' ');
  const softIndex = joined.search(/\bsoft skills\s*:?/i);
  const entries: string[] = [];

  if (/\btechnical skills\s*:?/i.test(joined)) {
    const technicalPart = softIndex >= 0 ? joined.slice(0, softIndex) : joined;
    const value = technicalPart.replace(/^.*?technical skills\s*:?\s*/i, '').trim();
    if (value) entries.push(`Technical Skills ${value}`);
  }
  if (softIndex >= 0) {
    const value = joined.slice(softIndex).replace(/^soft skills\s*:?\s*/i, '').trim();
    if (value) entries.push(`Soft Skills ${value}`);
  }

  if (entries.length === 0) {
    lines.map(stripBullet).filter(Boolean).forEach((line) => entries.push(line));
  }

  return entries.map((text, index) => ({ id: makeId('skill', index), text }));
}

function parseExperience(lines: string[]) {
  const blocks: Array<{ headers: string[]; bullets: string[] }> = [];
  let headers: string[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (headers.length || bullets.length) blocks.push({ headers, bullets });
    headers = [];
    bullets = [];
  };

  for (const line of lines.map(cleanLine).filter(Boolean)) {
    if (isBullet(line)) {
      bullets.push(stripBullet(line));
    } else {
      if (bullets.length && /^[a-z(]/.test(line)) {
        bullets[bullets.length - 1] = `${bullets[bullets.length - 1]} ${line}`.trim();
        continue;
      }
      if (bullets.length) flush();
      headers.push(line);
    }
  }
  flush();

  return blocks.map((block, index) => {
    const location = block.headers.map(extractLocation).find(Boolean) ?? '';
    const dateRange = block.headers.map(extractDate).find(Boolean) ?? '';
    const [startDate = '', endDate = ''] = dateRange
      .split(/\s*(?:[-–—]|\bto\b)\s*/i)
      .map((value) => value.trim());
    const cleanedHeaders = block.headers
      .map((line) => cleanLine(removeLocation(line).replace(dateRange, '').replace(/[|,-]+\s*$/, '')))
      .filter(Boolean);
    const firstLooksLikeRole = /\b(engineer|developer|analyst|intern|assistant|manager|member|participant|specialist|architect|consultant|coordinator|lead|director|officer|researcher|trainee)\b/i.test(cleanedHeaders[0] ?? '');
    const institutionIndex = firstLooksLikeRole && cleanedHeaders.length > 1 ? 1 : 0;
    const institution = cleanedHeaders[institutionIndex] ?? '';
    const jobTitle = cleanedHeaders.filter((_, headerIndex) => headerIndex !== institutionIndex).join(' ');

    return {
      id: makeId('experience', index),
      institution,
      institutionDesc: '',
      location,
      jobTitle,
      startDate,
      endDate,
      bullets: block.bullets.length ? block.bullets : [''],
    };
  }).filter((entry) => entry.institution || entry.jobTitle || entry.bullets.some(Boolean));
}

function parseList(lines: string[], group: string) {
  return lines.map(stripBullet).filter(Boolean).map((text, index) => ({ id: makeId(group, index), text }));
}

function parseExtracurricular(lines: string[]) {
  return lines.map(stripBullet).filter(Boolean).map((line, index) => {
    const interest = /^interests?\s*:?/i.test(line);
    return {
      id: makeId('extra', index),
      type: interest ? 'interest' as const : 'club' as const,
      text: cleanLine(line.replace(/^(?:clubs?|interests?)\s*:?\s*/i, '')),
    };
  });
}

export function parseResumeLines(lines: string[], documentLinks: string[] = []): PdfImportResult {
  const cleaned = lines.map(cleanLine).filter(Boolean);
  const { preamble, sections } = splitSections(cleaned);
  const contact = parseContact(preamble);
  if (!contact.linkedin) {
    contact.linkedin = documentLinks.find((url) => /(?:www\.)?linkedin\.com\/in\//i.test(url)) ?? '';
  }
  const education = parseEducation(sections.get('education') ?? []);
  const skills = parseSkills(sections.get('skills') ?? []);
  const experiences = parseExperience(sections.get('experience') ?? []);
  const volunteers = parseList(sections.get('volunteer') ?? [], 'volunteer');
  const certifications = parseList(sections.get('certifications') ?? [], 'certification');
  const extracurriculars = parseExtracurricular(sections.get('extracurricular') ?? []);
  const objective = (sections.get('objective') ?? []).map(stripBullet).join(' ').trim();
  const warnings: string[] = [];

  if (!contact.fullName) warnings.push('Full name was not detected.');
  if (!contact.email && !contact.phone) warnings.push('Contact details were not detected.');
  if (!education.length) warnings.push('Education was not detected.');
  if (!experiences.length) warnings.push('Experience or projects were not detected.');

  const data: ResumeData = {
    contact,
    objective: { text: objective },
    education: education.length ? education : [{ id: makeId('education', 0), university: '', location: '', degree: '', graduationDate: '', relevantCoursework: '', awards: '' }],
    skills: skills.length ? skills : [
      { id: makeId('skill', 0), text: 'Technical Skills' },
      { id: makeId('skill', 1), text: 'Soft Skills' },
    ],
    experiences: experiences.length ? experiences : [{ id: makeId('experience', 0), institution: '', institutionDesc: '', location: '', jobTitle: '', startDate: '', endDate: '', bullets: ['', '', ''] }],
    projects: [{ id: makeId('legacy-project', 0), institution: '', location: '', title: '', startDate: '', endDate: '', bullets: [''] }],
    volunteers: volunteers.length ? volunteers : [{ id: makeId('volunteer', 0), text: '' }],
    certifications: certifications.length ? certifications : [{ id: makeId('certification', 0), text: '' }],
    extracurriculars: extracurriculars.length ? extracurriculars : [
      { id: makeId('extra', 0), type: 'club', text: '' },
      { id: makeId('extra', 1), type: 'interest', text: '' },
    ],
  };

  return {
    data,
    warnings,
    detected: {
      contactFields: Object.values(contact).filter(Boolean).length,
      educationEntries: education.length,
      skillEntries: skills.length,
      experienceEntries: experiences.length,
      certifications: certifications.length,
    },
  };
}

export async function importResumePdf(
  file: File,
  onProgress?: (update: PdfImportProgress) => void,
): Promise<PdfImportResult> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    isEvalSupported: false,
  });
  onProgress?.({ label: 'Reading your CV', progress: 0.05 });
  const pdf = await loadingTask.promise;
  const lines: string[] = [];
  const documentLinks: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const annotations = await page.getAnnotations();
    annotations.forEach((annotation) => {
      if ('url' in annotation && typeof annotation.url === 'string') {
        documentLinks.push(annotation.url);
      }
    });
    const content = await page.getTextContent();
    const items = content.items
      .filter((item): item is typeof item & { str: string; transform: number[]; width: number } => 'str' in item && !!item.str.trim())
      .map((item) => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
      }))
      .sort((a, b) => Math.abs(b.y - a.y) > 2.5 ? b.y - a.y : a.x - b.x);

    const pageLines: Array<{ y: number; items: typeof items }> = [];
    for (const item of items) {
      const current = pageLines[pageLines.length - 1];
      if (!current || Math.abs(current.y - item.y) > 2.5) {
        pageLines.push({ y: item.y, items: [item] });
      } else {
        current.items.push(item);
      }
    }

    pageLines.forEach((line) => {
      line.items.sort((a, b) => a.x - b.x);
      let text = '';
      let endX = 0;
      line.items.forEach((item, index) => {
        const needsSpace = index > 0 && item.x - endX > 1.5;
        text += `${needsSpace ? ' ' : ''}${item.text}`;
        endX = item.x + item.width;
      });
      if (cleanLine(text)) lines.push(cleanLine(text));
    });

    onProgress?.({
      label: `Reading page ${pageNumber} of ${pdf.numPages}`,
      progress: 0.05 + (pageNumber / pdf.numPages) * 0.2,
    });
  }

  if (lines.join(' ').replace(/\s/g, '').length >= 40) {
    const result = parseResumeLines(lines, documentLinks);
    await pdf.destroy();
    return result;
  }

  const pageLimit = Math.min(pdf.numPages, 5);
  let currentOcrPage = 1;
  onProgress?.({ label: 'Preparing text recognition', progress: 0.25 });
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng', undefined, {
    logger: (message) => {
      if (message.status !== 'recognizing text' || typeof message.progress !== 'number') return;
      onProgress?.({
        label: `Scanning page ${currentOcrPage} of ${pageLimit}`,
        progress: 0.25 + ((currentOcrPage - 1 + message.progress) / pageLimit) * 0.7,
      });
    },
  });
  const ocrLines: string[] = [];

  try {
    for (currentOcrPage = 1; currentOcrPage <= pageLimit; currentOcrPage += 1) {
      onProgress?.({
        label: `Preparing page ${currentOcrPage} of ${pageLimit}`,
        progress: 0.25 + ((currentOcrPage - 1) / pageLimit) * 0.7,
      });
      const page = await pdf.getPage(currentOcrPage);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) throw new Error('This browser could not prepare the PDF for scanning.');

      await page.render({ canvasContext: context, viewport }).promise;
      const recognition = await worker.recognize(canvas);
      recognition.data.text
        .split(/\r?\n/)
        .map(cleanLine)
        .filter(Boolean)
        .forEach((line) => ocrLines.push(line));

      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    await worker.terminate();
  }

  if (ocrLines.join(' ').replace(/\s/g, '').length < 40) {
    throw new Error('No readable text could be detected in this PDF. Try a clearer scan or a text-based PDF.');
  }

  onProgress?.({ label: 'Organizing detected fields', progress: 0.98 });
  const result = parseResumeLines(ocrLines, documentLinks);
  result.warnings.unshift('This CV was scanned with OCR. Review the imported text for recognition errors.');
  if (pdf.numPages > pageLimit) {
    result.warnings.push(`Only the first ${pageLimit} pages were scanned.`);
  }
  await pdf.destroy();
  return result;
}
