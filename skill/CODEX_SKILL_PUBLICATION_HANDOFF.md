# CODEX · SKILL 发布交接

**From:** DSH　**To:** Codex　**Date:** 2026-10-27
**Version:** `0.5.0-prelaunch.4`　**Status:** `CANDIDATE` — 待负责人与主审验收后由你发布

---

## 0. 边界先说清

| 谁 | 负责 |
| --- | --- |
| DSH | SKILL 内容、版本管理、GitHub Release、验收 |
| **Codex（你）** | 官网、Cloudflare Worker、生产路由、网站部署 |

**本轮 DSH 不修改、不部署生产 Worker 或官网文件。** 需要落地的东西全部由你在你的工作流里完成。

已上线的 `POST /demo/search` 保持现状，本交接**不要求你改它**。

---

## 1. 需要公开的路由

### 1.1 主文件

```
GET /SKILL.md
```

### 1.2 九个 references（相对引用可达性是一项发布闸门）

SKILL.md 内部用的是相对链接 `references/xxx.md`。文件挂在 `/SKILL.md` 时，浏览器会把它们解析到根路径，所以**这九个路径必须同时存在**：

```
GET /references/declaration.md
GET /references/first-no.md
GET /references/mcp.md
GET /references/mint.md
GET /references/network.md
GET /references/payments.md
GET /references/protocols.md
GET /references/releases.md
GET /references/sponsored-first-call.md
```

> **替代方案（更整洁，二选一）**：把整包挂在 `/skill/` 下——
> `GET /skill/SKILL.md`、`GET /skill/references/*.md`，并对 `/SKILL.md` 做 302 → `/skill/SKILL.md`。
> 这样相对链接天然成立，根路径也不被污染。**但必须保证 `https://ailn.ai/SKILL.md` 最终返回 200 与 `text/markdown`**，因为对外宣传的唯一入口是那个地址。

### 1.3 索引与包

```
GET /skill/index.json                       当前版本、阶段、入口、五道门
GET /skill/manifest.json                    逐文件 SHA256 与字节数
GET /skill/status.json                      实时服务开关
GET /skill/ailn-skill-0.5.0-prelaunch.4.zip 安装包
```

**ZIP 的 SHA-256**（下载页建议直接展示，便于核对）：

```
2b383c22aed3b6bf6f9e428cce33d8fd86bf9ff05ff6e48d64e697a04d0ac21d
```

ZIP 结构：15 个条目，顶层目录 `ailn/`，全部 `/` 分隔，无绝对路径、无目录穿越。已在 Linux 与 macOS 结构上验证（CI 双跑）。

---

## 2. Content-Type 与响应头

| 路径 | Content-Type | 说明 |
| --- | --- | --- |
| `/SKILL.md` | `text/markdown; charset=utf-8` | **不要用 `text/plain`**——Agent 与浏览器都需要知道这是 Markdown |
| 其余 `*.md` | `text/markdown; charset=utf-8` | 同上 |
| `index.json` / `manifest.json` / `status.json` | `application/json; charset=utf-8` | 不要带 `charset` 以外的多余参数 |
| `*.zip` | `application/zip` | 同时给 `Content-Disposition: attachment; filename="ailn-skill-0.5.0-prelaunch.4.zip"` |

### 缓存

| 路径 | 建议 |
| --- | --- |
| `/SKILL.md` 与 references | `Cache-Control: public, max-age=300, must-revalidate` |
| `status.json` | `Cache-Control: no-store` — **它是实时开关，不能缓存** |
| ZIP（带版本号） | `Cache-Control: public, max-age=31536000, immutable` |

**`/SKILL.md` 不要设长缓存。** SKILL 一旦被 Agent 缓存很久，服务状态变了它还在用旧权限判断——这正是 `status.json` 被单独拆出来的原因。

---

## 3. 发布前的六项核实（缺一项就别发）

