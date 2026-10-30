#!/usr/bin/env node
/**
 * pr-steward v2 — deterministic first pass on a pull request.
 *
 * What changed from v1, and why:
 *   - Every GitHub API call's status is checked. v1 printed "posted report" even when the call
 *     failed, which is exactly what a fork PR produces.
 *   - A pull request from a fork gets a read-only GITHUB_TOKEN, so the comment POST answers 403.
 *     That is expected. The report is always written to the job summary, which needs no write scope.
 *   - Comments are paginated and the existing report is updated in place instead of one per push.
 *
 * Safety: runs on the BASE commit, never executes contributor code, holds no secrets beyond the
 * default token, cannot merge, deploy or pay.
 *
 * Env: GITHUB_TOKEN, PR, REPO, GITHUB_STEP_SUMMARY (optional)
 */

import { readdirSync, readFileSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { GITHUB_TOKEN, PR, REPO, GITHUB_STEP_SUMMARY } = process.env;
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const MARK = '<!-- pr-steward -->';

const FORBIDDEN = ['worker.js', '_ledger_d1/', 'contracts/', 'skill/ailn/release/', '.github/workflows/', 'ownerapi.txt', '.dev.vars'];
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

async function api(path, init = {}) {
  let r;
  try {
    r = await fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        authorization: `token ${GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'ailn-pr-steward',
        ...(init.headers || {}),
      },
    });
  } catch (e) {
    return { ok: false, status: 0, body: null, error: `network: ${e.name}` };
  }
  const text = await r.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 400) }; }
  return {
    ok: r.status >= 200 && r.status < 300,
    status: r.status,
    body,
    error: r.status >= 300 ? (body && (body.message || body.error)) || 'http error' : null,
  };
}

async function paginate(path) {
  const out = [];
  for (let page = 1; page <= 5; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await api(`${path}${sep}per_page=100&page=${page}`);
    if (!res.ok || !Array.isArray(res.body)) return { out, failed: !res.ok, status: res.status };
    out.push(...res.body);
    if (res.body.length < 100) return { out, failed: false, status: res.status };
  }
  return { out, failed: false, status: 200 };
}

const pull = await api(`/repos/${REPO}/pulls/${PR}`);
if (!pull.ok) { console.error(`cannot read PR: ${pull.status} ${pull.error}`); process.exit(1); }
const pr = pull.body;
const filesRes = await paginate(`/repos/${REPO}/pulls/${PR}/files`);
const files = filesRes.out;

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

let verdict = '建议接受（以 CI 结果为准）';
const reasons = [];
if (forbiddenHits.length) { verdict = '建议拒绝'; reasons.push(`触碰受保护路径：${forbiddenHits.join('、')}`); }
if (secretHits.length) { verdict = '建议拒绝'; reasons.push(`新增内容疑似凭据（${secretHits.length} 行，未在此展示）`); }
if (!forbiddenHits.length && !secretHits.length) {
  if (!task) { verdict = '要求修改'; reasons.push('标题里没有任务编号，无法核对范围与验收标准'); }
  if (outOfScope.length) { verdict = '要求修改'; reasons.push(`超出任务范围：${outOfScope.slice(0, 6).join('、')}`); }
  if (!hasSections) { verdict = '要求修改'; reasons.push('PR 正文缺少 Problem / Change / Evidence / Risk 之一'); }
  if (!hasOutput) { verdict = '要求修改'; reasons.push('没有粘贴真实命令输出'); }
  if (overclaims) { verdict = '要求修改'; reasons.push('协议目录的改动同时使用了 implemented/running/live 这类措辞'); }
  if (big) reasons.push(`diff 共 ${(pr.additions || 0) + (pr.deletions || 0)} 行，超过 400 行，请拆开`);
}

const problemLine = (body.match(/^#*\s*Problem\s*\n+([\s\S]{0,300})/im) || [, '（未填写）'])[1].trim();
const acceptance = task ? task.acceptance.map((a) => `- [ ] ${a}`).join('\n') : '（无任务文件）';
const cmds = task ? task.evidence.commands.map((c) => '`' + c + '`').join(' ') : '（无）';
const fromFork = !!(pr.head.repo && pr.base.repo && pr.head.repo.full_name !== pr.base.repo.full_name);

const report = `${MARK}
## 维护者报告（自动初审，非最终判定）

**建议：${verdict}**

| 项 | 值 |
|---|---|
| 改动文件 | ${touched.length} 个 |
| 新增/删除 | +${pr.additions || 0} / -${pr.deletions || 0} |
| 提交者 | @${pr.user.login}${fromFork ? '（来自 fork）' : ''} |
| 任务 | ${task ? `${task.id} — ${task.title}` : '未匹配到任务文件'} |

### 1. 这个 PR 解决什么实际问题
${problemLine}

### 2. 对应的规格与验收要求
${task ? `任务 \`tasks/${task.id}.json\`，风险 \`${task.risk}\`。\n\n${acceptance}` : '没有任务编号，无法核对。'}

### 3. 测试是否真实通过
本报告**不执行**贡献者的代码。审查者必须自己运行：${cmds}

四项 CI（verify / scan / tasks / conformance）才是机器判定。

### 4. 越权、资金、身份或密钥风险
- 受保护路径：${forbiddenHits.length ? '**命中** ' + forbiddenHits.join('、') : '未命中'}
- 疑似凭据：${secretHits.length ? `**${secretHits.length} 行**` : '未命中'}
- 资金相关：${touched.some((p) => /contracts\/|_ledger_d1\//.test(p)) ? '**涉及，需人工复核**' : '未涉及'}

### 5. 需要你决定的
${reasons.length ? reasons.map((r) => '- ' + r).join('\n') : '- 检查项全过。请自己跑一遍命令再决定是否合并。'}

<sub>由 scripts/pr-steward.mjs 生成。不执行 PR 代码、无密钥、无合并权限。规则见 docs/CONTRIBUTION-REVIEW-PROTOCOL.md</sub>`;

if (GITHUB_STEP_SUMMARY) {
  try {
    appendFileSync(GITHUB_STEP_SUMMARY, '## pr-steward 报告（同时尝试发到 PR）\n\n' + report.replace(MARK, '') + '\n');
  } catch (e) { console.error(`summary write failed: ${e.name}`); }
}

const comments = await paginate(`/repos/${REPO}/issues/${PR}/comments`);
if (comments.failed) {
  console.log(`comments unavailable (HTTP ${comments.status}) — report is in the job summary only`);
  process.exit(0);
}
const mine = comments.out.find((c) => (c.body || '').startsWith(MARK));
const res = mine
  ? await api(`/repos/${REPO}/issues/comments/${mine.id}`, { method: 'PATCH', body: JSON.stringify({ body: report }) })
  : await api(`/repos/${REPO}/issues/${PR}/comments`, { method: 'POST', body: JSON.stringify({ body: report }) });

if (res.ok) {
  console.log(`${mine ? 'updated' : 'posted'} the report (HTTP ${res.status})`);
} else {
  console.log(`could not ${mine ? 'update' : 'post'} the report: HTTP ${res.status} ${res.error}`);
  console.log('A pull request from a fork receives a read-only GITHUB_TOKEN, so writing a comment can be');
  console.log('refused. The report is still in the job summary. This is expected behaviour, not a bug.');
}
console.log(`verdict: ${verdict}`);
