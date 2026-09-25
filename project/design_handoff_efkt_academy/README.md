# Handoff: EFKT Academy (LMS + Photographer Dashboard)

## Overview
An internal learning platform for EFKT (real-estate photography, Denmark + Norway). It replaces an existing e-learning platform. Courses are mostly **Google Slides "published to web" links**, linked together into courses made of modules, with a quiz after each module. The same product also acts as the photographers' home page: news feed, contact info, important links, and a link to SPA.

Three surfaces:
1. **Login** — sign in, accept invitation, set password, forgot/reset password.
2. **Admin** — courses, modules, quiz builder + question bank, categories, users, groups, invitations, completion tracking + export, news editor, teamleaders.
3. **Photographer Dashboard (learner)** — news, contact/links, EFKT Academy (assigned courses by category), course player, quizzes, news reader, profile.

## About the design files
The files in this bundle are **design references built in HTML** — working prototypes that show intended look and behaviour. They are **not production code**. Each `.dc.html` file holds its own hard-coded seed data and its own state (in memory / `localStorage`); the three files do not share a backend.

The task is to **rebuild this as a real web application** with a database, authentication, and email. No codebase exists yet, so choose a suitable stack. Recommended: **Next.js (App Router) + TypeScript + PostgreSQL (Prisma) + Auth (e.g. Auth.js or Supabase Auth) + transactional email (Postmark/Resend) + object storage for images (S3/Supabase Storage)**. Any equivalent is fine.

Open the `.dc.html` files directly in a browser to click through them. Read the `<script data-dc-script>` block at the bottom of each file for seed data and logic; the markup above it is the layout with inline styles (exact values).

## Fidelity
**High-fidelity.** Colours, type, spacing, radii and interactions are final and follow the EFKT Design System (tokens included in `_ds/`). Recreate the UI faithfully. Copy is final (mix of Norwegian/Danish learner copy and English admin copy — keep as-is; i18n is a later concern).

---

## Core domain model

```
Country        Denmark | Norway            (top-level partition; "Both" allowed on content)
Region         fixed list per country; has one Teamleader (name, email, mobile — editable, region itself is not)
               Norway: Nord, Midt og Innlandet, Vest og Sør, Østlandet
               Denmark: Øst (Nanna Hegaard Rødtnes), Vest (Jesper Kristian Ovesen) — Fyn belongs to Vest
User           name, email, password hash, role (Learner | Team lead | Administrator), country, region,
               job title, photo, bio, phone, status (active | deactivated), createdAt, lastSeenAt
Group          name, description, icon. Users ↔ Groups is many-to-many.
               Seed: Photographers, Stylists, Employees: Sales, Employees: Production,
                     Employees: Customer Service, Admin, Customers
Category       name, description, icon. Categories ↔ Groups many-to-many (assigning a category to a group
               gives every member every course in that category).
               Seed: Foto, Drone, Video, Sales, Customer Service, Generell Internal, Reference Materials
Course         title, description, country, status (Draft | Published | Archived), thumbnail (+ crop x/y/scale),
               categories (many-to-many), directly assigned groups, directly assigned users, selfEnrol flag,
               ordered modules
Module         title, order, source: 'embed' (URL) | 'built' (block content, same blocks as news),
               quiz (optional, 1:1), minSeconds (dwell time before quiz unlocks — set per module)
Quiz           passPercent, retries (0 = unlimited), shuffle, showFeedback, questions
Question       text, multi (bool), options[{text, correct}]; may reference a QuestionBank item
QuestionBank   reusable questions tagged by category; import into any quiz; CSV import
Invitation     email, name, role, groups, country, status (Pending | Accepted | Expired), token, sentAt, expiresAt
Progress       per (user, module): seenAt, dwellSeconds, confirmedAllSlides, attempts, passed, bestScore
NewsStory      title, lead, category, author, country, status (Draft | Scheduled | Published), pinned,
               hero image (+crop), publishAt, ordered blocks
Block          heading | paragraph | image | imagetext | quote | list | button | divider | course
```

