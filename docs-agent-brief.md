# Shared brief for EFKT Academy implementation workers

You are one of several workers building EFKT Academy in parallel in the SAME working tree:
`/home/user/efkt_academy_v2`. Read this whole brief first.

## What we're building
A real web app rebuilt from high-fidelity HTML prototypes. Read the handoff:
`project/design_handoff_efkt_academy/README.md` (domain model, access rule, course/quiz flow, screens, tokens).
The prototypes are in `project/` (identical copies in `project/design_handoff_efkt_academy/`):
- `project/LMS Admin.dc.html` — markup lines 1–2176, logic/seed `<script data-dc-script>` lines 2177–4553
- `project/LMS Learner.dc.html` — markup 1–844, logic 845–1918
- `project/LMS Login.dc.html`
Markup uses a template syntax: `{{ expr }}`, `<sc-if value>`, `<sc-for list as>`, and
`<x-import component-from-global-scope="EFKTDesignSystem_b30f3d.Button|Input|Select|Checkbox|Switch|Badge|Tag|Logo">`
which map to our React components in `src/components/ui`. The inline style values are FINAL — reproduce them
faithfully (inline `style={{}}` objects are fine and expected). Derived view values (`v.xxx = ...`) are
computed in the script's render function — read it to understand behaviour and copy text. Copy is final
(English admin, Norwegian/Danish learner) — keep it as-is.

Reference screenshots of the prototypes (1440px):
`/tmp/claude-0/-home-user-efkt-academy-v2/bcc7a99d-8bfd-568e-b7a4-9f721318c67e/scratchpad/shots/` (LMS_Admin.png, LMS_Learner.png, LMS_Login.png).
To render any prototype state yourself: a static server runs at http://localhost:8765/ serving
`project/design_handoff_efkt_academy/`; use `scratchpad/shot.js`'s `open()` helper (it routes the blocked
unpkg CDN to local node_modules) e.g.
`node -e "require('/tmp/claude-0/-home-user-efkt-academy-v2/bcc7a99d-8bfd-568e-b7a4-9f721318c67e/scratchpad/shot.js').open().then(async({b,p})=>{await p.goto('http://localhost:8765/LMS%20Admin.dc.html');await p.waitForTimeout(2500);await p.click('text=Users');await p.waitForTimeout(500);await p.screenshot({path:'/tmp/x.png',fullPage:true});await b.close()})"`
(if the 8765 server is down: `cd project/design_handoff_efkt_academy && python3 -m http.server 8765 &`).

## Stack (already set up — do not reinstall or upgrade)
- Next.js 16 App Router + React 19 + TypeScript (strict). IMPORTANT Next 16 differences: `params` and
  `searchParams` are Promises (`const { id } = await params`), `cookies()`/`headers()` are async,
  middleware is `src/proxy.ts`. Docs: `node_modules/next/dist/docs/`.
- Prisma 6 + PostgreSQL. Schema: `prisma/schema.prisma` (read it fully). DB is seeded (`prisma/seed.ts`,
  data in `prisma/seed-data.json`). If Postgres is down:
  `su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/pgdata -l /var/lib/pgdata/log -o '-k /var/run/postgresql' start"`
- Mutations: Server Actions (`'use server'` files colocated with the route, e.g. `actions.ts`). Validate
  input with `zod`. After mutating call `revalidatePath(...)`. Client components call actions directly
  and use `useTransition`/`useToast()` for feedback.
- No CSS framework. Global tokens + helper classes in `src/styles/globals.css` (read it: `.efkt-btn--*`,
  `.efkt-card`, `.efkt-row`, `.efkt-seg`, `.efkt-progress`, `.efkt-link`, `.efkt-iconbtn`, `.efkt-page`...).
  Hover effects must be CSS (classes), since inline styles can't do :hover — you may add NEW classes in a
  new CSS file you own (import it from your layout/page), don't edit globals.css.
- Icons: Phosphor web font, `<i className="ph ph-camera" />` (also `ph-bold`, `ph-fill`). Already loaded.

