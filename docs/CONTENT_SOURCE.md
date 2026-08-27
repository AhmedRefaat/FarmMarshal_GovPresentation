# Content source

Where every piece of content in this deck came from, so a reviewer can trace it
and a successor can regenerate it.

---

## 1. Written content

The deck's argument, slide sequence and speaker lines derive from
`Specs/Ministerial_Presentation_Proposal.md` in the CropExpert workspace, which
is the strategy document behind this build. Supporting material:

| Source | Contributed |
|---|---|
| `Specs/Ministerial_Presentation_Proposal.md` | Slide sequence, three-ministry framing, the ask, delivery discipline |
| `Specs/KSA drone companies and agriculture landscape report.md` | Market and regulatory context |
| `Specs/Saudi Agricultural Platform Economic Case.md` | Economic framing (figures **not** carried over — see below) |
| `Specs/FarmMarshal_Video_Script_v4.md` | Concept-film narrative, title-plate wording |
| `Specs/video_handoff.md` | Image-generation consistency system reused in `IMAGE_GENERATION_PROMPTS.md` |
| `Admin/Meetings/MOM-12-Aug.md`, `MOM-26-Jul-26.md` | Partner structure, sponsor's role |

**Figures were not carried across uncritically.** The headline economic numbers
in the source material could not be sourced and are recorded as blocking in
`docs/CONTENT_VERIFICATION.md`. The deck uses a narrower, defensible fallback.

## 2. Video

`assets/video/` holds 12 clips (~2.2–2.6 MB each) produced for the concept film
and reused as slide backgrounds and inline illustrations:

`hero-aerial`, `drone-takeoff`, `inspection-flight`, `water-measurement`,
`solar-array`, `greenhouse-robot`, `expert-diagnose`, `evidence-chain`,
`cost-of-not-knowing`, `ai-detection`, `evidence-recorded`, `expert-network`

**`concept-film.mp4` is deliberately absent.** The assembled film does not exist
yet. `js/demo.js` detects the missing file and substitutes the title plate with
an explanatory caption. Drop the final cut at `assets/video/concept-film.mp4`
and rebuild.

## 3. Images

`assets/images/approved/` — generated imagery, reviewed and approved:

`disease-detection`, `drip-irrigation`, `solar-panels`, `expert-field`,
`farm-aerial`, `worker-drone`, `drone-ground`, `irrigation-line`, `desert-farm`,
`workflow-chain`, `title-plate.png`

Generation prompts and the consistency system are in
`docs/IMAGE_GENERATION_PROMPTS.md` so any image can be regenerated to match.

**These are illustrations, not evidence.** They depict the concept. They are not
photographs of a deployed system, and nothing in the deck claims they are. If a
minister asks whether these are real deployments, the answer is no — they are
concept imagery, and the pilot is what produces real imagery. Do not blur this.

## 4. Application screenshots

`assets/screenshots/original/` — `app-01-hero` … `app-08-overview`, plus
`ui-overlay`, `dashboard-concept`, `case-detail-concept`.

These represent the product interface. Anything named `*-concept` is a design
mock rather than a running build; keep that distinction when describing them.
See `docs/SCREENSHOT_GUIDE.md` for capture and replacement.

## 5. Fonts

- **IBM Plex Sans Arabic** — Arabic deck. Chosen because it is a genuine Arabic
  type design with matching Latin, not a Latin face with bolted-on Arabic.
- **Inter** — English deck.

Both self-hosted from `@fontsource` into `assets/fonts/files/` (12 woff2 faces)
by `npm run vendor`. **No font CDN is used anywhere**, because ministry networks
block external domains and a captive portal would leave the deck in a fallback
face mid-presentation.

Both are SIL Open Font License 1.1.

## 6. reveal.js

Version 5.2.1, vendored into `vendor/reveal/` with the notes, zoom, search,
highlight and markdown plugins. MIT licensed. `vendor/VENDOR_MANIFEST.json`
records the version.

Vendored rather than CDN-loaded for the same reason as the fonts, and so the
deck runs from `file://` with no network at all.

## 7. Regenerating

```powershell
npm run vendor          # reveal.js + fonts
npm run import-assets   # copy source media from the CropExpert workspace
npm run optimize        # sharp — resize and recompress images
npm run validate        # slide parity, asset existence, no remote resources
```

`scripts/import-source-assets.ps1` matches source filenames by substring because
several contain Unicode punctuation (`·`, `—`, `…`) and status markers that make
exact-path matching brittle.
