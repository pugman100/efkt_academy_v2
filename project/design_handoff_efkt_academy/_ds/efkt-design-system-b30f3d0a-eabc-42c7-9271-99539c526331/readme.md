# EFKT Design System

EFKT is a Danish/Nordic supplier of marketing solutions for real estate agents — *"The complete solution
from 'For Sale' to 'Sold'"* / *"Den komplette pakke fra 'Til salg' til 'Solgt'"*. Part of Esoft Group.
The business has two halves that the whole identity is built around:

- **Content creation** — photography, floor plans, 3D visualization, copywriting, video, drone ("Visuals that stand out").
- **Content activation** — organic social media, property ads, realtor ads ("Strategies that perform").

Customers are estate agents from single local offices to city chains, in Denmark, Norway and (in English) internationally.
The public site runs in three languages: English, Danish, Norwegian. Log-in goes to a separate customer portal,
**konekt.efkt.com** (not accessible for this build — no portal UI kit exists here).

## Sources used to build this system

| Source | What came from it |
|---|---|
| `uploads/EFKT-designprompt.md` → copied to `guidelines/EFKT-designprompt-v2.md` | **The ground truth.** EFKT's own standard prompt, version 2.0, 12 August 2026, approved by EFKT Marketing. Colours, type scale, the two-weight heading rule, radii, buttons, icon family, photography, layout grids, chart rules, tone of voice, slide types. |
| Official logo files supplied with it (SVG, PNG, favicons, mono variants, `kontrolark.png` control sheet) | `assets/logo/`, `assets/favicon/` |
| **efkt.com** (English version, read 12 August 2026) | Information architecture, section order, real product names, headlines, customer testimonials, footer content — used for the website UI kit and the slide copy. The site is built in Framer. |
| The bundled `efkt-cvi` skill | Cross-checked. Where it disagrees with the design prompt v2.0 (it still says 8–12px radii and 11–13px captions), **v2.0 wins** — it is the newer, Marketing-approved document. |

Not available: no codebase, no Figma file, no PowerPoint template file, no local font binaries, no photo library.
Component inventory below is therefore authored from the guideline document, not extracted from a source library.

---

## 1. Content fundamentals

**Voice.** Direct, concrete, warm-professional. Second person — "du/din" in Danish, "you/your" in English.
Active verbs, short sentences, no filler.

**Result-oriented, always with a source.** Numbers are the argument: *"28% reduced time on market in comparison to
the rest of the market"*. Never a figure without a period or a source next to it.

**Casing.** Sentence case everywhere, including headings. No ALL CAPS, no Title Case On Every Word, no underlines.
Headings may be sentence fragments without a full stop; body copy always has full stops.

**Length discipline.** Max 2 lines in a slide title, max 40 words of body per slide, max 5 bullets with max 2 lines
each and no sub-levels. One point per slide — if you have two, make two slides.

**Emoji: never.** Not in slides, not in UI, not in email. Icons do that job (Phosphor, one colour).

**Words EFKT uses:** indhold, aktivering, annoncering, liggetid, mægler, ejendom (DA) · content, activation,
advertising, days on market, agent, property (EN). In Danish texts, avoid "content" and "leads" unless it is a product name.
Avoid unbacked superlatives ("world's best", "revolutionary").

**Real examples of the house voice:**
- "Marketing **solutions** for real estate agents" (hero, two-weight)
- "All in **one**" · "Total **EFKT**" · "Content **creation**" · "What does the **customers say?**"
- "Did you know that we specialize in digital advertising – and that our customers ... experience 28% reduced time on market?"
- "We help real estate agents succeed with tailored solutions—whether for small local offices or large chains."
- Tagline: "The complete solution from 'For Sale' to 'Sold'." · Hashtags: `#ViSkaberEFKT` (DA) / `#WeCreateEFKT` (EN)

**Product naming.** Content Creation, Content Activation, Total EFKT, Konekt (portal). Keep product names identical
across languages; translate everything else.

---

## 2. Visual foundations

**Attitude.** Calm, warm, professional — Nordic minimalism with one sharp accent. Lots of white, softly rounded
shapes, large photographs of real homes, and a single coral used sparingly to point at what matters.
Never a "corporate template": no clipart, no 3D, no gradients on brand colours, no heavy shadows.

**Colour.** Navy `#373B54` is the text colour — all of it, everywhere. Coral `#F1554C` is the accent, capped at
**10% of the surface**. Deep Navy `#0C0E39` is allowed *only* as a whole dark section background, a photo scrim, or
depth in a graphic element — **never as text**. Neutrals (white, `#F8F8FA`, `#F6F6F6`, `#E9E9EC`, `#E2E2E2`, muted
`#63667E`) carry 60% of every surface. Five soft accents (Sand, Gold, Mint, Green, Blush) exist only as whole
section backgrounds — one per section, never as a text or icon colour. Distribution: **60 neutral / 30 navy+photo / 10 coral**.

