# CLAUDE.md — Resume Builder

> A comprehensive project guide for AI-assisted development.

## Overview

This is a resume builder web app based on the **Al Yamamah University (YU) CV Template for Students**. Users fill in a step-by-step form wizard, see a live US-Letter preview, and export to PDF or DOCX. It is being prepared for integration into the YU Career Center website.

**Architecture is migrating from static export → Next.js with API routes** (Phase 5) so the Career Center site can call the builder programmatically and persist resumes. `next.config.ts` no longer sets `output: 'export'`.

## Career Center Banner

The top of the app shows the credit strip: "Built with ♥ by Abdulrahman · Supervised by the Career Center". It lives in `app/page.tsx` and is NOT printed on the exported resume.

## File Structure (post-refactor, integration-ready)

```
app/
├── components/
│   ├── form/           # 9 section forms (Contact, Objective, …, Extracurricular)
│   ├── layout/         # App-shell pieces — composed by page.tsx
│   │   ├── CreditBanner.tsx
│   │   ├── TopBar.tsx
│   │   ├── BuilderPanel.tsx
│   │   ├── PreviewArea.tsx
│   │   ├── PropertiesPanel.tsx
│   │   └── ResetModal.tsx
│   ├── preview/
│   │   └── ResumePreview.tsx   # Pure renderer — accepts data + settings as props
│   └── ui/             # Reusable primitives
│       ├── PropsGroup.tsx
│       ├── Segmented.tsx
│       └── Toggle.tsx
├── lib/
│   ├── constants.ts    # SECTIONS, FONT_CHOICES, ACCENT_CHOICES, DEFAULT_SETTINGS
│   └── exportUtils.ts  # PDF & DOCX export
├── store/
│   └── resumeStore.ts  # Zustand store (data + settings + UI state)
├── types/
│   └── resume.ts       # ResumeData, ResumeSettings, ActiveSection, PaperSize, Density
├── globals.css
├── layout.tsx
└── page.tsx            # Thin composition root: <CreditBanner /> <TopBar /> <body grid />
```

**Single source of truth:** `DEFAULT_SETTINGS` lives only in `lib/constants.ts` (imported by the store and the preview). The store is the single source of UI + resume state. `ResumePreview` is a pure prop-based renderer — safe to reuse server-side later for PDF generation when the API layer lands in Phase 5.

## UI Layout (Phase 3 — Talently-style light theme)

The page is a vertical stack:

1. **Credit banner** — gradient strip, "Built with ♥ by Abdulrahman · Supervised by the Career Center".
2. **Header** — logo + brand on left, file title in the middle (auto-derived from `contact.fullName`), `Reset / Word / PDF` buttons on the right.
3. **3-column body grid** (`320px | 1fr | 300px`):
   - **Left: Builder panel** — `Builder` / `Templates` top tabs. Builder tab renders the 9 sections as a collapsible accordion. Multiple sections can be open at once (state in `expandedSections`).
   - **Center: Preview area** — soft grey background, paper-sized resume card with shadow. NO formatting toolbar (template is fixed-format on purpose). File title + paper-size badge above.
   - **Right: Properties panel** — live formatting controls bound to `settings` in the store: paper size, density, font (serif only), section-heading colour, show/hide rules, preview zoom, and a "Reset to YU defaults" button.

On screens ≤ 980px the layout collapses to one column with `Edit` / `Preview` mobile tabs; the properties panel hides.

### Settings model

`app/types/resume.ts` defines `ResumeSettings { paperSize, density, fontFamily, accentColor, showRules }`. The store (`useResumeStore`) holds `settings` next to `data`, with `updateSettings(partial)` and `resetSettings()`. Both are persisted in localStorage.

The preview accepts `settings` as a prop (defaults to YU template values if omitted) and applies them through a `buildStyles()` helper.

### CSS

