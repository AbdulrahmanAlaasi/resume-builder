# Resume Builder

A light, responsive resume builder for Al Yamamah University (YU) students. It helps students create a CV that follows the Career Center's approved template, preview it live as an A4 or US Letter document, and export it to PDF or DOCX.

Live: [resu.alaasi.dev](https://resu.alaasi.dev)
Repo: [github.com/AbdulrahmanAlaasi/resume-builder](https://github.com/AbdulrahmanAlaasi/resume-builder)

## About

The app digitizes the YU Career Center student CV template into a browser-based builder. Students enter their information in section-specific forms, see a live document preview, and export the result without needing a server-side renderer.

The project is designed for static hosting on Cloudflare Pages and is being prepared for possible embedding into the YU Career Center website.

## Features

- Section-based editor for Contact, Objective, Education, Skills, Experience & Projects, Volunteer Leadership, Certifications, and Extracurricular sections.
- Live A4 / US Letter preview with a paper-like resume renderer.
- Responsive desktop and mobile layout with Edit / Preview tabs on smaller screens.
- Live page counter with a warning when the CV exceeds one page, since YU usually expects a one-page CV.
- PDF export through `html2pdf.js`.
- DOCX export through `docx`, including real email and LinkedIn hyperlinks.
- LinkedIn appears as `LinkedIn` in the resume while preserving the actual URL as the link target.
- DOCX body text is justified while headings and two-column rows keep the approved template structure.
- Local persistence with Zustand and `localStorage`.
- Reset confirmation modal to avoid accidental data loss.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | App Router and static export |
| React 19 | UI |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling via `@tailwindcss/postcss` |
| Zustand 5 | Local state and persistence |
| html2pdf.js 0.14 | Browser-side PDF export |
| docx 9.6 | Browser-side DOCX export |

## Architecture

- Hosted on Cloudflare Pages.
- Static export only: `output: 'export'` in `next.config.ts`.
- No server, SSR, API routes, or backend dependency.
- Resume data and UI flags live in a persisted Zustand store.
- Form components read/write directly from the store.
- `ResumePreview` is a pure renderer that receives `data` and `settings` as props.
- PDF and DOCX exports run entirely in the browser.

## Project Structure

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

`ProjectsForm.tsx` and the `projects` data shape remain in the codebase for compatibility with older persisted data, but Projects is no longer a separate visible editor section. Projects are entered through the unified `Experience & Projects` section using the same institution/company/project format as work experience.

## Resume Sections

The visible builder sections are:

1. Contact Information
2. Objective
3. Education
4. Skills
5. Experience & Projects
6. Volunteer Leadership (Optional)
7. Certifications (If Applicable)
8. Extracurricular

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

The static export is produced in `out/` for Cloudflare Pages.

## Notes

- Supabase integration is planned but paused pending Career Center auth requirements.
- The app is English-only.
- Drag-and-drop reordering, import from LinkedIn/JSON, undo/redo, and server persistence are not implemented.

## Author

Abdulrahman Alaasi
GitHub: [@AbdulrahmanAlaasi](https://github.com/AbdulrahmanAlaasi)

## License

MIT. See [LICENSE](LICENSE).
