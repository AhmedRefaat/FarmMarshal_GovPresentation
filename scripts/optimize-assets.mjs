#!/usr/bin/env node
/**
 * Image optimization.
 *
 * Screenshots come off a phone at full sensor resolution and title plates come
 * out of design tools as multi-megabyte PNGs. Neither is appropriate for a deck
 * that may be served over a ministry network or copied to a USB stick.
 *
 *   node scripts/optimize-assets.mjs
 *   node scripts/optimize-assets.mjs --force
 *
 * Originals are never modified. Nothing is deleted.
 */
import { readdirSync, existsSync, mkdirSync, statSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const force = process.argv.includes('--force');

// Deck is authored at 1920x1080. Nothing needs to exceed that, and phone
// screenshots are displayed at roughly a quarter width.
const jobs = [
  { from: 'assets/screenshots/original', to: 'assets/screenshots/optimized', maxWidth: 1080, quality: 82 },
  { from: 'assets/images/approved', to: 'assets/images/optimized', maxWidth: 1920, quality: 80 },
];

const supported = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function mb(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

let totalBefore = 0;
let totalAfter = 0;
let processed = 0;
let skipped = 0;

for (const job of jobs) {
  const fromDir = join(root, job.from);
  const toDir = join(root, job.to);

  if (!existsSync(fromDir)) {
    console.log('  Skipping ' + job.from + ' (not present)');
    continue;
  }
  mkdirSync(toDir, { recursive: true });

  for (const name of readdirSync(fromDir)) {
    const ext = extname(name).toLowerCase();
    if (!supported.has(ext)) continue;

    const src = join(fromDir, name);
    if (!statSync(src).isFile()) continue;

    // PNG is kept for anything with transparency; everything else becomes JPEG,
    // which is dramatically smaller for photographic content.
    const meta = await sharp(src).metadata();
    const keepPng = ext === '.png' && meta.hasAlpha;
    const outName = basename(name, ext) + (keepPng ? '.png' : '.jpg');
    const dest = join(toDir, outName);

    if (!force && existsSync(dest) && statSync(dest).mtimeMs >= statSync(src).mtimeMs) {
      skipped++;
      continue;
    }

    const beforeBytes = statSync(src).size;
    let pipeline = sharp(src).rotate(); // honour EXIF orientation from phone captures

    if (meta.width && meta.width > job.maxWidth) {
      pipeline = pipeline.resize({ width: job.maxWidth, withoutEnlargement: true });
    }

    pipeline = keepPng
      ? pipeline.png({ compressionLevel: 9, palette: true })
      : pipeline.jpeg({ quality: job.quality, mozjpeg: true, chromaSubsampling: '4:4:4' });

    await pipeline.toFile(dest);

    const afterBytes = statSync(dest).size;

    // Refuse to make a file worse. Some already-optimized assets will not shrink.
    if (afterBytes >= beforeBytes) {
      copyFileSync(src, dest);
      console.log('  = ' + name + ' (already optimal, copied as-is)');
    } else {
      console.log(
        '  - ' + name.padEnd(34) + mb(beforeBytes).padStart(9) + '  ->  ' + mb(afterBytes).padStart(9) +
        '   (' + Math.round((1 - afterBytes / beforeBytes) * 100) + '% smaller)'
      );
    }

    totalBefore += beforeBytes;
    totalAfter += statSync(dest).size;
    processed++;
  }
}

console.log('');
console.log('  Processed ' + processed + ' file(s), skipped ' + skipped + ' already current.');
if (processed) {
  console.log('  Total: ' + mb(totalBefore) + ' -> ' + mb(totalAfter));
}
console.log('');
console.log('  Note: the decks still reference assets/screenshots/original and');
console.log('  assets/images/approved. Repoint them once you have reviewed the');
console.log('  optimized output — this script deliberately does not edit HTML.');