### Access rule (important)
A learner sees a course if the course is **Published**, matches their **country** (or is "Both"), and **any** of:
- the course is assigned to them directly,
- the course is assigned to one of their groups,
- one of the course's categories is assigned to one of their groups,
- the course is self-enrol and they enrolled.

The admin UI shows *why* a user has a course ("via category Foto → Photographers"). Keep that explainability.

### Country scope
Admins have a global **country switcher** (All countries / Denmark / Norway) in the sidebar that filters every admin list. Learners only ever see their own country.

---

## Course / module / quiz flow (the key behaviour)

1. Modules unlock **in order**. Module N+1 is locked until module N's quiz is passed (or N has no quiz and was opened).
2. Opening a module shows it in the **in-page player** — no popups. Google Slides `/pub` URLs are converted to `/embed` (see `embedUrl()` in the admin file). Player has a fullscreen toggle (Fullscreen API) and previous/next.
3. **Quiz gate.** Cross-origin iframes can't report the current slide, so "reached the last slide" is approximated by:
   - time spent on the module ≥ `module.minSeconds` (counted only while the tab is visible), **and**
   - the learner ticks "I've been through all slides".
   Then *Ta quizen* unlocks. Show the countdown.
4. **Passing** (score ≥ passPercent) marks both the module and its quiz complete and offers **"Neste: <next module>"** at the bottom of the result (no scrolling back up). Last module → "Fullfør kurset".
5. **Failing** always offers a way on: *Prøv quizen igjen* (while retries remain), *Gå gjennom modulen* (back to the player), *Tilbake til kurset*. When retries are exhausted, re-viewing the module resets the attempt counter.
6. **Reset progress** (learner): per module (resets that module and all later ones) and whole course (with confirmation).
7. **External links inside slides**: open in a separate window (not tab) sized beside the course, so the course stays visible.

Completion % for a course = passed modules / total modules.

---

## Screens

### Login (`LMS Login.dc.html`)
Split layout: photo left, form right. States: sign in, wrong password (after 3 failures show reset prompt), accept invitation (set name + password), forgot password (email → "check your mail"), reset password via token (new password + strength rules, min 8 chars), expired link. Redirect: Administrator → admin, others → dashboard.

### Admin (`LMS Admin.dc.html`) — left sidebar nav, deep-navy sidebar
- **Courses** — grid/list, filter by status and category. Course detail: settings (title, description, country, categories, thumbnail upload + drag/zoom crop), modules (reorder, add embed URL or built content, per-module dwell seconds), quiz builder per module, assignment (groups/users/self-enrol), preview.
- **Quiz builder** — pass %, retries, shuffle, feedback; single/multi-choice questions; add from **question bank**; **CSV import**.
- **Categories** — equal-sized cards; each lists its groups and courses (course list scrolls if long).
- **Users** — table with search/filter; user drawer (groups, direct courses, progress); **Log in as** (impersonation — must be audited and clearly bannered); **Create user** with admin-set password (for testing without email; shows credentials once with copy button); deactivate; role change.
- **Groups** — cards, multi-membership, bulk add members.
- **Bulk assign** — many users/groups ↔ many courses in one action.
- **Invitations** — list with spread-out row layout (email/name, role, groups, status pill, sent, actions: resend, revoke, copy link); invite dialog.
- **Completion** — matrix users × courses/modules with status pills; filters; **export CSV/XLSX** (per course, per user, all).
- **News** — list (Draft/Scheduled/Published, pinned); **block editor** (MailChimp-style): add/reorder/delete blocks in a left panel **and** edit blocks inline in the live preview (click a block; title and lead editable in the hero). Published stories remain editable; unpublish supported.
- **Teamleaders** — one card per region; edit person (name, email, mobile). Regions are fixed.

