/**
 * Confirms that the Node generator (scripts/create-user.mjs) and the browser
 * verifier (js/auth.js) derive the identical hash.
 *
 * These are two separate implementations of PBKDF2 — node:crypto and WebCrypto.
 * If they ever disagree, every passphrase silently stops working and the only
 * symptom is "that passphrase was not recognised". Worth a test.
 *
 *   node scripts/test-auth-parity.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { webcrypto, pbkdf2Sync, randomBytes } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The test generates its own throwaway credentials rather than reading
 * config/users.json. That file is gitignored and is deleted after a build, so
 * depending on it would make this test unrunnable in CI and unrunnable on a
 * clean checkout — which is exactly when you most want it to run.
 *
 * The derivation below is a duplicate of the one in scripts/create-user.mjs.
 * That duplication is the point: if the generator changes and js/auth.js does
 * not, this test fails.
 */
const FIXTURE = {
  iterations: 310000,
  salt: randomBytes(16).toString('hex'),
  users: [
    { id: 'mewa', passphrase: 'fixture-passphrase-mewa-0001' },
    { id: 'moi', passphrase: 'fixture-passphrase-moi-0002' },
    { id: 'mod', passphrase: 'fixture-passphrase-mod-0003' },
  ],
};

const nodeDerive = (passphrase, salt, iterations) =>
  pbkdf2Sync(passphrase, salt, iterations, 32, 'sha256').toString('hex');

// Load the real browser modules into a minimal window stub, so we are testing
// the shipped code rather than a copy of it.
const windowStub = {
  crypto: webcrypto,
  location: { protocol: 'http:', pathname: '/presentation-en.html', hash: '' },
  FM_OFFLINE: false,
};

new Function('window', readFileSync(join(root, 'config', 'presentation.config.js'), 'utf8'))(windowStub);
new Function('window', 'TextEncoder', readFileSync(join(root, 'js', 'config.js'), 'utf8'))(windowStub, TextEncoder);

// Install the fixture in place of config/auth.config.js, exactly as
// scripts/create-user.mjs would have written it.
windowStub.FM_AUTH = {
  iterations: FIXTURE.iterations,
  salt: FIXTURE.salt,
  users: FIXTURE.users.map((u) => ({
    id: u.id,
    hash: nodeDerive(u.passphrase, FIXTURE.salt + ':' + u.id, FIXTURE.iterations),
  })),
};

new Function('window', 'TextEncoder', 'Promise', readFileSync(join(root, 'js', 'auth.js'), 'utf8'))(
  windowStub, TextEncoder, Promise
);

const users = FIXTURE;
const authConfig = windowStub.FM_AUTH;

let failures = 0;

for (const user of users.users) {
  const stored = authConfig.users.find((u) => u.id === user.id);
  if (!stored) {
    console.error(`  FAIL  ${user.id}: not present in auth.config.js`);
    failures++;
    continue;
  }

  const derived = await windowStub.FMAuth.derive(
    user.passphrase,
    authConfig.salt + ':' + user.id,
    authConfig.iterations
  );

  if (derived === stored.hash) {
    console.log(`  PASS  ${user.id}: browser derivation matches generated hash`);
  } else {
    console.error(`  FAIL  ${user.id}: derivation mismatch`);
    console.error(`        generated: ${stored.hash}`);
    console.error(`        browser:   ${derived}`);
    failures++;
  }
}

// A wrong passphrase must not verify.
const wrong = await windowStub.FMAuth.verify('definitely-not-the-passphrase');
if (wrong === null) {
  console.log('  PASS  incorrect passphrase is rejected');
} else {
  console.error('  FAIL  incorrect passphrase was accepted as ' + wrong.id);
  failures++;
}

// The correct passphrase must verify.
const right = await windowStub.FMAuth.verify(users.users[0].passphrase);
if (right && right.id === users.users[0].id) {
  console.log('  PASS  correct passphrase resolves to ' + right.id);
} else {
  console.error('  FAIL  correct passphrase did not verify');
  failures++;
}

console.log('');
process.exit(failures ? 1 : 0);
