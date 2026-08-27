# Screenshot guide

How to capture and replace the application screenshots used on the demo slides.

---

## Current inventory

`assets/screenshots/original/`

| File | Shows |
|---|---|
| `app-01-hero` … `app-08-overview` | Mobile application flow |
| `ui-overlay` | Detection overlay on captured imagery |
| `dashboard-concept` | Review dashboard — **design mock** |
| `case-detail-concept` | Case detail view — **design mock** |

Anything suffixed `-concept` is a design mock, not a running build. Keep that
distinction. If asked directly whether the dashboard exists, say it is a design
for the review layer and the pilot is what builds it.

## Capture settings

**Mobile** — device or emulator at 1080×2340 (or 1170×2532), 3x scale factor.
Portrait. Status bar cleaned: full signal, full battery, no notifications, a
neutral time (09:41 or 10:00). Light or dark mode consistently across the whole
set — do not mix.

**Desktop** — 1920×1080, browser chrome excluded, 2x device pixel ratio.

Capture at full resolution and let `npm run optimize` downscale. Never upscale a
small capture; it looks exactly like what it is.

## Content rules

Screenshots go in front of ministers. Before capturing, ensure the app shows:

- **No real farm names, owner names, or company names** — use plausible generic
  labels
- **No GPS coordinates or map positions that locate a real holding**
- **No personal names, phone numbers, or email addresses**
- **No real commercial figures**
- Arabic UI screenshots for the Arabic deck where the interface supports it —
  an English-only interface on the Arabic deck undercuts the localisation claim
- Realistic, non-extreme data — an empty state or an implausible number both
  invite the wrong question

Screenshots are the most likely place for real data to leak, because they are
captured from a working system rather than authored. Check every one.

## Replacing a screenshot

1. Capture at full resolution
2. Save into `assets/screenshots/original/` using the **same filename**
3. Run `npm run optimize`
4. Run `npm run validate` — it fails if a referenced asset is missing
5. Check both decks in a browser; the phone-row layout crops to a fixed aspect
   and a differently proportioned capture will crop unexpectedly

Keeping filenames stable means no HTML changes. `scripts/optimize-assets.mjs`
deliberately does not edit HTML.

## Presentation in the deck

Mobile screenshots appear in `.fm-phone-row` — a row of device-framed images
sized so three fit at 1920×1080 without crowding. Desktop screenshots use
`.fm-figure` with a caption.

Every image needs an `alt` attribute. `npm run validate` fails without one.
Write what the screenshot *shows*, not "screenshot".