## Shared code you should use (read before writing)
- `src/lib/db.ts` (`db` Prisma client), `src/lib/auth.ts` (`getSession`, `requireUser`, `requireAdmin`,
  `createSession`, `destroySession`), `src/lib/password.ts`, `src/lib/tokens.ts` (`newToken`, `hashToken`,
  `appUrl`), `src/lib/email.ts` (`sendMail`, `mailLayout`), `src/lib/audit.ts` (`audit(actorId, action, target, details)`),
  `src/lib/access.ts` (access rule + reasons — the explainability "via category Foto → Photographers"),
  `src/lib/progress.ts` (`courseProgress` module states / unlock / pct), `src/lib/blocks.ts` (Block types,
  `embedUrl`, `sourceLabel`, `fileUrl`, `imageSrc`, `parseOptions`), `src/lib/labels.ts` (enum labels, `Scope`,
  `scopeWhere`), `src/lib/scope.ts` (`getScope()` admin country switcher, `scopeLine`), `src/lib/format.ts`
  (`ago`, `dateNo`, `initials`...), `src/lib/storage.ts`.
- UI: `src/components/ui/*` — Button/ButtonLink, Input/Textarea/Select/Checkbox/Radio/Switch, Badge, Tag,
  Heading (two-weight), Avatar, Photo (cropped image), ImageCropField (upload + drag/zoom crop, stores
  imageId/x/y/scale), Dialog (modal or `drawer`), CloseButton, useToast, Logo, Icon.
- `src/components/blocks/BlockRenderer.tsx` — read-only rendering of content blocks.
- Admin shell: `src/app/(admin)/admin/layout.tsx` + `src/components/admin/AdminSidebar.tsx` (nav links to
  /admin/courses, /admin/categories, /admin/question-bank, /admin/users, /admin/groups, /admin/bulk-assign,
  /admin/invitations, /admin/completion, /admin/news, /admin/teamleaders) and
  `src/components/admin/PageHeader.tsx`. Admin pages render inside `<div className="efkt-page">`.
- Image uploads: `src/app/actions/upload.ts` (`uploadImage(formData)`), served at `/api/files/[id]`.

## Rules for working in parallel
- Only create/edit files inside the area you own (listed in your task). Do NOT edit shared files
  (`prisma/schema.prisma`, `src/lib/*`, `src/components/ui/*`, `src/components/blocks/*`, `src/styles/*`,
  the admin layout/sidebar, `src/app/layout.tsx`, `package.json`). If you truly need a shared helper, create
  it inside your own area. If the schema is missing something essential, work around it (e.g. the `Setting`
  key/value table) and say so in your final report — do not change the schema.
- Do not install packages (exceljs, zod, bcryptjs are available).
- Do not run `next build`, do not start another `next dev` (one is already running on http://localhost:3000
  and hot-reloads your files), do not run the seed or reset the DB (other workers depend on the data), and
  do not `git commit` — the coordinator commits.
- Verify: `npx tsc --noEmit` must pass for your files (ignore errors clearly in other workers' in-progress
  files). Then check your pages visually against the prototype: `node scripts/shot.mjs <path> <out.png> [email] [width]`
  logs in as that user (default admin mpu@efkt.com; learner silje.rud@efkt.no) and screenshots
  http://localhost:3000<path>; Read the png. Also exercise your server actions (e.g. via Playwright clicks or
  a small tsx script) so you know they work. Check the dev server log for errors:
  `tail -50 /tmp/claude-0/-home-user-efkt-academy-v2/bcc7a99d-8bfd-568e-b7a4-9f721318c67e/scratchpad/dev.log`.
- Security: every admin page and admin server action must call `requireAdmin()`; learner actions must
  call `requireUser()` and check access (`canAccessCourse`). Never trust client-provided ids for ownership.
- Keep code tidy and consistent: small components, typed props, no dead code, comments only where useful.
- Final report (your last message): list the routes/files you created, what works, anything from the
  prototype you could not implement, and any shared-file/schema changes you think are needed.
