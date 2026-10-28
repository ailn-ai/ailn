// Exact kNN over cosine similarity, plus a two-list IVF partition to compare recall.
// Scope: reference implementation for structure, not performance.
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const norm = (a) => Math.sqrt(dot(a, a));
const cos = (a, b) => dot(a, b) / (norm(a) * norm(b));

const docs = [
  [1, 0.1, 0], [0.9, 0.2, 0.1], [1, 0, 0.2], [0.1, 1, 0], [0.2, 0.9, 0.1], [0, 1, 0.2],
  [0, 0.1, 1], [0.1, 0, 0.9], [0, 0.2, 1],
];
const q = [1, 0.05, 0.25];
const exact = docs.map((d, i) => [i, cos(q, d)]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => i);

const centroid = (xs) => xs[0].map((_, k) => xs.reduce((s, x) => s + x[k], 0) / xs.length);
const lists = [[0, 1, 2], [3, 4, 5], [6, 7, 8]].map((ids) => ({ ids, c: centroid(ids.map((i) => docs[i])) }));
const order = lists.map((l, i) => [i, cos(q, l.c)]).sort((a, b) => b[1] - a[1]);
const probed = lists[order[0][0]].ids
  .map((i) => [i, cos(q, docs[i])]).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => i);

const recall = probed.filter((i) => exact.includes(i)).length / exact.length;
console.log('exact top-3:', exact.join(','));
console.log('IVF  top-3:', probed.join(','));
console.log('recall@3 compared to exact:', recall);
if (recall !== 1) process.exit(1);