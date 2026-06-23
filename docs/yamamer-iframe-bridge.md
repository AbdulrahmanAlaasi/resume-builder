# Yamamer ↔ Resume Builder — iframe postMessage Bridge

This document describes the secure message protocol that lets the Yamamer
parent app communicate with the resume-builder when it is embedded in an
`<iframe>`.

**AI stays in Yamamer.** The resume-builder only exposes structured data and
accepts structured updates. It never makes AI calls.

---

## Quick-start (Yamamer side)

```html
<iframe
  id="resu-frame"
  src="https://resu.alaasi.dev"
  allow="clipboard-write"
  style="width:100%;height:90vh;border:0;"
></iframe>
```

```js
const frame = document.getElementById('resu-frame');

// 1. Wait for the builder to be ready
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://resu.alaasi.dev') return;
  const { type, payload } = event.data;

  if (type === 'RESU_READY') {
    // 2. Ask for current state
    frame.contentWindow.postMessage(
      { type: 'YAMAMER_RESUME_GET_STATE' },
      'https://resu.alaasi.dev',
    );
  }

  if (type === 'RESU_STATE') {
    const { resume, meta } = payload;
    // Run your AI on `resume`, then push results back
  }

  if (type === 'RESU_CHANGED') {
    // User edited something; payload.resume has the latest data
  }

  if (type === 'RESU_ERROR') {
    console.error('[resu]', payload.reason);
  }
});
```

---

## Allowed origins

The builder only accepts messages from these origins:

| Origin | Purpose |
|--------|---------|
| `https://yamamer.com` | Production Yamamer |
| `http://localhost:5173` | Local Yamamer dev |
| `http://127.0.0.1:5173` | Local Yamamer dev (IP form) |

To add a staging URL, set the Cloudflare Pages environment variable:

```
NEXT_PUBLIC_YAMAMER_ORIGINS=https://staging.yamamer.com
```

Comma-separate multiple extra origins if needed.

---

## Protocol reference

### Parent → iframe (inbound)

All inbound messages must be sent to the exact iframe origin
(`https://resu.alaasi.dev` in production).

---

#### `YAMAMER_RESUME_GET_STATE`

Ask for the full resume state.

```js
frame.contentWindow.postMessage(
  { type: 'YAMAMER_RESUME_GET_STATE' },
  'https://resu.alaasi.dev',
);
```

The builder responds with `RESU_STATE`.

---

#### `YAMAMER_RESUME_PREFILL_PROFILE`

Pre-fill contact fields from the student's Yamamer profile.
By default, only **empty** fields are filled. Pass `overwrite: true` to
replace existing values.

```js
frame.contentWindow.postMessage({
  type: 'YAMAMER_RESUME_PREFILL_PROFILE',
  payload: {
    full_name:            'Abdulrahman Alaasi',
    email:                'student@yu.edu.sa',
    phone:                '+966 5X XXX XXXX',
    city:                 'Riyadh',
    country:              'Saudi Arabia',
    linkedin_url:         'https://linkedin.com/in/example',
    expected_graduation:  'May 2026',
    // overwrite: true,   // optional — replaces existing values
  },
}, 'https://resu.alaasi.dev');
```

> `major`, `college`, and `academic_year` are accepted in the payload but
> currently have no direct field in the CV template; they are silently ignored.
> This will be mapped once the template adds those fields.

---

#### `YAMAMER_RESUME_UPDATE_FIELD`

Update a single field by dot-path.

```js
frame.contentWindow.postMessage({
  type: 'YAMAMER_RESUME_UPDATE_FIELD',
  payload: {
    path:  'contact.fullName',
    value: 'Abdulrahman Alaasi',
  },
}, 'https://resu.alaasi.dev');
```

**Supported paths:**

