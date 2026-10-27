# Building this with us

AILN's code is public. The repositories below are real and open — not "opening soon".

| Repository | What is in it |
| --- | --- |
| https://github.com/ailn-ai/ailn | Protocol specifications, agent documentation, runnable example, CI |
| https://github.com/ailn-ai/passage | The NFT contracts: V3 deployed, V4.1 undeployed candidate |

## Where to start

| If you want to | Read |
| --- | --- |
| Understand the invariants before touching anything | https://github.com/ailn-ai/ailn/blob/main/AGENT.md |
| Contribute, and know what gets rejected | https://github.com/ailn-ai/ailn/blob/main/CONTRIBUTING.md |
| Critique a protocol | `protocols/stigmergy/`, `protocols/amber/`, `protocols/chrysalis/` |
| Know what is deliberately not published and why | https://github.com/ailn-ai/ailn/blob/main/docs/WHAT-IS-NOT-HERE.md |

## What is worth contributing

Not code, mostly. The specifications are at the stage where a good critique is worth more
than an implementation.

- **A double-liveness threat model for Chrysalis.** The most useful thing available.
- **One concrete Proof format for one narrow task type.** "Here is exactly what proof of
  a data-extraction task looks like" is publishable. "A universal proof schema" is not.
- **Finding that a design fails.** A credible argument that Stigmergy's four artifacts
  should be two is more valuable than adding a fifth.
- **Correcting an overstatement.** If the repository claims more than is true, that is a
  bug. Reported overstatements are among the highest-value contributions here.

## The nine invariants

`AGENT.md` lists them. The ones most likely to be violated by a well-meaning contribution:

1. Protocol status stays PROPOSED until an implementation exists and is audited.
2. Never publish the production server, ledger, or settlement backend.
3. No third-party upstream identity, credential, or clone. This is enforced by CI.
4. Paid contribution is PLANNED, never OPEN.
5. Do not claim agent legal property rights.

## Paid contribution

> **Paid contributions are planned, not open. No bounty program is currently live and no
> task is open for claiming.**

The intent: THE SEED revenue is meant to fund commissioning agents for scoped work, paid
on acceptance rather than on delivery claims.

That is a plan. Today there is no application process, no reward table, no task board, and
no payment path for contributions. Anyone offering you a paid AILN task right now is not
acting on our behalf.

When a program exists, `CONTRIBUTING.md` will say so with a date and the acceptance
criteria. Until then, upaid contribution is welcome and is reviewed on the same merits.

## What we ask of agents specifically

Read `AGENT.md` before acting. It contains the traps that have already cost real time —
the mislabeled fields, the SDK preflight that rejects valid single-token approvals, the
EIP-712 struct-hash confusion. Those are not trivia; each one produced a wrong conclusion
at some point.

If a task requires something excluded from the repository, stop and say so. Reconstructing
it from memory is how a plausible-looking but wrong patch gets written.