| # | 检查 | 通过标准 |
| --- | --- | --- |
| 1 | `/SKILL.md` 可达 | HTTP **200**，`content-type: text/markdown` |
| 2 | 全部十个 references 可达 | 逐个 200，不能有 404 |
| 3 | 相对链接在浏览器里真的能点 | 打开 `/SKILL.md` 渲染页，点三个链接实测 |
| 4 | 三个 JSON 可解析 | `curl \| jq .` 不报错 |
| 5 | ZIP 可下载且能解开 | `unzip -l` 列出 15 条，无 `\` |
| 6 | `/demo/search` 未被影响 | 仍返回真实 JSON（当前已上线，不要回退） |

**这六项 DSH 无法代做**——我碰不到生产路由。

---

## 4. 千万不要做的事

```
✘ 不要改动 SKILL 正文来适配站点（改内容必须走 DSH 的版本流程，并更新 manifest）
✘ 不要从 ailn-public/deploy/SKILL.md 取文件 —— 那是 0.1.0，落后四个版本
✘ 不要用 ppt/deploy/SKILL.md —— 那是 0.4.1，含完整 Mint 操作手册，属 MINT 阶段内容
✘ 不要顺手把 /mint.md、/declaration.zh.md 一起放出来 —— 前者是未开放阶段的配方，
   后者与「SKILL 统一英文」的决定冲突
✘ 不要让站点整体离开 PRE_LAUNCH —— 只放行文档路径，Mint/充值/提现必须继续关着
```

### 关于「只放行文档」

当前站点门禁在 `worker.js` 的 PRE_LAUNCH 分支里，`ALLOW_DOCS` 是空集合。放开文档意味着往那里加路径，或改成独立的路由分支。

**建议做法**：加一个新的窄条件（例如 `isSkillDoc`），只匹配 `/SKILL.md` 与 `/references/*.md` 与 `/skill/*`，**不要动 `ALLOW_DOCS` 的语义**——那个变量同时管着白皮书与其他文档，放开它会连带打开你没打算开的东西。

---

## 5. 请你回报什么

发布完成后，在 `workbench/log.jsonl` 记一条，或直接回我，包含：

```
1  实际生效的 URL 列表（主文件 + references + JSON + ZIP）
2  第 3 节六项核实的原始输出（curl -i 的头几行即可）
3  /demo/search 的回归结果（确认没被影响）
4  站点模式确认仍是 PRE_LAUNCH
```

我拿到这四项会把 `status.json` 里 `canonicalPublicStatus` 从 `NOT_SERVED` 改成 `SERVED`，并把版本状态从 `CANDIDATE` 推进到 `RELEASED`。

**在拿到这四项之前，我不会声称 SKILL 已发布。**

---

## 6. 版本纪律（发布后仍然有效）

```
GitHub                   版本维护源。合并 PR = 改变候选，不等于发布
ailn.ai/SKILL.md         正式分发入口。只能由负责人批准的 Release 生成
```

- Agent **不应**从 GitHub `main` 分支直接执行更新——`main` 随时可能含未批准内容
- 每次发布 `index.json`、`manifest.json`、`status.json` 与 ZIP 必须来自**同一个批准版本**，不得人工拼接
- 改动任何文件后必须重跑 `tools/check-skill.mjs`，否则 manifest 与内容不匹配

---

## 7. 附：包内文件清单

| 文件 | 字节 | 作用 |
| --- | --- | --- |
| `SKILL.md` | 见 manifest | 主文件，宣言 15 段 + 5 条公约逐字内嵌 |
| `index.json` | 见 manifest | 版本、阶段、入口、五道门 |
| `manifest.json` | — | 逐文件 SHA256（自引用不列） |
| `status.json` | 见 manifest | 实时服务状态，**no-store** |
| `references/` × 10 | 见 manifest | 渐进加载 |
| `tools/check-skill.mjs` | 见 manifest | 链接、哈希、宣言逐字、措辞校验 |

**准确的字节数与哈希以 `manifest.json` 为准**，本文件不复制那些数字，避免两处不一致。

---

## 8. 一句话

**你要做的只有一件事：把这 14 个文件按第 1、2 节挂上去，然后跑第 3 节的六项核实回报给我。** 内容是定稿的，不需要你改。
