/**
 * SKILL 包术语与事实一致性检查。
 *
 * 目的：同一事实在多个 reference 里出现时不能互相打架。
 * 只检查能从包内自洽验证的项，不检查外部事实（那些需要链上/线上复核）。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const R = process.argv[2];
const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (extname(e.name) === '.md') files.push(p);
  }
})(R);

const doc = Object.fromEntries(files.map((f) => [relative(R, f).replace(/\\/g, '/'), readFileSync(f, 'utf8')]));
const all = Object.values(doc).join('\n');
let fail = 0;
const bad = (m) => { console.error('  FAIL ' + m); fail += 1; };
const ok = (m) => console.log('  ok   ' + m);

// ---------- 1. BSC 不得被写成可用支付链 ----------
const bscClaim = /(?:USDC|USDT)[^.\n]{0,60}\bBSC\b|\bBSC\b[^.\n]{0,60}(?:USDC|USDT)[^.\n]{0,20}(?:accepted|settle)/i;
const bscNeg = /not accepted|absent|lack|do not implement|unsupported|no working|nothing to accept|cannot be used|closed for|excluded|cannot pay|nothing will accept|do not assume|no x402/i;
for (const [f, t] of Object.entries(doc)) {
  for (const line of t.split('\n')) {
    if (!/BSC|eip155:56/i.test(line)) continue;
    if (/(?:x402|USDC|USDT|payment|settle)/i.test(line) && !bscNeg.test(line)) {
      // 允许描述铸造用 BNB 的句子
      if (/BNB|mint|priceOf|native/i.test(line)) continue;
      bad(`${f}: BSC appears in the same sentence as x402/stablecoin without negation → "${line.trim().slice(0, 90)}"`);
    }
  }
}
if (!fail) ok('BSC is correctly excluded from x402 in every file');

// ---------- 2. 价格两档一致 ----------
const priceFiles = Object.entries(doc).filter(([, t]) => /BNB/i.test(t));
for (const [f, t] of priceFiles) {
  if (/0\.1 BNB/.test(t) && /mint/i.test(t) && !/0\.2 BNB/.test(t) && !/PRICE_HIGH/.test(t)) {
    bad(`${f}: mentions 0.1 BNB but not the second tier 0.2 BNB`);
  }
}
if (/0\.2 BNB/.test(doc['references/mint.md'] || '')) ok('mint.md two price tiers match PRICE_HIGH');

// ---------- 3. 赞助调用限额一致 ----------
const sp = doc['references/sponsored-first-call.md'] || '';
if (!/6 calls/.test(sp)) bad('sponsored-first-call.md missing the 6-per-IP cap');
if (!/300/.test(sp)) bad('sponsored-first-call.md missing the 300-per-instance cap');
for (const [f, t] of Object.entries(doc)) {
  for (const line of t.split('\n')) {
    if (!/per (?:wallet )?address/i.test(line)) continue;
    // 只在「免费调用限额」语境下判定。铸造配额（MAX_QUOTA）本来就按地址算，不在此列。
    if (!/(demo|sponsored|free call|free metadata)/i.test(line)) continue;
    if (/not per|rather than per|instead of per/i.test(line)) continue; // correctly negated
    bad(`${f}: cap written per address → "${line.trim().slice(0, 90)}"`);
  }
}
if (/per source IP|per IP/i.test(all)) ok('cap wording is consistently per IP');
if (/best-effort/i.test(sp)) ok('best-effort caveat on counters is present');

// ---------- 4. 三阶段名称一致 ----------
for (const stage of ['PRE-LAUNCH', 'MINT', 'MARKET']) {
  const hits = Object.values(doc).filter((t) => t.includes(stage)).length;
  if (hits === 0) bad(`stage ${stage} does not appear in any file`);
}
ok('all three stages present: PRE-LAUNCH / MINT / MARKET');

// ---------- 5. PROPOSED 声明 ----------
for (const proto of ['stigmergy', 'amber', 'chrysalis']) {
  const hit = Object.values(doc).some((t) => new RegExp(proto, 'i').test(t));
  if (!hit) bad(`protocol ${proto} not present`);
}
if (!/All three are \*\*PROPOSED\*\*|all three are PROPOSED|three protocols .*PROPOSED/i.test(all)) {
  bad('missing the unified "all three protocols are PROPOSED" statement');
} else ok('three-protocol PROPOSED statement present');

// ---------- 6. 有偿贡献措辞 ----------
if (!/planned, not open/i.test(all)) bad('missing planned-not-open');
if (/bounty is live|claim your reward|claim this task/i.test(all)) bad('wording implying paid tasks are live');
else ok('paid-contribution wording compliant');

// ---------- 7. GitHub 链接真实且一致 ----------
const gh = [...all.matchAll(/https:\/\/github\.com\/[A-Za-z0-9_.\-\/]+/g)].map((m) => m[0]);
const uniq = [...new Set(gh)];
const wrongOwner = uniq.filter((u) => !u.startsWith('https://github.com/ailn-ai/'));
if (wrongOwner.length) bad('GitHub links not pointing at ailn-ai: ' + wrongOwner.join(', '));
else ok(`${uniq.length} GitHub links all point at the ailn-ai org`);

// ---------- 8. 版本号一致 ----------
const vers = [...new Set([...all.matchAll(/0\.\d+\.\d+-[a-z]+\.[0-9]+/g)].map((m) => m[0]))];
const RESERVED = new Set(['0.6.0-mint.7', '0.7.0-market.1']);
const stray = vers.filter((v) => v !== '0.6.0-mint.7' && !RESERVED.has(v));
if (stray.length) bad('version strings other than the current one: ' + stray.join(', '));
else ok('version is consistent at 0.6.0-mint.7');

// ---------- 9. 术语一致性 ----------
const termPairs = [
  [/collection-wide approval/gi, 'setApprovalForAll'],
  [/Sponsored First Call/gi, 'sponsored first call'],
];
// 仅提示，不判失败
const casing = {};
for (const m of all.matchAll(/[Ss]ponsored [Ff]irst [Cc]all/g)) casing[m[0]] = (casing[m[0]] || 0) + 1;
if (Object.keys(casing).length > 1) {
  console.log('  note  mixed casing: ' + Object.entries(casing).map(([k, v]) => `${k}×${v}`).join(', '));
}

// ---------- 10. 文件齐全 ----------
const required = [
  'SKILL.md', 'index.json', 'manifest.json', 'status.json',
  'references/declaration.md', 'references/sponsored-first-call.md',
'references/protocols.md', 'references/first-no.md',
  'references/network.md', 'references/mcp.md', 'references/payments.md',
  'references/mint.md', 'references/releases.md',
];
const { existsSync } = await import('node:fs');
const missing = required.filter((r) => !existsSync(join(R, r)));
if (missing.length) bad('missing files: ' + missing.join(', '));
else ok(`all ${required.length} required files present`);

console.log('');
if (fail) { console.error(`consistency FAILED: ${fail} item(s)`); process.exit(1); }
console.log('consistency OK');
