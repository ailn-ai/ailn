// keccak-256 in plain JS, then an EIP-712 digest assembled from it.
// Scope: keccak-256 is checked against published vectors. The typed-data digest is assembled
// correctly but is NOT checked against a third-party signer.
const MASK = (1n << 64n) - 1n;
const ROT = [[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];
const RC = ['0x0000000000000001','0x0000000000008082','0x800000000000808a','0x8000000080008000',
'0x000000000000808b','0x0000000080000001','0x8000000080008081','0x8000000000008009',
'0x000000000000008a','0x0000000000000088','0x0000000080008009','0x000000008000000a',
'0x000000008000808b','0x800000000000008b','0x8000000000008089','0x8000000000008003',
'0x8000000000008002','0x8000000000000080','0x000000000000800a','0x800000008000000a',
'0x8000000080008081','0x8000000000008080','0x0000000080000001','0x8000000080008008'].map(BigInt);
const rotl = (x, n) => (n === 0 ? x : (((x << BigInt(n)) | (x >> BigInt(64 - n))) & MASK));
function perm(A) {
  for (let r = 0; r < 24; r++) {
    const C = new Array(5);
    for (let x = 0; x < 5; x++) C[x] = A[x] ^ A[x + 5] ^ A[x + 10] ^ A[x + 15] ^ A[x + 20];
    for (let x = 0; x < 5; x++) {
      const D = C[(x + 4) % 5] ^ rotl(C[(x + 1) % 5], 1);
      for (let y = 0; y < 25; y += 5) A[y + x] ^= D;
    }
    const B = new Array(25).fill(0n);
    for (let x = 0; x < 5; x++) for (let y = 0; y < 5; y++) {
      B[y + 5 * ((2 * x + 3 * y) % 5)] = rotl(A[x + 5 * y], ROT[x][y]);
    }
    for (let y = 0; y < 25; y += 5) for (let x = 0; x < 5; x++) {
      A[y + x] = B[y + x] ^ ((~B[y + (x + 1) % 5] & MASK) & B[y + (x + 2) % 5]);
    }
    A[0] ^= RC[r];
  }
}
function keccak256(input) {
  const bytes = Buffer.from(input);
  const rate = 136;
  const padded = Buffer.alloc(bytes.length + (rate - (bytes.length % rate)));
  bytes.copy(padded);
  padded[bytes.length] ^= 0x01;
  padded[padded.length - 1] ^= 0x80;
  const A = new Array(25).fill(0n);
  for (let off = 0; off < padded.length; off += rate) {
    for (let i = 0; i < rate / 8; i++) {
      let lane = 0n;
      for (let b = 0; b < 8; b++) lane |= BigInt(padded[off + i * 8 + b]) << BigInt(8 * b);
      A[i] ^= lane;
    }
    perm(A);
  }
  const out = Buffer.alloc(32);
  for (let i = 0; i < 4; i++) {
    let lane = A[i];
    for (let b = 0; b < 8; b++) { out[i * 8 + b] = Number(lane & 0xffn); lane >>= 8n; }
  }
  return out;
}
const hex = (b) => b.toString('hex');
const vectors = [
  ['', 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'],
  ['abc', '4e03657aea45a94fc7d47ba826c8d667c0d1e6e33a64a036ec44f58fa12d6c45'],
  ['The quick brown fox jumps over the lazy dog', '4d741b6f1eb29cb2a9b9911c82f56fa8d73b04959d3d9d222895df6c0b28aa15'],
];
const ok = vectors.every(([i, want]) => hex(keccak256(i)) === want);
console.log('keccak256 matches 3 published vectors:', ok);
if (!ok) process.exit(1);

// EIP-712: digest = keccak256(0x1901 || domainSeparator || structHash)
const word = (n) => Buffer.from(BigInt(n).toString(16).padStart(64, '0'), 'hex');
const addr = (a) => Buffer.from(a.replace(/^0x/, '').padStart(64, '0'), 'hex');
const typeHash = keccak256('Payment(address to,uint256 amount)');
const domainType = keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)');
const domain = (chainId) => keccak256(Buffer.concat([
  domainType, keccak256('AILN'), keccak256('1'), word(chainId), addr('0x5A5514F65e1ECB8dE1C369c2703859f5f107ED52'),
]));
const struct = (to, amount) => keccak256(Buffer.concat([typeHash, addr(to), word(amount)]));
const digest = (to, amount, chainId) => keccak256(Buffer.concat([
  Buffer.from([0x19, 0x01]), domain(chainId), struct(to, amount),
]));
const d1 = digest('0x1111111111111111111111111111111111111111', 1n, 56);
const d1b = digest('0x1111111111111111111111111111111111111111', 1n, 56);
const d2 = digest('0x1111111111111111111111111111111111111111', 2n, 56);
const d3 = digest('0x1111111111111111111111111111111111111111', 1n, 8453);
console.log('digest is 32 bytes:', d1.length === 32);
console.log('deterministic:', hex(d1) === hex(d1b));
console.log('amount changes digest:', hex(d1) !== hex(d2));
console.log('chainId changes digest:', hex(d1) !== hex(d3));
console.log('sample digest:', hex(d1));
if (!(d1.length === 32) || hex(d1) !== hex(d1b) || hex(d1) === hex(d2) || hex(d1) === hex(d3)) process.exit(1);