**Type.** Be Vietnam Pro only, weights 300–900. The signature is the **two-weight heading**: the key word in 800/900,
the rest in 300 Light, same size and same colour, one switch per heading. 700+400 is the forbidden pair.
Absolute floor: **14px/14pt** for any text anywhere; body is 16px; hero 70px/54pt; H1 40px/36pt; KPI 60pt+.
The bigger the text, the tighter the tracking (H1 −6.5%, body −2%, under 20px 0 to −2%).

**Spacing and layout.** Web: 1440px design viewport, 1200px max content width, 120px desktop side margin,
12 columns / 24px gutters, sections 96–160px apart. Only these steps: 4, 8, 12, 16, 20, 24, 32, 48, 64, 96, 120, 160.
Interior padding starts at **20px** and never goes lower — in cards, buttons, text boxes and table cells alike.
Slides: 960×540pt, 48pt side margins, title baseline at y=64pt, content from y=150pt, 8pt baseline steps.
Header is 64–72px, white, logo left, coral "Log in" text link plus one coral CTA right.

**Backgrounds.** White or off-white by default; whole-section pastels for rhythm; Deep Navy for one dark section
per deck or page. Photography is the only imagery — full-bleed heroes and radius-20 crops. Permitted background
graphic: a *very* discreet 45° light band on pastel sections (4–6% lighter). No waves, blobs, dot patterns, gradient
mesh or decorative lines. One oversized transparent number (e.g. "360°" at 40% white over a photo) is allowed as a
front-page graphic — once per deck.

**Corners.** Cards, images and section boxes 20px. Buttons fully rounded — minimum 25px, or half the button height.
Pills and chips at half height. Play buttons and small icon plates ~10px, including the triangle's own tips.
Icon circles are circles. Table cells and chart plots are the one exception at 0.

**Cards.** White or off-white, radius 20, 1px `#E9E9EC` border when on white, interior air 24–32px, and one shadow
only: `0 4px 24px rgba(12,14,57,0.06)`. On slides: no shadow, or 3pt blur at 10% opacity with no offset. Content
order inside a card: image (radius on top corners), 24–32px of air, H3 in 600, body in 300 Muted.
A second card pattern exists: the **dashed section frame** — 1px dashed `#E2E2E2`, radius 20, `#F8F8FA` fill, with a
fully rounded coral pill straddling the top edge. Max 1–2 per deck.

**Buttons and states.** Primary = coral fill, white label at 16px+ in 500–700. Secondary = 1.5px coral outline.
Tertiary = coral text, no underline. On photos = white 30% + blur. Minimum height 50px/40pt, padding 20×36px.
**Hover** darkens coral 8% to `#DD4E45` — nothing moves, nothing scales, the layout never shifts. **Press** reuses the
same darker coral. Cards may lift their shadow slightly on hover (`0 8px 32px rgba(12,14,57,0.10)`); they do not
translate. Focus is a navy border on form fields. No bounce, no scale, no springy motion anywhere.

**Animation.** Restrained: 180ms (320ms for larger moves) on `cubic-bezier(0.4,0,0.2,1)`, and only on colour, opacity
and shadow. Fades and colour transitions only — no slide-ins on load, no parallax, no bouncing, no looping motion.

**Transparency and blur.** Two sanctioned uses: the white-30%-plus-blur control over photography, and the
Deep Navy photo scrim `rgba(12,14,57,0)` → `rgba(12,14,57,0.65)`. Text is never below 20% opacity.
Protection for text on imagery is always a **gradient scrim**, never a solid capsule behind the words.

**Imagery vibe.** Real Nordic home interiors — daylight, warm neutrals (beige, greige, oak, white with a black
accent), calm styling, few objects; or agents and families in natural, unposed situations. Natural white balance,
soft contrast, no heavy filters, no black & white, no vignette, no grain. Always crop, never stretch: 16:9, 4:3, 1:1,
3:4, or full-bleed. Text on photo is white, in a calm area, on a scrim. Never generic office stock, handshake photos,
people pointing at screens, foreign logos, or AI images with visible errors. Customer logos appear in flat navy or
greyscale at equal optical height — never in their own colours.

**Charts.** Series order is fixed: coral → navy → green → gold → muted → blush; coral is the series that carries the
point. Positive/negative = green/coral. Sequential = blush → coral → navy. Horizontal gridlines only in `#E9E9EC`,
no frame, no vertical lines, zero baseline always visible on bar charts, direct labels instead of a legend at ≤4
series, axis labels at 14pt Muted. Forbidden: 3D, shadows, pattern fills, >6 series, pie charts with >4 segments.

---

## 3. Iconography

