# Farm Marshal — Ministerial Presentation

Bilingual (Arabic / English) presentation for the Farm Marshal supervised pilot
proposal, built for a meeting with Saudi ministers of Environment, Water &
Agriculture; Interior; and Defense.

Runs offline from a USB stick with no server, no build step and no network.

---

## Quick start

```powershell
npm install
npm run vendor      # reveal.js + fonts into vendor/ and assets/fonts/
npm start           # http://127.0.0.1:8080
```

To produce the USB build:

```powershell
npm run build       # -> dist-offline/ and FarmMarshal-Offline.zip
```

Then open `dist-offline/index.html` directly in Chrome or Edge. No server.

## Read these before presenting

| Document | Why |
|---|---|
| **[docs/SPEAKER_GUIDE.md](docs/SPEAKER_GUIDE.md)** | Room dynamics, timing, the three asks, hard questions, what not to say |
| **[docs/CONTENT_VERIFICATION.md](docs/CONTENT_VERIFICATION.md)** | **Two blocking unverified claims.** Do not present them |
| **[docs/ARABIC_LANGUAGE_REVIEW.md](docs/ARABIC_LANGUAGE_REVIEW.md)** | **Native sign-off not yet done.** Blocking |
| **[docs/OFFLINE_PRESENTATION.md](docs/OFFLINE_PRESENTATION.md)** | How to present from the stick, and rehearsal checklist |
| **[docs/SECURITY_LIMITATIONS.md](docs/SECURITY_LIMITATIONS.md)** | **The login gate is not authentication.** Read before sending anyone a link |
| [docs/PDF_EXPORT.md](docs/PDF_EXPORT.md) | Leave-behind and last-resort backup |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Hosting, and why the default advice is not to |
| [docs/TEST_REPORT.md](docs/TEST_REPORT.md) | What was actually tested, and what was not |
| [docs/CONTENT_SOURCE.md](docs/CONTENT_SOURCE.md) | Where the content came from |
| [docs/IMAGE_GENERATION_PROMPTS.md](docs/IMAGE_GENERATION_PROMPTS.md) | Regenerating imagery consistently |
| [docs/SCREENSHOT_GUIDE.md](docs/SCREENSHOT_GUIDE.md) | Capturing and replacing app screenshots |

## Scripts

| Command | Does |
|---|---|
| `npm run vendor` | Download reveal.js and fonts into the repo |
| `npm run import-assets` | Copy source media from the CropExpert workspace |
| `npm run optimize` | Resize and recompress images with sharp |
| `npm run slide-index` | Regenerate `config/slide-index.js` from the two decks |
| `npm run validate` | Slide-id parity, assets exist, no remote resources, alt text, gitignore safety, slide index current |
| `npm test` | PBKDF2 parity between the Node generator and the browser verifier |
| `npm run verify` | Vendored deps, fonts, no credential files, no Git LFS pointers |
| `npm run check` | validate + verify + test |
| `npm run build` | Produce `dist-offline/` and the zip |
| `npm run verify:offline` | Run `verify` against `dist-offline/` |
| `npm run create-user` | Derive passphrase hashes into `config/auth.config.js` |
| `npm start` | Local static server on port 8080 |

## Choosing which slides to show

Open `config.html` (“Choose slides” on the landing page). Tick slides
individually or start from a preset — full deck, main deck without the appendix,
a ten-minute cut, or one of the three ministry-focused selections defined in
`presentation.config.js`.

The choice applies to **both** language decks and to PDF export. Unselected
slides are removed before reveal.js initialises, so the slide counter, arrow
navigation, overview and export all agree with what is on screen.

It is stored two ways:

- in this browser, so it survives closing the deck;
- in the link — `presentation-en.html?slides=preset:moi` — which is what to send
  if someone else is driving the screen, or to carry the choice onto a USB copy.

A trimmed deck shows a brief notice on load, and the landing page states the
current selection, so a cut-down deck is never mistaken for the full one. To
force everything regardless of what is saved, open the deck with `?slides=all`.

Appendix slides have no ids of their own, so they are keyed by position
(`appendix/1`…). `config/slide-index.js` carries a fingerprint of the deck
structure; if the decks change, a saved selection is discarded rather than
applied to the wrong slides.

## Keyboard

`→` `←` next / previous · `↓` `↑` appendix stack · `T` timer · `R` restart timer
· `L` switch language keeping your slide · `S` speaker view · `Esc` overview ·
`F` fullscreen · `B` black screen

## Layout

```
config/     presentation.config.js (slides, presets, features, verification register)
            auth.config.js (generated; users: [] by default)
            slide-index.js (generated; every slide, for the deck builder)
css/        theme, english, arabic, print, responsive, login, deck-builder
js/         config, auth, language, slides, presentation, demo
assets/     video, images (approved + optimized), screenshots, fonts, icons
vendor/     reveal.js 5.2.1, vendored
scripts/    vendor, import, optimize, validate, create-user, build, verify, test,
            generate-slide-index
docs/       the documents listed above
```

`presentation-en.html` and `presentation-ar.html` are **separate documents**, not
one deck with swapped strings — RTL is a layout concern. They are kept in step by
a shared slide-id manifest in `config/presentation.config.js`, enforced by
`npm run validate`.

## Design decisions worth knowing

- **Config is `.js`, not `.json`.** `fetch()` of a local file is blocked under
  the `file://` origin policy, so config sets globals instead.
- **Everything is vendored.** No CDN for reveal.js or fonts. Ministry networks
  block external domains, and a captive portal must not be able to change what
  is on screen.
- **The access gate disables itself offline** and says so. See
  `docs/SECURITY_LIMITATIONS.md`.
- **Git LFS is deliberately not used.** GitHub Pages serves LFS *pointer files*,
  which would silently break video on a live site. `npm run verify` fails if a
  pointer file appears.

## Known open items

- `assets/video/concept-film.mp4` is absent; the deck shows a tested poster fallback
- Two blocking unverified claims — `docs/CONTENT_VERIFICATION.md`
- Arabic native review not signed off
- Brand name (**Farm Marshal** vs CropExpert) and partner spelling (**Al Sarrani**
  vs El Sarrani) are placeholder decisions — see `CHANGELOG.md`
