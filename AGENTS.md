# AGENTS.md - Resume Builder

Project guide for AI-assisted development. Keep this file in sync with the code.

## Overview

A web app for Al Yamamah University (YU) students to build a CV that matches the Career Center's approved template. Users fill in form fields, see a live A4 / US Letter preview, get a page-count warning when the CV exceeds one page, and export to PDF or DOCX.

Live: `resu.alaasi.dev`
Repo: `github.com/AbdulrahmanAlaasi/resume-builder`

## Hosting & Architecture

- Cloudflare Pages auto-deploys from `main`.
- `next build` produces the static `out/` directory.
- Static export only: `output: 'export'` in `next.config.ts`.
- No server, SSR, API routes, or backend dependency.
- Supabase is planned for Career Center integration, but Phase 5 is paused until Career Center auth requirements are clear.

## Tech Stack

| Tool | Version | Purpose |
|---|---:|---|
| Next.js | 16 | App Router, static export |
| React | 19 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Via `@tailwindcss/postcss` |
| Zustand | 5 | State and localStorage persistence |
| html2pdf.js | 0.14 | Browser-side PDF export |
| docx | 9.6 | Browser-side DOCX export |

## File Structure

```text
resume-builder/
├── app/
│   ├── components/
│   │   ├── form/
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ObjectiveForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── ProjectsForm.tsx
│   │   │   ├── VolunteerForm.tsx
│   │   │   ├── CertificationsForm.tsx
│   │   │   └── ExtracurricularForm.tsx
│   │   ├── layout/
│   │   │   ├── CreditBanner.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── SectionNav.tsx
│   │   │   ├── BuilderPanel.tsx
│   │   │   ├── PreviewArea.tsx
│   │   │   └── ResetModal.tsx
│   │   ├── preview/
│   │   │   └── ResumePreview.tsx
│   │   └── ui/
│   │       ├── PropsGroup.tsx
│   │       ├── Segmented.tsx
│   │       └── Toggle.tsx
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── exportUtils.ts
│   │   └── placeholders.ts
│   ├── store/
│   │   └── resumeStore.ts
│   ├── types/
│   │   └── resume.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/
│   ├── logo.png
│   └── README.md
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── LICENSE
```

`ProjectsForm.tsx` and `projects` store fields remain for compatibility with older persisted data, but Projects is no longer a separate visible editor section. Project entries should be created in `ExperienceForm.tsx` through the unified Experience & Projects format.

## UI Layout

Desktop:

```text
CreditBanner
TopBar
SectionNav (220px) | BuilderPanel (380px, conditional) | PreviewArea (fills rest)
```

- `SectionNav.tsx`: always-visible left sidebar. Lists the visible resume sections and contains the only formatting controls: Density and Preview Zoom.
- `BuilderPanel.tsx`: 380px detail panel. Shows the active form and can be closed with the X button.
- `PreviewArea.tsx`: auto-fits the resume to the available width with `ResizeObserver`, applies the user zoom multiplier, shows A4/US Letter, and displays a live page count. If the resume exceeds one page, it shows the warning: "YU usually requires a 1-page CV".
- Mobile at `max-width: 980px`: switches to a single-column Edit / Preview tab layout.

## Visible Sections

`SECTIONS` in `app/lib/constants.ts` controls the visible left nav:

1. Contact Information
2. Objective
3. Education
4. Skills
5. Experience & Projects
6. Volunteer Leadership (Optional)
7. Certifications (If Applicable)
8. Extracurricular

Volunteer and certification optional/applicable notes belong in the section nav/form context, not in the resume preview or DOCX headings.

## Store

`app/store/resumeStore.ts` uses Zustand with `persist`. localStorage key: `resume-builder-data`.

State:
- `data`: contact, objective, education, skills, experiences, legacy projects, volunteers, certifications, extracurriculars.
- `settings`: paper size, density, font family, accent color, show/hide rules.
- `activeSection`: current form.
- `detailPanelOpen`: whether the builder panel is visible.

Important actions:
- `selectSection(id)`: opens a section, or closes the panel if the active section is clicked again.
- `closeDetailPanel()`.
- `updateSettings(partial)` and `resetSettings()`.
- Granular updaters/adders/removers per section.
- `resetData()`.

Forms read/write through `useResumeStore()` directly. Do not prop-drill resume data. `ResumePreview` receives `data` and `settings` as props.

