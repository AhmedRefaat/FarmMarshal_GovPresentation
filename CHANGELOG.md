# Changelog

## 1.0.0 — initial build

Complete bilingual ministerial presentation, runnable offline and deployable as
a static site.

### Added

- **Two decks, 30 slides each.** `presentation-en.html` (LTR) and
  `presentation-ar.html` (RTL) as independent peer documents, kept in step by a
  20-id shared manifest enforced by `npm run validate`. 19 top-level slides plus
  an 11-slide appendix stack. Speaker notes on every slide.
- **Offline-first.** reveal.js 5.2.1 and 12 font faces vendored into the repo.
  No CDN, no network, no build step. Runs from `file://`.
- **Access gate** — PBKDF2-SHA256 at 310,000 iterations, sessionStorage token,
  three identities. Disables itself offline, when no users are configured, or
  when `crypto.subtle` is unavailable, and announces when it is inactive.
- **Live verification register** rendered from config onto the appendix slide, so
  an unresolved claim cannot be silently left in the deck.
- **Presenter tooling** — timer (`T`/`R`), language switch preserving slide
  position (`L`), skip link, per-slide `aria-label`, classification bar.
- **Deck builder** (`config.html`) — choose which slides the presentation shows,
  slide by slide or from six presets (full, no-appendix, ten-minute cut, and one
  per ministry). The selection applies to both language decks and to PDF export,
  travels in the URL (`?slides=preset:moi`), and is announced on load and on the
  landing page so a trimmed deck is never mistaken for the full one.
  `config/slide-index.js` is generated from the decks by `npm run slide-index`
  and carries a fingerprint, so a saved selection is discarded rather than
  applied to the wrong slides if the decks change.
- **Scripts** — `vendor`, `import-assets`, `optimize`, `validate`, `test`,
  `verify`, `check`, `build`, `verify:offline`, `create-user`, `start`.
- **GitHub Pages workflow** with LFS disabled, optional credential secret,
  post-build assertion that no credential file was published.
- **Eleven documents** in `docs/`, including the security-limitations and
  content-verification registers.

### Fixed during build verification

Found by inspecting the running application, not by reading code. Full detail in
`docs/TEST_REPORT.md`.

- **Arabic sequences ran left-to-right.** `arabic.css` set
  `flex-direction: row-reverse` on the process chain, but `direction: rtl`
  already mirrors a flex row — so it double-reversed back to English order.
  Process steps began on the left on four slides, making the deck read as a
  translated English document rather than an Arabic one. Also caught by the
  user. `npm run validate` now rejects any `*-reverse` in `arabic.css`.
- **Light text on a white body — the deck was unreadable on most slides.**
  reveal.js puts `.reveal-viewport` on `<body>` and sets `background-color:#fff`
  on it, outranking a bare `body` selector. Cream body copy on white gave a
  contrast ratio near 1.1:1 on every slide without its own background image.
  Caught by the user, not by the build's own testing — the overflow sweeps
  measured geometry and the only slides screenshotted had background video
  covering the white. `npm run validate` now guards against it.
- **Arabic webfont silently discarded.** reveal.css's own `.reveal.rtl` rule
  (specificity 0,2,2) overrode the custom Arabic face, so every Arabic heading
  and table cell rendered in generic system sans-serif. Visually plausible, which
  is what made it dangerous.
- **RTL slide counter reversed** — "11 / 30" displayed as "30 / 11" through bidi
  reordering.
- **Footnote overlapped body copy** — a `position: relative` rule beat
  `position: absolute` on source order at equal specificity.
- **Classification marking missing from PDF exports** — suppressed in print mode,
  which is precisely the artefact most likely to be photocopied.
- **Video fallback race condition** — over `file://` a missing video errors
  before `demo.js` runs, so the error listener was attached too late and the
  browser's own fallback text appeared instead of the poster. Intermittent: one
  deck passed while the other failed on the same build.
- **`test-auth-parity.mjs` depended on a gitignored file**, so it could never
  have run in CI or on a clean checkout. Rewritten to be self-contained.
- **`.gitignore` excluded the optimized assets the decks reference** — a fresh
  clone would have rendered with broken images.

### Content decisions

- **Two claims withheld as unsourced** and not shown in the deck: the
  SAR 9.2bn / 1.5bn / 16–17% loss figures, and "five acres per hour". The
  defensible fallback (2017 Saudi post-harvest date-loss assessment, ~12.6%
  average damage) is used instead, with its narrower scope stated on the slide.
- **Vision 2030 logo omitted** — usage permission not held. Alignment is stated
  in words.
- **Regulatory route not asserted.** Speaker notes say "subject to confirmation
  with your teams" rather than naming an authority that has not confirmed scope.
- **No military framing.** MOD content is limited to airspace discipline and data
  sovereignty. No capability, weaponisation or conflict references.
- **No claim that drones outperform satellites** — positioned as complementary.
- **Images are concept illustrations**, never presented as photographs of a
  deployed system.

### Unresolved — decisions required

- **Product name.** "Farm Marshal" and "CropExpert" both appear in source
  material. The deck uses **Farm Marshal** / فارم مارشال throughout. This is a
  placeholder, not a verified decision.
- **Partner spelling.** "Al Sarrani" and "El Sarrani" both appear. The deck uses
  **Al Sarrani** / مجموعة السراني. Confirm against company registration.
- **`assets/video/concept-film.mp4` does not exist.** The deck shows a tested
  poster fallback. Drop the final cut in and re-run `npm run build`.
- **Arabic native-speaker sign-off** outstanding — blocking.
- **Pilot scope, funding amount and region** are bracketed placeholders in the
  ask and appendix tables.
