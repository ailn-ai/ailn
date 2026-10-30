#!/usr/bin/env node
/**
 * pr-steward — deterministic first pass on a pull request, posted as one Chinese report.
 *
 * Design constraints (docs/CONTRIBUTION-REVIEW-PROTOCOL.md):
 *   - Runs on the BASE commit; contributor code is never executed here.
 *   - Read-only on contents. No secrets. Cannot merge, deploy, or pay.
 *   - One comment per PR, updated in place on every push, so history stays readable.
 *
 * This is not an AI reviewer. It is a checklist that never forgets. An LLM layer, if added later,
 * goes in a separate job with its own low-privilege token and no secret access.
 *
 * Env: GITHUB_TOKEN, PR, REPO
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { GITHUB_TOKEN, PR, REPO } = process.env;
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const MARK = '<!-- pr-steward -->';

const FORBIDDEN = [
  'worker.js', '_ledger_d1/', 'contracts/', 'skill/ailn/release/',
  '.github/workflows/', 'ownerapi.txt', '.dev.vars',
];
const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\b(sk|pk)_(live|test)_[A-Za-z0-9]{10,}/,
  new RegExp('CLOUDFLARE' + '_API_TOKEN\\s*[:=]'),
  new RegExp('MON' + 'ID_API_KEY\\s*[:=]', 'i'),
  /(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{12,}["']/i,
];

if (!GITHUB_TOKEN || !PR || !REPO) {
  console.error('needs GITHUB_TOKEN, PR, REPO');
  process.exit(1);
}

const api = async (path, init = {}) => {
  const r = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      authorization: `token ${GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'ailn-pr-steward',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  return { status: r.status, body };
};

const pr = (await api(`/repos/${REPO}/pulls/${PR}`)).body;
if (!pr) { console.error('cannot read PR'); process.exit(1); }
const files = (await api(`/repos/${REPO}/pulls/${PR}/files?per_page=100`)).body || [];

// ---- task matching -------------------------------------------------------
let tasks = [];
const tasksDir = join(ROOT, 'tasks');
if (existsSync(tasksDir)) {
  tasks = readdirSync(tasksDir)
    .filter((f) => /^task-\d{4}\.json$/.test(f))
    .map((f) => { try { return JSON.parse(readFileSync(join(tasksDir, f), 'utf8')); } catch { return null; } })
    .filter(Boolean);
}
const idMatch = (pr.title || '').match(/task-\d{4}/);
const task = idMatch ? tasks.find((t) => t.id === idMatch[0]) : null;

// ---- checks --------------------------------------------------------------
const touched = files.map((f) => f.filename);
const forbiddenHits = touched.filter((p) => FORBIDDEN.some((f) => p.includes(f)));
const outOfScope = task
  ? touched.filter((p) => !task.scope.paths_allowed.some((a) => p === a || p.startsWith(a.replace(/\/$/, '') + '/')))
  : [];

const addedLines = files.flatMap((f) => (f.patch || '').split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++')));
const secretHits = addedLines.filter((l) => SECRET_PATTERNS.some((re) => re.test(l)));

const body = pr.body || '';
const hasSections = ['Problem', 'Change', 'Evidence', 'Risk'].every((s) =>
  new RegExp(`^#+\\s*${s}|^${s}\\s*$`, 'im').test(body));
const hasOutput = /```[\s\S]{20,}?```/.test(body);
const overclaims = touched.some((p) => p.startsWith('protocols/')) &&
  /\b(implemented|works|running|live)\b/i.test(body) && !/PROPOSED|specification only/i.test(body);

const big = (pr.additions || 0) + (pr.deletions || 0) > 400;

// ---- verdict -------------------------------------------------------------
let verdict = '建议接受（以 CI 结果为准）';
const reasons = [];
if (forbiddenHits.length) { verdict = '建议拒绝'; reasons.push(`触碰受保护路径：${forbiddenHits.join('、')}`); }
if (secretHits.length) { verdict = '建议拒绝'; reasons.push(`新增内容疑似凭据（${secretHits.length} 行），已折叠不在此展示`); }
if (!forbiddenHits.length && !secretHits.length) {
  if (!task) { verdict = '要求修改'; reasons.push('标题里没有任务编号，无法核对范围与验收标准'); }
  if (outOfScope.length) { verdict = '要求修改'; reasons.push(`超出任务范围：${outOfScope.slice(0, 6).join('、')}`); }
  if (!hasSections) { verdict = '要求修改'; reasons.push('PR 正文缺少 Problem / Change / Evidence / Risk 四段之一'); }
  if (!hasOutput) { verdict = '要求修改'; reasons.push('没有粘贴真实命令输出（代码块里的实际输出才算证据）'); }
  if (overclaims) { verdict = '要求修改'; reasons.push('协议目录的改动同时使用了 "implemented/running/live" 这类措辞'); }
  if (big) reasons.push(`diff 共 ${(pr.additions || 0) + (pr.deletions || 0)} 行，超过 400 行，请拆成两个 PR`);
}

// ---- report --------------------------------------------------------------
const problemLine = (body.match(/^#*\s*Problem\s*\n+([\s\S]{0,300})/im) || [, '（未填写）'])[1].trim();
const rows = [
  ['改动文件', touched.length + ' 个'],
  ['新增/删除', `+${pr.additions || 0} / -${pr.deletions || 0}`],
  ['提交者', `@${pr.user.login}`],
  ['任务', task ? `${task.id} — ${task.title}` : '未匹配到任务文件'],
];

const acceptance = task ? task.acceptance.map((a) => `- [ ] ${a}`).join('\n') : '（无任务文件，无法列出验收项）';
const cmds = task ? task.evidence.commands.map((c) => '`' + c + '`').join(' ') : '（无）';

const report = `${MARK}
## 维护者报告（自动初审，非最终判定）

**建议：${verdict}**

| 项 | 值 |
|---|---|
${rows.map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

### 1. 这个 PR 解决什么实际问题
${problemLine}

### 2. 对应的规格与验收要求
${task ? `任务文件 \`tasks/${task.id}.json\`，风险等级 \`${task.risk}\`。验收项：\n\n${acceptance}` : '没有任务编号，无法核对。请把任务编号写进标题，例如 `task-0003: ...`。'}

### 3. 测试是否真实通过
本报告**不执行**贡献者的代码，因此无法判断测试真假。审查者必须自己运行：

${cmds}

CI 的 \`verify\` / \`scan\` / \`tasks\` / \`conformance\` 四项才是机器判定；此报告只是提醒你该做什么。

### 4. 越权、资金、身份或密钥风险
- 受保护路径：${forbiddenHits.length ? '**命中** ' + forbiddenHits.join('、') : '未命中'}
- 疑似凭据：${secretHits.length ? `**${secretHits.length} 行**` : '未命中'}
- 资金相关文件（contracts/、账本）：${touched.some((p) => /contracts\/|_ledger_d1\//.test(p)) ? '**涉及，需人工二次复核**' : '未涉及'}

### 5. 需要你决定的
${reasons.length ? reasons.map((r) => '- ' + r).join('\n') : '- 检查项全部通过。请自己跑一遍上面的命令，然后决定是否合并。'}

<sub>由 \`scripts/pr-steward.mjs\` 生成。它不执行 PR 代码、不持有密钥、无合并权限。规则见 \`docs/CONTRIBUTION-REVIEW-PROTOCOL.md\`。</sub>`;

const comments = (await api(`/repos/${REPO}/issues/${PR}/comments?per_page=100`)).body || [];
const mine = comments.find((c) => (c.body || '').startsWith(MARK));
if (mine) {
  await api(`/repos/${REPO}/issues/comments/${mine.id}`, { method: 'PATCH', body: JSON.stringify({ body: report }) });
  console.log('updated existing report');
} else {
  await api(`/repos/${REPO}/issues/${PR}/comments`, { method: 'POST', body: JSON.stringify({ body: report }) });
  console.log('posted report');
}
console.log(`verdict: ${verdict}`);
