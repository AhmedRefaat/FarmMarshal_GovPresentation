# Image generation prompts

For regenerating or extending the deck imagery so new images match the existing
set. The consistency system is carried over from `Specs/video_handoff.md`.

---

## The consistency system

Every prompt is assembled from three fixed blocks plus one subject line. Keep
the blocks **verbatim**. They are what makes separately generated images look
like one body of work.

### BLOCK A — Setting

> Saudi Arabian agricultural landscape. Arid climate, sand and ochre ground
> tones, low scrub, date palms or centre-pivot fields. Strong directional
> sunlight, long shadows, dust haze on the horizon. Real working farmland — not
> manicured, not idealised.

### BLOCK B — Photographic treatment

> Photographic realism, full-frame DSLR, 35mm or 50mm lens, shallow-to-medium
> depth of field. Natural colour grade: warm sand, muted green, desaturated sky.
> Golden-hour or early-morning light. No lens flare, no HDR, no oversaturation.
> Documentary tone, not advertising.

### BLOCK C — Constraints

> No text, no logos, no watermarks, no national flags, no military or security
> imagery, no weapons. No identifiable faces. No branded equipment. Clothing
> appropriate and respectful to Saudi context. 16:9 aspect ratio.

**BLOCK C is not stylistic.** Faces, flags and anything military-adjacent are
excluded because this deck goes in front of interior and defence ministers.
Removing them afterwards is harder than not generating them.

---

## Prompt template

```
[BLOCK A]
[SUBJECT LINE]
[BLOCK B]
[BLOCK C]
```

## Subject lines — existing set

| File | Subject line |
|---|---|
| `farm-aerial` | Elevated wide view across an irrigated field bordered by desert, irrigation lines visible as parallel green rows. |
| `desert-farm` | A cultivated plot meeting open desert, the boundary between green and sand sharply visible. |
| `drone-ground` | A small quadcopter survey drone resting on dry ground at the edge of a field, ready for launch. |
| `worker-drone` | An agricultural worker, seen from behind, operating a survey drone controller at a field edge. |
| `disease-detection` | Close detail of crop leaves showing early disease discolouration, shallow depth of field. |
| `drip-irrigation` | Drip irrigation emitters at the base of young plants, dark damp soil against dry ground. |
| `irrigation-line` | A single irrigation line running to the horizon between crop rows. |
| `solar-panels` | A solar array powering irrigation infrastructure at a desert farm's edge. |
| `expert-field` | An agronomist crouched among crops examining a plant closely, face not visible. |
| `workflow-chain` | Abstract representation of a sequence: field, capture, review, record. Muted palette, no text. |

## Title plate

`assets/images/approved/title-plate.png` — the fallback shown when
`concept-film.mp4` is absent, and the still behind the title slide.

Same three blocks, subject line:

> Wide aerial view along ordered rows of date palms stretching to a desert
> horizon at low sun. Composition open and calm, with clear negative space in
> the upper third for overlaid text.

The negative space matters — the title and subtitle sit over it.

## Rules for anything new

1. Reuse the blocks exactly. Do not paraphrase them.
2. Generate more variants than you need and discard aggressively. Consistency
   comes from selection, not from the prompt alone.
3. Reject anything with visible text or pseudo-Arabic glyphs. Generators produce
   convincing nonsense, and a minister reads Arabic.
4. Reject identifiable faces.
5. Reject anything that reads as surveillance or security imagery.
6. Approved files go in `assets/images/approved/`. Record the prompt here.
7. Run `npm run optimize` afterwards.

## Honesty constraint

These are **concept illustrations**. They must never be captioned, described, or
implied to be photographs of a real deployment. The deck does not claim this,
and neither should you if asked. See `docs/CONTENT_SOURCE.md` §3.