| Path | Updates |
|------|---------|
| `contact.fullName` | Full name |
| `contact.email` | Email |
| `contact.phone` | Phone |
| `contact.city` | City |
| `contact.country` | Country |
| `contact.linkedin` | LinkedIn URL |
| `objective` | Objective paragraph text |
| `education.{n}.university` | Education institution |
| `education.{n}.location` | Education location |
| `education.{n}.degree` | Degree line |
| `education.{n}.graduationDate` | Graduation date |
| `education.{n}.relevantCoursework` | Coursework |
| `education.{n}.awards` | Awards |
| `skills.{n}` | Text of skill bullet at index n |
| `experiences.{n}.institution` | Employer / project name |
| `experiences.{n}.institutionDesc` | Employer description |
| `experiences.{n}.location` | Location |
| `experiences.{n}.jobTitle` | Job title |
| `experiences.{n}.startDate` | Start date |
| `experiences.{n}.endDate` | End date |
| `experiences.{n}.bullets.{i}` | Bullet i of experience n |
| `volunteers.{n}` | Volunteer bullet at index n |
| `certifications.{n}` | Certification bullet at index n |
| `extracurriculars.{n}` | Extracurricular text at index n |

`projects.*` is accepted as a legacy alias for `experiences.*`.

If the path is invalid or the index is out of bounds, the builder sends
`RESU_ERROR`.

---

#### `YAMAMER_RESUME_REPLACE_STATE`

Replace the entire resume with a new `ResumeData` object. The builder
validates the shape before applying it.

```js
frame.contentWindow.postMessage({
  type: 'YAMAMER_RESUME_REPLACE_STATE',
  payload: { /* full ResumeData object */ },
}, 'https://resu.alaasi.dev');
```

The payload must include at minimum: `contact` (object), `objective` (object),
`education` (array), `skills` (array), `experiences` (array).

---

### Iframe → parent (outbound)

The builder posts these messages to `event.origin` of the first trusted
parent message it received (not `'*'`).

---

#### `RESU_READY`

Sent once when the builder has mounted and the bridge is listening.

```json
{ "type": "RESU_READY", "payload": { "version": "1.0" } }
```

---

#### `RESU_STATE`

Sent in response to `YAMAMER_RESUME_GET_STATE`.

```json
{
  "type": "RESU_STATE",
  "payload": {
    "resume": { /* ResumeData */ },
    "meta": {
      "density": "normal",
      "updatedAt": "2026-05-31T10:00:00.000Z"
    }
  }
}
```

---

#### `RESU_CHANGED`

Sent ~400 ms after any resume data change. Only fires after the parent has
sent at least one message (so students who open the builder directly never
trigger this). Payload is the same shape as `RESU_STATE`.

---

#### `RESU_ERROR`

Sent when a message cannot be processed.

```json
{
  "type": "RESU_ERROR",
  "payload": {
    "reason": "Unknown contact field: \"nickname\"",
    "originalType": "YAMAMER_RESUME_UPDATE_FIELD"
  }
}
```

---

## Security

| Threat | Mitigation |
|--------|-----------|
| Messages from unknown origins | `isAllowedOrigin()` check — unknown origins are silently dropped |
| Unknown message types | Dropped silently |
| Prototype pollution via path | `__proto__`, `constructor`, `prototype` are blocked in path parsing |
| Arbitrary field injection | Contact / education / experience field names are checked against allowlists; unknown fields are rejected with `RESU_ERROR` |
| Index coercion tricks | Array indices must match `^\d+$` — values like `"5abc"`, `"1.5"`, `"-1"` are rejected |
| Code execution via messages | Only structured data is processed; no `eval` or dynamic imports |
| Sending resume data to wrong origin | Outbound messages use the captured `event.origin`, never `'*'` for data |
| Students opening builder directly | `isInIframe()` check — hook is completely inert outside an iframe |

---

## Data types (TypeScript)

```ts
interface ResumeData {
  contact:         { fullName, phone, email, city, country, linkedin: string };
  objective:       { text: string };
  education:       { id, university, location, degree, graduationDate,
                     relevantCoursework, awards: string }[];
  skills:          { id, text: string }[];
  experiences:     { id, institution, institutionDesc, location, jobTitle,
                     startDate, endDate: string; bullets: string[] }[];
  projects:        { id, institution, location, title,
                     startDate, endDate: string; bullets: string[] }[];
  volunteers:      { id, text: string }[];
  certifications:  { id, text: string }[];
  extracurriculars:{ id, type: 'club' | 'interest', text: string }[];
}
```

Full source: `app/types/resume.ts`.

---

## Local development

The allowlist includes `http://localhost:5173` and `http://127.0.0.1:5173`
so Yamamer's Vite dev server can communicate with the builder running on
`http://localhost:3000` (or any port) without any changes.

To also allow the builder dev server to act as the iframe target, run it and
embed it using its full `localhost` URL in the Yamamer iframe `src`.
