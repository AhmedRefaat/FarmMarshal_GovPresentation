/**
 * Generates config/slide-index.js — the list of every slide in the decks, used
 * by config.html to offer them for selection.
 *
 * This is generated rather than hand-maintained because the appendix slides are
 * vertical children with no ids of their own, and a hand-written list would
 * drift from the decks silently. It is emitted as a classic script (not JSON)
 * for the same reason as the other config files: fetch() of a local file is
 * blocked over file://, and this deck has to run from a USB stick.
 *
 * Run by `npm run build`; `npm run validate` fails if the committed index is
 * stale.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Builds a tree of <section> elements by depth-counting the open/close tags.
 * A real parser would be safer against arbitrary HTML, but these two documents
 * are ours and contain no <section> inside comments or script strings.
 */
function parseSections(html) {
  const token = /<section\b([^>]*)>|<\/section\s*>/gi;
  const roots = [];
  const stack = [];
  let m;

  while ((m = token.exec(html)) !== null) {
    if (m[0].startsWith('</')) {
      const done = stack.pop();
      if (done) done.end = m.index;
      continue;
    }
    const node = { attrs: m[1] || '', start: token.lastIndex, end: html.length, children: [] };
    if (stack.length) stack[stack.length - 1].children.push(node);
    else roots.push(node);
    stack.push(node);
  }
  return roots;
}

const attr = (attrs, name) => {
  const m = new RegExp(`\\b${name}="([^"]*)"`).exec(attrs);
  return m ? m[1] : '';
};

/** First heading inside a section. Only ever called on leaf sections. */
function heading(html, node) {
  const m = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/i.exec(html.slice(node.start, node.end));
  if (!m) return '';
  return m[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&times;/g, '×')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Flattens the section tree into the list of things a viewer actually steps through. */
function flatten(html, roots) {
  const slides = [];
  roots.forEach((node, h) => {
    const id = attr(node.attrs, 'id');
    if (node.children.length) {
      // A vertical stack: the parent is a container, its children are the slides.
      node.children.forEach((child, v) => {
        slides.push({
          key: `${id || 'stack' + h}/${v + 1}`,
          group: id || `stack${h}`,
          title: heading(html, child),
          h,
          v,
        });
      });
    } else {
      slides.push({ key: id || `slide${h}`, group: null, title: heading(html, node), h, v: 0 });
    }
  });
  return slides;
}

function readDeck(file) {
  const html = readFileSync(join(root, file), 'utf8');
  return flatten(html, parseSections(html));
}

const en = readDeck('presentation-en.html');
const ar = readDeck('presentation-ar.html');

if (en.length !== ar.length) {
  console.error(
    `Decks have different slide counts (en ${en.length}, ar ${ar.length}). ` +
    'Fix the decks before regenerating the index.'
  );
  process.exit(1);
}

const manifest = [];
{
  // The manifest supplies the human-facing group names; fall back to the id.
  const cfg = readFileSync(join(root, 'config', 'presentation.config.js'), 'utf8');
  const re = /\{\s*id:\s*'([^']+)'[^}]*?en:\s*'([^']*)'[^}]*?ar:\s*'([^']*)'\s*\}/g;
  let m;
  while ((m = re.exec(cfg)) !== null) manifest.push({ id: m[1], en: m[2], ar: m[3] });
}
const labelFor = (id) => manifest.find((s) => s.id === id) || null;

const slides = en.map((slide, i) => {
  const label = slide.group ? null : labelFor(slide.key);
  return {
    key: slide.key,
    group: slide.group,
    en: slide.title || (label ? label.en : slide.key),
    ar: ar[i].title || (label ? label.ar : slide.key),
  };
});

const fingerprint = createHash('sha256')
  .update(slides.map((s) => s.key).join('|'))
  .digest('hex')
  .slice(0, 12);

const groups = [...new Set(slides.map((s) => s.group).filter(Boolean))].map((id) => {
  const label = labelFor(id);
  return { id, en: label ? label.en : id, ar: label ? label.ar : id };
});

const body = `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`npm run slide-index\` (or \`npm run build\`) to regenerate from the decks.
 *
 * Slide keys are how a saved selection refers to slides. Appendix slides have no
 * id of their own, so they are keyed by position within their stack; the
 * fingerprint below lets a saved selection detect that the decks changed under
 * it and fall back to the full deck rather than hiding the wrong slides.
 */
window.FM_SLIDE_INDEX = {
  fingerprint: '${fingerprint}',
  groups: ${JSON.stringify(groups, null, 2).replace(/\n/g, '\n  ')},
  slides: ${JSON.stringify(slides, null, 2).replace(/\n/g, '\n  ')},
};
`;

const out = join(root, 'config', 'slide-index.js');
const previous = (() => {
  try {
    return readFileSync(out, 'utf8');
  } catch {
    return '';
  }
})();

if (process.argv.includes('--check')) {
  if (previous !== body) {
    console.error('config/slide-index.js is stale. Run: npm run slide-index');
    process.exit(1);
  }
  console.log(`Slide index current — ${slides.length} slides, fingerprint ${fingerprint}.`);
  process.exit(0);
}

writeFileSync(out, body, 'utf8');
console.log(`Wrote config/slide-index.js — ${slides.length} slides, fingerprint ${fingerprint}.`);
