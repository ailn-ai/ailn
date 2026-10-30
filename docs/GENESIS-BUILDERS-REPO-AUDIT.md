# Genesis Builders — repository audit

Audited at commit `6f4e2fa` on 2026-10-30, against the live repository, its settings via the GitHub
API, and a fresh clone. Every claim below was checked; the method is in the last column.

---

## 1. 现状事实

| 项 | 实测值 | 方法 |
|---|---|---|
| 可见性 | **public** | `GET /repos/ailn-ai/ailn` → `visibility: public` |
| 默认分支 | `main` | 同上 |
| 允许 Fork | **是** | `allow_forking: true` |
| 外部 PR | 可用（PR 触发条件已在 ci.yml 中声明） | `.github/workflows/ci.yml` → `on: pull_request` |
| 分支保护 | **未配置** | `GET /branches/main/protection` → 404 |
| 必需状态检查 | 无 | 同上 |
| 必需审查 | 无 | 同上 |
| Actions | 启用，`allowed_actions: all` | `GET /actions/permissions` |
| 工作流 | `ci`（verify / scan / conformance / example）、`skill-release` | `GET /actions/workflows` |
| 现有标签 | accessibility, bug, documentation, duplicate, enhancement, good first issue, help wanted, invalid, question, wontfix | `GET /labels` |
| Issue 模板 | bug_report, overstatement（+ config.yml） | 仓库文件 |
| PR 模板 | 存在，但含一处与 Fork 流程冲突的条款 | 见 §3 |

**唯一的结构性缺口：main 没有分支保护。** 任何持有写权限的账号可以直接推 main，跳过 PR、
跳过 CI、跳过审查。这与「外部贡献必须走 PR」的目标直接冲突。

---

## 2. 外部 Agent 能否靠现有文件完成首次贡献

按一个陌生 Agent 的路径逐步检查：

| 步骤 | 现有材料 | 结论 |
|---|---|---|
| 这是什么项目 | `README.md` 首屏状态表 | **可以** |
| 什么已实现、什么是规格 | README 状态表 + `protocols/*/README.md` | **可以** |
| 去哪找任务 | **无任务池** | **失败** |
| 验收标准在哪读 | **无任务定义** | **失败** |
| 怎么 Fork、怎么建分支 | 未写 | **失败** |
| 怎么跑测试 | `CONTRIBUTING.md` 给了 `npm run verify` / `npm run test` | **可以** |
| 怎么提 PR | PR 模板存在 | **部分**（模板自相矛盾，见 §3） |
| 怎么响应审查 | 未写 | **失败** |
| 贡献怎么被记录 | 未写 | **失败** |
| 任务有没有报酬 | `CONTRIBUTING.md` 一句"planned, not open" | **可以**（明确说没有） |

**结论：10 步里 4 步可以走通，5 步缺失，1 步自相矛盾。** 现有仓库是"公开代码"，还不是"可被
外部建设的协作网络"。本轮的交付就是补上这 5 步。

---

## 3. 必须先修的一处矛盾：禁止推送

`CONTRIBUTING.md` 的自查清单写：

```
[ ] I did not publish anything or push to a remote
```

`.github/PULL_REQUEST_TEMPLATE.md` 的 Invariants 写：

```
- [ ] I did not publish anything, create a repository, or push to a remote
```

**这与 Fork → PR 的整个流程冲突。** 贡献者必须先推送到自己的 Fork 才能开 PR；按字面读，
每一个合规的 PR 都违反这条。

正确的边界是：

> **允许**推送到贡献者自己的 Fork、自己的分支、自己的仓库。
> **禁止**未经授权修改、发布或部署 AILN 官方生产资产（`main` 分支、生产 Worker、账本、
> 合约、SKILL 发布路由、DNS）。

已按此改写 `CONTRIBUTING.md` 与 PR 模板，改为两条分列的条款。

---

## 4. 过期事实（按证据修正）

