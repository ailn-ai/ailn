// Append-only Merkle log (RFC 6962 style hashing): inclusion paths + append-only check.
// Scope: inclusion proofs are real proofs. Append-only is checked by recomputation, not by a consistency proof.
import { createHash } from 'node:crypto';
const sha = (b) => createHash('sha256').update(b).digest();
const leafHash = (d) => sha(Buffer.concat([Buffer.from([0]), Buffer.from(d)]));
const nodeHash = (l, r) => sha(Buffer.concat([Buffer.from([1]), l, r]));
const mth = (leaves) => {
  if (leaves.length === 1) return leaves[0];
  const k = 1 << Math.floor(Math.log2(leaves.length - 1));
  return nodeHash(mth(leaves.slice(0, k)), mth(leaves.slice(k)));
};
const path = (m, leaves) => {
  const n = leaves.length;
  if (n === 1) return [];
  const k = 1 << Math.floor(Math.log2(n - 1));
  return m < k ? [...path(m, leaves.slice(0, k)), mth(leaves.slice(k))]
               : [...path(m - k, leaves.slice(k)), mth(leaves.slice(0, k))];
};
const verify = (d, m, n, proof, root) => {
  let fn = m, sn = n - 1, r = leafHash(d);
  for (const p of proof) {
    if (sn === 0) return false;
    if ((fn & 1) === 1 || fn === sn) {
      r = nodeHash(p, r);
      while ((fn & 1) === 0 && fn !== 0) { fn >>= 1; sn >>= 1; }
    } else r = nodeHash(r, p);
    fn >>= 1; sn >>= 1;
  }
  return sn === 0 && r.equals(root);
};

let ok = true;
for (const n of [2, 3, 5, 8]) {
  const data = Array.from({ length: n }, (_, i) => `entry-${i}`);
  const leaves = data.map(leafHash);
  const root = mth(leaves);
  for (let i = 0; i < n; i++) if (!verify(data[i], i, n, path(i, leaves), root)) ok = false;
}
console.log('inclusion proofs verify for n=2,3,5,8:', ok);

// append-only: grow the log, old leaves must still prove into the new root
const d3 = ['a', 'b', 'c'].map((x) => x);
const l3 = d3.map(leafHash), r3 = mth(l3);
const d4 = [...d3, 'd'], l4 = d4.map(leafHash), r4 = mth(l4);
const grew = !r3.equals(r4) && verify('a', 0, 4, path(0, l4), r4) && mth(l3).equals(r3);
console.log('append keeps old proofs valid:', grew);
if (!ok || !grew) process.exit(1);