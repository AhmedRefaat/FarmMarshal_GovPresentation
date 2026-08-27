# Security limitations

**Read this before you send anyone a link.**

This document exists because the login page in this project could easily be
mistaken for access control. It is not access control.

---

## 1. The short version

This is a **static site**. There is no server-side application, no session
validation, and no authorisation check on any file. Every asset that makes up
this presentation — both decks, every image, every video, the speaker notes, and
`config/auth.config.js` itself — is served as a plain file to anyone who
requests it.

The login page:

| Does | Does not |
|---|---|
| Deter casual link-forwarding | Prevent anyone from reading the content |
| Create a visible confidentiality marking | Restrict access to named individuals |
| Record a deliberate acceptance step | Produce an access log |
| Stop a colleague idly clicking through | Stop anyone who opens developer tools |

**Anyone who has the URL can read the entire deck without the passphrase.**

## 2. Exactly how it is bypassed

Not theoretical. Any of these takes under a minute:

1. **Request the file directly.** `presentation-en.html` is a static file. The
   gate is a *separate page*. Navigating straight to the deck runs a JavaScript
   redirect — which does not happen if JavaScript is disabled, and does not
   remove the already-downloaded HTML.
2. **Read the source.** `view-source:` or `curl` returns the complete deck
   including every speaker note.
3. **Set the session flag.** The gate checks `sessionStorage['fm.session.v1']`.
   Setting that key in the console grants access.
4. **Attack the hash offline.** `config/auth.config.js` is public. It contains
   PBKDF2-SHA256 derivations at 310,000 iterations. That is a genuine cost per
   guess, but a short or predictable passphrase falls to an offline dictionary
   attack, and the attacker gets unlimited attempts with no rate limiting and no
   lockout, because there is nothing to rate-limit them.

Point 4 is why `scripts/create-user.mjs` refuses passphrases under 12
characters. It reduces the risk. It does not remove it.

## 3. What the passphrases actually protect

Effectively: nothing, cryptographically. Their real function is social and
procedural.

- A recipient who receives a passphrase understands the material is restricted.
- Forwarding the link alone does not work, so sharing requires a deliberate act.
- If the deck leaks, the deliberate act is a fact you can point at.

Treat it as a seal on an envelope, not a lock on a door.

## 4. If the content genuinely must be restricted

Pick one:

| Option | How it works | Cost |
|---|---|---|
| **Do not publish it** | Present from the offline USB build only | Free, and the strongest option here |
| **Cloudflare Access** | Identity-aware proxy in front of Cloudflare Pages; authenticates *before* serving any file | Free tier available |
| **Ministry intranet** | Host inside the authority's own network | Depends on the authority |
| **Netlify password protection** | Server-side gate | Paid plan |
| **Authenticated web app** | Rebuild as a server-rendered application | Disproportionate for a deck |

Only the first, second and fourth actually stop file retrieval. The gate in
this repository does not belong on that list, which is the entire point of this
document.

**Recommendation for this project:** present from the USB build. Publish only a
scrubbed version, and only if a minister's office asks for a link.

## 5. What must never go into the published build

Before running the deploy workflow, remove:

- Named farms, owners, companies, or any identifiable holding
- GPS coordinates, plot boundaries, or anything that locates a specific site
- Real commercial figures, contract values, or funding amounts
- Personal names, phone numbers, or email addresses
- Any imagery of infrastructure that is not already publicly visible
- Internal delivery notes about how to handle individual officials

The speaker notes in both decks contain frank tactical guidance about the
audience. **Speaker notes ship inside the HTML.** They are readable by anyone who
opens the file, and they are visible via reveal.js's own speaker view (`S`).
Review them before publishing, or strip them from the published build.

## 6. Deliberate design decisions

These look like bugs. They are not.

- **The gate disables itself offline.** On `file://`, `crypto.subtle` is
  unavailable in several browsers, and physical control of the USB stick is the
  actual control. A gate that silently failed open would be worse than one that
  announces it is off.
- **`config/auth.config.js` defaults to `users: []`.** An empty user list means
  no gate. A committed real credential is worse than no credential.
- **`config/users.json` is gitignored**, holds plaintext passphrases, and is
  deleted by `scripts/build-offline.mjs` and by the CI workflow. `npm run
  validate` fails if it exists but is not gitignored.
- **The failure message is uniform.** "That passphrase was not recognised" never
  reveals which of the three identities exists.
- **The disclosure text is on the login page itself**, not only in this file, so
  a viewer cannot form a false impression of protection.

## 7. Threat model, stated plainly

| Threat | Protected? |
|---|---|
| Colleague forwards the link casually | Partly |
| Recipient shares the passphrase | No |
| Journalist given the URL | No |
| Anyone using developer tools | No |
| Search engine indexing | Partly — `noindex` is set, which is advisory only |
| Targeted attacker | No |
| Someone who steals the USB stick | No |

If any row in that table is unacceptable for this material, do not publish it.
