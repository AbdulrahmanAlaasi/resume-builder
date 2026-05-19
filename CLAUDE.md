# CLAUDE.md — Resume Builder

> Project guide for AI-assisted development. Kept in sync with the code.

## Overview

A web app for Al Yamamah University (YU) students to build a CV that matches the **Career Center's approved template**. Users fill in form fields, see a live A4 / US-Letter preview, and export to PDF or DOCX. Being prepared for embedding into the YU Career Center website.

Live: **resu.alaasi.dev** · Repo: **github.com/AbdulrahmanAlaasi/resume-builder**

## Hosting & Architecture

- **Cloudflare Pages**, auto-deploys from `main`. The `out/` directory produced by `next build` is served as static files.
- **Static export** (`output: 'export'` in `next.config.ts`). No server, no SSR, no API routes.
- **Supabase** is planned for the Career Center integration (Phase 5). The browser will call Supabase directly with the public anon key + Row Level Security; the Career Center backend will use a service-role key for staff reads. **Not yet implemented** — auth model is on hold pending a conversation with Career Center IT.

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16 | App Router, static export |
| React | 19 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Via `@tailwindcss/postcss` (no `tailwind.config` file) |
| Zustand | 5 | State (data + settings + UI flags), persisted in localStorage |
| html2pdf.js | 0.14 | Browser-side PDF |
| docx | 9.6 | Browser-side DOCX |

## File Structure

```
resume-builder/
├── app/
│   ├── components/
│   │   ├── form/                   # 9 section-specific form components
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ObjectiveForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── ProjectsForm.tsx
│   │   │   ├── VolunteerForm.tsx
│   │   │   ├── CertificationsForm.tsx
│   │   │   └── ExtracurricularForm.tsx
│   │   ├── layout/                 # App-shell pieces composed by page.tsx
│   │   │   ├── CreditBanner.tsx    # Gradient credit strip at the very top
│   │   │   ├── TopBar.tsx          # Logo, file title, Reset/Word/PDF buttons
│   │   │   ├── SectionNav.tsx      # FIXED left sidebar (sections + density + zoom)
│   │   │   ├── BuilderPanel.tsx    # Slide-out detail panel showing the active form
│   │   │   ├── PreviewArea.tsx     # Right column; auto-fits the resume to width
│   │   │   └── ResetModal.tsx
│   │   ├── preview/
│   │   │   └── ResumePreview.tsx   # Pure renderer — data + settings via props
│   │   └── ui/                     # Tiny reusable primitives
│   │       ├── PropsGroup.tsx
│   │       ├── Segmented.tsx
│   │       └── Toggle.tsx
│   ├── lib/
│   │   ├── constants.ts            # SECTIONS, FONT_CHOICES, ACCENT_CHOICES, DEFAULT_SETTINGS
│   │   ├── exportUtils.ts          # exportToPDF + exportToDOCX
│   │   └── placeholders.ts         # FORM_PLACEHOLDERS — every form field's placeholder text
│   ├── store/
│   │   └── resumeStore.ts          # Zustand store, persisted to localStorage
│   ├── types/
│   │   └── resume.ts               # All TypeScript types
│   ├── globals.css                 # Design tokens + component classes
│   ├── layout.tsx                  # Root HTML/metadata
│   └── page.tsx                    # Thin composition root
├── public/
│   ├── logo.png                    # Top-bar logo (referenced as /logo.png)
│   └── README.md
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── package.json
└── LICENSE
```

`page.tsx` is intentionally small. It composes the shell and owns three pieces of cross-cutting state (preview scale, fitMode, mobileTab, exporting status, reset-modal open). All resume data and UI panel-open flags live in the Zustand store.

