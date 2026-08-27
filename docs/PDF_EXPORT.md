# PDF export

The PDF is the **leave-behind and the last-resort backup**. Print it and bring
it, even when the laptop is working.

---

## 1. Export

reveal.js has a built-in print mode. Chrome or Edge only — Firefox and Safari
paginate reveal decks incorrectly.

1. Open the deck with `?print-pdf` appended, **before** the `#` fragment:

   ```
   file:///…/dist-offline/presentation-en.html?print-pdf
   file:///…/dist-offline/presentation-ar.html?print-pdf
   ```

2. `Ctrl+P`
3. Destination: **Save as PDF**
4. Layout: **Landscape**
5. Margins: **None**
6. **Background graphics: ON** — without this you get white slides with
   invisible text
7. Paper size: A4 or Letter, whichever the office prints
8. Save

Export both languages separately. They are separate documents.

> **The slide selection applies to the PDF.** If a selection is saved in this
> browser, the export contains only those slides. That is usually what you want
> — a handout matching what was shown — but it is a quiet way to hand over an
> incomplete document. Check the landing page first, or export the full deck
> explicitly:
>
> ```
> file:///…/presentation-en.html?print-pdf&slides=all
> ```

> If the deck is hosted behind the access gate, `?print-pdf` still redirects to
> login in a fresh browser session. Sign in first, or export from the offline
> build — which is simpler and is what `dist-offline/` is for.

## 2. What print mode changes

`css/print.css` and `js/presentation.js` together:

- Invert to a **light ground** — dark slides consume toner and read badly on paper
- Hide video, the presenter timer, navigation controls, and the progress bar
- **Keep the classification marking.** A confidential deck photocopied around a
  ministry is exactly the artefact that most needs it
- Expand the chain and card components so nothing depends on a hover or an
  animation state

Verified in browser: print media yields a white ground, controls and progress
`display: none`, all `<video>` hidden, classification bar present with the
correct text.

## 3. Check the output before printing 30 copies

- [ ] Slide count matches the deck (30 content slides, plus reveal's wrapper page)
- [ ] No slide is clipped at the bottom
- [ ] Arabic PDF reads right-to-left and the glyphs are joined correctly — **check this specifically**, PDF generators mishandle Arabic shaping more often than they mishandle Latin
- [ ] Tables are readable, not overlapping
- [ ] Classification marking present on the output
- [ ] Images are not washed out on the light ground

## 4. Speaker notes are not in the PDF

Intentional. The notes contain frank guidance about the audience, and this file
is a handout.

To produce a notes copy for yourself only, use reveal's speaker view (`S`) and
print from that window — then **do not hand it to anyone**.

## 5. Before it leaves the room

Read `docs/SECURITY_LIMITATIONS.md` §5. A PDF is trivially forwarded and
cannot be recalled. Confirm it contains no unverified figures — see
`docs/CONTENT_VERIFICATION.md`, which currently lists two **blocking** items.