### Photographer Dashboard (`LMS Learner.dc.html`)
- **Deep-navy top bar** with logo, nav, prominent **"Log in SPA"** box → `https://sp.efkt.com/` (new tab), profile avatar.
- **Hero** with large interior photo.
- **News feed** (pinned first) → **news reader** view with "Flere nyheter".
- **Kontakt oss** (teamleader for the learner's region + customer service) and **Viktige lenker**.
- **EFKT Academy** section on a distinct background with its own header: "Fortsett der du slapp" + assigned courses **grouped by category**. Course tiles: large photo, title overlaid on a navy scrim, progress. Grid `repeat(auto-fill, minmax(min(100%,360px),1fr))`, so ~4 per row at 1920px, 3 at 1440px; many courses wrap into more rows.
- **Catalogue** (self-enrol courses).
- **Course overview** → module list with lock/status, reset controls.
- **Player** and **Quiz** as described above.
- **Profile** — edit own name, photo, phone, bio, change password; shows region + teamleader.

---

## Backend requirements not in the prototype
- Real auth: hashed passwords (argon2/bcrypt), sessions, rate-limited login, invitation + reset tokens (single-use, expiring).
- Email service for invites, reminders, password reset.
- Image upload to storage; store crop (x, y, scale) alongside the URL.
- Audit log: assignments, pass-mark changes, impersonation start/stop, user deactivation.
- Re-certification: when a published course's modules change, decide whether existing completions stand (flag for admin).
- Exports generated server-side (CSV + XLSX).
- Hosting on an EFKT subdomain; Google Slides decks must be "Published to web" (and shared appropriately) to embed.

---

## Design tokens (EFKT Design System — full files in `_ds/…/tokens/`)
- **Colours:** Navy text `#373B54` · Coral accent `#F1554C` (hover/press `#DD4E45`, ≤10% of surface) · Deep Navy `#0C0E39` (dark sections/scrims only, never text) · Muted `#63667E` · White `#FFFFFF` · Off-white `#F8F8FA` / `#F6F6F6` · Borders `#E9E9EC`, dashed `#E2E2E2` · Soft section accents: Sand, Gold, Mint, Green, Blush (see `colors.css`).
- **Type:** Be Vietnam Pro 300–900. Two-weight headings (key word 800, rest 300, same size). Hero 70px, H1 40px (−6.5% tracking), body 16px/300, minimum 14px anywhere.
- **Spacing steps:** 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 120, 160. Interior padding ≥ 20px.
- **Radii:** cards/images 20px; buttons fully rounded (≥25px); pills half-height; icon plates ~10px; table cells 0.
- **Shadow:** `0 4px 24px rgba(12,14,57,0.06)`; card hover `0 8px 32px rgba(12,14,57,0.10)`.
- **Photo scrim:** `linear-gradient(rgba(12,14,57,0) → rgba(12,14,57,0.65))`.
- **Motion:** 180ms (320ms large) `cubic-bezier(0.4,0,0.2,1)`, colour/opacity/shadow only. No scale, no slide-ins.
- **Buttons:** primary coral fill + white label, secondary 1.5px coral outline, tertiary coral text; min height 50px, padding 20×36px.
- **Icons:** Phosphor only (Regular/Fill), `https://unpkg.com/@phosphor-icons/web@2.1.1`.
- **Logo:** always from file (`assets/logo/`), never redrawn.

## Assets
- `assets/photo-*.{webp,jpg}` — course thumbnails (keyed by course id) and dashboard hero. Supplied by EFKT.
- `assets/news-*.{png,jpg}` — news story hero images.
- `assets/logo/` — official EFKT logo files.
- Fonts: Be Vietnam Pro via Google Fonts. Icons: Phosphor via CDN.

## Files
- `LMS Login.dc.html` — login, invitation acceptance, password reset.
- `LMS Admin.dc.html` — all admin panels. Seed data: `SEED_CATEGORIES`, `SEED_GROUPS`, `LEARNERS`, `USER_DETAIL`, `SEED_LEADS`, `SEED_INVITES`, `SEED_BANK`, `SEED_NEWS`, `SEED` (courses, incl. the real "Fotograf: Velkommen til EFKT Norge" with 11 Google Slides modules — quiz questions are placeholders).
- `LMS Learner.dc.html` — Photographer Dashboard, course player, quiz, news reader, profile.
- `support.js`, `image-slot.js` — prototype runtime only; not needed in production.
- `_ds/` — EFKT tokens, stylesheet and component bundle used by the prototypes.