## UI Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CreditBanner — "Built with ♥ by Abdulrahman Alaasi · Supervised by ..."  │
├──────────────────────────────────────────────────────────────────────────┤
│  TopBar — logo │ file title │ Reset · Word · PDF                          │
├──────────────────────────────────────────────────────────────────────────┤
│ SectionNav │ BuilderPanel? │              Preview                         │
│  220px     │   320px       │            (fills rest)                      │
│  fixed     │  conditional  │                                              │
│  always    │  opens when   │  auto-fit width via ResizeObserver,          │
│  visible   │  a section    │  multiplied by the user zoom value.          │
│            │  is clicked   │                                              │
│ ┌────────┐ │               │                                              │
│ │ footer │ │               │                                              │
│ │density │ │                                                              │
│ │+ zoom  │ │                                                              │
│ └────────┘ │               │                                              │
└──────────────────────────────────────────────────────────────────────────┘
```

**Panels:**

- **SectionNav** (`SectionNav.tsx`, 220px) — always visible, never collapsible. Top: lists the 9 sections as buttons (active row has accent strip + chevron). Clicking a section calls `selectSection(id)`. Clicking the currently-active section *closes* the detail panel. Bottom (`section-nav-footer`): the only formatting controls left in the UI — a `Density` segmented (Compact/Normal/Roomy) and the `Preview Zoom` slider (40–100%).
- **BuilderPanel** (`BuilderPanel.tsx`, 320px, conditional on `detailPanelOpen`) — shows the form for the active section only. ✕ button calls `closeDetailPanel()`.
- **PreviewArea** (`PreviewArea.tsx`, fills remaining space) — paper-sized resume on a soft grey backdrop. Auto-fits via `ResizeObserver` + `useLayoutEffect`, then multiplies by the user `zoom` (so zoom=100% means "fill the column"). The dep array includes `detailPanelOpen`, so opening/closing the detail panel re-fits.

**Mobile (≤ 980px):** layout collapses to a single column with `Edit` / `Preview` tabs in the top bar.

## Store (`app/store/resumeStore.ts`)

Zustand store wrapped with `persist`. localStorage key: `"resume-builder-data"`.

State:
- `data: ResumeData` — the resume content (contact, objective, education[], skills[], experiences[], projects[], volunteers[], certifications[], extracurriculars[]).
- `settings: ResumeSettings` — formatting (paperSize, density, fontFamily, accentColor, showRules).
- `activeSection: ActiveSection` — which form is currently shown in BuilderPanel.
- `detailPanelOpen: boolean` — whether BuilderPanel is rendered.

Key actions:
- `selectSection(id)` — sets active section and opens detail panel. Toggles closed if clicking the already-active section.
- `closeDetailPanel()`.
- `updateSettings(partial)` · `resetSettings()` (restores `DEFAULT_SETTINGS`).
- Granular updaters/adders/removers per resume section + bullet (e.g. `addExperienceBullet(expId)`).
- `resetData()` — restores `defaultData`.

All form components read/write through `useResumeStore()` hooks directly. **No prop drilling for resume data.** Only `ResumePreview` receives `data` + `settings` as props (so it can be reused server-side later for PDF generation if Phase 5 needs it).

## Types (`app/types/resume.ts`)

- `ContactInfo` — `fullName, phone, email, city, country, linkedin`
- `Objective` — `text`
- `Education` — `university, location, degree, graduationDate, relevantCoursework, awards`
- `Skill` — `text`
- `Experience` — `institution, institutionDesc, location, jobTitle, startDate, endDate, bullets[]`
- `Project` — `institution, location, title, startDate, endDate, bullets[]`
- `VolunteerItem`, `Certification` — `text`
- `ExtracurricularItem` — `type: 'club' | 'interest', text`

Array entries have `id: string` (random 7-char slug from `Math.random().toString(36).slice(2, 9)`).

`ResumeSettings` — `paperSize: 'letter' | 'a4'`, `density: 'compact' | 'normal' | 'roomy'`, `fontFamily: string`, `accentColor: string`, `showRules: boolean`.

`ActiveSection` — union of the 9 section ids.

## Resume Preview — Template Fidelity

`app/components/preview/ResumePreview.tsx` mirrors the approved YU CV `.docx`:

- Black bold UPPERCASE section headings — **no trailing colon** (e.g. `OBJECTIVE`, `EDUCATION`).
- Thin black horizontal rules between every section (controlled by `settings.showRules`).
- Two-column rows for institution/location (bold) and italic title/dates.
- Default Times New Roman, 11pt body, ~16pt centered name.
- LinkedIn rendered as a real `<a href>` (URL is normalised — adds `https://` if missing).
- Email rendered as a `mailto:` link.
- **Sections only render when they have content.** An empty resume shows just the header (name + contact placeholders); no ghost sections.

