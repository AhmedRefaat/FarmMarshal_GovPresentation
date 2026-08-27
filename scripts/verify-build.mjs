#!/usr/bin/env node
/**
 * Post-build verification.
 *
 * Confirms that the things which silently break a deck are actually present:
 * the vendored library, the fonts, the media, and the absence of anything that
 * should never have been published.
 *
 *   node scripts/verify-build.mjs
 *   node scripts/verify-build.mjs dist-offline
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2] ? join(repoRoot, process.argv[2]) : repoRoot;

const failures = [];
const notes = [];

function must(relPath, description) {
  if (existsSync(join(target, relPath))) return true;
  failures.push(`${description} missing: ${relPath}`);
  return false;
}

function mustNot(relPath, description) {
  if (!existsSync(join(target, relPath))) return true;
  failures.push(`${description} MUST NOT be present: ${relPath}`);
  return false;
}

console.log('  Verifying: ' + target + '\n');

/* Pages ------------------------------------------------------------------- */
must('index.html', 'Landing page');
must('login.html', 'Login page');
must('config.html', 'Deck builder');
must('presentation-en.html', 'English deck');
must('presentation-ar.html', 'Arabic deck');
must('config/slide-index.js', 'Generated slide index');
must('js/slides.js', 'Slide selection module');

/* Vendored library -------------------------------------------------------- */
must('vendor/reveal/dist/reveal.js', 'reveal.js runtime');
must('vendor/reveal/dist/reveal.css', 'reveal.js core stylesheet');
must('vendor/reveal/plugin/notes/notes.js', 'Speaker notes plugin');
must('vendor/reveal/plugin/zoom/zoom.js', 'Zoom plugin');
must('vendor/reveal/plugin/search/search.js', 'Search plugin');

const manifestPath = join(target, 'vendor', 'VENDOR_MANIFEST.json');
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  notes.push('reveal.js version ' + (manifest.revealVersion || 'unknown'));
}

/* Fonts ------------------------------------------------------------------- */
if (must('assets/fonts/fonts.css', 'Font stylesheet')) {
  const fontDir = join(target, 'assets', 'fonts', 'files');
  const faces = existsSync(fontDir) ? readdirSync(fontDir).filter((f) => f.endsWith('.woff2')) : [];
  if (faces.length < 8) {
    failures.push(`Only ${faces.length} woff2 files present; expected the full Arabic and Latin set.`);
  } else {
    notes.push(faces.length + ' font faces vendored');
  }
  if (!faces.some((f) => f.includes('arabic'))) {
    failures.push('No Arabic font subset found. The Arabic deck will fall back to a system font.');
  }
}

/* Stylesheets and modules ------------------------------------------------- */
for (const css of ['theme', 'arabic', 'english', 'print', 'responsive', 'login']) {
  must(`css/${css}.css`, `Stylesheet ${css}`);
}
for (const js of ['config', 'auth', 'language', 'presentation', 'demo']) {
  must(`js/${js}.js`, `Module ${js}`);
}
must('config/presentation.config.js', 'Presentation config');
must('config/auth.config.js', 'Auth config');

/* Things that must never ship --------------------------------------------- */
mustNot('config/users.json', 'Plaintext passphrase file');
mustNot('.env', 'Environment file');

/* Media ------------------------------------------------------------------- */
const videoDir = join(target, 'assets', 'video');
if (existsSync(videoDir)) {
  const clips = readdirSync(videoDir).filter((f) => f.endsWith('.mp4'));
  notes.push(clips.length + ' video clip(s) present');
  if (!clips.includes('concept-film.mp4')) {
    notes.push('concept-film.mp4 is NOT present — the video slide will show the poster fallback.');
  }
  for (const clip of clips) {
    const sizeMb = statSync(join(videoDir, clip)).size / (1024 * 1024);
    if (sizeMb > 25) {
      notes.push(`${clip} is ${sizeMb.toFixed(1)} MB — over the Cloudflare Pages 25 MiB per-file limit.`);
    }
  }
} else {
  failures.push('assets/video/ is missing entirely.');
}

/* Git LFS pointers -------------------------------------------------------- */
// A committed LFS pointer served by GitHub Pages produces a broken player with
// no error message. Catch it here instead.
function scanForPointers(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) { scanForPointers(p); continue; }
    if (statSync(p).size < 512) {
      const head = readFileSync(p, 'utf8').slice(0, 60);
      if (head.startsWith('version https://git-lfs')) {
        failures.push(`Git LFS pointer instead of real file: ${p.replace(target, '.')}`);
      }
    }
  }
}
scanForPointers(join(target, 'assets'));

/* Report ------------------------------------------------------------------ */

if (notes.length) {
  console.log('  Notes:');
  for (const n of notes) console.log('    - ' + n);
  console.log('');
}

if (failures.length) {
  console.error('  FAILED (' + failures.length + '):');
  for (const f of failures) console.error('    - ' + f);
  console.error('');
  process.exit(1);
}

console.log('  Build verified.\n');
