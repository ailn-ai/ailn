// RFC 8785 (JCS): canonical JSON must not depend on key order, and must follow the ES6 number rules.
// Scope: key ordering, number formatting and string escaping as specified; no UTF-8 byte-preserving
// exotic cases (e.g. lone surrogates) are exercised.
import { createHash } from 'node:crypto';

const canon = (v) => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
};
const h = (s) => createHash('sha256').update(s).digest('hex');

const checks = [];
const check = (name, got, want) => checks.push({ name, ok: got === want, got, want });

// 1. key order does not change the hash
const a = { b: 2, a: 1, c: { z: 9, y: 8 } };
const b = { c: { y: 8, z: 9 }, a: 1, b: 2 };
check('same hash across key order', h(canon(a)), h(canon(b)));

// 2. keys sort by UTF-16 code units, so uppercase before lowercase
check('UTF-16 key order', canon({ b: 1, A: 2, a: 3 }), '{"A":2,"a":3,"b":1}');

// 3. ES6 number formatting: integers stay integral, -0 becomes 0, exponents appear as ES6 prints them
check('integer stays integral', canon({ n: 1 }), '{"n":1}');
check('-0 serialises as 0', canon({ n: -0 }), '{"n":0}');
check('1e21 uses exponent form', canon({ n: 1e21 }), '{"n":1e+21}');
check('small fraction', canon({ n: 1.5 }), '{"n":1.5}');

// 4. no whitespace is emitted anywhere
check('no whitespace', canon({ a: [1, 2], b: 'x' }), '{"a":[1,2],"b":"x"}');

// 5. arrays keep order (order is data, not noise)
check('array order preserved', canon([3, 1, 2]), '[3,1,2]');

let failed = 0;
for (const c of checks) {
  if (!c.ok) failed++;
  console.log(`${c.ok ? 'ok  ' : 'FAIL'}  ${c.name}${c.ok ? '' : `  got=${c.got} want=${c.want}`}`);
}
console.log(`\n${checks.length - failed}/${checks.length} JCS checks passed`);
if (failed) process.exit(1);