Light theme tokens in `app/globals.css`: white surfaces, soft lavender-grey app background (`#f4f5fb`), blue→purple accent gradient kept from before. Component classes: `.form-input`, `.form-label`, `.btn-primary/ghost/danger/add`, `.section-card`, plus new `.accordion-*`, `.toptab(-group)`, `.segmented`, `.swatch`, `.toggle`.

## Resume Preview — Template Fidelity (Phase 2)

`app/components/preview/ResumePreview.tsx` mirrors the approved YU CV `.docx` exactly:
- Black bold UPPERCASE section headings with trailing colon (`OBJECTIVE:`, `EDUCATION:`, etc.)
- Thin black horizontal rules separate every section
- Two-column rows for institution/location and italic title/dates (flexbox + space-between)
- Times New Roman, 11pt body, ~16pt name
- LinkedIn is a real `<a href>` hyperlink; email is a `mailto:` link
- Bracketed placeholder copy matches the template (e.g. `[Your Phone Number]`, `[Your LinkedIn Profile]`)

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16 | Framework (App Router, static export only) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling (via `@tailwindcss/postcss`) |
| Zustand | 5 | Client-side state management (with `persist` middleware → `localStorage`) |
| html2pdf.js | 0.14 | Client-side PDF generation from DOM |
| docx | 9.6 | DOCX (Word) file generation |

### Key Config Notes

- **Static export**: `next.config.ts` sets `output: 'export'`. No SSR, no API routes, no `getServerSideProps`. Everything runs in the browser.
- **PostCSS**: `postcss.config.mjs` uses `@tailwindcss/postcss` (Tailwind v4 approach — no `tailwind.config` file).
- **TypeScript**: `tsconfig.json` targets `ES2017`, uses `bundler` module resolution and `react-jsx` JSX transform. Path alias `@/*` maps to the project root.

---

## Project Structure

```
resume-builder/
├── app/
│   ├── components/
│   │   ├── form/                  # One form component per resume section
│   │   │   ├── ContactForm.tsx
│   │   │   ├── ObjectiveForm.tsx
│   │   │   ├── EducationForm.tsx
│   │   │   ├── SkillsForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   ├── ProjectsForm.tsx
│   │   │   ├── VolunteerForm.tsx
│   │   │   ├── CertificationsForm.tsx
│   │   │   └── ExtracurricularForm.tsx
│   │   └── preview/
│   │       └── ResumePreview.tsx   # Live preview rendered at US Letter size
│   ├── lib/
│   │   └── exportUtils.ts         # PDF & DOCX export functions
│   ├── store/
│   │   └── resumeStore.ts         # Zustand store (single source of truth)
│   ├── types/
│   │   └── resume.ts              # All TypeScript interfaces & union types
│   ├── globals.css                # Design system: CSS variables, component classes
│   ├── layout.tsx                 # Root layout (metadata, font imports via CSS)
│   └── page.tsx                   # Main (and only) page — the full app shell
├── next.config.ts                 # Static export config
├── postcss.config.mjs             # Tailwind v4 PostCSS plugin
├── tsconfig.json
├── package.json
├── preview.png                    # README hero image
└── LICENSE                        # MIT
```

---

## Architecture & Data Flow

### Single Page, Three Panels

The entire app lives in `app/page.tsx` with this layout:

```
┌───────────────────────────────────────────────────────────────────┐
│  HEADER — Logo, Mobile tabs, Reset, Export Word, Export PDF       │
├──────────┬──────────────────┬─────────────────────────────────────┤
│ SIDEBAR  │  CENTER FORM     │  RIGHT PREVIEW                     │
│ (200px)  │  (480px fixed)   │  (flex: 1)                         │
│          │                  │                                     │
│ Section  │  Active form     │  <ResumePreview />                 │
│ nav      │  component       │  Scaled via CSS transform          │
│          │                  │                                     │
│ Zoom     │  Prev / Next     │  US Letter (8.5 × 11 in)           │
│ slider   │  navigation      │                                     │
└──────────┴──────────────────┴─────────────────────────────────────┘
```

