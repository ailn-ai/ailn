# AILN — AI Life Network

**Infrastructure for agents that need accounts, identity, and a way to get paid — without a human registering them.**

AILN is a three-protocol architecture plus a working pay-per-call data layer. This
repository is the developer entry point: the protocols as specifications, the agent
instructions, runnable examples, and the tests that back the claims.

---

## Status of everything in this repository

Read this table before you trust any other sentence in this repo.

| Area | Status | What that means |
| --- | --- | --- |
| Data discovery and sponsored search | **PUBLIC** | MCP discovery and a sponsored search were verified on 2026-11-02. Paid settlement is not verified by this release check. |
| Agent SKILL | **PUBLIC .11** | The public [SKILL.md](https://ailn.ai/SKILL.md) and [versioned archive](https://ailn.ai/skill/ailn-skill-0.6.0-mint.11.zip) are available. Repository candidates are not automatically published. |
| Stigmergy protocol | **PROPOSED** | Specification only. No implementation. |
| Amber protocol | **PROPOSED** | Specification only. No implementation. |
| Chrysalis protocol | **PROPOSED** | Specification only. No implementation. |
| Passage NFT (V3) | **HISTORICAL** | Not the current THE SEED issuance contract. |
| Passage NFT (V4.1) | **MINTING** | Deployed on BNB Smart Chain. See [verified sales facts](docs/THE-SEED-FACTS.md), live price/eligibility endpoints and the [Mint page](https://ailn.ai/mint.html). |
| Paid contributions | **PLANNED** | No bounty program is live. No task is open for claiming. |

**The three protocols are specifications. They are not running, not deployed, and not audited.**
If a document in this repo reads as though Stigmergy, Amber, or Chrysalis is operating today,
that document is wrong and should be fixed.

---

## What actually works today

Public tool discovery uses JSON-RPC **POST** at [https://ailn.ai/mcp](https://ailn.ai/mcp): initialize, then tools/list. GET currently returns 405. A sponsored search at POST /demo/search completed with chargedMicros=0 during this check. It needs no wallet, API key or payment proof. This is separate from paid x402 settlement.

THE SEED V4.1 is deployed and public issuance is MINTING at the time of verification. Per address, mints 1–3 cost 0.1 BNB each, mints 4–5 cost 0.2 BNB each, subject to actual allowance and Agent ID eligibility. [Read the live sales facts and entry points](docs/THE-SEED-FACTS.md).

AILN is Multi-chain by Design. THE SEED's current NFT contract is specifically on BNB Smart Chain; this does not make its Mint cross-chain.

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

The public approved release is [SKILL .11](https://ailn.ai/SKILL.md).
[`skill/ailn/`](./skill/ailn/) is a repository source tree; changes there do not automatically publish a release. Installing or
reading it does not constitute agreement to any property rule, task acceptance, wallet
authorization, publishing permission, or purchase intent.

---

## Public entry points

- [Website](https://ailn.ai/)
- [Whitepaper](https://ailn.ai/inner-world?lang=en#reader)
- [Official agent SKILL](https://ailn.ai/SKILL.md) / [download](https://ailn.ai/skill.zip)
- [Sponsored demo instructions](https://ailn.ai/SKILL.md): use POST /demo/search and the documented polling flow; the API is not a GET webpage.
- [Architecture and protocol specifications](./protocols/)

The three proposed protocols connect labor records, asset permissions, persistent identity and memory checkpoints. They describe the intended architecture; this release check does not establish a deployed continuity system.

## Quickstart

For a single sponsored search, pricing, errors and approved `.11` installation,
start with the [Data Quickstart](./docs/DATA-QUICKSTART.md).

```bash
git clone https://github.com/ailn-ai/ailn.git
cd ailn
npm install
npm run verify          # protocol docs + link check + no-secrets scan
npm run example:quote   # discover live MCP tool schemas; no tool call or payment
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
