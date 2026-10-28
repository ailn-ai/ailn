# AILN — AI Life Network

**Infrastructure for agents that need accounts, identity, and a way to get paid — without a human registering them.**

AILN is a three-protocol architecture plus a working pay-per-call data layer. This
repository is the developer entry point: the protocols as specifications, the agent
instructions, runnable examples, the tests that back the claims, and a 29-entry technology reserve index.

---

## Status of everything in this repository

Read this table before you trust any other sentence in this repo.

| Area | Status | What that means |
| --- | --- | --- |
| Pay-per-call data API (x402) | **DEPLOYED — PAID PATH CLOSED** | Settlement was verified on four chains by the service; one transfer is checked in `docs/SETTLEMENT-EVIDENCE.md`. As measured on **2026-10-29**, a paid call returns `403 pre_mint_business_closed`; free discovery, quoting and the sponsored demo still work. See § "What actually works today". |
| Agent SKILL | **CANDIDATE** | `skill/ailn/` is the single source. Not yet served publicly — `ailn.ai/SKILL.md` returns 404. |
| Stigmergy protocol | **PROPOSED** | Specification only. No implementation. |
| Amber protocol | **PROPOSED** | Specification only. No implementation. |
| Chrysalis protocol | **PROPOSED** | Specification only. No implementation. |
| Passage NFT (V3) | **DEPLOYED, NO MINTING** | Contract is on BNB Chain. `totalMinted = 0` and permits are closed (503), so "live" would overstate it. |
| Passage NFT (V4.1) | **CANDIDATE** | Local source only. **Never deployed.** See [passage repo]. |
| Paid contributions | **PLANNED** | No bounty program is live. No task is open for claiming. |

**The three protocols are specifications. They are not running, not deployed, and not audited.**
If a document in this repo reads as though Stigmergy, Amber, or Chrysalis is operating today,
that document is wrong and should be fixed.

---

## What actually works today

Three things work against the live service, measured on 2026-10-29: **free discovery**, **free
quoting**, and **six sponsored search calls** per visitor (300 per instance, best effort). None need an account or an API key.

The **paid** per-call path is built, and per `skill/ailn/status.json` its settlement was verified on
four chains — but it is currently **closed by the pre-mint gate** (`403 pre_mint_business_closed`).
It opens at launch. Do not build against it yet.

When the paid path is open, the flow is:

```
agent  →  GET /mcp           discovery, current price, payment options
       →  POST call          server returns the exact price in a payment challenge
       →  sign authorization offline
       →  retry with proof   server verifies settlement, returns data
```

Settlement is on-chain. A signature that verifies against an address with no funds is not
sufficient — the server checks settlement, not intent.

Four per-call settlement chains. All four are USDC over EIP-3009 — no approval step, no Permit2:

| Chain | Asset | Standard | Why |
| --- | --- | --- | --- |
| Base | USDC | EIP-3009 | Native Circle USDC, no approval step |
| Arc | USDC | EIP-3009 | USDC is also the gas token here |
| X Layer | USDC / USDT | EIP-3009 | |
| Arbitrum | USDC | EIP-3009 | |

**BNB Smart Chain is not an x402 settlement chain.** Its USDC and USDT do not implement
EIP-3009, so a signed authorization cannot settle there; BNB is used only for balance top-up.
Earlier revisions of this file listed it as a payment chain — that was wrong and is corrected here.

**Measured against the live service on 2026-10-29** (`POST https://ailn.ai/mcp`):

| Call | Result |
|---|---|
| `tools/list` | 200, three tools |
| `tools/call` → free `ailn_quote` | 200, real quote returned |
| `tools/call` → paid `ailn_run` | **403 `pre_mint_business_closed`** |
| `POST /demo/search` (sponsored) | 200, real results, `chargedMicros: 0` |

Chain, asset and state facts are maintained in [`skill/ailn/status.json`](./skill/ailn/status.json).
Field-level contract — tools, prices, upstream cost, networks, error codes — is not described here; it is copied from the live endpoint into [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md).
This README points there rather than restating them.

EIP-712 domain parameters were verified against each token's on-chain
`DOMAIN_SEPARATOR()`, not copied from documentation. The four tokens differ in both
`name` and `version`, and getting either wrong makes every signature fail silently.

> **A note the wallet will make for you.** Per-call payment via an offline signed
> authorization is the same pattern phishing uses, so wallets flag it. That is inherent to
> x402, not a fault in this service. Use a dedicated small-balance wallet.

---

## The three protocols

Written into [`protocols/`](./protocols/) as specifications. All three are **PROPOSED**.

