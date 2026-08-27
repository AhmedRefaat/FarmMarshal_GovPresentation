# Deployment

**Default recommendation: do not deploy.** Present from the USB build and hand
over a PDF. A static site cannot restrict access (see
`docs/SECURITY_LIMITATIONS.md`), and this deck is marked confidential.

Deploy only if a minister's office asks for a link, and only after scrubbing
the content.

---

## 1. Choosing a host

| Host | Access control | Per-file limit | Verdict |
|---|---|---|---|
| **GitHub Pages** | None on free tier; repo must be public | ~100 MB soft | Default if you must publish. **Does not serve Git LFS files** — see §2 |
| **Cloudflare Pages + Access** | Cloudflare Access gates before serving; free tier available | **25 MiB** | Best if you need real gating, **but the 25 MiB cap will reject the concept film** |
| **Netlify** | Password protection is a paid feature | 
 | Fine, but you pay for the only feature you'd switch for |
| **Ministry intranet** | Real, and owned by the authority | — | Best option if offered |

The 25 MiB Cloudflare cap is the deciding constraint. A four-minute 1080p film
does not fit. You would have to host the video elsewhere, which reintroduces a
network dependency and defeats the purpose.

**Cloudflare Access is still the right answer if genuine gating matters more
than the embedded film** — host the film separately, or ship it only on the
stick.

## 2. Git LFS — read this before committing video

**GitHub Pages does not serve Git LFS objects.** It serves the *pointer file*: a
132-byte text file beginning `version https://git-lfs.github.com/spec/v1`. The
browser receives that instead of the video. The result is a silently broken
video slide on a live site, and nothing in the build warns you.

Therefore:

- `.gitattributes` explicitly **does not** configure LFS, and documents why
- The deploy workflow checks out with `lfs: false`
- `npm run verify` fails on any file under 512 bytes that begins with the LFS
  pointer signature

If the repository is near a size limit, the answer is to **remove video from
the repository**, not to enable LFS.

## 3. GitHub Pages via the included workflow

`.github/workflows/deploy-pages.yml` runs on push to the default branch.

It: checks out (`lfs: false`) → Node 20 → `npm ci` → `npm run vendor` →
optionally writes credentials from the `FM_USERS_JSON` secret, runs
`create-user`, then **deletes `users.json`** → `npm run validate` →
`npm run verify` → assembles `_site` with `.nojekyll` → **asserts `users.json`
is absent** → uploads and deploys.

The `.nojekyll` file matters: without it, GitHub Pages' Jekyll processing
ignores files and directories beginning with `_` or `.`.

To enable: repository **Settings → Pages → Source → GitHub Actions**.

### Setting the passphrase gate in CI

Add a repository secret named `FM_USERS_JSON` containing the JSON from
`config/users.example.json` with real passphrases. The workflow derives the
hashes and deletes the plaintext before the site is assembled.

Re-read `docs/SECURITY_LIMITATIONS.md` first. This gate deters; it does not
protect. On a free GitHub Pages site the repository is public, so the derived
hashes are public too.

## 4. Manual deploy anywhere else

The site is plain static files with no build step:

```powershell
npm run vendor
npm run validate
npm run verify
```

Then upload the repository root — excluding `node_modules/`,
`config/users.json`, `dist-offline/`, and `docs/` — to any static host.

`dist-offline/` is **not** what you upload; it hard-disables the gate.

## 5. Before you publish — checklist

- [ ] `docs/CONTENT_VERIFICATION.md` — both blocking items resolved or absent from the deck
- [ ] `docs/ARABIC_LANGUAGE_REVIEW.md` — native sign-off complete
- [ ] Speaker notes reviewed; they ship inside the HTML and are readable by anyone
- [ ] Nothing from `SECURITY_LIMITATIONS.md` §5 present (named farms, coordinates, real figures, personal data)
- [ ] `npm run validate` and `npm run verify` both exit 0
- [ ] Video plays from the deployed URL, not just locally
- [ ] Arabic deck checked on the live site — fonts and RTL
- [ ] You have accepted that anyone with the URL can read everything
