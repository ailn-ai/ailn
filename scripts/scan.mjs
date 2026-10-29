/**
 * Sensitivity scan. Pattern-based, deliberately conservative about what it claims.
 *
 * A passing run is NOT a security guarantee. It catches known credential formats and the
 * project's hard exclusions. It cannot detect a leak in prose.
 *
 * Exit codes: 0 = clean, 2 = blocker found.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.argv[2] || '.';
const SKIP_EXT = new Set(['.png','.jpg','.jpeg','.gif','.webp','.ico','.svg','.mp4','.webm','.woff','.woff2','.ttf','.otf','.zip','.pdf','.map','.lock','.wasm','.bin']);
const SKIP_DIR = new Set(['node_modules','.git','dist','.cache']);
/**
 * The scanner matches its own rule literals. Excluding it is honest self-reference
 * handling, not a loophole: this file contains no secrets, only the patterns to find them.
 */
const SKIP_FILES = new Set(['scripts/scan.mjs']);

const BLOCKERS = [
  { id: 'PRIVATE_KEY', re: /\b(?:0x)?[0-9a-fA-F]{64}\b(?=[^\n]{0,80}(?:privateKey|PRIVATE_KEY|secretKey|signer))/, why: 'possible private key' },
  { id: 'MNEMONIC', re: /\b(?:abandon abandon|test test test|witch collapse practice)\b/i, why: 'possible seed phrase' },
  { id: 'SLACK_TOKEN', re: /xox[baprs]-[0-9A-Za-z-]{10,}/, why: 'Slack token' },
  { id: 'API_KEY', re: /\bsk-[A-Za-z0-9_-]{20,}\b/, why: 'API key' },
  { id: 'GITHUB_TOKEN', re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/, why: 'GitHub token' },
  { id: 'AWS_KEY', re: /\bAKIA[0-9A-Z]{16}\b/, why: 'AWS key id' },
  { id: 'BEARER', re: /\bBearer\s+[A-Za-z0-9._-]{30,}/, why: 'hardcoded bearer token' },
  { id: 'JWT', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, why: 'JWT' },
  { id: 'UPSTREAM', re: /\bmonid\b|MONID_API_KEY|api\.monid\.ai|context\.dev/i, why: 'third-party upstream identity (hard project requirement)' },
];

const KNOWN_PUBLIC = new Set([
  '0x5a5514f65e1ecb8de1c369c2703859f5f107ed52',
  '0x94f56f6070d61b6a2a5433b1ed1cbad8fe7b749e',
  '0x0000000000000068f116a894984e2db1123eb395',
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
  '0x00000000f9490004c11cef243f5400493c00ad63',
  '0x60b9262456de011f7d15a54cdd8c48baaa8b022f',
  '0x0000000000000000000000000000000000000000',
]);

function walk(dir, out = []) {
  let ents; try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of ents) {
    if (e.name.startsWith('.') && !['.github', '.env.example'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!SKIP_DIR.has(e.name)) walk(p, out); }
    else if (!SKIP_EXT.has(extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}

import { relative as relPath } from 'node:path';
const files = walk(ROOT).filter((f) => !SKIP_FILES.has(relPath(ROOT, f).replace(/\\/g, '/')));
const blockers = [];
const notes = [];
for (const f of files) {
  let text;
  try { if (statSync(f).size > 4 * 1024 * 1024) continue; text = readFileSync(f, 'utf8'); } catch { continue; }
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  const lines = text.split(/\r?\n/);
  for (const r of BLOCKERS) {
    for (let i = 0; i < lines.length; i++) {
      if (!r.re.test(lines[i])) continue;
      blockers.push({ rule: r.id, file: rel, line: i + 1, why: r.why, sample: lines[i].trim().slice(0, 100) });
      break;
    }
  }
  // addresses that are not on the allowlist
  lines.forEach((line, i) => {
    const addrs = line.match(/\b0x[0-9a-fA-F]{40}\b/g) || [];
    const unknown = addrs.filter((a) => !KNOWN_PUBLIC.has(a.toLowerCase()));
    if (unknown.length) notes.push({ file: rel, line: i + 1, addrs: unknown, sample: line.trim().slice(0, 100) });
  });
}

console.log(`scan: ${files.length} files`);
console.log(`blockers: ${blockers.length}`);
console.log(`unverified addresses: ${notes.length}`);
for (const b of blockers) console.log(`  BLOCK ${b.rule} ${b.file}:${b.line} — ${b.why}\n      > ${b.sample}`);
if (notes.length) {
  console.log('  Unverified addresses need a verification method in the same file:');
  for (const n of notes) console.log(`    ${n.file}:${n.line}  ${n.addrs.join(', ')}`);
}
if (blockers.length) process.exit(2);
console.log('scan OK (pattern scan only — not a security guarantee)');
