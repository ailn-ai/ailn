# Genesis Builders V1 — handoff

Written 2026-10-30, after the first push (`e051c2e`) and the CI fix (`faa2758`).

---

## What was delivered

| # | 交付物 | 文件 | 状态 |
|---|---|---|---|
| 1 | 仓库现状审计 | `docs/GENESIS-BUILDERS-REPO-AUDIT.md` | 完成，含实测值与取证方法 |
| 2 | 贡献入口 | `docs/GENESIS-BUILDERS-START-HERE.md` | 完成，六步，无钱包要求 |
| 3 | Agent 原生指南 | `AGENT.md` 新增 "Finding work" 一节 | 完成 |
| 4 | Task Pact V0 | `tasks/schema/task-pact.schema.json` + `scripts/validate-tasks.mjs` | 完成，已并入 `npm test` 与 CI |
| 5 | 首批任务池 | `tasks/task-0001..0010.json` + GitHub Issues #1–#10 | 完成，10 项，全部无报酬 |
| 6 | 审查规则 | `docs/CONTRIBUTION-REVIEW-PROTOCOL.md` + 新 PR 模板 | 完成 |
| 7 | 贡献履历 | `contributors/registry.json`、`payments.json` | 完成，**内容为空**（尚无外部贡献） |
| 8 | 付费制度草案 | `docs/GENESIS-BOUNTY-POLICY-DRAFT.md` | 草案，未生效 |
| 9 | 权限与 CI | `.github/workflows/ci.yml`、`pr-steward.yml` | 完成；分支保护**未开**，见下 |
| 10 | 三次陌生 Agent 模拟 | 见 §3 | 完成，全部发现真问题 |
| 11 | 社区地图 | `docs/GENESIS-BUILDERS-COMMUNITY.md` | 完成，链接标 `VERIFY` |
| 12 | 统一工作台 | `docs/GENESIS-BUILDERS-WORKBENCH.md` | 完成 |

---

## 2. 修掉的两处自相矛盾

| 矛盾 | 修法 |
|---|---|
| `CONTRIBUTING.md` 与 PR 模板都写「不得向任何远程推送」——与 Fork→PR 冲突 | 拆成两条：允许推自己的 fork；禁止推 main 与生产资产 |
| `ROADMAP.md` / `SECURITY.md` 五处过期事实 | 按实测改，每条在审计文档 §4 里有取证方法 |

---

## 3. 三次陌生 Agent 模拟（真实失败点，不是 PASS）

测试 agent 只拿到仓库 URL，不读本地工作台。

**A · 新手 Agent** — 选中 `task-0004`，能读懂 scope 与 evidence，判定「可参与」。
发现的真问题：
1. **干净 clone 上 `npm run verify` 直接红** —— `scripts/pr-steward.mjs` 里那条检测泄露的正则，
   被 `scripts/scan.mjs` 当成上游身份拦下（`BLOCK UPSTREAM`）。已修（`faa2758`）。
2. `README.md` 任务链接里混进一个制表符，变成 `asks/`。已修。
3. `README.md` 还写 SKILL 返回 404、以及「没有可领取的任务」，与 `tasks/` 的 10 个 OPEN 冲突。已修。

**B · 编程 Agent** — 在本地分支真做了一次贡献（`task-0004`，27 行，未推送），产出可用 patch 与
符合模板的 PR 正文。发现的真问题：
1. 同一个 `scan` 阻塞（已修）。
2. **`task-0001` / `task-0002` / `task-0006` 的验收内容在 main 上已成立**——我一边建任务一边自己
   把修复做了，这三条照做只会得到空 diff。已在 issue 下注明改为**验证任务**。
3. `verify --only=docs` 仍会打印「scan clean」，措辞误导（**未修**，见 §5）。