## Template Fidelity

`app/components/preview/ResumePreview.tsx` mirrors the YU CV template:

- Black bold uppercase section headings.
- No trailing colons in section headings or labels like `Relevant Coursework`, `Clubs`, and `Interests`.
- Thin black horizontal rules between sections when `settings.showRules` is true.
- Two-column institution/location and title/date rows.
- Default resume font is Times New Roman.
- LinkedIn renders as the visible text `LinkedIn` with the real URL as the link target.
- Email renders as a `mailto:` link.
- Empty sections do not render.
- Legacy `projects` data is ignored by preview/export; project content should be entered as experience-format entries.

## Forms

Each form component follows this pattern:

1. `'use client'`.
2. Import `useResumeStore` and `FORM_PLACEHOLDERS as P`.
3. Wrap content in `<div className="fade-in-up">`.
4. Use a short `.form-caption`.
5. Inputs use `.form-input`, `.form-textarea`, and `.form-label`.
6. Multi-entry sections use `.section-card` and `.card-head`.
7. Bullet sections use `.bullet-row` and `.bullet-dot`.
8. Add buttons use `.btn-add`.

`ExperienceForm.tsx` is the unified editor for work, internships, co-op positions, and projects. The first field label is `Institution / Company / Project`.

## Placeholders

All placeholder copy lives in `app/lib/placeholders.ts` as `FORM_PLACEHOLDERS`.

## Export System

### PDF

`exportToPDF(settings)`:
- Targets `#resume-preview`.
- Dynamically imports `html2pdf.js`.
- Uses the current paper size, A4 or Letter.
- Filename: `resume.pdf`.

### DOCX

`exportToDOCX(data, settings)`:
- Dynamically imports `docx`.
- Uses the current paper size, A4 or Letter.
- Uses the selected serif font.
- Keeps section headings uppercase and without colons.
- Renders LinkedIn and email as real hyperlinks.
- Shows LinkedIn as `LinkedIn`, not the raw URL.
- Uses thin black paragraph borders for horizontal rules.
- Justifies body paragraphs and bullet text.
- Keeps institution/location and title/date rows aligned with tab stops.
- Skips empty sections.
- Filename: `{fullName}.docx`, or `resume.docx` if no name is present.

## Theming

Theme tokens live in `app/globals.css`.

Current palette:

```css
--bg: #f4f5fb;
--surface: #ffffff;
--surface-2: #f8f9fc;
--surface-soft: #eef0f7;
--border: #e6e8f0;
--accent: #ED7A26;
--accent-2: #1f1f1f;
--accent-glow: rgba(237, 122, 38, 0.14);
--text-primary: #14172b;
--text-secondary: #5d6580;
--text-muted: #9ba3b8;
--preview-bg: #ecedf2;
```

App UI font: Inter. Resume preview font: serif, Times New Roman by default.

## Development

```bash
npm run dev
npm run build
```

The app is a single route: `app/page.tsx`.

## Important Conventions

1. All components are client components.
2. Keep the app static-export safe: no API routes, SSR-only APIs, or server-only dependencies.
3. Prefer existing store/actions and local CSS classes.
4. Keep `page.tsx` as a composition shell.
5. Keep preview and DOCX behavior aligned.
6. Do not add trailing colons to resume labels/headings.
7. Keep LinkedIn visible text as `LinkedIn`.
8. Do not silently re-enable the separate Projects UI; use the unified Experience & Projects section.

## Known Limitations / Future Work

- No true multi-page PDF flow. The app warns when the resume exceeds one page, but PDF export still screenshots the preview.
- No template switching.
- No print-specific CSS.
- No form validation.
- No drag-and-drop reordering.
- No import from JSON or LinkedIn.
- No undo/redo.
- English only.
- No auth or persistence to server. Supabase integration is paused pending Career Center direction.

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 1. Static-export setup + credit banner | Done | |
| 2. Preview matches YU template | Done | Uppercase headings, no colons, rules, hyperlinks |
| 3. Light-theme UI redesign | Done | Fixed nav, 380px detail panel, responsive tabs |
| 4. DOCX/PDF export updates | Done | Paper size, hyperlinks, justified DOCX body text |
| 5. Supabase integration | Paused | Waiting on Career Center auth requirements |
| 6. Polish + integration docs | In progress | README updated; Career Center brief still to do |
