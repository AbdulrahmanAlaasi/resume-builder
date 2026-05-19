# Integration Guide — Resume Builder × YU Career Center

This document is for the YU Career Center IT team (and the developer maintaining the resume builder) when wiring this tool into the Career Center website.

It is split into three parts:

1. **Embed now** — what works today, no backend required.
2. **Persist later** — adding Supabase so resumes save to student accounts.
3. **Open decisions** — what the Career Center needs to confirm before step 2.

---

## 1. Embed Now (No Backend)

The builder is currently a static site hosted at **https://resu.alaasi.dev** (Cloudflare Pages, auto-deployed from `main`). Resume data persists in the student's browser `localStorage` only.

### Option A — iframe embed (recommended for a fast start)

Drop this anywhere in the Career Center site:

```html
<iframe
  src="https://resu.alaasi.dev"
  title="YU Resume Builder"
  style="width:100%; height:90vh; border:0;"
  allow="clipboard-write"
></iframe>
```

That's it. No build step, no integration code. Students can fill, preview, and download PDF/Word inside your page.

**Trade-off:** every student has their own browser-only data. There's no "log in and continue later from another device" until you move to step 2.

### Option B — point a Career Center subdomain at the same site

If you prefer the URL to live under YU (e.g. `resume.yu.edu.sa`):

1. In Cloudflare Pages → Custom domains → add `resume.yu.edu.sa`.
2. Add a CNAME on YU DNS: `resume.yu.edu.sa → resume-builder.pages.dev`.
3. Embed the new URL instead of `resu.alaasi.dev`.

### Option C — host the build yourself

The repo produces a fully static `out/` directory (`npm run build`). Drop that on any static host the Career Center already uses (Nginx, IIS, Azure Static Web Apps, etc.). No server side runtime needed.

```bash
git clone https://github.com/AbdulrahmanAlaasi/resume-builder.git
cd resume-builder
npm install
npm run build   # produces ./out
```

---

## 2. Persist Later (Add Supabase)

When you're ready to let students save resumes to YU accounts and let Career Center advisors review them, the recommended addition is Supabase. The architecture stays simple: **the browser talks to Supabase directly using the public anon key**, and **row-level security policies enforce who can read what**. No Next.js API routes or server runtime are needed; the static export model is preserved.

### Suggested schema

```sql
-- A single row per saved resume. Most students will have exactly one.
create table public.resumes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  data        jsonb not null,        -- the ResumeData object
  settings    jsonb not null,        -- the ResumeSettings object
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- Index for "list a student's resumes" queries.
create index on public.resumes (user_id, updated_at desc);

-- Career Center advisors (separate role from students).
create table public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text not null
);
```

`ResumeData` and `ResumeSettings` shapes are stable and defined in `app/types/resume.ts` — they slot straight into the `jsonb` columns. No transformation needed.

### Row-Level Security policies

```sql
alter table public.resumes enable row level security;

-- Students see only their own resumes.
create policy "students read own"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "students write own"
  on public.resumes for insert with check (auth.uid() = user_id);

create policy "students update own"
  on public.resumes for update using (auth.uid() = user_id);

create policy "students delete own"
  on public.resumes for delete using (auth.uid() = user_id);

-- Career Center staff can read everyone's resumes.
create policy "staff read all"
  on public.resumes for select
  using (exists (select 1 from public.staff s where s.user_id = auth.uid()));
```

This gives you student isolation by default, and read-only staff access without any server code.

### Required app changes (one PR)

1. `npm install @supabase/supabase-js`
2. Create `app/lib/supabase.ts` exporting a single client built from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Add a thin adapter `app/store/supabaseSync.ts`:
   - On first sign-in: pull the user's row into the Zustand store (or create one).
   - Subscribe to `data` + `settings` changes in the store; debounce and `upsert` to Supabase.
4. Add a sign-in UI: a single "Save to your YU account" button that opens a magic-link flow (Supabase Auth `signInWithOtp`).
5. Keep localStorage as the **anonymous fallback** so the builder works without an account.

The Zustand store stays the single source of truth — Supabase is just persistence. **No component changes are required**, because forms already read/write the store and not the network.

### Environment variables

Cloudflare Pages → Settings → Environment variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | from the Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from the Supabase project |

The anon key is *meant* to be public — RLS does the security. Never put the service-role key in the browser.

### Staff dashboard (optional add-on)

A second route, `/staff`, lists every resume the signed-in staff user can see (RLS returns only what they're allowed to read). Implementation is roughly:

```tsx
const { data, error } = await supabase
  .from('resumes')
  .select('id, user_id, updated_at, data->contact->>fullName')
  .order('updated_at', { ascending: false });
```

Render as a table. Clicking a row opens that resume in a read-only version of the existing `ResumePreview`.

---

## 3. Open Decisions

Before step 2 can ship, the Career Center needs to confirm:

| # | Decision | Why it matters |
|---|----------|----------------|
| 1 | **Auth method.** Does YU have a single sign-on (SAML/OIDC) you want to plug in, or should we use Supabase magic-link email restricted to `@yu.edu.sa`? | This is the only choice that significantly changes the work. SSO requires cooperation from YU IT; magic link does not. |
| 2 | **Supabase project ownership.** Should the Career Center create the Supabase project under a YU billing account, or use the developer's existing project? | All student data lives there. Best practice is YU owns it so data stewardship stays internal. |
| 3 | **Hosting.** Is `resu.alaasi.dev` acceptable long-term, or do you want a YU subdomain like `resume.yu.edu.sa`? | Just DNS work. Either way Cloudflare Pages serves the build. |
| 4 | **Staff access.** Do advisors need a read-only dashboard, comments on resumes, or just the link to view individual resumes? | Determines whether we add the `/staff` route and a `comments` table. |
| 5 | **Drafts.** Should each student have one resume or many (multiple drafts)? | One-line schema change (drop the `user_id` unique constraint or not). |

Once those are answered, the rest is well-defined work and can ship in a single follow-up release.

---

## 4. Appendix — Useful Data Shapes

For anyone integrating the data outside the app, here are the types (full source: `app/types/resume.ts`):

```ts
interface ResumeData {
  contact: { fullName, phone, email, city, country, linkedin: string };
  objective: { text: string };
  education: { id, university, location, degree, graduationDate,
               relevantCoursework, awards: string }[];
  skills:    { id, text: string }[];
  experiences: { id, institution, institutionDesc, location, jobTitle,
                 startDate, endDate: string; bullets: string[] }[];
  projects:    { id, institution, location, title, startDate, endDate: string;
                 bullets: string[] }[];
  volunteers:      { id, text: string }[];
  certifications:  { id, text: string }[];
  extracurriculars:{ id, type: 'club' | 'interest', text: string }[];
}

interface ResumeSettings {
  paperSize:  'letter' | 'a4';
  density:    'compact' | 'normal' | 'roomy';
  fontFamily: string;
  accentColor: string;    // hex like "#000000"
  showRules:  boolean;
}
```

No nested objects beyond what is shown. No dates as `Date` instances — they're strings. No required fields enforced client-side (the Career Center should treat all values as optional when consuming).
