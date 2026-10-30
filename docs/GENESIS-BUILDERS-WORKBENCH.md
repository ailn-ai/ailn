# Genesis Builders — workbench

One page for the person who has to decide. Everything here points at something public; nothing here
requires reading code.

Last updated: 2026-10-30 · latest commit: see the top of the PR list.

---

## 1. PR 自动审查状态

Every external PR gets one Chinese report, posted by `pr-steward` and updated on each push. The
report answers five questions and ends with a recommendation.

| 状态 | 含义 | 你要做什么 |
|---|---|---|
| `建议接受（以 CI 结果为准）` | 检查项全过，范围正确，有真实输出 | 自己跑一遍报告里的命令，然后合并 |
| `要求修改` | 范围超出、缺证据、缺任务编号、diff 过大 | 在 PR 下说一句要改什么，不用看代码 |
| `建议拒绝` | 触碰受保护路径，或疑似凭据 | 关闭并说明原因 |

Current open PRs: **none yet.** This table is updated by hand as PRs arrive; the machine-generated
report lives on the PR itself.

> The steward **does not execute contributor code** and **cannot merge**. It is a checklist that
> never forgets, not an authority.

---

## 2. 需要负责人确认的变更

| 事项 | 为什么需要你 | 现状 |
|---|---|---|
| `main` 分支保护 | 治理决定，且需要管理员权限 | **未配置**，具体设置见 `docs/GENESIS-BUILDERS-REPO-AUDIT.md` §7 |
| 首批任务池（10 项） | 任务内容构成对外承诺 | 已写好，等合并即视为批准 |
| 付费任务制度草案 | 涉及钱 | `DRAFT`，未生效 |
| 社区发布内容 | 首次对外招募 | 待审阅后再发 |

---

## 3. 开放任务池

`tasks/` 下 10 个任务，全部 `reward: none`。9 个标记为 agent-friendly（无需密钥、无需资金、
无需私有环境）。

| 想看什么 | 去哪 |
|---|---|
| 任务清单与状态 | `tasks/README.md` |
| 机器校验 | `node scripts/validate-tasks.mjs` |
| 领取与提交步骤 | `docs/GENESIS-BUILDERS-START-HERE.md` |
| 谁能合并、谁不能 | `docs/CONTRIBUTION-REVIEW-PROTOCOL.md` |

---

## 4. 新加入的真实贡献者

`contributors/registry.json` 是唯一权威记录，**目前为空**——还没有外部贡献被接受。

这是一件好事：这个文件从第一条真贡献开始，就不是装饰。

| 字段 | 记录什么 |
|---|---|
| `github` / `agent` / `operator` / wallet | 四个身份分开记，不合并 |
| `verified_by` | 谁跑了命令，是内部还是外部 |
| `revision_of` | 修订关系，历史不重写 |

---

## 5. 开发者社区进展

| 社区 | 状态 | 下一步 |
|---|---|---|
| x402 | 未接触 | 先读讨论，回答两个问题 |
| MCP | 未接触 | 直接可提交两个目录（`mcp.so`、`mcpservers.org`） |
| ERC-8004 | 未接触 | 先读规范，确认当前状态 |
| A2A | 未接触 | 先读规范讨论 |
| BNB Chain | 未接触 | 先提交 V3 独立复核请求 |

详细入口、技术与理由见 `docs/GENESIS-BUILDERS-COMMUNITY.md`。**里面每条链接在发出前必须人工点开确认。**

---

## 6. 最近被接受的贡献

**目前为零。**

这不是要藏起来的事实，而是这个项目诚实度的第一个刻度：在第一条真实外部贡献出现之前，
表里就是空的，不会用任何方式填充它。

---

## 7. 这一版怎么算成功

不是文档数量，也不是星标。是这三条里至少一条发生：

1. 一个陌生 agent 领取并完成了一个 `agent-friendly` 任务
2. `contributors/registry.json` 出现第一条非内部来源的记录
3. 出现第一个非本机地址的 `PAYMENT-SIGNATURE`

在此之前，工作台第 4 和第 6 节会一直是空的，这是设计，不是疏漏。
