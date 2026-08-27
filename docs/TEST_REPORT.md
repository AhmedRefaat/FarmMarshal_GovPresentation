# Test report

Every result below was produced by actually running the command or driving a
real browser. Nothing here is asserted from reading code.

**Environment:** Windows, PowerShell · Node v24.12.0 · npm 11.6.2 ·
git 2.39.1.windows.1 · Chromium (Playwright-driven, headful)

---

## 1. Command-line pipeline

Run in the final state of the repository, after cleanup.

| Command | Exit | Result |
|---|---|---|
| `npm install` | 0 | reveal.js 5.2.1, both @fontsource packages, sharp installed |
| `node scripts/vendor-deps.mjs` | 0 | `reveal.js@5.2.1 -> vendor/reveal/`, 12 font faces written |
| `pwsh -File scripts/import-source-assets.ps1` | 0 | `Copied 35 asset(s).` — 0 missing |
| `node scripts/optimize-assets.mjs` | 0 | 22 files, **24.41 MB → 3.88 MB** |
| `node scripts/validate-content.mjs` | 0 | `Validation passed. 20 manifest slides present in both decks.` — 4 warnings, all intentional |
| `node scripts/test-auth-parity.mjs` | 0 | 5/5 PASS |
| `node scripts/verify-build.mjs` | 0 | `Build verified.` |
| `node scripts/build-offline.mjs` | 0 | `Built dist-offline/ (63.6 MB)`, `Packaged FarmMarshal-Offline.zip` |
| `node scripts/verify-build.mjs dist-offline` | 0 | `Build verified.` |

### The four validator warnings are deliberate

```
- presentation-en.html: concept film not yet present at assets/video/concept-film.mp4
- presentation-ar.html: concept film not yet present at assets/video/concept-film.mp4
- UNVERIFIED CLAIM STILL BLOCKING: SAR 9.2bn date production value; SAR 1.5bn annual losses (16–17%)
- UNVERIFIED CLAIM STILL BLOCKING: Drone covers five acres per hour
```

The first two: the assembled film does not exist yet; the fallback is tested
below. The last two: tracked in `docs/CONTENT_VERIFICATION.md` and **not
displayed in the deck**. The validator keeps warning so they cannot be
forgotten.

### Auth derivation parity — 5/5

```
PASS  mewa: browser derivation matches generated hash
PASS  moi: browser derivation matches generated hash
PASS  mod: browser derivation matches generated hash
PASS  incorrect passphrase is rejected
PASS  correct passphrase resolves to mewa
```

This test loads the **real shipped `js/auth.js`** into a window stub backed by
`node:crypto.webcrypto` and compares its PBKDF2-SHA256 output against
`pbkdf2Sync`. It generates its own throwaway credentials, so it runs on a clean
checkout and in CI.

### Credential leak check

`Test-Path dist-offline/config/users.json` → **False**. Confirmed after a build.

---

## 2. Browser tests

Driven against a real Chromium instance, over both `http://127.0.0.1:8080` and
`file://`.

### Access gate (HTTP)

| Test | Result |
|---|---|
| `index.html` renders, footer reports "Access gate active." | Pass |
| English selection → `login.html?next=presentation-en.html`, English preselected | Pass |
| Wrong passphrase → "That passphrase was not recognised.", field cleared, button restored | Pass |
| Correct passphrase → deck opens at `#/title` | Pass |
| Direct navigation to deck in a fresh session → redirected to login | Pass |

### Offline `file://` mode

| Probe | Value |
|---|---|
| `FM.isOffline()` | `true` |
| `FMAuth.isEnabled()` | `false` |
| `FMAuth.disabledReason()` | `'offline-build'` |
| Opened deck directly without login redirect | `true` |
| Arabic heading font is IBM Plex | `true` |
| `Reveal.VERSION` | `5.2.1` |

### Slide overflow — zero across every configuration tested

Measured `scrollHeight - clientHeight` on each of the 30 slides.

