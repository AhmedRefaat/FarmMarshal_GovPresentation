# Speaker guide

Three ministers, 35 minutes, one decision. This is how the deck is meant to be
delivered.

---

## 1. The room

Your sponsor — the Saudi businessman and former Public Security officer — is
already convinced. He is not your audience. He is your **credibility anchor**.

**He opens the meeting, not you.** A foreign presenter opening a ministerial
meeting starts from a deficit. A respected Saudi former officer introducing the
proposal starts from his credit. Agree this with him beforehand and do not
improvise it.

Each minister is asking a different question:

| | The question in their head | The slide that answers it |
|---|---|---|
| **MEWA / Agriculture** | Does this reduce loss and improve yield? | `#cost`, `#economics` |
| **MOI / Interior** | Who is flying, where, and who controls the footage? | `#flight-chain`, `#governance` |
| **MOD / Defense** | Is this a sovereignty and airspace risk? | `#governance`, `#not-asking` |

Any one of them can stop this. You need all three to not object. That is a
lower bar than enthusiasm, and it should shape your tone: you are removing
objections, not selling.

## 2. Sequence and timing — 35 minutes

| Min | Slides | Purpose |
|---|---|---|
| 0–2 | — | Sponsor opens and introduces |
| 2–5 | `#title`, `#video` | The film does the emotional work so you don't have to |
| 5–9 | `#reframe`, `#cost` | Reframe: this is an information gap, not an agriculture problem |
| 9–13 | `#evidence-chain`, `#layers` | How observation becomes evidence |
| 13–19 | `#demo-open` → `#demo-close` | The product, concretely |
| 19–25 | `#track-mewa`, `#track-moi`, `#track-mod` | One slide each — address each minister directly |
| 25–28 | `#governance`, `#flight-chain` | Control, custody, airspace discipline |
| 28–30 | `#not-asking`, `#economics`, `#localization` | Remove the suspicion; show the structure |
| 30–33 | `#the-ask`, `#close` | The three asks, stated once, clearly |
| 33–35 | `#appendix` on demand | Only if asked |

**Target 20 minutes of speaking**, not 35. `presenter.targetMinutes` is set to
20. The remainder belongs to them. A ministerial meeting that runs to time and
leaves room for questions signals competence; one that overruns signals you did
not think about their day.

Press `T` for the timer. `R` restarts it.

## 3. The three asks — say them once, exactly

On `#the-ask`:

1. **Authorisation for a supervised pilot** — a defined area, a defined period,
   under their observation
2. **Drone operating licences** for that pilot
3. **A path to a funding decision** — not funding today

Do not add a fourth. Do not soften them into hints. State them, stop talking,
and let the silence sit. The instinct to fill it is the instinct that loses the
ask.

## 4. `#not-asking` — why it exists

This slide states what you are *not* requesting: not exclusivity, not data
ownership, not unsupervised access, not a defence contract.

Three ministers are, correctly, wondering what a foreign-linked drone operation
actually wants. Naming the suspicion before they do converts it from a private
doubt into a settled point. Deliver it flatly. Any defensiveness here reads as
confirmation.

## 5. Hard questions

**"Why not satellites?"**
Do not claim drones are better. They answer different questions — satellite for
coverage and trend, drone for resolution and diagnosis at the plant. The deck
positions them as complementary. Claiming superiority to a room that may have
satellite programmes is an unforced error.

**"Where does the data go?"**
In-Kingdom. Their rules, their custody. If you do not know the specific hosting
answer, say the pilot is how it gets defined with their teams — do not invent
an architecture at the table.

**"Who flies?"**
Certified remote pilots under the authorities' clearance. See
`docs/CONTENT_VERIFICATION.md` V3 — the exact regulatory route is
**unconfirmed**. Say "subject to confirmation with your teams." Do not name an
authority you have not verified, in front of the minister who owns it.

**"What does it cost?"**
Structure, not a number. The pilot exists to produce the number. See V4.

**"How much loss does this actually prevent?"**
The 12.6% post-harvest date-damage figure, with its scope stated. **Do not use
the SAR 9.2bn / 1.5bn / 16–17% figures** — see V1, blocking, unsourced.

**"How fast can you survey?"**
**Do not say "five acres per hour."** See V2, blocking. Say the pilot will
establish the rate under their conditions.

## 6. Do not say

- Anything about current or regional conflict
- Anything about weaponisation, ISR, or military application beyond airspace
  discipline and data sovereignty
- Any claim that drones outperform satellites
- Any number in `CONTENT_VERIFICATION.md` marked blocking
- Any authority name you have not confirmed
- Any real farm, owner, or location

The MOD framing throughout is **sovereignty and control**, never capability.

## 7. Operating the deck

| Key | Does |
|---|---|
| `→` / `←` | Next / previous |
| `↓` / `↑` | Into and out of the appendix stack |
| `T` | Presenter timer on/off |
| `R` | Restart timer |
| `L` | Switch language, keeping your slide |
| `S` | Speaker view — **notes are frank; check which screen it opens on** |
| `Esc` | Slide overview |
| `F` | Fullscreen |
| `B` | Black the screen — use it when you want them looking at you |

`L` is worth rehearsing. Switching to Arabic mid-sentence when a minister
engages in Arabic is a strong moment — but only if it is smooth.

### Cutting the deck down

If the meeting is shortened, or the room turns out to be one ministry rather
than three, do not skip slides live — skipping forward in front of a minister
looks like you brought the wrong deck. Set the selection before you walk in.

Open `config.html` (“Choose slides” on the landing page) and pick a preset:

| Preset | Slides | Use when |
|---|---|---|
| Full deck | 30 | Normal run, appendix available for questions |
| Main deck, no appendix | 19 | You want the appendix out of arrow-key reach |
| Cut to ten minutes | 8 | You have been told the slot is shorter |
| Agriculture / Interior / Defense focus | 15 / 12 / 12 | One ministry is in the room |

The choice applies to both languages and to the PDF. A trimmed deck says so
briefly when it opens, and the landing page shows the current selection — check
it before you connect to the projector. “Reset to full deck” puts everything
back.

Decide this before the room, not during it. A ten-minute cut still needs the
ask on it: `#the-ask` is in every preset.

## 8. Before you walk in

- [ ] Sponsor has agreed he opens
- [ ] Rehearsed on the actual presenting laptop from the actual USB stick
- [ ] Slide selection checked on the landing page — full deck unless you chose otherwise
- [ ] Printed PDFs in the room, both languages
- [ ] Second USB stick, separate pocket
- [ ] Timer rehearsed to 20 minutes
- [ ] Both blocking items in `CONTENT_VERIFICATION.md` handled
- [ ] Arabic reviewed and signed off
- [ ] You can state the three asks without looking at the slide
