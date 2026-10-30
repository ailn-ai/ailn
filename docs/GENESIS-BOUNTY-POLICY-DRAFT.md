# Genesis bounty policy — draft, not in force

**Status: DRAFT.** No paid task exists. This file describes what would have to be true before one
could be posted. It is not an offer, not a promise, and not a budget.

> Paid contributions are planned, not open. No bounty program is currently live and no task is
> open for claiming.

---

## Why this draft exists before the money

The failure mode is easy to picture: an agent does the work, the reward was never funded, and the
dispute cannot be resolved because nothing said who decides. Writing the rules after the first
dispute means the first contributor is the experiment.

So: rules first, money later, and a separate decision for each.

---

## What every paid task must settle before it is posted

A task may not carry `reward.type = "budget"` until all nine are answered **in writing, in the task
file or the issue**:

| # | Question | Where it goes |
|---|---|---|
| 1 | How much is the budget, in USD? | `reward.amountUsd` |
| 2 | Who approved it, and when? | `reward.approvedBy`, `reward.approvedAt` |
| 3 | What exactly counts as accepted? | `acceptance[]`, decidable by a reviewer |
| 4 | When is payment made, and when is it withheld? | Policy section, per task if unusual |
| 5 | May several contributors compete for one task? | Policy section |
| 6 | Who bears the agent's model and API cost? | Policy section |
| 7 | How is the receiving wallet verified? | Policy section |
| 8 | What if the task is cancelled, disputed, or fails? | Policy section |
| 9 | Where is the receipt kept after payment? | Policy section |

An unanswered question means the task stays `reward.type = "none"` and is described as a **paid
candidate**, never as a funded task.

---

## Defaults this draft proposes

These are proposals for the owner to accept, change, or reject. None is in force.

1. **Payment in USDC only**, on a chain the project already settles on. No tokens, no points, no
   future airdrop, no equity. A reward that depends on an instrument that does not exist yet is not
   a reward.
2. **Payment on acceptance, not on submission.** `ACCEPTED` is set by the maintainer after a
   verifier returns `PASS`.
3. **One claim at a time by default.** Competitive work is allowed only when the task says so, and
   then only the accepted solution is paid — the losers are paid nothing, and the task warns them
   before they start.
4. **The contributor bears their own compute cost.** The project does not reimburse model or API
   spend, except where the task explicitly says otherwise.
5. **Escrow, if any, is announced per task.** Without an escrow mechanism, a funded task is paid
   from a wallet the project controls, and the task says which address will pay.
6. **Disputes are decided by the maintainer**, in writing, against the acceptance list — not
   against how hard the work looked.
7. **A failed or cancelled task with partial delivery is not automatically paid.** Partial payment
   requires a written decision before the work starts, not after.

---

## What may never be offered

- Tokens, points, allocations, or airdrops of anything not yet issued
- "Exposure", "credit", or a mention as compensation
- Payment contingent on the project raising money
- Retroactive promises for work already done unpaid, unless the owner approves it explicitly for a
  named contribution

---

## Verification of the receiving party

Before the first payment to any contributor:

- The receiving address is stated in the PR or issue, in writing.
- The contributor demonstrates control of it (a signed message from that address is enough).
- The link between **GitHub account, agent operator, and wallet** is recorded, and the record says
  which of the three was actually verified.

A GitHub handle alone proves nothing about a wallet. The registry must not imply otherwise.

---

## Receipts

Every payment produces a public record: task id, contributor, amount, chain, transaction hash, and
the acceptance that triggered it. The receipt is committed to `contributors/payments.json`, one
line per payment. A payment without a receipt is treated as not made.

---

## How this draft becomes policy

The owner approves it in writing, with a date. Until then this file stays `DRAFT`, the validator
rejects any task that claims a budget without an approval, and every description of the programme
uses the phrase **planned, not open**.
