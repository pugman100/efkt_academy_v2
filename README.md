# EFKT Academy

Internal learning platform and Photographer Dashboard for EFKT (Denmark + Norway), built from the
Claude Design handoff in [`project/design_handoff_efkt_academy`](project/design_handoff_efkt_academy/README.md).

Three surfaces:

| Surface | Routes |
|---|---|
| **Login** | `/login`, `/login/forgot`, `/reset/[token]`, `/invite/[token]` |
| **Photographer Dashboard** (learners) | `/`, `/catalog`, `/courses/[id]`, `/courses/[id]/modules/[moduleId]`, `…/quiz`, `/news/[id]`, `/profile` |
| **Admin** | `/admin/courses`, `/admin/categories`, `/admin/question-bank`, `/admin/users`, `/admin/groups`, `/admin/bulk-assign`, `/admin/invitations`, `/admin/completion`, `/admin/news`, `/admin/teamleaders` |

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions) + **React 19** + TypeScript
- **PostgreSQL** via **Prisma 6** (`prisma/schema.prisma`)
- Auth: email + password (bcrypt), database sessions in an httpOnly cookie, rate-limited login
  with lockout after 5 failures, single-use expiring tokens for invitations and password reset
- Email: [Resend](https://resend.com) over HTTPS; without an API key, emails are logged to the
  console and the `EmailOutbox` table (handy in development)
- Images: stored in Postgres (`FileUpload`) and served from `/api/files/[id]` to signed-in users,
  with the crop (focus x/y + zoom) stored next to the reference
- Exports: CSV and XLSX (exceljs) generated server-side
- Design system: EFKT tokens in `src/styles/tokens`, components in `src/components/ui`,
  Be Vietnam Pro (Google Fonts) and Phosphor icons (bundled from npm)

## Getting started

Requirements: Node 20+ and PostgreSQL 14+.

```bash
npm install
cp .env.example .env          # set DATABASE_URL (and optionally RESEND_API_KEY)
npx prisma migrate deploy     # create the schema
npm run db:seed               # load the prototype content (wipes existing data)
npm run dev                   # http://localhost:3000
```

Seeded accounts all use the password `efkt-academy` (override with `SEED_PASSWORD`):

| Who | Email | Role |
|---|---|---|
| Matthew Pugsley | `mpu@efkt.com` | Administrator |
| Nadia Iversen | `nadia.iversen@efkt.com` | Administrator |
| Silje Rud | `silje.rud@efkt.no` | Learner (Norway, Photographers + Stylists) |
| Anders Bak | `anders.bak@efkt.com` | Learner (Denmark, Photographers) |

Administrators land on `/admin`; everyone else on the dashboard.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create a new migration after changing the schema |
| `npm run db:seed` | Reset content to the prototype seed |
| `npx tsx scripts/set-password.ts <email> <pw>` | Set a user's password (ops helper) |

### Environment

See [`.env.example`](.env.example): `DATABASE_URL`, `APP_URL` (used in email links),
`RESEND_API_KEY` + `EMAIL_FROM`, and `CRON_SECRET`.

### Scheduled job

`GET /api/cron` with header `Authorization: Bearer $CRON_SECRET` (e.g. Vercel Cron or any
scheduler, hourly) sends due invitation reminders, expires old invitations and publishes
scheduled news stories.

## How it works

### Access rule (`src/lib/access.ts`)

A learner sees a course when it is **Published**, matches their **country** (or is "Both"), and any
of: assigned directly, assigned to one of their groups, one of its categories is assigned to one of
their groups, or it is self-enrol and they enrolled. Every matching reason is kept, so admins see
*why* a user has a course ("via category Foto → Photographers").

### Course flow (`src/lib/progress.ts`)

Modules unlock in order. Google Slides `/pub` links are embedded as `/embed`. The quiz unlocks when
the learner has spent the module's `minSeconds` with the tab visible **and** ticked "I've been
through all slides" — the dwell time is tracked server-side. Quizzes are graded on the server
(correct answers never reach the browser before submission), retries are enforced, and passing
offers "Neste: …" straight away. Completion = passed modules / total.

### Security notes

- Passwords hashed with bcrypt (cost 12); sessions are random 256-bit tokens stored as SHA-256.
- Invitation and reset tokens are single-use, expiring, and stored hashed. Reset links live 60
  minutes, invitations 14 days (configurable under Invitations).
- "Log in as" (impersonation) is admin-only, cannot target administrators, is clearly bannered,
  short-lived, and audited (`AuditLog`) along with assignments, pass-mark changes, deactivation,
  invitations and teamleader changes.
- Every admin page and Server Action re-checks the session role; impersonation sessions never get
  admin rights.

## Project layout

```
prisma/               schema, seed script, seed data extracted from the prototypes
src/app/(auth)/       login, forgot/reset password (+ server actions)
src/app/invite/       invitation acceptance
src/app/(learner)/    Photographer Dashboard, course player, quiz, news, profile
src/app/(admin)/      admin panels
src/app/api/          file serving, exports, cron
src/components/ui/    EFKT design-system components
src/lib/              auth, access rule, progress, email, storage, formatting
project/              the original design handoff (reference only)
```

## Not included yet

- **Microsoft SSO** for EFKT employees (the link on the login page shows a notice). Add an
  OIDC provider (Entra ID) and map users by email.
- **Object storage**: images live in Postgres. Swap `src/lib/storage.ts` and `/api/files/[id]`
  for S3 / Supabase Storage when volume grows.
- **Danish customer-service contact details** for the dashboard: only the Norwegian ones were in
  the design; edit the `dashboard` row in the `Setting` table.
- **Course photos and news images** from the prototype were not part of the handoff bundle —
  upload them in the admin (course Settings → Thumbnail, news hero).
- i18n: copy is kept exactly as designed (English admin, Norwegian/Danish learner).