| Viewport | Deck | Overflowing slides |
|---|---|---|
| 1920×1080 | English | 0 / 30 |
| 1920×1080 | Arabic | 0 / 30 |
| 1440×1080 (4:3) | English | 0 / 30 |
| 1024×768 | English | 0 / 30 |
| 1280×720 | English | 0 / 30 |

### Video fallback — 6/6 deterministic

With `concept-film.mp4` absent, over `file://`, three consecutive loads per
language:

| | Poster shown | Image | Caption |
|---|---|---|---|
| English ×3 | yes | `assets/images/optimized/title-plate.jpg` | "Video file not present in this build." |
| Arabic ×3 | yes | `assets/images/optimized/title-plate.jpg` | «ملف الفيديو غير متوفر في هذه النسخة.» |

The raw `<video>` element is removed in all six runs.

### Text contrast — 0 failures across 60 slide-views

Every text element on every slide, in both decks, measured as a WCAG contrast
ratio of computed `color` against its effective (first opaque ancestor)
background. Thresholds: 4.5:1 normal text, 3:1 large text.

| Deck | Slides checked | Slides with a failing element |
|---|---|---|
| English | 30 | **0** |
| Arabic | 30 | **0** |

This test was added after defect **D6** below, which the earlier round of
testing completely missed.

### Slide selection (deck builder) — 17 checks, all passing

Run over `file://` in Chromium, which is the USB scenario.

| Check | Result |
|---|---|
| `config.html` renders 30 rows, 6 presets, appendix grouped | Pass |
| `localStorage` usable over `file://` | Pass |
| Preset counts: full / main / short / mewa / moi / mod | 30 / 19 / 8 / 15 / 12 / 12 |
| Deck loads exactly the selected ids, in deck order | Pass |
| Slide counter reflects the selection (`1 / 12`, not `1 / 30`) | Pass |
| Selection notice appears on load, in the right language | Pass (EN + AR) |
| `L` language switch carries the selection | Pass — 12 slides both sides |
| Saved selection applies with no URL parameter | Pass |
| `?slides=all` overrides a saved selection without deleting it | Pass |
| Unknown slide keys fall back to the full deck | Pass — 30, not blank |
| Partial appendix keeps the stack with only chosen children | Pass — 4 slides, 2 children |
| Appendix "toggle all" both directions | Pass — 23 then 12 |
| Reset clears storage, links and checkboxes | Pass |
| Landing page reports the active selection | Pass |
| `?print-pdf` honours the selection | Pass — 8 sections |
| `?print-pdf&slides=all` forces the full deck | Pass |
| Notice suppressed in print mode; classification still present | Pass |
| Whole feature works from `dist-offline/` | Pass — AR, correct font, 8 slides |

Two validation guards were added and **proven to fail** before being trusted: a
stale `config/slide-index.js` (exit 1) and a preset naming a slide that does not
exist (exit 1, both offending presets named).

### RTL ordering — 14/14 horizontal containers correct

For every flex-row and multi-column grid on every Arabic slide, checked that the
**first DOM child is the rightmost** — i.e. sequences read right-to-left.

| Metric | Value |
|---|---|
| Horizontal containers found across 30 slides | 14 |
| Correct RTL order | **14** |
| Wrong (reading left-to-right) | **0** |

Also audited `theme.css`, `responsive.css` and `english.css` for physical
direction properties (`margin-left`, `padding-right`, `border-left`,
`text-align: left|right`): **0 matches** — the stylesheets use logical
properties throughout, so they mirror automatically.

Added after defect **D7**.

### Images after repointing to optimized assets

Walked all 30 slides in both decks: **0 broken `<img>`** (`complete && naturalWidth === 0`), **0 HTTP responses ≥ 400** for any image. Video poster resolves to `assets/images/optimized/title-plate.jpg`.

### Presenter controls

| Test | Result |
|---|---|
| `T` toggles the timer | Pass — visible, counting (`00:01`) |
| `L` from `presentation-en.html#/governance` | Pass — → `presentation-ar.html#/governance`, slide 13/30, same slide |
| Per-slide `aria-label` injected from heading on `slidechanged` | Pass |

