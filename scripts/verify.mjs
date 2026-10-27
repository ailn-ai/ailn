/**
 * Repository verification. What CI runs.
 *
 * Three checks:
 *   1. docs   — required files exist and required sections are present
 *   2. links  — every relative markdown link resolves
 *   3. scan   — sensitivity scan (delegates to scan.mjs)
 *
 * This is a consistency check, not a proof of correctness.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(import.meta.dirname, '..');
const only = (process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || null;
let failures = 0;

const fail = (msg) => { console.error('  FAIL ' + msg); failures += 1; };
const ok = (msg) => console.log('  ok   ' + msg);

// ---------- 1. docs ----------
function checkDocs() {
  console.log('\n[docs]');
  const required = {
    'README.md': ['Status of everything', 'What actually works today', 'License'],
    'AGENT.md': ['What this repo is', 'Structure', 'Commands', 'Core invariants', 'Gotchas'],
    'DEVELOPMENT.md': ['Setup', 'Testing', 'Boundaries'],
    'CONTRIBUTING.md': ['What counts as a contribution', 'Before you open a PR'],
    'SECURITY.md': ['Reporting a vulnerability', 'Known limitations'],
    'ROADMAP.md': ['Where things actually stand', 'Explicitly not planned'],
    'LICENSE': ['MIT License'],
    'LICENSE-SCOPE.md': ['NOT covered by MIT'],
    'protocols/stigmergy/README.md': ['PROPOSED'],
    'protocols/amber/README.md': ['PROPOSED'],
    'protocols/chrysalis/README.md': ['PROPOSED'],
    'docs/WHAT-IS-NOT-HERE.md': ['What this means for you'],
    'docs/X402.md': ['How payment works'],
    'skill/ailn/references/releases.md': ['Release policy'],
  };
  for (const [file, needles] of Object.entries(required)) {
    const p = join(ROOT, file);
    if (!existsSync(p)) { fail(`${file} missing`); continue; }
    const text = readFileSync(p, 'utf8');
    for (const n of needles) {
      if (!text.includes(n)) fail(`${file} missing section: "${n}"`);
    }
  }
  if (!failures) ok(`all ${Object.keys(required).length} required files have their sections`);

  // protocol status must say PROPOSED somewhere unambiguous
  for (const name of ['stigmergy', 'amber', 'chrysalis']) {
    const p = join(ROOT, 'protocols', name, 'README.md');
    if (!existsSync(p)) continue;
    const t = readFileSync(p, 'utf8');
    if (!/Status:\s*`PROPOSED`/.test(t)) fail(`protocols/${name} does not declare Status: PROPOSED`);
  }

  // paying-contribution phrasing must be the permitted one, never an offer
  const contrib = readFileSync(join(ROOT, 'CONTRIBUTING.md'), 'utf8');
  if (!contrib.includes('Paid contributions are planned, not open')) {
    fail('CONTRIBUTING.md missing the required planned-not-open statement');
  }
  /**
   * Only flag actual offers, not mentions in a rejected-phrases list.
   * A line that also contains a negation or the word "rejected" is not an offer.
   */
  const lower = contrib.toLowerCase();
  for (const bad of ['bounty is live', 'claim this task', 'apply for a bounty', 'available now']) {
    for (const line of lower.split('\n')) {
      if (!line.includes(bad)) continue;
      if (/reject|not |no |never|forbidden|planned/.test(line)) continue;
      fail(`CONTRIBUTING.md appears to offer a program: "${bad}"`);
    }
  }
  ok('contribution phrasing is planned-not-open');
}

// ---------- 2. links ----------
function checkLinks() {
  console.log('\n[links]');
  const mdFiles = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (extname(e.name) === '.md') mdFiles.push(p);
    }
  })(ROOT);

  let checked = 0;
  for (const f of mdFiles) {
    const text = readFileSync(f, 'utf8');
    const rel = relative(ROOT, f).replace(/\\/g, '/');
    const re = /\[[^\]]*\]\(([^)\s]+)\)/g;
    let m;
    while ((m = re.exec(text))) {
      const target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      const clean = target.split('#')[0];
      if (!clean) continue;
      checked += 1;
      const resolved = resolve(dirname(f), clean);
      if (!existsSync(resolved)) fail(`${rel} → broken link: ${target}`);
    }
  }
  if (!failures) ok(`${mdFiles.length} markdown files, ${checked} relative links resolve`);
}

// ---------- 3. scan ----------
function checkScan() {
  console.log('\n[scan]');
  try {
    const out = execFileSync(process.execPath, [join(ROOT, 'scripts', 'scan.mjs'), ROOT], { encoding: 'utf8' });
    process.stdout.write(out.split('\n').filter((l) => l.trim()).map((l) => '  ' + l + '\n').join(''));
  } catch (e) {
    const out = (e.stdout || '') + (e.stderr || '');
    process.stdout.write(out.split('\n').filter((l) => l.trim()).map((l) => '  ' + l + '\n').join(''));
    fail('scan reported blockers');
  }
}

if (!only || only === 'docs') checkDocs();
if (!only || only === 'links') checkLinks();
if (!only || only === 'scan') checkScan();

console.log('');
if (failures) {
  console.error(`verify FAILED with ${failures} problem(s)`);
  process.exit(1);
}
console.log('verify OK — docs consistent, links resolve, scan clean (pattern scan only)');
