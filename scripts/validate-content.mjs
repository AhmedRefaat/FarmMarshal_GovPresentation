#!/usr/bin/env node
/**
 * Structural validation of the two decks.
 *
 * The Arabic and English decks are separate documents, which is the right call
 * for layout but creates one real risk: they drift. A slide gets added to one
 * and not the other, and nobody notices until a minister is looking at it.
 *
 * This script makes that drift a build failure rather than a discovery.
 *
 *   node scripts/validate-content.mjs
 *
 * Exits non-zero on any error. Warnings do not fail the build.
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const errors = [];
const warnings = [];

function err(m) { errors.push(m); }
function warn(m) { warnings.push(m); }

/* -------------------------------------------------------------------------- */
/* Load the manifest                                                          */
/* -------------------------------------------------------------------------- */

const configSource = readFileSync(join(root, 'config', 'presentation.config.js'), 'utf8');

// The config is a browser script assigning to window. Evaluate it in a stub
// rather than duplicating the manifest here, so there is exactly one source.
const windowStub = {};
new Function('window', configSource)(windowStub);
const config = windowStub.FM_CONFIG;

if (!config || !Array.isArray(config.slides)) {
  console.error('presentation.config.js did not produce window.FM_CONFIG.slides');
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/* Deck checks                                                                */
/* -------------------------------------------------------------------------- */

const decks = [
  { lang: 'en', file: 'presentation-en.html', dir: 'ltr' },
  { lang: 'ar', file: 'presentation-ar.html', dir: 'rtl' },
];

const idsByDeck = {};

for (const deck of decks) {
  const path = join(root, deck.file);
  if (!existsSync(path)) {
    err(`${deck.file} is missing.`);
    continue;
  }

  const html = readFileSync(path, 'utf8');

  // Language and direction must be declared correctly or the whole Arabic
  // layer silently does nothing.
  if (!new RegExp(`<html[^>]*lang="${deck.lang}"`).test(html)) {
    err(`${deck.file}: <html> is missing lang="${deck.lang}".`);
  }
  if (!new RegExp(`<html[^>]*dir="${deck.dir}"`).test(html)) {
    err(`${deck.file}: <html> is missing dir="${deck.dir}".`);
  }

  const ids = new Set();
  const idPattern = /<section[^>]*\sid="([^"]+)"/g;
  let match;
  while ((match = idPattern.exec(html)) !== null) {
    if (ids.has(match[1])) err(`${deck.file}: duplicate slide id "${match[1]}".`);
    ids.add(match[1]);
  }
  idsByDeck[deck.lang] = ids;

  for (const slide of config.slides) {
    if (!ids.has(slide.id)) {
      err(`${deck.file}: manifest slide "${slide.id}" is not present.`);
    }
  }

  for (const id of ids) {
    if (!config.slides.some((s) => s.id === id)) {
      warn(`${deck.file}: slide id "${id}" is not in the manifest.`);
    }
  }

  // The correct stylesheet layer must be loaded. Loading english.css in the
  // Arabic deck produces a subtly wrong deck rather than an obviously broken one.
  const expectedCss = deck.lang === 'ar' ? 'css/arabic.css' : 'css/english.css';
  const forbiddenCss = deck.lang === 'ar' ? 'css/english.css' : 'css/arabic.css';
  if (!html.includes(expectedCss)) err(`${deck.file}: does not load ${expectedCss}.`);
  if (html.includes(forbiddenCss)) err(`${deck.file}: must not load ${forbiddenCss}.`);

  // Every deck slide should carry speaker notes; a slide without them usually
  // means the content was pasted in and the delivery guidance forgotten.
  const sectionsWithNotes = (html.match(/<aside class="notes">/g) || []).length;
  if (sectionsWithNotes < 10) {
    warn(`${deck.file}: only ${sectionsWithNotes} slides carry speaker notes.`);
  }

  // No remote resources. Ministry networks block them, and a CDN font that
  // fails to load reflows the entire deck mid-presentation.
  const remote = html.match(/(?:src|href)="https?:\/\/[^"]+"/g) || [];
  for (const ref of remote) {
    err(`${deck.file}: remote resource must be vendored locally — ${ref}`);
  }

  // Referenced local assets must exist.
  const assetPattern = /(?:src|href|data-background-image|data-background-video)="((?:assets|vendor|css|js|config)\/[^"]+)"/g;
  while ((match = assetPattern.exec(html)) !== null) {
    const assetPath = join(root, match[1]);
    if (!existsSync(assetPath)) {
      // The final film is expected to be absent until it is rendered.
      if (match[1] === 'assets/video/concept-film.mp4') {
        warn(`${deck.file}: concept film not yet present at ${match[1]} — the poster fallback will show.`);
      } else {
        err(`${deck.file}: referenced asset does not exist — ${match[1]}`);
      }
    }
  }

  // Images need alt text.
  const imgs = html.match(/<img\b[^>]*>/g) || [];
  for (const img of imgs) {
    if (!/\balt=/.test(img)) err(`${deck.file}: <img> without alt attribute — ${img.slice(0, 80)}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Cross-deck parity                                                          */
/* -------------------------------------------------------------------------- */

if (idsByDeck.en && idsByDeck.ar) {
  for (const id of idsByDeck.en) {
    if (!idsByDeck.ar.has(id)) err(`Slide "${id}" exists in English but not Arabic.`);
  }
  for (const id of idsByDeck.ar) {
    if (!idsByDeck.en.has(id)) err(`Slide "${id}" exists in Arabic but not English.`);
  }
}

/* -------------------------------------------------------------------------- */
/* Verification register                                                      */
/* -------------------------------------------------------------------------- */

const blocking = (config.verification || []).filter((v) => v.status === 'blocking');
for (const item of blocking) {
  warn(`UNVERIFIED CLAIM STILL BLOCKING: ${item.claimEn}`);
}

/* -------------------------------------------------------------------------- */
/* Secrets and hygiene                                                        */
/* -------------------------------------------------------------------------- */

if (existsSync(join(root, 'config', 'users.json'))) {
  const gitignore = existsSync(join(root, '.gitignore'))
    ? readFileSync(join(root, '.gitignore'), 'utf8')
    : '';
  if (!/^\s*config\/users\.json\s*$/m.test(gitignore)) {
    err('config/users.json exists but is not listed in .gitignore. It contains plaintext passphrases.');
  }
}

// Oversized assets make the deck slow to load on a ministry network and can
// exceed host per-file limits.
const heavy = [];
function checkSize(relPath) {
  const p = join(root, relPath);
  if (existsSync(p) && statSync(p).isFile()) {
    const mb = statSync(p).size / (1024 * 1024);
    if (mb > 25) heavy.push(`${relPath} is ${mb.toFixed(1)} MB — exceeds the 25 MiB per-file limit on Cloudflare Pages.`);
    else if (mb > 3) heavy.push(`${relPath} is ${mb.toFixed(1)} MB — run npm run optimize.`);
  }
}
for (const deck of decks) {
  const path = join(root, deck.file);
  if (!existsSync(path)) continue;
  const html = readFileSync(path, 'utf8');
  const pattern = /(?:src|poster|data-background-image|data-background-video)="(assets\/[^"]+)"/g;
  let m;
  while ((m = pattern.exec(html)) !== null) checkSize(m[1]);
}
for (const note of [...new Set(heavy)]) warn(note);

// `direction: rtl` already lays a flex row out right-to-left. Adding a
// *-reverse on top of it reverses a second time and restores English order.
const arabicCss = join(root, 'css', 'arabic.css');if (existsSync(arabicCss)) {
  const css = readFileSync(arabicCss, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  if (/flex-direction\s*:\s*(row|column)-reverse/.test(css)) {
    err('css/arabic.css: uses a *-reverse flex-direction. direction:rtl already mirrors flex rows, so this double-reverses back to left-to-right order.');
  }
}

// reveal.js puts .reveal-viewport on <body> and sets background-color:#fff on
// it. That outranks a bare `body` selector, so without an explicit override the
// deck renders cream text on a white body on every slide that has no background
// image — unreadable, and easy to miss because image-backed slides look fine.
// Re-check this after any reveal.js upgrade.
const themeCss = join(root, 'css', 'theme.css');
if (existsSync(themeCss)) {
  // Comments are stripped first: the explanation of this rule mentions the
  // selector by name, and matching that would make the check always pass.
  const css = readFileSync(themeCss, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  if (!/body\.reveal-viewport\s*[,{]/.test(css)) {
    err('css/theme.css: no body.reveal-viewport background override — reveal.css will force a white body and the deck will render light text on white.');
  }
}

/* -------------------------------------------------------------------------- */
/* Slide index and presets                                                    */
/* -------------------------------------------------------------------------- */

// A stale index would offer slides that no longer exist, and — because appendix
// slides are keyed by position — could hide the wrong ones.
const indexPath = join(root, 'config', 'slide-index.js');
if (!existsSync(indexPath)) {
  err('config/slide-index.js is missing. Run: npm run slide-index');
} else {
  try {
    execFileSync(process.execPath, [join(root, 'scripts', 'generate-slide-index.mjs'), '--check'], {
      stdio: 'pipe',
    });
  } catch {
    err('config/slide-index.js is out of date with the decks. Run: npm run slide-index');
  }

  const indexStub = {};
  new Function('window', readFileSync(indexPath, 'utf8'))(indexStub);
  const known = new Set((indexStub.FM_SLIDE_INDEX?.slides || []).map((s) => s.key));

  for (const preset of config.presets || []) {
    if (!preset.slides) continue;
    const missing = preset.slides.filter((k) => !known.has(k));
    if (missing.length) {
      err(`presentation.config.js: preset '${preset.id}' names slides that do not exist: ${missing.join(', ')}`);
    }
    if (!preset.slides.length) {
      err(`presentation.config.js: preset '${preset.id}' is empty; it would show nothing.`);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Report                                                                     */
/* -------------------------------------------------------------------------- */

if (warnings.length) {
  console.log('\nWarnings (' + warnings.length + '):');
  for (const w of warnings) console.log('  - ' + w);
}

if (errors.length) {
  console.error('\nErrors (' + errors.length + '):');
  for (const e of errors) console.error('  - ' + e);
  console.error('');
  process.exit(1);
}

console.log('\n  Validation passed. ' + config.slides.length + ' manifest slides present in both decks.\n');