On screens ≤ 900px, the sidebar hides and the form/preview switch to a tabbed mobile layout.

### State Management (Zustand)

**Store**: `app/store/resumeStore.ts`

- Wraps `create<ResumeStore>()(persist(...))` from Zustand
- `localStorage` key: `"resume-builder-data"`
- Holds the full `ResumeData` object and `activeSection: ActiveSection`
- Provides granular updater functions for every section and sub-item (bullets, etc.)
- `resetData()` restores `defaultData` (all fields empty with sensible defaults)
- ID generation: `uid()` → `Math.random().toString(36).slice(2, 9)`

**Important**: All form components read/write via `useResumeStore()` hooks directly — there is no prop drilling for data, only the preview receives `data` as a prop from `page.tsx`.

### Type System

**File**: `app/types/resume.ts`

Core interfaces:
- `ContactInfo` — fullName, phone, email, city, country, linkedin
- `Objective` — text
- `Education` — university, location, degree, graduationDate, relevantCoursework, awards (each entry has an `id`)
- `Skill` — id, text
- `Experience` — institution, institutionDesc, location, jobTitle, startDate, endDate, bullets[]
- `Project` — institution, location, title, startDate, endDate, bullets[]
- `VolunteerItem` — id, text
- `Certification` — id, text
- `ExtracurricularItem` — id, type ('club' | 'interest'), text

Aggregate: `ResumeData` holds all of the above.

`ActiveSection` is a string union of the 9 section names.

---

## Component Patterns

### Form Components (`app/components/form/`)

Every form component follows this pattern:

1. `'use client'` directive
2. Import `useResumeStore` — destructure only needed actions
3. Render a wrapper `<div className="fade-in-up">`
4. Section header: `<h2>` + description `<p>`
5. Form fields using CSS classes: `form-input`, `form-textarea`, `form-label`
6. For array sections (education, experience, projects, skills, etc.):
   - Each entry wrapped in `<div className="section-card">`
   - "Remove" button with `className="btn-danger"` (hidden when only 1 item)
   - "Add Another" button with `className="btn-add"` at the bottom
7. For bullet-point fields (experience, projects):
   - Each bullet has a textarea + a remove `✕` button
   - "+ Add Bullet Point" button at the end

### Resume Preview (`app/components/preview/ResumePreview.tsx`)

- Pure presentational component receiving `data: ResumeData` as props
- Renders `id="resume-preview"` div (targeted by `exportToPDF`)
- Uses inline styles in a `const s = { ... }` object at the top
- Styled to match a traditional Times New Roman academic resume
- Page dimensions: `8.5in × 11in`, white background with navy (`#1a3a6b`) accent
- `Bullet` helper component for bullet points
- Conditional rendering: sections only show if they have content

### Main Page (`app/page.tsx`)

- `'use client'` — the entire app is client-rendered
- `ResumePreview` is loaded with `next/dynamic` + `{ ssr: false }` (uses `html2pdf.js` which requires DOM)
- `NAV_ITEMS` array defines the 9 sections with id, label, and emoji icon
- `FormSection` switch component maps `activeSection` to the correct form
- Inline `<style>` tag for responsive breakpoints (900px, 1100px)
- Reset modal with backdrop blur and confirmation

---

## Export System

### PDF Export (`exportToPDF`)

- Grabs `#resume-preview` from the DOM
- Dynamically imports `html2pdf.js` (client-only)
- Renders at 2× scale JPEG quality 0.98
- US Letter format, portrait orientation
- Output filename: `resume.pdf`

### DOCX Export (`exportToDOCX`)

- Receives `ResumeData` directly (not from DOM)
- Dynamically imports `docx` library
- Programmatically builds Word document with:
  - `Document`, `Paragraph`, `TextRun` objects
  - Custom bullet numbering reference (`'bullets'`)
  - Times New Roman font, navy (`#1a3a6b`) section headers
  - US Letter page (12240 × 15840 twips), 0.9" margins
  - Tab stops for right-aligned dates/locations
