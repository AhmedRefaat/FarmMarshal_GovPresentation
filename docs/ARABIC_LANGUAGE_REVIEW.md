# Arabic language review

The Arabic deck (`presentation-ar.html`) is a **peer document**, not a
translation artefact. It is written to be presented as-is to Arabic speakers. It
has not been signed off by a native reviewer. **It must be before the meeting.**

---

## 1. Status

| Item | Status |
|---|---|
| Arabic deck written as an independent RTL document | Done |
| Slide-id parity with the English deck enforced by `npm run validate` | Done — 20/20 |
| RTL layout, mirrored controls, mirrored tables | Done — verified in browser |
| Arabic webfont actually applied to headings and table cells | Done — verified in browser (see §4) |
| Arabic-Indic numerals in tables | Done |
| Sequences and process chains flow right-to-left | Done — 14/14 horizontal containers verified (was broken; see `docs/TEST_REPORT.md` D7) |
| Latin company names isolated in `.fm-latin` spans | Done |
| Known source-document typos excluded | Done — verified by search |
| **Native-speaker sign-off** | **NOT DONE — blocking** |
| **Terminology sign-off with the Saudi partner** | **NOT DONE — blocking** |

## 2. Typos inherited from source material — do not reintroduce

These appear in earlier drafts under `Specs/`. They were checked for and are
**not present** in `presentation-ar.html`. If you edit the deck by copying from
those source files, check again.

| Wrong | Correct | Note |
|---|---|---|
| ينبغى | ينبغي | Final yāʾ, not alif maqṣūra |
| الروية | الرؤية | "Vision" — requires the hamza; the wrong form reads as "the watching" |

Re-run the check after any edit:

```powershell
Select-String -Path presentation-ar.html -Pattern 'ينبغى|الروية' -Encoding utf8
```

Empty output is a pass.

## 3. What the native reviewer must check

Not spelling alone. In order of consequence:

1. **Register.** The deck addresses three ministers. The Arabic must be formal
   ministerial register — neither journalistic nor casual. This is the most
   likely failure, and the least likely to be caught by a non-native writer.
2. **Ministry names and titles.** Exact official forms of وزارة البيئة والمياه
   والزراعة, وزارة الداخلية, وزارة الدفاع, and any authority named on the
   governance slides. Getting a ministry's own name subtly wrong in front of its
   minister is unrecoverable.
3. **Partner name.** مجموعة السراني — confirm the legal Arabic form and its
   Latin transliteration. See §5.
4. **Technical terminology.** Consistency for: drone / مسيّرة, evidence / دليل,
   chain of custody, supervised pilot / تجربة تشغيلية خاضعة للإشراف,
   remote-pilot certification. Pick one term per concept and use it throughout.
5. **The ask.** The wording on `#the-ask` must be unambiguous about what is
   being requested and what is not. Ambiguity here converts a decision into a
   follow-up meeting.
6. **Tone on `#not-asking`.** This slide exists to remove a suspicion. If it
   reads as defensive or presumptuous in Arabic it does the opposite of its job.
7. **Numerals.** Arabic-Indic numerals are used in tables. Confirm this matches
   the audience's expectation; Saudi government documents use both conventions
   and the partner will know which is expected here.
8. **Direction of every sequence.** Process chains, step markers, ordered lists
   and any "from → to" construction must begin on the **right**. A left-starting
   sequence is the clearest possible signal that a deck was written in English
   and translated, and it was a real defect in this build.

## 4. Typography — verified, and why it needed verifying

reveal.js ships this rule in its own stylesheet:

```css
.reveal.rtl .slides, .reveal.rtl .slides h1, … h6 { font-family: sans-serif; }
```

At specificity (0,2,2) it **overrides** a custom `[dir='rtl'] .reveal h2` rule
(0,2,1). The result is silent: the page looks fine, but every Arabic heading and
table cell falls back to the system sans-serif instead of IBM Plex Sans Arabic.

`css/arabic.css` counters it by mirroring reveal's own selector prefixed with
`[dir='rtl']`, raising specificity above reveal's, and restores the Latin face
for `.fm-latin` and `code`.

Verified in a real browser: headings, paragraphs, list items and table cells all
compute to `"IBM Plex Sans Arabic", "Segoe UI", Tahoma, sans-serif`.

**If you upgrade reveal.js, re-check this.** Do not trust a visual glance —
Arabic in a fallback sans-serif looks plausible. Check the computed value:

```js
getComputedStyle(document.querySelector('.reveal h2')).fontFamily
```

A related fix: bidi reordering displayed the slide counter "11 / 30" as
"30 / 11". `css/arabic.css` isolates it with `direction: ltr; unicode-bidi:
isolate`.

## 5. Unresolved — decide before the meeting

- **Partner name transliteration.** "Al Sarrani" and "El Sarrani" both appear in
  source material. The deck uses **Al Sarrani** / **مجموعة السراني**
  throughout. This is a placeholder decision, not a verified one. Confirm the
  legal spelling on the company's own registration and correct both decks.
- **Product name.** "Farm Marshal" and "CropExpert" both appear in source
  material. The deck uses **Farm Marshal** / **فارم مارشال**. Confirm which name
  is being taken to government, and whether the Arabic should be a
  transliteration (فارم مارشال) or a translated name. A transliterated English
  name is normal and fine; the decision just needs to be deliberate.

## 6. Sign-off

Presenting unreviewed Arabic to a Saudi minister is a larger risk than any
technical defect in this repository.

| | Name | Date |
|---|---|---|
| Native Arabic reviewer | | |
| Saudi partner — terminology and titles | | |
| Presenter — confirms they can deliver this text aloud | | |