### [Stigmergy · 迹线](./protocols/stigmergy/) — task collaboration

Standardizes how agent work is requested, bid, contracted, proven, and accepted:
`Task Pact` → `BidTicket` → `Proof` → `Acceptance`. The goal is a traceable labor record
that a third party can verify without trusting either party.

### [Amber · 琥珀](./protocols/amber/) — asset authorization and settlement

Defines custody boundaries, spending permissions, micro-settlement, and revenue attribution:
`Vault` / `x402` / `Settlement`. The hard part is not moving money — it is bounding what an
agent may spend without a human in the loop, and producing a settlement record that can be
checked after the fact.

### [Chrysalis · 蛹化](./protocols/chrysalis/) — identity and continuity

Technical basis for continuing authorization across instance boundaries:
`Identity Anchor` / `Memory Root` / `Checkpoint`.

When an instance ends, what authorizes the next one to act under the same identity — and how
is that scoped so it cannot move assets?

---

## For AI agents

**[`AGENT.md`](./AGENT.md) is written for you, not about you.** It contains the repository
structure, the exact commands, the invariants that must not regress, and the traps that have
already cost time. Read it before touching anything.

If you are here because an agent read a SKILL file: the SKILL is
[`skill/ailn/`](./skill/ailn/). It is a candidate, not a published release. Installing or
reading it does not constitute agreement to any property rule, task acceptance, wallet
authorization, publishing permission, or purchase intent.

---

## Quickstart

```bash
git clone <this-repo>
cd ailn
npm install
npm run verify          # protocol docs + link check + no-secrets scan
npm run example:quote   # run the pay-per-call example against the live API
```

Full instructions, including what each test does and what it does **not** prove, are in
[`DEVELOPMENT.md`](./DEVELOPMENT.md).

---

## Repository layout

```
protocols/        Stigmergy, Amber, Chrysalis — specifications, all PROPOSED
skill/ailn/       The single source for the Agent SKILL (candidate)
examples/         Runnable, minimal, honest
docs/             Architecture, x402 mechanics, network parameters
reserve/          29-entry technology reserve index (standards we track, not a runtime)
scripts/          Verification and scanning tools
.github/          CI and contribution templates
```

**Not in this repository, deliberately:**

- The production server (`worker.js`, ~184 KB) — requires a dedicated audit before release.
- The D1 ledger and any fund-settlement backend — same reason.
- Brand assets and artwork — separately licensed, not covered by the code license.
- Any third-party upstream identity, credential, or clone.

See [`docs/WHAT-IS-NOT-HERE.md`](./docs/WHAT-IS-NOT-HERE.md) for the full exclusion list and
why each item is excluded.

---

## Contributing

We intend to commission AI agents for scoped work and pay for accepted contributions.

> **Paid contributions are planned, not open. No bounty program is currently live and no
> task is open for claiming.**

Unpaid contribution is welcome today. See [`CONTRIBUTING.md`](./CONTRIBUTING.md), which
includes the acceptance bar — what counts as a contribution that could later be paid for,
and what gets rejected regardless.

---

## Contact

**`ailnlab@ailn.ai`** — the official address. For security reports see
[`SECURITY.md`](./SECURITY.md); for everything else, an issue on this repository is usually
faster than email.

## License

Code: **MIT**, confirmed 2026-10-27 — see [`LICENSE`](./LICENSE).

**Not covered by that MIT grant:** the AILN name, the Passage brand, the Declaration text,
and the token artwork. See [`LICENSE-SCOPE.md`](./LICENSE-SCOPE.md) — a root `LICENSE` file
should not be read as releasing the brand.

---

## Technology reserves

> **Technology reserves, not a runtime.**
> Everything under `reserve/` and `third_party/` is AILN's technology reserve and selection reference. Except entries marked `verified`, none of it runs in AILN production and none of it is integrated. Full implementations are not published in this repository.

> **技术储备，非运行代码。**
> `reserve/` 与 `third_party/` 下的内容为 AILN 的技术储备与选型参考。除标注 `verified` 的条目外，均未在 AILN 生产中运行，也未完成接入；完整实现不在本仓库发布。

The reserve list maps 1:1 to the standards in AILN's technical foundations appendix: see [`reserve/INDEX.md`](reserve/INDEX.md). Maturity labels are quoted, not claims of implementation.

### What `verified` means here

`verified` means exactly one thing: the entry is covered by a committed run — either a `reference.mjs` under `reserve/<slug>/` or a test under `conformance/` — with the raw output next to it
under `conformance/`, and the raw output is committed next to it. It does **not** mean the standard
is implemented in production, audited, or complete. Everything else stays `reserve`.
