// Merkle tree with proof verification, including a tampered leaf.
import { createHash } from 'node:crypto';
const h = (b) => createHash('sha256').update(b).digest();
const leafHash = (d) => h(Buffer.concat([Buffer.from([0]), Buffer.from(d)]));
const nodeHash = (x, y) => h(Buffer.concat([Buffer.from([1]), x, y]));
const data = ['a', 'b', 'c', 'd'];
const levels = [data.map(leafHash)];
while (levels.at(-1).length > 1) {
  const cur = levels.at(-1), next = [];
  for (let i = 0; i < cur.length; i += 2) next.push(nodeHash(cur[i], cur[i + 1] ?? cur[i]));
  levels.push(next);
}
const root = levels.at(-1)[0];
const proofFor = (i) => {
  const p = []; let idx = i;
  for (let l = 0; l < levels.length - 1; l++) { p.push(levels[l][idx ^ 1] ?? levels[l][idx]); idx >>= 1; }
  return p;
};
const verify = (i, d, p) => {
  let cur = leafHash(d), idx = i;
  for (const s of p) { cur = (idx & 1) ? nodeHash(s, cur) : nodeHash(cur, s); idx >>= 1; }
  return cur.equals(root);
};
let ok = data.every((d, i) => verify(i, d, proofFor(i)));
console.log('root:', root.toString('hex'));
console.log('all 4 proofs verify:', ok);
console.log('tampered leaf rejected:', !verify(0, 'x', proofFor(0)));
if (!ok || verify(0, 'x', proofFor(0))) process.exit(1);