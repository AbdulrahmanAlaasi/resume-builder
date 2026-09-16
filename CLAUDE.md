# CLAUDE.md - Resume Builder

Project guide for AI-assisted development. Keep this file in sync with the code.

## Overview

A web app for Al Yamamah University (YU) students to build a CV that matches the Career Center's approved template. Users fill in form fields, see a live A4 / US Letter preview, get a page-count warning when the CV exceeds one page, and export to PDF or DOCX.

Live: `resu.alaasi.dev`
University proposal: `resu.alaasi.dev/proposal`
Repo: `github.com/AbdulrahmanAlaasi/resume-builder`

## Hosting & Architecture

- Cloudflare Pages auto-deploys from `main`.
- `next build` produces the static `out/` directory.
- Static export only: `output: 'export'` in `next.config.ts`.
- No server, SSR, or API routes. The browser talks to Supabase directly with the public anon key; Row-Level Security does the access control.
- Supabase is **optional**. With no env vars the app falls back to the built-in template and skips analytics, so the site always works.

## Tech Stack

| Tool | Version | Purpose |
|---|---:|---|
| Next.js | 16 | App Router, static export |
| React | 19 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Via `@tailwindcss/postcss` |
| Zustand | 5 | State and localStorage persistence |
| @react-pdf/renderer | 4.5 | Browser-side structured PDF export |
| docx | 9.6 | Browser-side DOCX export |
| @supabase/supabase-js | 2.x | Live template + anonymous usage analytics (optional) |

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
│   ├── hooks/
│   │   └── useYamamerBridge.ts   # iframe postMessage bridge (inert outside an iframe)
│   ├── lib/
│   │   ├── constants.ts
│   │   ├── exportUtils.ts        # DOCX export
│   │   ├── resumePdf.tsx         # structured PDF export (@react-pdf/renderer)
│   │   ├── yamamerBridge.ts      # bridge pure logic (origin allowlist, path resolver)
│   │   └── placeholders.ts
│   ├── store/
│   │   └── resumeStore.ts
│   ├── types/
│   │   └── resume.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── public/                         # logo32.png, favicon.png
├── docs/
│   └── yamamer-iframe-bridge.md    # iframe postMessage protocol reference
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
- Mobile at `max-width: 980px`: single-column Edit / Preview tabs with a **drill-down** edit flow — the section list and the section form are shown one full screen at a time (swapped on `detailPanelOpen`), with a "‹ Sections" back button in the form header. Desktop shows nav + form side by side as before.

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

