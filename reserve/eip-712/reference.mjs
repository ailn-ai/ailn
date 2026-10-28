// EIP-712 digest assembled on top of keccak-256.
//
// keccak-256 is taken from the vendored @noble/hashes copy in third_party/ (MIT, audited) instead of
// a hand-written permutation: one implementation, published vectors, no local crypto to trust.
//
// Scope: keccak-256 is third-party code, checked here against three published vectors.
// The EIP-712 digest is assembled by us and is NOT cross-checked against a third-party signer.
import { keccak_256 } from '../../third_party/noble-hashes/sha3.js';

const hex = (b) => Buffer.from(b).toString('hex');
const bytes = (s) => new TextEncoder().encode(s);

const vectors = [
  ['', 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'],
  ['abc', '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45'],
  ['The quick brown fox jumps over the lazy dog', '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15'],
];
const ok = vectors.every(([input, want]) => hex(keccak_256(bytes(input))) === want);
console.log('keccak256 (vendored noble-hashes) matches 3 published vectors:', ok);
if (!ok) process.exit(1);

// EIP-712: digest = keccak256(0x1901 || domainSeparator || structHash)
const word = (n) => Buffer.from(BigInt(n).toString(16).padStart(64, '0'), 'hex');
const addr = (a) => Buffer.from(a.replace(/^0x/, '').padStart(64, '0'), 'hex');
const typeHash = keccak_256(bytes('Payment(address to,uint256 amount)'));
const domainType = keccak_256(bytes('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'));
// 0x1111... is a placeholder address for this example; it is not an account and holds nothing.
const domain = (chainId) =>
  keccak_256(Buffer.concat([
    domainType, keccak_256(bytes('AILN')), keccak_256(bytes('1')), word(chainId),
    addr('0x5A5514F65e1ECB8dE1C369c2703859f5f107ED52'),
  ]));
const struct = (to, amount) => keccak_256(Buffer.concat([typeHash, addr(to), word(amount)]));
const digest = (to, amount, chainId) =>
  keccak_256(Buffer.concat([Buffer.from([0x19, 0x01]), domain(chainId), struct(to, amount)]));

const d1 = digest('0x1111111111111111111111111111111111111111', 1n, 56);
const d1b = digest('0x1111111111111111111111111111111111111111', 1n, 56);
const d2 = digest('0x1111111111111111111111111111111111111111', 2n, 56);
const d3 = digest('0x1111111111111111111111111111111111111111', 1n, 8453);
console.log('digest is 32 bytes:', d1.length === 32);
console.log('deterministic:', hex(d1) === hex(d1b));
console.log('amount changes digest:', hex(d1) !== hex(d2));
console.log('chainId changes digest:', hex(d1) !== hex(d3));
console.log('sample digest:', hex(d1));
if (d1.length !== 32 || hex(d1) !== hex(d1b) || hex(d1) === hex(d2) || hex(d1) === hex(d3)) process.exit(1);