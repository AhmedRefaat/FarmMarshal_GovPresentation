#!/usr/bin/env node
/**
 * Generates config/auth.config.js from config/users.json.
 *
 * The derivation here must stay byte-for-byte identical to Auth.derive() in
 * js/auth.js: PBKDF2-SHA256, 256 bits, salt = "<deploymentSalt>:<userId>",
 * hex-encoded. If you change one, change both, and re-run this script.
 *
 *   node scripts/create-user.mjs
 *   node scripts/create-user.mjs --rotate-salt
 *
 * Passphrases are never written to the output.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const usersPath = join(root, 'config', 'users.json');
const outPath = join(root, 'config', 'auth.config.js');

function fail(message) {
  console.error('\n  ' + message + '\n');
  process.exit(1);
}

if (!existsSync(usersPath)) {
  fail(
    'config/users.json not found.\n' +
    '  Copy config/users.example.json to config/users.json, set real passphrases,\n' +
    '  then run this again. users.json is gitignored and must stay that way.'
  );
}

let source;
try {
  source = JSON.parse(readFileSync(usersPath, 'utf8'));
} catch (err) {
  fail('config/users.json is not valid JSON: ' + err.message);
}

const iterations = Number(source.iterations) || 310000;
if (iterations < 100000) {
  fail('iterations is ' + iterations + '. Use at least 100000; 310000 is the OWASP guidance.');
}

if (!Array.isArray(source.users) || source.users.length === 0) {
  fail('config/users.json contains no users.');
}

// Reuse the existing deployment salt unless asked to rotate. Rotating
// invalidates every previously issued passphrase link, so it is opt-in.
const rotate = process.argv.includes('--rotate-salt');
let salt = '';
if (!rotate && existsSync(outPath)) {
  const previous = readFileSync(outPath, 'utf8');
  const match = previous.match(/salt:\s*'([^']*)'/);
  if (match && match[1]) salt = match[1];
}
if (!salt) salt = randomBytes(16).toString('hex');

const seen = new Set();
const users = source.users.map((user, index) => {
  if (!user.id) fail('User at index ' + index + ' has no "id".');
  if (seen.has(user.id)) fail('Duplicate user id: ' + user.id);
  seen.add(user.id);

  const passphrase = user.passphrase || '';
  if (passphrase.length < 12) {
    fail(
      'User "' + user.id + '" has a passphrase shorter than 12 characters.\n' +
      '  This gate is weak enough already — do not weaken it further.'
    );
  }
  if (passphrase.startsWith('replace-me')) {
    fail('User "' + user.id + '" still has the placeholder passphrase from the example file.');
  }

  const hash = pbkdf2Sync(passphrase, salt + ':' + user.id, iterations, 32, 'sha256').toString('hex');

  return {
    id: user.id,
    labelEn: user.labelEn || user.id,
    labelAr: user.labelAr || user.id,
    hash,
  };
});

const banner = `/**
 * Access credentials — GENERATED FILE. Do not edit by hand.
 *
 * Regenerate with:  npm run create-user
 * Generated:        ${new Date().toISOString()}
 *
 * Contains PBKDF2-SHA256 derivations, not passphrases. Safe to commit only in
 * the sense that the passphrases are not recoverable cheaply — it is NOT a
 * substitute for real access control. See docs/SECURITY_LIMITATIONS.md.
 */
`;

// JSON output rather than hand-formatted JS: quoted keys are valid JavaScript,
// and this cannot be broken by an unusual character in an Arabic label.
const body = banner + 'window.FM_AUTH = ' + JSON.stringify({ iterations, salt, users }, null, 2) + ';\n';

writeFileSync(outPath, body, 'utf8');

console.log('  Wrote config/auth.config.js');
console.log('  Users:      ' + users.map((u) => u.id).join(', '));
console.log('  Iterations: ' + iterations);
console.log('  Salt:       ' + (rotate ? salt + '  (rotated — all previous passphrases are now invalid)' : salt));
console.log('');
console.log('  Reminder: this gate deters sharing. It does not protect the content.');
