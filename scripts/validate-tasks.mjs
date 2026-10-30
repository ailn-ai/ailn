#!/usr/bin/env node
/**
 * Validate Task Pact V0 files against tasks/schema/task-pact.schema.json.
 *
 * Dependency-free on purpose: a contributor has to be able to run this on a clean clone
 * with no install step, and a reviewer has to be able to trust that the check is the one
 * described in the docs.
 *
 * Usage:  node scripts/validate-tasks.mjs [dir]
 * Exit:   0 all valid, 1 at least one problem
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DIR = process.argv[2] || join(ROOT, 'tasks');

const STATUSES = ['OPEN', 'CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEW', 'ACCEPTED', 'REJECTED', 'CLOSED'];
const RISKS = ['low', 'medium', 'high', 'funds'];
const CLAIMED = new Set(['CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEW', 'ACCEPTED']);
const REQUIRED = ['id', 'title', 'problem', 'scope', 'deliverables', 'acceptance', 'evidence',
  'dependencies', 'risk', 'reward', 'status'];
const PROTECTED = ['worker.js', 'skill/ailn/release/', 'contracts/', '_ledger_d1/'];

const problems = [];
const warn = (file, msg) => problems.push(`${file}: ${msg}`);

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

if (!existsSync(DIR)) {
  console.error(`no tasks directory at ${DIR}`);
  process.exit(1);
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'schema').sort();
if (files.length === 0) {
  console.error('no task files found');
  process.exit(1);
}

const tasks = [];
for (const f of files) {
  let t;
  try {
    t = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
  } catch (e) {
    warn(f, `not valid JSON (${e.message})`);
    continue;
  }
  tasks.push({ file: f, t });
}

const ids = new Map();
for (const { file, t } of tasks) {
  for (const k of REQUIRED) if (!(k in t)) warn(file, `missing required field "${k}"`);

  if (!/^task-\d{4}$/.test(t.id || '')) warn(file, `id must look like task-0001, got ${JSON.stringify(t.id)}`);
  if (ids.has(t.id)) warn(file, `duplicate id ${t.id} (also in ${ids.get(t.id)})`);
  ids.set(t.id, file);

  if (typeof t.title !== 'string' || t.title.length < 8) warn(file, 'title too short');
  if (typeof t.problem !== 'string' || t.problem.length < 20) warn(file, 'problem must state an observable problem (>= 20 chars)');

  if (!t.scope || !Array.isArray(t.scope.paths_allowed) || t.scope.paths_allowed.length === 0) {
    warn(file, 'scope.paths_allowed must list at least one path');
  } else {
    for (const p of PROTECTED) {
      if (t.scope.paths_allowed.some((a) => a.includes(p))) warn(file, `scope allows protected path ${p}`);
    }
  }

  for (const k of ['deliverables', 'acceptance']) {
    if (!Array.isArray(t[k]) || t[k].length === 0) warn(file, `${k} must be a non-empty array`);
  }
  if (t.acceptance && t.acceptance.some((a) => /looks good|seems fine|没问题/i.test(a))) {
    warn(file, 'acceptance contains a non-decidable item');
  }

  if (!t.evidence || !Array.isArray(t.evidence.commands) || t.evidence.commands.length === 0) {
    warn(file, 'evidence.commands must list the commands a reviewer runs');
  }
  if (!t.evidence || !Array.isArray(t.evidence.required) || t.evidence.required.length === 0) {
    warn(file, 'evidence.required must say what has to appear in the PR body');
  }

  if (!RISKS.includes(t.risk)) warn(file, `risk must be one of ${RISKS.join('/')}`);
  if (!STATUSES.includes(t.status)) warn(file, `status must be one of ${STATUSES.join('/')}`);

  const r = t.reward || {};
  if (r.type === 'none') {
    if (Object.keys(r).length !== 1) warn(file, 'reward.type=none must not carry other fields');
  } else if (r.type === 'budget') {
    if (!(typeof r.amountUsd === 'number' && r.amountUsd > 0)) warn(file, 'reward.amountUsd must be a positive number');
    if (!r.approvedBy) warn(file, 'reward.approvedBy required');
    if (!isDate(r.approvedAt)) warn(file, 'reward.approvedAt must be YYYY-MM-DD');
    if (r.paidIn !== 'USDC') warn(file, 'reward.paidIn must be USDC');
  } else {
    warn(file, 'reward.type must be "none" or "budget" — tokens, points and future airdrops are not reward values');
  }

  if (CLAIMED.has(t.status) && !t.claimed_by) warn(file, `status ${t.status} but claimed_by is empty`);
  if (t.status === 'OPEN' && t.claimed_by) warn(file, 'OPEN task should not have claimed_by');
  if (t.risk === 'funds' && !(t.notes || '').length) warn(file, 'risk=funds should say who signs off in notes');
}

for (const { t } of tasks) {
  for (const d of t.dependencies || []) {
    if (!ids.has(d)) warn(t.id, `depends on unknown task ${d}`);
  }
}

// summary
const byStatus = {};
for (const { t } of tasks) byStatus[t.status] = (byStatus[t.status] || 0) + 1;
console.log(`tasks dir      ${DIR}`);
console.log(`task files     ${tasks.length}`);
console.log(`status         ${Object.entries(byStatus).map(([k, v]) => `${k}:${v}`).join('  ')}`);
console.log(`agent-friendly ${tasks.filter(({ t }) => t.agent_friendly).length}`);
console.log('');

if (problems.length) {
  for (const p of problems) console.log('FAIL  ' + p);
  console.log(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log('task pacts OK');
