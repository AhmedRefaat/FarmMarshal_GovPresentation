# Offline presentation

**This is the intended way to present.** Ministry rooms have unreliable guest
Wi-Fi, captive portals, and blocked domains. Do not plan to present from a URL.

---

## 1. Build the package

```powershell
npm install
npm run vendor      # only needed once, or after upgrading reveal.js
npm run build
```

Produces:

- `dist-offline/` — the complete self-contained site (~60 MB)
- `FarmMarshal-Offline.zip` — the same, zipped for transfer

`npm run build` deliberately **excludes `config/users.json`** and writes
`config/offline.config.js`, which sets `window.FM_OFFLINE = true`.

Verify before you trust it:

```powershell
npm run verify:offline
```

Exit code 0 means: both decks present, reveal.js vendored, fonts present
including the Arabic subset, all CSS and JS modules present, no credential
files, and no Git LFS pointer files masquerading as videos.

## 2. Copy to the stick

Copy the **whole `dist-offline` folder**, not its contents. Then open
`index.html` in Chrome or Edge.

No web server. No network. No install.

## 3. What changes offline

The access gate **switches itself off**, deliberately:

- `crypto.subtle` is unavailable or restricted on `file://` in several browsers,
  so the passphrase could not be verified even if it were required.
- Physical control of the USB stick is the actual access control.
- A gate that silently failed *open* would be worse than one that announces it
  is off. `js/presentation.js` logs the reason to the console, and
  `index.html` states it in the footer.

Confirmed behaviour offline: `FM.isOffline()` → `true`,
`FMAuth.disabledReason()` → `'offline-build'`, decks open directly with no login
redirect.

Everything else is identical: both languages, all videos, all fonts, the
presenter timer, speaker notes, keyboard shortcuts.

## 4. Rehearse on the presenting laptop

Not on your laptop. **The one that will be in the room.**

- [ ] Stick mounts and `index.html` opens
- [ ] Fonts render — Arabic headings must not look like plain system sans-serif
- [ ] Video on `#video` plays with sound at room volume
- [ ] Projector resolution handled — the deck is authored at 1920×1080 and scales, but check 4:3 if the room is old
- [ ] `T` shows the presenter timer; `L` switches language mid-deck and keeps your place
- [ ] `S` opens speaker view — **confirm it opens on the correct screen**, and remember the notes are frank
- [ ] Screen mirroring vs extended display decided in advance
- [ ] Laptop sleep, screensaver, and notifications disabled
- [ ] A second copy of the stick exists, in a different pocket

## 5. The concept film

`assets/video/concept-film.mp4` is **not in this build**. The `#video` slide
detects the missing file and shows the title plate with "Video file not present
in this build."

That fallback is verified working, but it is not what you want on screen in
front of a minister. Place the final cut at `assets/video/concept-film.mp4`,
re-run `npm run build`, and confirm playback on the presenting laptop.

Keep the file under ~200 MB. If it is larger, the stick still works — but the
hosted build will not, and you will want both.

## 6. If something fails in the room

| Symptom | Do this |
|---|---|
| Video will not play | Press `→`. The deck continues without it. Describe the film in one sentence and move on. |
| Fonts look wrong | Irrelevant to the argument. Continue. |
| Browser will not open the stick | Copy the folder to the desktop and open it from there. |
| Laptop fails entirely | Present from the printed PDF. See `docs/PDF_EXPORT.md`. |

Have the PDF printed and in the room. It is the only backup that does not
depend on a computer.
