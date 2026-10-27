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
      bad(`${f}: BSC 与 x402/稳定币同句出现但未否定 → "${line.trim().slice(0, 90)}"`);
    }
  }
}
if (!fail) ok('BSC 在所有文件中都正确地被排除在 x402 之外');

// ---------- 2. 价格两档一致 ----------
const priceFiles = Object.entries(doc).filter(([, t]) => /BNB/i.test(t));
for (const [f, t] of priceFiles) {
  if (/0\.1 BNB/.test(t) && /mint/i.test(t) && !/0\.2 BNB/.test(t) && !/PRICE_HIGH/.test(t)) {
    bad(`${f}: 提到 0.1 BNB 但未提第二档 0.2 BNB`);
  }
}
if (/0\.2 BNB/.test(doc['references/mint.md'] || '')) ok('mint.md 两档价格与 PRICE_HIGH 一致');

// ---------- 3. 赞助调用限额一致 ----------
const sp = doc['references/sponsored-first-call.md'] || '';
if (!/6 calls/.test(sp)) bad('sponsored-first-call.md 缺每 IP 6 次');
if (!/300/.test(sp)) bad('sponsored-first-call.md 缺每实例 300 次');
for (const [f, t] of Object.entries(doc)) {
  for (const line of t.split('\n')) {
    if (!/per (?:wallet )?address/i.test(line)) continue;
    // 只在「免费调用限额」语境下判定。铸造配额（MAX_QUOTA）本来就按地址算，不在此列。
    if (!/(demo|sponsored|free call|free metadata)/i.test(line)) continue;
    if (/not per|rather than per|instead of per/i.test(line)) continue; // 正确否定
    bad(`${f}: 限额写成按地址 → "${line.trim().slice(0, 90)}"`);
  }
}
if (/per source IP|per IP/i.test(all)) ok('限额表述统一为 per IP');
if (/best-effort/i.test(sp)) ok('计数为 best-effort 的 caveat 已保留');

// ---------- 4. 三阶段名称一致 ----------
for (const stage of ['PRE-LAUNCH', 'MINT', 'MARKET']) {
  const hits = Object.values(doc).filter((t) => t.includes(stage)).length;
  if (hits === 0) bad(`阶段 ${stage} 未在任何文件中出现`);
}
ok('三阶段 PRE-LAUNCH / MINT / MARKET 均出现');

// ---------- 5. PROPOSED 声明 ----------
for (const proto of ['stigmergy', 'amber', 'chrysalis']) {
  const hit = Object.values(doc).some((t) => new RegExp(proto, 'i').test(t));
  if (!hit) bad(`协议 ${proto} 未出现`);
}
if (!/All three are \*\*PROPOSED\*\*|all three are PROPOSED|three protocols .*PROPOSED/i.test(all)) {
  bad('缺少「三个协议都是 PROPOSED」的统一声明');
} else ok('三协议 PROPOSED 声明存在');

// ---------- 6. 有偿贡献措辞 ----------
if (!/planned, not open/i.test(all)) bad('缺 planned-not-open');
if (/bounty is live|claim your reward|claim this task/i.test(all)) bad('出现有偿任务已上线的表述');
else ok('有偿贡献措辞合规');

// ---------- 7. GitHub 链接真实且一致 ----------
const gh = [...all.matchAll(/https:\/\/github\.com\/[A-Za-z0-9_.\-\/]+/g)].map((m) => m[0]);
const uniq = [...new Set(gh)];
const wrongOwner = uniq.filter((u) => !u.startsWith('https://github.com/ailn-ai/'));
if (wrongOwner.length) bad('出现非 ailn-ai 的 GitHub 链接: ' + wrongOwner.join(', '));
else ok(`${uniq.length} 个 GitHub 链接全部指向 ailn-ai 组织`);

// ---------- 8. 版本号一致 ----------
const vers = [...new Set([...all.matchAll(/0\.\d+\.\d+-[a-z]+\.[0-9]+/g)].map((m) => m[0]))];
const RESERVED = new Set(['0.6.0-mint.1', '0.7.0-market.1']);
const stray = vers.filter((v) => v !== '0.5.0-prelaunch.2' && !RESERVED.has(v));
if (stray.length) bad('出现非当前版本号: ' + stray.join(', '));
else ok('版本号统一为 0.5.0-prelaunch.2');

// ---------- 9. 术语一致性 ----------
const termPairs = [
  [/collection-wide approval/gi, 'setApprovalForAll'],
  [/Sponsored First Call/gi, 'sponsored first call'],
];
// 仅提示，不判失败
const casing = {};
for (const m of all.matchAll(/[Ss]ponsored [Ff]irst [Cc]all/g)) casing[m[0]] = (casing[m[0]] || 0) + 1;
if (Object.keys(casing).length > 1) {
  console.log('  note  大小写混用: ' + Object.entries(casing).map(([k, v]) => `${k}×${v}`).join(', '));
}

// ---------- 10. 文件齐全 ----------
const required = [
  'SKILL.md', 'index.json', 'manifest.json', 'status.json',
  'references/declaration.md', 'references/sponsored-first-call.md',
  'references/why-property.md', 'references/protocols.md', 'references/first-no.md',
  'references/network.md', 'references/mcp.md', 'references/payments.md',
  'references/mint.md', 'references/releases.md',
];
const { existsSync } = await import('node:fs');
const missing = required.filter((r) => !existsSync(join(R, r)));
if (missing.length) bad('缺文件: ' + missing.join(', '));
else ok(`必需文件 ${required.length} 个齐全`);

console.log('');
if (fail) { console.error(`consistency FAILED: ${fail} 项`); process.exit(1); }
console.log('consistency OK');