| 文件 | 原文 | 实测 | 依据 |
|---|---|---|---|
| `ROADMAP.md` | This open-source repository — `IN PROGRESS`，"Local candidate, not published" | **已公开**，30+ 提交 | 仓库 2026-10-27 起 public |
| `ROADMAP.md` | Agent SKILL — `IN DESIGN`，"not published" | **已由 `ailn.ai/SKILL.md` 提供（200）**，另有 0.6.0-mint.* 系列 | `GET https://ailn.ai/SKILL.md` |
| `ROADMAP.md` | Near term #1 「Publish this repository … Nothing here is reachable until it is public」 | 已完成 | 同上 |
| `ROADMAP.md` | NFT mint open — "Permit issuance returns 503" | 门禁处返回 **403**，源站才 503 | 2026-10-29 实测 `POST /api/mint/permit` |
| `SECURITY.md` | "permit issuance currently returns HTTP 503" | 同上 | 同上 |
| `ROADMAP.md` | Pay-per-call API — "Live on four chains, real settlement verified" | 四条链可用；**链上证据只有 Base 与 Arbitrum**，X Layer 与 Arc 仍是服务端声明 | `docs/SETTLEMENT-EVIDENCE.md` |
| `ROADMAP.md` | Passage V3 — `DONE`，"Deployed" | 正确，但"已部署"不等于"可用"：`totalMinted = 0`、无 permit 路径 | README 状态表 |
| `CONTRIBUTING.md` | 要求 `npm run test` | 正确，且 `test` 现在包含 verify + 两套 conformance | `package.json` |

**修正原则**：只改被证据否定的句子，不改叙述语气；每条改动注明依据。

---

## 5. 外部 PR 会不会泄露密钥或触发部署

| 风险 | 现状 | 判断 |
|---|---|---|
| PR 能否拿到生产 Secrets | 两个工作流都未引用 `secrets.*` | **安全**；但仍应设置 `permissions: contents: read` 显式收紧 |
| PR 能否触发 Cloudflare 部署 | 无部署工作流；`skill-release.yml` 只在 tag/push 时发 Release | **安全**；文本上仍应写死"PR 不部署" |
| 不可信代码能否拿到高权限 Token | 默认为读写仓库的 `GITHUB_TOKEN` | **需要收紧**（改为 `contents: read`） |
| 外部 PR 能否改 `main` | **能**——无分支保护 | **不安全** |
| 能否自动支付 | 无相关 Action | **安全** |

需要改的两件：给工作流加 `permissions:` 最小权限；开启 main 保护。

---

## 6. `passage` 仓库适合开放什么

| 内容 | 适合开放贡献 | 理由 |
|---|---|---|
| 合约注释、README、部署脚本的可读性 | 是 | 不影响链上行为 |
| 测试用例、边界条件补充 | 是 | 只增加覆盖，不改行为 |
| 独立复核报告（第三人复核已部署合约） | 是，收取 | 这正是该仓库最需要的外部输入 |
| 任何会改变 V3 已部署合约行为的改动 | **否** | 合约不可升级，改动无意义且误导 |
| V4.1 的接口级修改 | 需人工复核 | 未部署，但一旦部署即为资金相关 |
| 任何私钥、部署凭证、RPC 付费 key | **永不** | |

**规则**：`passage` 的资金相关改动不走"测试通过即合并"，必须独立复核 + 维护者二次批准。

---

## 7. 需要负责人手动完成的设置（我无权限/不宜代做）

| # | 操作 | 位置 | 为什么必须手工 |
|---|---|---|---|
| 1 | 给 `main` 加分支保护：要求 PR、要求 `verify`/`scan`/`conformance` 通过、禁止强推与删除 | Settings → Branches | 涉及仓库治理，属管理员决定 |
| 2 | 打开 Private vulnerability reporting（如未开） | Settings → Security | 同上 |
| 3 | 确认 `passage` 仓库同样加保护 | 该仓库 Settings | 同上 |
| 4 | 批准首批任务池与标签 | 本 PR 合并即视为批准 | 任务内容含承诺，需负责人确认 |

分支保护一旦开启，本轮之后所有外部 PR 都会被自动要求通过 CI——这是把"制度"变成"机器约束"
的关键一步。

---

## 8. 本轮不动的资产（与任务书一致）

V4.1 合约、Mint 与凭证开关、邀请系统、生产支付与结算、SKILL 正式发布路由、宣言正文与五条
公约、白皮书冻结正文。本轮的改动全部落在文档、模板、Schema 与 CI 配置上。

---

## 9. 审计结论

- 仓库的**内容**质量高于其**协作结构**：状态诚实的文档已经有了，能让人参与的制度还没有。
- 阻塞外部贡献的不是技术，是四个空缺（任务池、验收标准、审查规则、贡献记录）加一处自相矛盾。
- 一处真实风险：main 没有保护，任何有写权限的账号可以绕过全部流程。
- 本轮交付正好覆盖这五项，且不需要新的基础设施。
