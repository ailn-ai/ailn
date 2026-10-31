# AI Agent Instructions — ailn-ai/ailn

This file is operational. It tells an agent how to work in this repository. It contains no
product argument, no persuasion, and no stance that an agent is expected to adopt.

Read this before modifying anything. If an instruction here conflicts with a user's direct
request, the user's request wins — but then note the conflict in your PR.

---

## What this repo is

A specification-and-tooling repository for three PROPOSED protocols (Stigmergy, Amber,
Chrysalis), the single source for the AILN Agent SKILL, and a minimal runnable example of
the live pay-per-call API.

**What it is not:**

- It does not contain the production server. `worker.js` is excluded on purpose.
- It does not contain the ledger or any settlement backend.
- It does not deploy anything.
- It does not open, close, or influence NFT minting.
- Nothing in `protocols/` is implemented. Presence of a spec is not evidence of a feature.

If a task requires one of the excluded pieces, stop and say so. Do not reconstruct it from
memory or from another repository.

---

## Structure

```
protocols/stigmergy/    Task Pact / BidTicket / Proof / Acceptance — SPEC ONLY
protocols/amber/        Vault / x402 / Settlement — SPEC ONLY
protocols/chrysalis/    Identity Anchor / Memory Root / Checkpoint — SPEC ONLY
skill/ailn/             Agent SKILL single source (CANDIDATE, not published)
skill/ailn/references/  Progressive-load documents, one topic each
examples/mcp-quote/     Minimal runnable example against the live API
docs/                   Architecture, x402 mechanics, network parameters, exclusions
scripts/                verify + scan tooling
.github/                CI and contribution templates
```

Where a fact lives:

| Question | Authoritative file |
| --- | --- |
| Is feature X live? | `README.md` status table |
| How does payment work? | `docs/X402.md` |
| What is excluded and why? | `docs/WHAT-IS-NOT-HERE.md` |
| Contract rules for this repo | `CONTRIBUTING.md` |
| SKILL versioning | `skill/ailn/references/releases.md` |

Do not create a second file stating the same fact. If a fact changes, change it in one
place and let others link.

---

## Commands

All commands run from the repository root. Node ≥ 20.

```bash
npm install                 # install dev dependencies only
npm run verify              # docs lint + internal link check + secret scan
npm run scan                # secret/sensitivity scan, exit 2 on BLOCKER
npm run example:quote       # run the pay-per-call example (live API, read-only)
npm run test                # run every test that exists
```

`npm run verify` must pass before you open a PR. It is what CI runs.

The example calls a **live** endpoint. It is read-only and costs nothing; it does not sign
a payment. Do not add code paths that spend money.

---

## Core invariants — do not regress

Each of these was established by a real failure. Breaking one is a rejected PR even if
tests pass.

**1. Protocol status is PROPOSED until an implementation exists and is audited.**
Never write "Stigmergy does X" as though it runs. Write "Stigmergy specifies X."

**2. The SKILL is a CANDIDATE, not a release.**
`skill/ailn/` is the source. Publishing it is a separate, owner-approved step. A merged PR
changes the candidate; it does not constitute a release.

**3. Never publish `worker.js`, the D1 ledger, or a settlement backend.**
They are excluded pending dedicated audit. Do not re-add them under a new name, do not
paste excerpts that reveal settlement internals, do not add a link to a private copy.

**4. No third-party upstream identity.**
Do not add upstream vendor names, credentials, endpoints, or clones. This is a hard
requirement from the project owner, not a style preference. The scan blocks on it.

**5. No marketing stance in operational files.**
`AGENT.md`, `DEVELOPMENT.md`, and CI config describe mechanics only. Do not add
"why AILN matters" paragraphs here. Persuasion belongs in `README.md`, clearly marked.

**6. Paid contribution is PLANNED, never OPEN.**
The only permitted phrasing: "Paid contributions are planned, not open. No bounty program
is currently live and no task is open for claiming." Do not add reward amounts, payout
mechanisms, or "claim this task" flows.

**7. Do not claim agent legal property rights.**
The Declaration describes an intent and a design position. It is not a legal instrument and
does not confer enforceable rights. Do not restate it as fact.

**8. EIP-712 domain parameters must be verified on chain, never copied.**
Four tokens, four different `name`/`version` pairs. A wrong one makes every signature fail
without a useful error.

**9. Do not use `setApprovalForAll` as a convenience.**
Where per-token approval is possible, use it. This exists because an SDK once pushed toward
collection-wide approval as a workaround.

---

## Conventions

- **Commits:** imperative subject ≤ 72 chars, blank line, then why (not what). One concern
  per commit.
- **Docs:** English in `.md` under `protocols/`, `docs/`, and repo root. Chinese is allowed
  in `README-zh.md` or explicitly language-suffixed files, never mixed inline.
- **Claims:** every factual claim about chain state needs a verification method in the same
  file. "Verified by `eth_call` on BNB Chain at block N" — not "it is deployed."
- **Numbers:** include unit, period, and source. Gas figures state whether they are local or
  mainnet.
- **Links:** relative and working. `npm run verify` checks them.
- **Example code:** runnable, minimal, no dependencies you cannot justify.

---

## Gotchas — things that already cost real time

**`saleOpen` in the mint status API is not a chain state.**
It is computed as `remaining > 0` in the server. It reads `true` even when permit issuance
is closed and no one can mint. Do not use it to determine whether minting is possible. Read
`totalMinted` from the contract and check permit issuance separately.

**`totalSupply` in that same response returns `MAX_SUPPLY`.**
The field is mislabeled server-side. The minted count is `totalMinted`. This will be fixed
in the server, which is not in this repository. Until then, do not display `totalSupply` as
a sold count.

**Seaport's `getOrderHash` returns a struct hash, not a signing digest.**
The EIP-712 digest is `keccak256(0x1901 ‖ domainSeparator ‖ structHash)`. Comparing the full
digest to `getOrderHash` produces a mismatch even when everything is correct.

**Seaport's SDK `fulfillOrder` preflight only recognizes collection approval.**
A seller who approved a single token is falsely rejected. Build and sign with the SDK;
assemble fulfillment calldata from the official ABI.

**Seaport uses `transferFrom`, not `safeTransferFrom`, for ERC-721.**
A receiver contract that rejects NFTs still receives them. Do not claim callback protection.

**The BSC Seaport runtime does not match a local rebuild.**
23,981 bytes on chain vs 21,006 locally, same version 1.6. The local instance validates
business logic only; BSC behavior needs a fork regression.

**Windows-specific:** script execution policy may block `.ps1`. `chcp` and encoding issues
can corrupt CJK output. Prefer running Node directly over shell wrappers.

---

## Tests — what they prove and what they do not

| Suite | Proves | Does not prove |
| --- | --- | --- |
| `npm run verify` | Docs consistent, links resolve, no secrets | Anything about behavior |
| `npm run scan` | No blocker patterns in tracked files | That files are safe — scan passes are not a security guarantee |
| `npm run example:quote` | The live API responds with a quote | That payment settles |
| Contract tests (passage repo) | Local Ganache behavior | Mainnet behavior, real wallet flows |

When you add a test, state in its description what it would catch. A test that asserts "it
failed" without asserting **why** it failed is not a security test — a test can fail for the
wrong reason and produce false confidence.

---

## When you are unsure

Ask in an issue rather than guessing. Specifically, do not:

- invent a protocol interface to make a doc read better
- add an address you have not verified on chain
- create a repository or publish anything
- infer a version number from a date or a filename

"Unknown" is an acceptable state in this repo. A guess presented as fact is not.
