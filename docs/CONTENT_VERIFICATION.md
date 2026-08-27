# Content verification register

Every factual claim on a slide is listed here with its status. Two are
**BLOCKING**: they must not be spoken in the room until sourced, and the deck
does not currently display them.

Status meanings:

| Status | Meaning |
|---|---|
| `blocking` | Not sourced. Do not say it. Not currently in the deck. |
| `confirm` | Plausible but must be confirmed with a named authority before use |
| `verified` | Sourced, with the source recorded below |

The register is also encoded in `config/presentation.config.js` under
`verification`, and rendered on the appendix slide by `js/demo.js`. Editing one
without the other will make the deck contradict this file.

---

## BLOCKING — do not present

### V1 · `production-value` — "SAR 9.2bn / 1.5bn / 16–17% losses"

**Claim as originally drafted:** Saudi crop production is worth ~SAR 9.2bn
annually, of which ~SAR 1.5bn (16–17%) is lost to late-detected disease and
irrigation failure.

**Why it is blocked:** No source was located for either the production figure or
the loss percentage. The ratio appears to be a derived estimate whose derivation
is undocumented. Presenting an unverifiable financial figure to a finance-literate
ministerial audience is the single fastest way to lose the room.

**What to do instead:** Use the defensible fallback (below), or obtain the
figure from GASTAT's agricultural production statistics and MEWA's own loss
assessments and cite them on the slide.

**Defensible fallback, currently used in the deck:**
The 2017 Saudi post-harvest loss assessment for dates found average damage
around 12.6%, with marketing losses of 5–10%. This is narrower in scope — one
crop, post-harvest — and the deck says so. It is a real number that survives a
follow-up question.

### V2 · `coverage-rate` — "five acres per hour"

**Claim as originally drafted:** One drone inspects five acres per hour.

**Why it is blocked:** Survey rate depends on altitude, sensor, overlap,
ground-sample-distance target, wind and battery cycles. Quoting a single number
without stating those conditions invites a defence or interior specialist to
dismantle it, and MOD will have people in the room who fly.

**What to do instead:** Either state it with full conditions
("at X m AGL, Y cm/px, Z% overlap, in calm conditions, one aircraft covers …"),
measured on your own equipment and recorded in the pilot report — or say
"we will establish the rate during the supervised pilot," which is stronger
because it is honest and it presupposes the pilot.

---

## CONFIRM — verify before naming

### V3 · `regulatory-route` — authorities and permissions

**Claim:** The pilot requires GACA authorisation, remote-pilot certification,
Public Security clearance, and GAMI involvement where defence-adjacent.

**Why it needs confirmation:** Saudi UAS regulation has changed repeatedly.
Naming the wrong authority, or the right authority with the wrong scope, in
front of the ministers who own those authorities is a credibility loss you do
not recover from in the same meeting.

**Current handling:** Speaker notes on the governance and flight-chain slides
say "subject to confirmation with your teams." Keep that phrasing until a named
official confirms the route in writing.

### V4 · `economics-model` — unit economics and pilot cost

**Claim:** Per-hectare inspection cost and the pilot's total cost.

**Why it needs confirmation:** The figures are internal estimates and have not
been validated against actual Saudi operating costs — labour, import duty,
insurance, local partner margin.

**Current handling:** The economics slide presents structure and ratio, not
absolute riyal values. Do not improvise numbers if asked; say the pilot exists
to produce them.

### V5 · `vision-2030-logo` — use of official identity

**Claim:** None. This concerns the Vision 2030 logo.

**Why it needs confirmation:** The Vision 2030 identity has usage rules.
Displaying it without permission implies an endorsement that does not exist,
in front of the people who would know.

**Current handling:** The logo is **omitted by default**. Alignment with Vision
2030 objectives is stated in words instead. Do not add the logo without written
permission.

---

## Verified

### Post-harvest date losses (fallback for V1)

2017 assessment of post-harvest losses in Saudi date production: average damage
≈12.6%; marketing-stage losses 5–10%. Used on the cost slide with its scope
stated. **Before the meeting, re-read the source and confirm the wording on the
slide matches it**, then move this entry's citation from "on file" to a full
reference.

---

## Pre-meeting sign-off

Do not present until every line is ticked.

- [ ] V1 either sourced with citation on the slide, or the fallback stands and the speaker knows not to extrapolate
- [ ] V2 either measured with conditions stated, or replaced with "the pilot will establish this"
- [ ] V3 confirmed with a named official; slide wording matches what they confirmed
- [ ] V4 either validated, or the speaker is briefed to decline to improvise
- [ ] V5 logo still absent unless written permission is held
- [ ] Speaker notes reviewed for anything that must not be read aloud or published
- [ ] `docs/ARABIC_LANGUAGE_REVIEW.md` sign-off completed by a native reviewer