### Arabic deck

| Test | Result |
|---|---|
| `dir="rtl"`, `.reveal.rtl` applied | Pass |
| Headings, paragraphs, list items, table cells all compute to `"IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif` | Pass — 4/4 probes |
| Slide counter reads `11 / 30`, `direction: ltr`, positioned left | Pass |
| Tables and navigation controls mirrored | Pass |
| No uppercase transform, letter-spacing normal | Pass |
| Known source typos («ينبغى», «الروية») absent | Pass — search returned nothing |

### Print / PDF mode

Loaded with `?print-pdf` under emulated print media:

| Property | Value |
|---|---|
| Body background | `rgb(255, 255, 255)` |
| `.controls` display | `none` |
| `.progress` display | `none` |
| All `<video>` hidden | `true` |
| Classification bar present | `true` — "Confidential — for ministerial review" |

---

## 3. Defects found and fixed

All were found by inspecting the running application, not by reading code.

### D7 · Arabic sequences ran left-to-right — the deck read as a translation

**Also reported by the user, not found by my testing.**

`css/arabic.css` contained:

```css
/* Chain/pipeline flows right-to-left in Arabic. */
[dir='rtl'] .fm-chain { flex-direction: row-reverse; }
```

The comment states the intent correctly, but the rule defeats it. In an element
whose computed `direction` is `rtl`, a normal `flex-direction: row` **already**
lays children out right-to-left. Adding `row-reverse` reverses a second time,
restoring English order.

Effect: on every process-chain slide the sequence began on the **left**, so
Inspect → Detect → Diagnose → Recommend read backwards to an Arabic reader, and
the highlighted "current step" markers pointed the wrong way. The deck looked
like English content with Arabic words dropped into it — exactly the impression
that must not be given to this audience.

Affected `#evidence-chain`, `#demo-open`, `#demo-expert`, `#demo-close`.

**Why my earlier testing missed it.** I verified that `dir="rtl"` was applied,
that `.reveal.rtl` was present, and that tables and navigation controls mirrored
— then generalised from that to "RTL is correct". I never checked the *geometric
order* of items inside a component against their DOM order, which is the only
thing that would have caught a double-reversal.

**Fixed** by deleting the rule and letting `direction: rtl` do the work.
**Verified:** the chain now reads فحص → اكتشاف → تشخيص → توصية right-to-left,
and the full RTL sweep above passes 14/14.

**Regression guard added:** `npm run validate` now fails if `arabic.css`
contains any `*-reverse` flex-direction.

### D6 · Light text on a white body — the deck was unreadable on most slides

**The most serious defect found, and it was reported by the user, not by my
testing.**

reveal.js 5.x applies the class `.reveal-viewport` to `<body>` and its own
stylesheet sets `background-color: #fff` on that class. At specificity (0,1,0) it
overrides `html, body { background: var(--fm-deep) }` at (0,0,1). The result:
the body rendered white while all body copy kept its cream/sand colour
(`#e7dcc6`, `#f6f3ec`), giving a contrast ratio near 1.1:1 — effectively
invisible.

Every slide **without** its own `data-background-image` or
`data-background-video` was affected, which is most of the deck: the reframe
statement, the layers table, the evidence chain, the ministry tracks, the ask.

**Why my earlier testing missed it.** The overflow sweeps measured geometry, not
colour. The accessibility snapshots return text, not rendered pixels. And the
only slides I actually screenshotted — the title slides — carry a background
video that covered the white body. I reported "renders correctly" on the basis of
evidence that could not have detected this.

**Fixed** with `body.reveal-viewport` (0,1,1) in `css/theme.css`.
**Verified:** body background `rgb(7, 13, 10)`, and the new contrast sweep above
passes 60/60 slide-views.

**Regression guard added:** `npm run validate` now fails if
`body.reveal-viewport` is absent from `theme.css`, because a future reveal.js
upgrade could silently reintroduce this.

### D1 · Footnote overlapped body copy