- Downloads as `{fullName}.docx` (or `resume.docx` if name is empty)

---

## Design System

### CSS Variables (`app/globals.css`)

```css
--bg: #0f1117           /* Page background (dark) */
--surface: #181c27      /* Sidebar, header, cards */
--surface-2: #1e2333    /* Elevated surfaces, section cards */
--border: #2a3050       /* Border lines */
--accent: #4f6ef7       /* Primary accent (blue) */
--accent-glow: rgba(79, 110, 247, 0.15)  /* Focus rings, active states */
--accent-2: #7c5cfc     /* Secondary accent (purple, used in gradients) */
--text-primary: #e8ecf5  /* Main text */
--text-secondary: #8b93b0  /* Descriptions, labels */
--text-muted: #555f7a   /* Placeholder, de-emphasized text */
--success: #2dd4a4      /* Success green (available but unused) */
```

### Reusable CSS Classes

| Class | Usage |
|-------|-------|
| `.form-input` | Text inputs — dark bg, accent focus ring |
| `.form-textarea` | Multi-line inputs — same style, resizable |
| `.form-label` | Small uppercase labels |
| `.btn-primary` | Accent-colored solid button |
| `.btn-ghost` | Transparent bordered button |
| `.btn-danger` | Red danger/remove button |
| `.btn-add` | Dashed-border "add" button |
| `.nav-tab` / `.nav-tab.active` | Sidebar navigation tabs |
| `.section-card` | Card wrapper for repeated items |
| `.fade-in-up` | Entry animation (translateY + opacity) |

### Typography

- **App UI**: DM Sans (imported from Google Fonts in `globals.css`)
- **Resume Preview**: Times New Roman (system font, for academic look)
- **Decorative** (unused import): Playfair Display

---

## Development Commands

```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Build static export to /out
npm run start  # Start production server (rarely used — static export)
```

---

## Important Conventions

1. **All components use `'use client'`** — the app is entirely client-side.
2. **Inline styles are preferred** for layout and one-off styling in `page.tsx` and `ResumePreview.tsx`. CSS classes from `globals.css` are used for reusable interactive elements (inputs, buttons, nav).
3. **No prop drilling for data** — form components pull from the Zustand store directly. Only `ResumePreview` receives data as a prop (from `page.tsx`).
4. **Dynamic imports** are used for:
   - `ResumePreview` (SSR-incompatible due to DOM measurement)
   - `html2pdf.js` (browser-only)
   - `docx` (heavy library, code-split)
5. **No routing** — single page app. `app/page.tsx` is the only route.
6. **No environment variables** needed — fully offline-capable.
7. **`localStorage` persistence** — resume data survives page refreshes via Zustand `persist` middleware.

---

## Known Limitations & Future Improvement Areas

- **No multi-page PDF support**: The preview is a single `div`; very long resumes may clip at one page in PDF export.
- **No theme/template switching**: Currently locked to the YU template design.
- **No print-specific CSS**: PDF relies on `html2pdf.js` screenshot approach rather than `@media print`.
- **No form validation**: Inputs are free-text with no required field enforcement.
- **No drag-and-drop reordering** of entries within sections.
- **No import from JSON/LinkedIn**: Users must manually fill all fields.
- **Preview zoom** only supports 40–100% range.
- **No undo/redo** history.
- **No i18n** — English only, though the template is tailored for Saudi/GCC students.

---

## Adding a New Resume Section

1. Add a new interface in `app/types/resume.ts` and add the field to `ResumeData`.
2. Add the section key to the `ActiveSection` union type.
3. Add default data in `resumeStore.ts` (`defaultData`) and create updater/add/remove actions in the store interface + implementation.
4. Create a new form component in `app/components/form/` following the existing pattern.
5. Add the section to `NAV_ITEMS` in `page.tsx` and add a case to the `FormSection` switch.
6. Add rendering logic to `ResumePreview.tsx`.
7. Add DOCX generation logic to `exportUtils.ts` → `exportToDOCX`.
