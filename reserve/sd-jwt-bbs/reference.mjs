// Selective disclosure by salted hashes: issuer commits to digests, holder reveals a subset.
// Scope: salty-hash mechanism only. No JWS signature layer, no BBS+, no key binding.
import { createHash, randomBytes } from 'node:crypto';
const h = (s) => createHash('sha256').update(s).digest('base64url');
const claims = { name: 'Alice', country: 'SG', tier: 'gold', wallet: '0xabc' };
const salt = {}, digest = {};
for (const [k, v] of Object.entries(claims)) {
  salt[k] = randomBytes(16).toString('base64url');
  digest[k] = h(`${salt[k]}|${k}|${v}`);
}
const committed = new Set(Object.values(digest));
const reveal = ['country'];
const presented = reveal.map((k) => ({ k, s: salt[k], v: claims[k] }));
const recomputed = presented.map((p) => h(`${p.s}|${p.k}|${p.v}`));
const accepted = recomputed.every((d) => committed.has(d));
const hiddenStaysHidden = !recomputed.includes(digest.wallet) && !recomputed.includes(digest.tier);
const tamperedRejected = !committed.has(h(`${salt.country}|country|MY`));
const wrongSaltRejected = !committed.has(h(`x|country|SG`));

console.log('disclosed claim verifies against commitment:', accepted);
console.log('undisclosed claims stay unrecoverable:', hiddenStaysHidden);
console.log('altered value rejected:', tamperedRejected);
console.log('altered salt rejected:', wrongSaltRejected);
if (!accepted || !hiddenStaysHidden || !tamperedRejected || !wrongSaltRejected) process.exit(1);