`exportToPDF(data, settings)` lives in `app/lib/resumePdf.tsx`:
- Structured (vector) PDF via `@react-pdf/renderer` — **not** a screenshot.
- Selectable, searchable, ATS-parseable text.
- Real `mailto:` and LinkedIn hyperlinks.
- Mirrors the YU template (uppercase accent headings, rules, two-column rows, bullets) and follows the DOCX "real content only, no placeholders" rule.
- Embeds the standard `Times-Roman` family for every serif choice (Georgia/Garamond/Cambria are proprietary and can't be embedded without TTFs; they map to Times-Roman in the PDF only — preview and DOCX still honour the chosen face).
- Uses the current paper size, A4 or Letter; honours density (compact/normal) and `showRules`.
- Filename: `{fullName}.pdf`, or `resume.pdf` if no name is present.

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

## Admin Dashboard (`/admin`)

`app/admin/page.tsx`. Three tabs plus a sticky publish bar.

- **Usage** — anonymous counters: visits, PDF/Word exports, export rate, PDF imports, examples used, over-1-page count, mobile/desktop, embedded/direct, and a daily bar chart. 7/30/90-day ranges.
- **Design** — Word-like formatting. Click any line in the CV preview (or pick from the dropdown) to select that *element type*, then format it with the ribbon: font, size, bold, italic, underline, ALL CAPS, colour, alignment and space before/after. Also a Page setup row: base font, base size, line spacing, margins and the horizontal-rule colour/thickness.
- **Content** — edits the whole live template: default formatting, sections (reorder / rename nav label / rename CV heading / hide), CV labels, branding copy, and every placeholder. A live CV preview sits beside the editor.
- **Import / Export** — download the template as JSON, or upload/paste one. Uploads run through `mergeTemplate()` so partial or older files still load.

**Publishing** upserts `site_config` row 1. The public site picks it up on next load.

### Auth

`app/admin/AdminGate.tsx` wraps the dashboard. States: loading → signed-out (magic-link form) → not-admin → admin. Sign-in is Supabase `signInWithOtp` redirecting to `/admin`; no passwords exist.

The allowlist is `public.admins`, **keyed by email** rather than user id, so a colleague can be authorised before they've ever signed in — they get access on first login. Supabase verifies the address during the magic-link flow, so the JWT email claim is trustworthy.

**The gate is convenience, not the security boundary.** Enforcement is Row-Level Security: `is_admin()` compares the JWT email claim against `admins`. Verified against the live database — with the public anon key, an unauthenticated caller can read the template and append events, but gets `0 rows` on publish and an empty array on analytics.

### Live template

`app/lib/siteConfig.ts` defines `TemplateConfig` and `DEFAULT_TEMPLATE` (the built-in YU template).
`app/store/configStore.ts` loads it: built-in defaults → localStorage cache → Supabase.

Consumers read the published config, so an admin edit changes all of them at once:
`ResumePreview` (headings, CV labels, enabled sections), `SectionNav` / `BuilderPanel` (nav labels, order, visibility), `TopBar` / `CreditBanner` (branding), `PreviewArea` (page-limit warning), `resumePdf.tsx` and `exportUtils.ts` (headings + labels in PDF and DOCX).

Placeholders are special: `FORM_PLACEHOLDERS` in `placeholders.ts` is a Proxy over a live map that `configStore` pushes into via `setLivePlaceholders()`. That keeps all nine form components unchanged and avoids a circular import.


### Element styles (the Word model)

A CV is generated from each student's data, so you cannot bold one specific word — formatting is defined per *element type*, exactly like Word's Heading 1 / Normal styles.

`ElementKey` in `app/lib/siteConfig.ts` lists them: `name`, `contact`, `sectionHeading`, `institution` (bold+underlined), `university` (bold only — the YU template deliberately differs), `location`, `roleTitle`, `dates`, `body`, `bullet`, `inlineLabel`.

Each carries an `ElementStyle` (fontFamily, fontSize, bold, italic, underline, uppercase, color, align, spaceBefore, spaceAfter). Sentinels: `fontSize: 0`, `fontFamily: ''` and `color: ''` all mean "inherit from `page`".

All three renderers read the same styles, so the preview, the PDF and the Word file stay in sync:
- `ResumePreview.tsx` — `buildStyles()` maps them to CSS and tags each node with `data-el`, which is what makes click-to-select work in the admin.
- `resumePdf.tsx` — `st()` maps them to react-pdf props. Font family is still pinned to Times-Roman (see the font note in that file).
- `exportUtils.ts` — `runOf()` maps them to docx `TextRun` props (half-points) and `alignOf()` to paragraph alignment.

Density remains a student-facing control: "normal" adds +0.5pt, +0.12 line-height and +0.2in margins on top of the admin's page setup; "compact" uses it as-is. An element with an explicit `fontSize` is absolute and does not shift with density.

### Analytics

`app/lib/analytics.ts` — `track(event, meta?, { once })`. Fire-and-forget; never throws; no-ops without Supabase.

**Privacy contract:** no resume content, names, emails, IPs, cookies, or fingerprinting. The session id is a random UUID in `sessionStorage` that dies with the tab. `meta` accepts primitives only and is truncated. Event names are whitelisted by a DB `CHECK` constraint. This matches the commitment made publicly on `/proposal`.

### Setup

1. Create a Supabase project.
2. SQL Editor → run `supabase/schema.sql` (creates tables, RLS, and the admin allowlist).
3. Authentication → Providers → **Email** enabled; URL Configuration → Site URL `https://resu.alaasi.dev`, Redirect URLs `https://resu.alaasi.dev/admin` and `http://localhost:3000/admin`.
4. Add admins: `insert into public.admins (email, note) values ('you@yu.edu.sa', 'Career Center');`
5. Cloudflare Pages → env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
6. Redeploy.

Locally, the same two vars go in `.env.local` (git-ignored). Never put the database password or `service_role` key in a `NEXT_PUBLIC_*` variable — those bypass RLS and would be inlined into the public bundle.

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

The CV builder lives at `app/page.tsx`. The public university partnership proposal lives at `app/proposal/page.tsx`, with route-scoped styles in `app/proposal/proposal.module.css`.

## Important Conventions

1. All components are client components.
2. Keep the app static-export safe: no API routes, SSR-only APIs, or server-only dependencies.
3. Prefer existing store/actions and local CSS classes.
4. Keep `page.tsx` as a composition shell.
5. Keep preview and DOCX behavior aligned.
6. Do not add trailing colons to resume labels/headings.
7. Keep LinkedIn visible text as `LinkedIn`.
8. Do not silently re-enable the separate Projects UI; use the unified Experience & Projects section.
9. **Do not remove `pako` from `package.json`.** It looks unused, but `@react-pdf/pdfkit` deep-imports `pako/lib/zlib/*` as a bare specifier. It is only ever installed *nested* by other packages, so without an explicit top-level entry the bare import has nothing to resolve against and the Cloudflare build fails with `Module not found`. Local builds can hide this by resolving it from a stray `node_modules` in a parent/home directory.

## Known Limitations / Future Work

- PDF is now structured/vector (selectable, ATS-friendly), but non-default serif fonts (Georgia/Garamond/Cambria) render as Times-Roman in the PDF only.
- No template switching.
- No form validation.
- No drag-and-drop reordering.
- No import from JSON or LinkedIn.
- No undo/redo.
- English only.
- Student resume data is still browser-only (localStorage). Only the template and anonymous counters live in Supabase.
- Adding/removing admins is a SQL statement (`supabase/schema.sql` section 7) — there's no UI for managing the allowlist yet.
- Template import/export is JSON. Uploading a `.docx` to become the template is not supported — Word layout doesn't map faithfully onto the structured render model.

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 1. Static-export setup + credit banner | Done | |
| 2. Preview matches YU template | Done | Uppercase headings, no colons, rules, hyperlinks |
| 3. Light-theme UI redesign | Done | Fixed nav, 380px detail panel, responsive tabs |
| 4. DOCX/PDF export updates | Done | Paper size, hyperlinks, justified DOCX body text |
| 5. Supabase integration | Paused | Waiting on Career Center auth requirements |
| 6. Polish + integration docs | Done | See `INTEGRATION.md` — embed-now + Supabase wiring + open decisions |
