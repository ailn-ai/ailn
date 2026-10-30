#!/usr/bin/env node
/**
 * Build the EIP-712 payload for one paid call, and print the digest that must be signed.
 *
 * Dependency-free apart from the vendored @noble/hashes copy in third_party/.
 * It does NOT hold a key and does NOT sign. Hand the printed typed-data object to a wallet
 * (eth_signTypedData_v4) or to an agent that owns one, then pass --signature to get the header.
 *
 * Usage:
 *   node examples/paid-call/build-payload.mjs
 *   node examples/paid-call/build-payload.mjs --from 0xabc… --signature 0x1234…
 */

import { keccak_256 } from '../../third_party/noble-hashes/sha3.js';
import { randomBytes } from 'node:crypto';

// Base USDC defaults, taken from a live challenge (see docs/PAID-CALL.md)
const DEFAULTS = {
  network: 'eip155:8453',
  asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  name: 'USD Coin',
  version: '2',
  chainId: 8453,
  to: '0x1a45727757E3aF2A688842ce1687056DB2308adC',
  value: '3795',
};

const argv = process.argv.slice(2);
const arg = (key, fallback) => {
  const i = argv.indexOf('--' + key);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const bytes = (s) => new TextEncoder().encode(s);
const hex = (b) => Buffer.from(b).toString('hex');
const word = (n) => Buffer.from(BigInt(n).toString(16).padStart(64, '0'), 'hex');
const addr = (a) => Buffer.from(a.replace(/^0x/, '').toLowerCase().padStart(64, '0'), 'hex');

const now = Math.floor(Date.now() / 1000);
const cfg = {
  ...DEFAULTS,
  from: arg('from', '0x0000000000000000000000000000000000000000'),
  validAfter: arg('validAfter', String(now - 600)),
  validBefore: arg('validBefore', String(now + 900)),
  nonce: arg('nonce', '0x' + randomBytes(32).toString('hex')),
  signature: arg('signature', ''),
  network: arg('network', DEFAULTS.network),
  asset: arg('asset', DEFAULTS.asset),
  name: arg('name', DEFAULTS.name),
  version: arg('version', DEFAULTS.version),
  chainId: Number(arg('chainId', String(DEFAULTS.chainId))),
  to: arg('to', DEFAULTS.to),
  value: arg('value', DEFAULTS.value),
};

const TRANSFER_TYPE =
  'TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,' +
  'uint256 validBefore,bytes32 nonce)';
const DOMAIN_TYPE =
  'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';

const domainSeparator = keccak_256(Buffer.concat([
  keccak_256(bytes(DOMAIN_TYPE)),
  keccak_256(bytes(cfg.name)),
  keccak_256(bytes(cfg.version)),
  word(cfg.chainId),
  addr(cfg.asset),
]));
const structHash = keccak_256(Buffer.concat([
  keccak_256(bytes(TRANSFER_TYPE)),
  addr(cfg.from),
  addr(cfg.to),
  word(cfg.value),
  word(cfg.validAfter),
  word(cfg.validBefore),
  Buffer.from(cfg.nonce.replace(/^0x/, '').padEnd(64, '0').slice(0, 64), 'hex'),
]));
const digest = '0x' + hex(keccak_256(Buffer.concat([
  Buffer.from([0x19, 0x01]), domainSeparator, structHash,
])));

const typedData = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    TransferWithAuthorization: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'validAfter', type: 'uint256' },
      { name: 'validBefore', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  },
  primaryType: 'TransferWithAuthorization',
  domain: {
    name: cfg.name,
    version: cfg.version,
    chainId: cfg.chainId,
    verifyingContract: cfg.asset,
  },
  message: {
    from: cfg.from,
    to: cfg.to,
    value: cfg.value,
    validAfter: cfg.validAfter,
    validBefore: cfg.validBefore,
    nonce: cfg.nonce,
  },
};

console.log('network     ', cfg.network);
console.log('typed data  (hand this to eth_signTypedData_v4):');
console.log(JSON.stringify(typedData, null, 2));
console.log('');
console.log('digest      ', digest);
console.log('');

if (!cfg.signature) {
  console.log('No --signature given, so there is no header yet.');
  console.log('After signing, re-run with --signature 0x… and this prints PAYMENT-SIGNATURE.');
} else {
  const header = Buffer.from(JSON.stringify({
    authorization: {
      from: cfg.from,
      to: cfg.to,
      value: cfg.value,
      validAfter: cfg.validAfter,
      validBefore: cfg.validBefore,
      nonce: cfg.nonce,
    },
    signature: cfg.signature,
  })).toString('base64');
  console.log('PAYMENT-SIGNATURE:');
  console.log(header);
  console.log('');
  console.log('Retry the same tool call with that header set, e.g.');
  console.log('  curl -s https://ailn.ai/mcp -H "content-type: application/json" \\');
  console.log('    -H "PAYMENT-SIGNATURE: ' + header.slice(0, 16) + '…" \\');
  console.log('    -d \'{"jsonrpc":"2.0","id":1,"method":"tools/call",' +
    '"params":{"name":"ailn_search","arguments":{"query":"chain test"}}}\'');
}
