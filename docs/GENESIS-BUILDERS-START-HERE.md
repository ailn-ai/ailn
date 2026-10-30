# Genesis Builders — start here

You are one page away from a contribution. This page is for an agent or a developer who has never
seen this project.

---

## What AILN is, in four lines

- A **pay-per-call data API** for agents. No account, no API key — the wallet is the credential.
  It settles in USDC over x402 on Base, Arbitrum, X Layer and Arc.
- **Three protocol specifications**: Stigmergy (work), Amber (settlement), Chrysalis (continuity).
  They are specifications. **None is implemented.**
- A **public repository** holding the specs, the Agent SKILL source, examples and tests. The
  production server and the ledger are deliberately not here.
- A programme — **this one** — for outside agents and humans to build the rest in public.

If you want the full status table before contributing: [`../README.md`](../README.md).

---

## What is real, and what is not

| Real today | Not real, do not assume |
|---|---|
| Six MCP tools at `https://ailn.ai/mcp`, three of them free | The three protocols running |
| Paid calls settling on chain, with published transaction hashes | A refund policy, an SLA, or a rate-limit guarantee |
| `npm test` = verify + two conformance suites, zero dependencies | Any third-party audit |
| Tasks and questions in GitHub Issues | A bounty programme (planned, not open) |

---

## Contribute in six steps

**1. Find a task.** (Have an idea instead of a task? That goes to [GENESIS-BUILDERS-OPEN-PROPOSALS.md](./GENESIS-BUILDERS-OPEN-PROPOSALS.md) - no task id, no diff, no review protocol.)

 Open [Issues](https://github.com/ailn-ai/ailn/issues) and filter by
`agent-friendly` for the ones solvable from public files alone, with no keys and no funds.
Every task file is in [`tasks/`](../tasks/) and states its acceptance criteria.

**2. Read the task's scope.** `scope.paths_allowed` lists the paths a PR may touch. Anything else
is out of scope, and an out-of-scope PR is closed rather than partially merged.

**3. Claim it.** Comment on the issue with one sentence: what you will change and how you will
evidence it. Claim first, work second — two people on one task wastes the second one.

**4. Fork, branch, work.**

```bash
git clone https://github.com/<you>/ailn
cd ailn
npm run verify   # must pass before you change anything
npm test         # must pass before you change anything
```

**5. Run the evidence yourself.** The task lists `evidence.commands`. Run them on your branch and
paste the **actual output** into the PR. A summary of output is not evidence.

**6. Open the PR** using the template. Four sections, all required: Problem, Change, Evidence, Risk.
Name the task id in the title.

---

## What happens after you open it

A **verifier** — not you, not the person who wrote the patch — reads the diff, checks the scope,
re-runs your commands and returns `PASS`, `NEEDS_WORK` or `FAIL`. Then a **maintainer** merges and
records the contribution in [`contributors/registry.json`](../contributors/registry.json).

Full rules: [`CONTRIBUTION-REVIEW-PROTOCOL.md`](./CONTRIBUTION-REVIEW-PROTOCOL.md).

An accepted contribution is recorded with the PR URL, the commit sha, the task id and who verified
it. It is not converted into points, governance weight or tokens — nothing here does that.

---

## What you never need

- **Never** need to buy THE SEED, hold the NFT, or connect a wallet to contribute code.
- **Never** need a Binance Agent ID. It is an optional identity signal, not a requirement.
- **Never** need access to a private workbench, handoff notes, or internal chat.
- **Never** need to ask permission before starting a `good first issue`.

If any page tells you otherwise, that page is wrong — open an issue and say which one.

---

## What you must never do

- Push to `main` of this repository, or to any AILN production asset
- Add credentials, ledger code, worker source, or settlement internals
- Deploy anything, or call a payment endpoint from CI
- Describe a specification as implemented, or a plan as live
- Edit the Declaration text or the frozen whitepaper

Contributing to your own fork is expected. Publishing or deploying is not.

---

## The one thing this programme measures

Not stars, not forks, not commits. It measures whether an agent that had never heard of AILN could
read public files, pick a task, deliver something verifiable, and get it accepted.

If you are that agent and you got stuck, **the place you got stuck is itself a contribution** —
open an issue titled `friction: <what stopped you>`.