**One family: Phosphor Icons** (Regular or Fill, 256×256 viewBox) — geometric, rounded, even stroke weight.
Never mix in a second family. No local icon binaries were supplied, so the system loads Phosphor from CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/bold/style.css">
<i class="ph ph-camera"></i>
```

This is the icon set the guideline names, not a substitution — but it is loaded from a CDN rather than from EFKT's
own asset store. Use the `Icon` component so sizes and tones stay legal.

- **Colour:** one layer, one colour. Coral when the icon carries content, navy when it supports, white on photos.
- **Size:** 20px inline/nav, 24px UI, 40px feature icons; 24–32pt on slides.
- **Never:** multicoloured icons, pastel plates behind icons, emoji, Unicode characters used as icons, two families mixed.
- The one recurring "icon" that is *not* Phosphor: the **chevron/arrow-mark from the logo**, used only as part of the
  logo files in `assets/logo/` — never redrawn as decoration.
- Recurring glyph vocabulary in EFKT material: `arrow-up-right` (read more), `caret-down` (nav), `camera`, `blueprint`,
  `video-camera`, `cube`, `pen-nib`, `megaphone`, `chart-line-up`, `instagram-logo`, `facebook-logo`, `linkedin-logo`.

**Logo rule that overrides everything:** the logo is *inserted from file*. It is never drawn, typeset, generated,
approximated or rebuilt — see `components/core/Logo.prompt.md`. A missing logo is always better than a wrong one.

---

## 4. Index

**Root**
- `styles.css` — the single entry point consumers link (`@import` list only)
- `readme.md` — this file · `SKILL.md` — Agent Skills wrapper · `thumbnail.html` — homepage tile

**`tokens/`** — `fonts.css` (Be Vietnam Pro from Google Fonts), `colors.css`, `typography.css`, `spacing.css` (spacing, radii, shadow, motion, layout), `base.css` (element defaults, link colours, `.efkt-fat`/`.efkt-thin` helpers)

**`guidelines/`** — `EFKT-designprompt-v2.md` (the full source document, Danish) plus 25 specimen cards for the
Design System tab: Colors (primary, restricted, neutrals, soft accents, 60/30/10, contrast), Type (hero display,
two-weight signature, heading ladder, body/lead, micro floor, weights, KPI), Spacing (scale, radii, elevation,
padding in use), Brand (logo variants, mono variants, mark & favicons, clear zone, iconography, photography & scrim,
tagline & hashtag, chart series).

**`components/`** — 22 primitives, each with `.jsx`, `.d.ts`, `.prompt.md`, and one specimen card per folder:
| Group | Components |
|---|---|
| `core/` | Button, IconButton, Icon, Logo, SectionHeading (two-weight), Tag, Badge |
| `cards/` | Card, ImageCard (bento tile), StatCard (KPI), QuoteBlock, DashedSection, ServiceCard |
| `media/` | PlayButton, VideoThumb, CircleAction |
| `forms/` | Input, Select, Checkbox, Radio, Switch |
| `navigation/` | Tabs, NavDropdown |
| `feedback/` | Dialog, Toast, Tooltip |
| `data/` | BarChart, DataTable |

**`ui_kits/website/`** — click-through recreation of efkt.com: `index.html` (router), `Chrome.jsx`, `Home.jsx`,
`ContentCreation.jsx`, `Resources.jsx`, `ContactForm.jsx`, `README.md`.

**`slides/`** — 11 slide types at 1280×720 (= 960×540 pt): cover, agenda, section divider, content, split,
three cards, bento, KPI, quote, chart, closing. Components in `Slides.jsx`.

**`assets/`** — `logo/` (primary, white, mono navy, mono white, mark, mark mono, PNG at 1200/2400w, `kontrolark.png`
control sheet), `favicon/` (32/180/512 + `.ico`).

### Intentional additions
- **Icon** — a thin Phosphor wrapper, so sizes/tones stay inside the rules rather than being retyped per use.
- **DataTable, BarChart** — the guideline defines chart and table behaviour (§7) but ships no component; these encode it.
- **Standard set** (Input, Select, Checkbox, Radio, Switch, Tabs, Dialog, Toast, Tooltip) — no source library existed,
  so a conventional set was authored to EFKT's shapes. Nothing here contradicts the guideline; nothing was extracted
  from a real EFKT product.

### Qualified choices made outside the guideline (please confirm)
1. **Single-line form fields are fully rounded** (pill) so they pair with the buttons; multiline uses radius 20.
   The guideline does not specify field radius.
2. **Checkbox radius 8px** and **24px control size**; switch 52×30. Not specified.
3. **Toast/tooltip patterns** (dot-coded status, navy tooltip at 10px radius) are inferred from the shape language.
4. **Card hover** lifts the shadow to `0 8px 32px rgba(12,14,57,0.10)`. The guideline only fixes button hover.
5. **Photography and customer logos are hot-linked** from EFKT's own Framer CDN (`framerusercontent.com`) in the UI kit,
   slides and two specimen cards, because no image library was supplied. Replace with local files for offline use.
6. **Be Vietnam Pro loads from Google Fonts**, not from local binaries (none supplied). This matches the CVI's own
   instruction, but the deck-embedding workflow (§2.1) needs the real font installed locally.
