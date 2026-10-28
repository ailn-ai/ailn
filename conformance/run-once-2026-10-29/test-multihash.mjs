// multihash sha2-256: 0x12 0x20 + digest, against a public test vector.
import { createHash } from 'node:crypto';
const multihash = (buf) => {
  const d = createHash('sha256').update(buf).digest();
  return Buffer.concat([Buffer.from([0x12, d.length]), d]).toString('hex');
};
const out = multihash(Buffer.from('hello world'));
const expected = '1220b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
console.log('multihash(sha2-256, "hello world"):', out);
console.log('matches known vector:', out === expected);
if (out !== expected) process.exit(1);