**C · 审核 Agent** — 对一份构造的 PR 判 `NEEDS_WORK`，理由全部成立：证据里的 `1/1 passed` 不对应
仓库任何脚本（真实应为 `5/5 passed` 与 `run-reserve` 输出）、缺「故意破坏后失败」的证据、
`run-all` 那行是空操作、Risk 段说「服务改字段测试会失败」而离线 fixture 根本看不到服务。

**结论：审查协议本身是有效的**——它让一个只读 PR 的审查者抓到了伪造迹象，而这正是协议存在的理由。

---

## 4. AI 值守（任务 A）现状

| 项 | 状态 |
|---|---|
| 每次 PR 自动跑 CI | 已配置（`ci.yml`：verify / scan / tasks / conformance，PR 触发） |
| 确定性的中文维护者报告 | 已实现 `scripts/pr-steward.mjs` + `pr-steward.yml`，**不执行 PR 代码、无密钥、无合并权** |
| GitHub Copilot 自动 Code Review | **未评估完成**——需要仓库/组织设置页确认可用性，我无界面权限，列为待办 |
| 自建 LLM Reviewer | **未实现**，只写了隔离要求：独立 job、只读 token、不接触 Secrets、不执行 PR 代码 |
| 重大变更第二 AI 复核 | 写入协议（`risk: high/funds` 需第二审查者），但尚无实例 |
| main 分支保护 | **未开启**，见 §5 |
| 审查状态公开记录 | 每条 PR 有固定评论；工作台 §1 有汇总 |

**替代 AI 的说明**：在拿到 LLM 凭据之前，值班的是**确定性检查器**——它不会漏项，但也不理解语义。
这个差别必须写在报告里，不能让负责人误以为有 AI 在看代码。

---

## 5. 待批准 / 待补

| # | 事项 | 需要谁 | 说明 |
|---|---|---|---|
| 1 | 开启 `main` 分支保护 | 负责人 | 建议：要求 PR、要求 4 项检查、`enforce_admins: false`（避免锁死自己）、禁止强推与删除 |
| 2 | 评估 Copilot Code Review | 负责人（网页） | Settings → Copilot → Code review，看是否可用 |
| 3 | 若自建 LLM Reviewer | 负责人 | 需要 API key 与一个只读 token；实现前先批隔离方案 |
| 4 | `verify --only=docs` 仍打印 `scan clean` | 新任务 | 模拟 B 发现，未修 |
| 5 | 3 条已满足的任务改为验证任务 | 已注明 | 见 §3-B |
| 6 | 社区发布内容 | 负责人 | 首次对外招募文案需审阅后发 |

---

## 6. 这一版没有做到的事

- `contributors/registry.json` **是空的**。没有外部贡献，所以没有记录。这是设计，不是遗漏。
- 分支保护未开，因此「必须走 PR」目前只是文档约定，不是机器约束。
- Copilot 可用性未确认；自建 LLM 审查未实现。
- `examples/paid-call/` 在本次推送中补回，但**未在 CI 中运行**。
- 社区链接标了 `VERIFY`，没有一条经过本机实测。

---

## 7. 验收标准对照

> 一个完全不了解 AILN 的外部 Agent，能够：阅读仓库 → 发现任务 → 自愿参与 → 提交可验证成果 →
> 接受独立审查 → 获得正式贡献记录。

| 环节 | 现在是否成立 | 证据 |
|---|---|---|
| 阅读仓库 | 成立 | 模拟 A 读通六步 |
| 发现任务 | 成立 | 10 个 issue，9 个 `agent-friendly` |
| 自愿参与 | 成立 | 无需钱包/代币/Agent ID，已写入 START-HERE |
| 提交可验证成果 | 成立 | 模拟 B 真做出 27 行贡献与完整 PR 正文 |
| 接受独立审查 | 成立 | 模拟 C 按协议返回 `NEEDS_WORK` 并给出理由 |
| 获得正式贡献记录 | **未验证** | 还没有真实合并，registry 为空 |

最后一项只能在第一个真实 PR 合并时才算数。**在那之前，这份交付只能算「制度就绪」，不能算「已运行」。**
