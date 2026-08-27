/**
 * Assembles the publishable site into _site/.
 *
 * Shared by the GitHub Pages workflow and by external hosts (Cloudflare Pages,
 * Netlify), so there is one list of what gets published rather than one per
 * host — a page added to the deck but not to a host's file list works locally
 * and 404s in production.
 *
 *   node scripts/assemble-site.mjs [--with-docs]
 */
import { cpSync, mkdirSync, rmSync, existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, '_site');

const PAGES = [
  'index.html',
  'login.html',
  'config.html',
  'presentation-en.html',
  'presentation-ar.html',
];

const DIRS = ['assets', 'config', 'css', 'js', 'vendor'];

/**
 * docs/ is excluded by default. It contains the verification register, the
 * Arabic review status and the test report — internal candour that is useful
 * to the team and damaging on a public URL. Pass --with-docs to include it.
 */
const withDocs = process.argv.includes('--with-docs');

if (existsSync(site)) rmSync(site, { recursive: true, force: true });
mkdirSync(site, { recursive: true });

for (const page of PAGES) {
  const from = join(root, page);
  if (!existsSync(from)) {
    console.error(`Missing page: ${page}`);
    process.exit(1);
  }
  cpSync(from, join(site, page));
}

for (const dir of [...DIRS, ...(withDocs ? ['docs'] : [])]) {
  const from = join(root, dir);
  if (!existsSync(from)) continue;
  cpSync(from, join(site, dir), { recursive: true });
}

// Defence in depth: plaintext passphrases must never reach a host.
const secrets = join(site, 'config', 'users.json');
if (existsSync(secrets)) rmSync(secrets, { force: true });

// Without this, GitHub Pages runs the output through Jekyll, which drops
// directories beginning with an underscore. Harmless on other hosts.
writeFileSync(join(site, '.nojekyll'), '', 'utf8');

/* -------------------------------------------------------------------------- */

if (existsSync(secrets)) {
  console.error('config/users.json survived into _site. Refusing to continue.');
  process.exit(1);
}

let files = 0;
let bytes = 0;
let largest = { path: '', size: 0 };

(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    files++;
    bytes += stat.size;
    if (stat.size > largest.size) largest = { path: path.slice(site.length + 1), size: stat.size };
  }
})(site);

const mb = (n) => (n / 1024 / 1024).toFixed(2) + ' MB';
console.log(`\n  _site assembled — ${files} files, ${mb(bytes)}${withDocs ? '' : ' (docs/ excluded)'}`);
console.log(`  Largest file: ${largest.path} (${mb(largest.size)})`);

// Cloudflare Pages rejects any single file over 25 MiB and any deployment over
// 20,000 files. Both are silent until the deploy fails, so say it here.
if (largest.size > 25 * 1024 * 1024) {
  console.log(`\n  WARNING: ${largest.path} exceeds Cloudflare Pages' 25 MiB per-file limit.`);
}
if (files > 20000) {
  console.log(`\n  WARNING: ${files} files exceeds Cloudflare Pages' 20,000 file limit.`);
}
console.log('');