## Form Components

Each form follows the same pattern:

1. `'use client'` directive.
2. Import `useResumeStore` and `FORM_PLACEHOLDERS as P`.
3. Wrap in `<div className="fade-in-up">`.
4. A short `<p className="form-caption">` description (no big h2 — the BuilderPanel head already shows the section name).
5. Inputs use `.form-input`, `.form-textarea`, `.form-label`.
6. Multi-entry sections wrap each entry in `<div className="section-card">` with a `.card-head` and "Remove" button (hidden when only 1 entry).
7. Bullet-list sections use `.bullet-row` + `.bullet-dot`.
8. "Add another …" button uses `.btn-add`.

## Editing Placeholders

All placeholder text for every form field lives in **`app/lib/placeholders.ts`** as a single `FORM_PLACEHOLDERS` object. Each form imports it as `P` and uses keys like `P.contactFullName`, `P.expBullet`. Edit one file to change them everywhere.

## Logo

The top bar references `/logo.png`. Drop the logo image at `public/logo.png` — Cloudflare Pages serves it at the site root. If missing, the `<img>` hides itself gracefully via an `onError` handler.

## Theming

Theme tokens live in `app/globals.css` (`:root`). Current palette:

```css
--bg:           #f4f5fb;   /* soft lavender-grey page background */
--surface:      #ffffff;   /* white panels */
--surface-2:    #f8f9fc;
--surface-soft: #eef0f7;
--border:       #e6e8f0;
--accent:       #ED7A26;   /* logo orange — primary */
--accent-2:     #1f1f1f;   /* logo black — gradient secondary */
--accent-glow:  rgba(237, 122, 38, 0.14);
--text-primary:   #14172b;
--text-secondary: #5d6580;
--text-muted:     #9ba3b8;
--preview-bg:     #ecedf2;
```

Changing `--accent` + `--accent-2` re-skins every button, focus ring, accordion accent strip, and the credit banner gradient.

**App UI font:** Inter. **Resume preview font:** Times New Roman by default (settable via the Font dropdown to Georgia, Garamond, or Cambria — all serif).

## Reusable CSS Classes (`globals.css`)

| Class | Usage |
|-------|-------|
| `.form-input` / `.form-textarea` / `.form-label` | Form controls |
| `.form-caption` | Small grey description above a form |
| `.form-grid` + `.full` | 2-column grid for paired fields; collapses to 1 col under 1100px |
| `.btn-primary` / `.btn-ghost` / `.btn-danger` / `.btn-add` | Buttons |
| `.icon-btn` | Square close/chevron buttons (e.g. on panel heads) |
| `.section-card` + `.card-head` | Card wrapper for repeated entries |
| `.bullet-row` + `.bullet-dot` | Bulleted textareas inside forms |
| `.row-with-remove` | Single input with trailing remove button |
| `.subhead` | Mini section heading inside a form |
| `.section-nav-panel` + `.section-nav-head` + `.section-nav-list` + `.section-nav-btn` + `.section-nav-chevron` | Left sidebar |
| `.builder-panel-head` + `.builder-panel-title` + `.builder-panel-body` | Detail panel chrome |
| `.panel-head` + `.panel-head-title` + `.panel-collapse-btn` | Properties panel chrome |
| `.toptab-group` + `.toptab` | Pill tab group (mobile Edit/Preview) |
| `.segmented` | Segmented control (paper size, density, fit/manual zoom) |
| `.swatch-row` + `.swatch` | Colour swatches |
| `.toggle` + `.toggle.on` | Switch |
| `.reopen-tab.right` / `.reopen-tab.left` | Floating reopen tab when a side panel is hidden |
| `.fade-in-up` | Entry animation |

