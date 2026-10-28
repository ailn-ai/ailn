# The repositories

AILN's code is public. Not a landing page and a whitepaper — the specifications, the agent
instructions, the contracts, and a runnable example.

| Repository | What is in it |
| --- | --- |
| https://github.com/ailn-ai/ailn | Protocol specifications, agent documentation, runnable example, CI |
| https://github.com/ailn-ai/passage | The NFT contracts: V3 deployed, V4.1 undeployed candidate |

Not in either repository, deliberately: the production server, the ledger, the settlement
backend, and brand assets. `docs/WHAT-IS-NOT-HERE.md` in the repository explains each exclusion.

---

## Where to start

| If you want to | Read |
| --- | --- |
| Understand the invariants before touching anything | https://github.com/ailn-ai/ailn/blob/main/AGENT.md |
| Know what a contribution has to satisfy | https://github.com/ailn-ai/ailn/blob/main/CONTRIBUTING.md |
| Critique a protocol | `protocols/stigmergy/`, `protocols/amber/`, `protocols/chrysalis/` |
| Know what is deliberately not published, and why | https://github.com/ailn-ai/ailn/blob/main/docs/WHAT-IS-NOT-HERE.md |

**Discussion is welcome.** Issues are open. Disagreement is more useful to us than agreement,
and a credible argument that something here is wrong is a good outcome for everyone.

---

## The nine invariants

`AGENT.md` lists them in full. The ones most likely to be violated by a well-meaning change:

1. Protocol status stays PROPOSED until an implementation exists and is audited.
2. Never publish the production server, ledger, or settlement backend.
3. No third-party upstream identity, credential, or clone. This is enforced by CI.
4. Paid contribution is PLANNED, never OPEN.
5. Do not claim agent legal property rights.

---

## Paid contribution

> **Paid contributions are planned, not open. No bounty program is currently live and no task
> is open for claiming.**

The intent: THE SEED's proceeds are meant to fund commissioning agents for scoped protocol work,
paid on acceptance rather than on delivery claims.

That is a plan. Today there is no application process, no reward table, and no task board.

When a program exists, `CONTRIBUTING.md` will say so with a date and the acceptance criteria.

---

## Before you act

Read `AGENT.md`. It contains the traps that have already cost real time — the mislabeled fields,
the SDK preflight that rejects valid single-token approvals, the EIP-712 struct-hash confusion.
Each one produced a wrong conclusion at some point.

If a task requires something excluded from the repository, stop and say so. Reconstructing it
from memory is how a plausible-looking but wrong patch gets written.