`.fm-scrim > * { position: relative }` beat `.fm-footnote { position: absolute }`
— equal specificity (0,1,0), later source order. Fixed with
`.reveal .slides section .fm-footnote` (0,2,1) plus `margin: 0`.
**Verified:** `position: absolute`, `overlapsLead: false`, 18px from slide bottom.

### D2 · Arabic webfont silently discarded

reveal.css ships `.reveal.rtl .slides, .reveal.rtl .slides h1…h6 { font-family:
sans-serif }` at (0,2,2), overriding `[dir='rtl'] .reveal h2` at (0,2,1). **Every
Arabic heading and table cell was rendering in generic system sans-serif** — and
it looked plausible, so it would not have been caught by glancing at it. Fixed by
mirroring reveal's own selector prefixed with `[dir='rtl']`, with a `.fm-latin`
exception. **Verified:** 4/4 probes return the IBM Plex stack.

### D3 · RTL slide counter reversed

Bidi reordering displayed "11 / 30" as "30 / 11". Fixed with `direction: ltr;
unicode-bidi: isolate`. **Verified:** reads `11 / 30`.

### D4 · Classification marking missing from PDF export

`setupClassification()` returned early in print mode, so exported PDFs carried no
confidentiality marking — the one artefact most likely to be photocopied and
circulated. Fixed by injecting it in print mode too. **Verified:** present with
correct text under print media.

### D5 · Video fallback race condition

`guardMedia()` only attached `error` listeners. Over `file://` a missing video
fails **immediately**, often before `demo.js` executes, so the listener was
attached too late and the browser's own fallback text appeared instead of the
poster. Observed intermittently — the English deck failed while the Arabic deck
passed on the same build. Fixed by also checking `video.error` and
`networkState === NETWORK_NO_SOURCE` synchronously at init, plus `stalled` /
`suspend` handlers. **Verified:** 6/6 deterministic across both languages.

### Also corrected

- **`scripts/test-auth-parity.mjs` depended on gitignored `config/users.json`**,
  so it failed on a clean checkout and could never have run in CI. Rewritten to
  generate its own fixture credentials. Now wired into `npm test` and the deploy
  workflow.
- **`.gitignore` excluded the optimized asset directories** that the decks now
  reference — a fresh clone or CI deploy would have rendered with broken images.
  Now committed, with the reason documented in the file.

---

## 4. Not tested — do not assume these work

Stated explicitly so nobody infers coverage that does not exist.

| Item | Why not | Who must do it |
|---|---|---|
| **PDF export end-to-end** | `Page.printToPDF` is unavailable in this browser context. Print *styling* was verified; the actual exported file was not produced. | Export manually per `docs/PDF_EXPORT.md` and check the Arabic PDF's glyph shaping |
| **The concept film** | `concept-film.mp4` does not exist. Only the fallback path is tested. | Re-run `npm run build` and test playback once the film exists |
| **Real projector hardware** | No projector available | Rehearse on the actual presenting laptop and projector |
| **`forced-colors: active`** | Not exercised | Test if any attendee uses high-contrast mode |
| **Visual regression** | No pixel baselines exist. D6 shows that structural and geometric checks do not catch rendering faults | Screenshot key slides after any CSS or reveal.js change |
| **Deployed GitHub Pages site** | Workflow never run; no repository configured | Verify video, fonts and Arabic on the live URL before sharing any link |
| **Screen-reader pass** | `aria-label` injection and landmarks verified structurally; no assistive technology was driven | Run NVDA or VoiceOver if required |
| **Arabic linguistic quality** | Not a testable property | **Blocking** — native reviewer, `docs/ARABIC_LANGUAGE_REVIEW.md` |
| **Factual accuracy of content** | Not a testable property | **Blocking** — `docs/CONTENT_VERIFICATION.md`, 2 open items |

---

## 5. Reproducing this

```powershell
npm install
npm run vendor
npm run check      # validate + verify + test
npm run build
npm run verify:offline
```

All five exit 0 in the state recorded here.
