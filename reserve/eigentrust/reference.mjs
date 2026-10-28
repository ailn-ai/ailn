// EigenTrust power iteration over a small local-trust matrix.
// Scope: the iterative algorithm on synthetic trust; no Sybil resistance claims.
const C = [
  [0, 1, 0, 0],
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [0, 0, 1, 0],
].map((row) => { const s = row.reduce((a, b) => a + b, 0); return row.map((v) => v / s); });
const p = [1, 0, 0, 0];
const alpha = 0.15;

function iterate(t0) {
  let t = t0.slice(), delta = Infinity;
  for (let i = 0; i < 500; i++) {
    const next = new Array(4).fill(0);
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) next[b] += C[a][b] * t[a];
    for (let b = 0; b < 4; b++) next[b] = (1 - alpha) * next[b] + alpha * p[b];
    delta = next.reduce((s, v, b) => s + Math.abs(v - t[b]), 0);
    t = next;
    if (delta < 1e-13) break;
  }
  return { t, delta };
}

const a = iterate(p);
const b = iterate([0.25, 0.25, 0.25, 0.25]);
const sum = a.t.reduce((x, y) => x + y, 0);
const sameFixedPoint = a.t.every((v, i) => Math.abs(v - b.t[i]) < 1e-9);
const order = a.t.map((v, i) => [i, v]).sort((x, y) => y[1] - x[1]).map(([i]) => i);

console.log('scores:', a.t.map((v) => v.toFixed(6)).join(' '));
console.log('converged, delta:', a.delta.toExponential(2));
console.log('sum ~ 1:', Math.abs(sum - 1) < 1e-9);
console.log('same fixed point from a uniform start:', sameFixedPoint);
console.log('ranking:', order.join(','));
if (!(Math.abs(sum - 1) < 1e-9) || a.delta > 1e-9 || !sameFixedPoint) process.exit(1);