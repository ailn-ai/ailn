// Metered payment channel: each state is a signed (nonce, cumulative) pair.
// Scope: single-channel semantics only (monotonic nonce, monotonic cumulative, replay rejected).
import { generateKeyPairSync, sign, verify } from 'node:crypto';
const kp = () => generateKeyPairSync('ed25519');
const payer = kp(), payee = kp();
const channel = 'ch-1';
const payload = (n, c) => Buffer.from(`${channel}|${n}|${c}`);
const state = (n, c) => ({ n, c, sig: sign(null, payload(n, c), payer.privateKey) });
const sigOk = (s) => verify(null, payload(s.n, s.c), payer.publicKey, s.sig);
const accepts = (prev, next) => sigOk(next) && next.n === prev.n + 1 && next.c >= prev.c;

const s1 = state(1, 10), s2 = state(2, 25), s3 = state(3, 25);
const chain = accepts(s1, s2) && accepts(s2, s3);
const replayRejected = !accepts(s2, s1);
const tampered = { ...s2, c: 999 };
const tamperRejected = !sigOk(tampered);
const payeeSignatureOk = verify(null, payload(s3.n, s3.c), payer.publicKey, s3.sig);

console.log('state chain accepted:', chain);
console.log('replayed old state rejected:', replayRejected);
console.log('inflated balance rejected:', tamperRejected);
console.log('payee verifies latest state:', payeeSignatureOk);
console.log('amount owed on close:', s3.c);
if (!chain || !replayRejected || !tamperRejected || !payeeSignatureOk) process.exit(1);