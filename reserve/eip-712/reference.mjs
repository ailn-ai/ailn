// EIP-712: assemble a digest, then check the pipeline against values read from three chains.
//
// keccak-256 is the vendored @noble/hashes copy (MIT), not a hand-written permutation.
// The strongest check here is not "the digest changes when a field changes" - it is that
// keccak256(abi.encode(typeHash, nameHash, versionHash, chainId, verifyingContract)) reproduces
// each token's on-chain DOMAIN_SEPARATOR() exactly. If the hashing or the ABI encoding were wrong,
// none of the three would match.
//
// Scope: domain separators are verified against chain-derived constants (docs/EIP712-DOMAINS.md).
// No signature is produced or verified here - that needs a signing key.
import { keccak_256 } from '../../third_party/noble-hashes/sha3.js';

const hex = (b) => Buffer.from(b).toString('hex');
const bytes = (s) => new TextEncoder().encode(s);
const word = (n) => Buffer.from(BigInt(n).toString(16).padStart(64, '0'), 'hex');
const addr = (a) => Buffer.from(a.replace(/^0x/, '').toLowerCase().padStart(64, '0'), 'hex');

const vectors = [
  ['', 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'],
  ['abc', '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45'],
  ['The quick brown fox jumps over the lazy dog', '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15'],
];
const keccakOk = vectors.every(([input, want]) => hex(keccak_256(bytes(input))) === want);
console.log('keccak256 (vendored noble-hashes) matches 3 published vectors:', keccakOk);
if (!keccakOk) process.exit(1);

const DOMAIN_TYPE = 'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';
const domainSeparator = (name, version, chainId, token) =>
  keccak_256(Buffer.concat([
    keccak_256(bytes(DOMAIN_TYPE)),
    keccak_256(bytes(name)),
    keccak_256(bytes(version)),
    word(chainId),
    addr(token),
  ]));

// Values read with eth_call on 2026-10-29; see docs/EIP712-DOMAINS.md
const known = [
  ['Base', 'USD Coin', '2', 8453, '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    '0x02fa7265e7c5d81118673727957699e4d68f74cd74b7db77da710fe8a2c7834f'],
  ['Arbitrum', 'USD Coin', '2', 42161, '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    '0x08d11903f8419e68b1b8721bcbe2e9fc68569122a77ef18c216f10b3b5112c78'],
  ['X Layer', 'USD Coin', '2', 196, '0x74b7f16337b8972027f6196a17a631ac6de26d22',
    '0xb1671065a2ea487729c4ff0e2f8beb2105e3ce63315ad07483374a3476b83972'],
];

let matched = 0;
for (const [chain, name, version, chainId, token, want] of known) {
  const got = '0x' + hex(domainSeparator(name, version, chainId, token));
  const ok = got === want;
  if (ok) matched++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${chain} DOMAIN_SEPARATOR recomputed from components`);
  if (!ok) console.log(`      got  ${got}\n      want ${want}`);
}
console.log(`\n${matched}/${known.length} on-chain domain separators reproduced`);
if (matched !== known.length) process.exit(1);