## Export System

### PDF (`exportToPDF`)

- Targets `#resume-preview` in the DOM.
- Dynamically imports `html2pdf.js`.
- Renders at 2× scale, JPEG quality 0.98, US Letter portrait.
- Filename: `resume.pdf`.

### DOCX (`exportToDOCX(data, settings)`)

- Accepts both resume data and current settings.
- Section headings written with `color: toDocxHex(settings.accentColor)` — pure black when black is selected (fixes the prior navy bug).
- Thin black `BorderStyle.SINGLE` paragraph borders for the horizontal rules (toggled by `settings.showRules`).
- LinkedIn and email rendered as real `ExternalHyperlink` runs (normalised URL).
- Tab-stop rows for institution/location and italic title/dates (mirrors the preview's two-column layout).
- Falls back to `DEFAULT_SETTINGS` if called without a settings argument.
- Sections with no content are skipped — matches preview behaviour.
- Filename: `{fullName}.docx`, or `resume.docx` if name is empty.

## Development

```bash
npm run dev    # localhost:3000 with hot reload
npm run build  # produces out/ for Cloudflare Pages
```

## Important Conventions

1. **All components are `'use client'`.** The app is entirely client-side because of the static export.
2. **Inline styles are preferred** for layout in `page.tsx` and the layout components. CSS classes from `globals.css` are used for reusable interactive elements.
3. **No prop drilling for resume data.** Form components read/write the store directly. Only `ResumePreview` takes data + settings as props.
4. **Dynamic imports** for: `ResumePreview` (`{ ssr: false }`), `html2pdf.js`, and `docx` — keeps the initial bundle small.
5. **Single-page app.** `app/page.tsx` is the only route.
6. **`localStorage` persistence** via Zustand `persist` — resume data survives page refreshes.
7. **Section headings carry no trailing colon** — both in preview and DOCX export.

## Adding a New Resume Section

1. Add an interface in `app/types/resume.ts` and append the field to `ResumeData`. Add the new id to the `ActiveSection` union.
2. Add default data in `resumeStore.ts` (`defaultData`) and create updater/add/remove actions.
3. Add the section to `SECTIONS` in `app/lib/constants.ts`.
4. Add a new form in `app/components/form/` following the existing pattern; add placeholder copy to `app/lib/placeholders.ts`.
5. Map the id to the new form in `FORM_BY_SECTION` inside `BuilderPanel.tsx`.
6. Add rendering logic to `ResumePreview.tsx` (with the empty-content guard so the section is hidden when blank).
7. Add the matching DOCX block in `exportUtils.ts`.

## Known Limitations / Future Work

- **No multi-page PDF.** Long resumes may clip — the preview is a single page.
- **No template switching.** YU template only.
- **No print-specific CSS** — PDF is a screenshot via html2pdf.js, not `@media print`.
- **No form validation.**
- **No drag-and-drop reordering** within sections.
- **No import** from JSON / LinkedIn.
- **No undo/redo.**
- **English only.**
- **No auth / persistence to server** — Phase 5 (Supabase) is paused pending Career Center direction.

## Phase Status

| Phase | Status | Notes |
|---|---|---|
| 1. Static-export setup + credit banner | ✅ | |
| 2. Preview matches YU template | ✅ | Black uppercase headings (no colons), separator rules, hyperlinks |
| 3. Light-theme UI redesign | ✅ | Fixed left section nav, slide-out detail panel, right properties panel, auto-fit preview |
| 4. DOCX/PDF export updates | ✅ | DOCX honours accent colour, real hyperlinks, no colons |
| 5. Supabase integration | ⏸ | Paused — waiting on Career Center auth requirements |
| 6. Polish + integration docs | ⏳ | README + Career Center brief still to do |
