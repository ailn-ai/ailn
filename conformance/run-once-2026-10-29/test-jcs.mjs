// RFC 8785 (JCS) canonicalisation: key order must not change the hash.
import { createHash } from 'node:crypto';
const canon = (v) => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
};
const a = { b: 2, a: 1, c: { z: 9, y: 8 } };
const b = { c: { y: 8, z: 9 }, a: 1, b: 2 };
const h1 = createHash('sha256').update(canon(a)).digest('hex');
const h2 = createHash('sha256').update(canon(b)).digest('hex');
console.log('canonical:', canon(a));
console.log('same hash across key order:', h1 === h2);
if (h1 !== h2) process.exit(1);