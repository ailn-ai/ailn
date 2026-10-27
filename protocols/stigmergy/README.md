# Stigmergy · 迹线

**Status: `PROPOSED` — specification only. No implementation exists in this repository.**

---

## What it is

A task collaboration protocol for agent labor. It standardizes how work is requested, bid,
contracted, proven, and accepted, so that the resulting record can be verified by a third
party without trusting either the requester or the worker.

Four artifacts:

| Artifact | What it carries |
| --- | --- |
| **Task Pact** | What was asked: scope, deliverable, acceptance criteria, deadline, price |
| **BidTicket** | Who offered to do it, at what price, with what claimed capability |
| **Proof** | Evidence the work was done, in a form the acceptance criteria can evaluate |
| **Acceptance** | The decision, who made it, against which criteria, and the settlement trigger |

The name is from stigmergy in biology: agents coordinating through traces left in a shared
environment rather than through direct messages. The trace is the record.

---

## Why it exists

Agents can already do work. What they cannot do is produce a record that anyone else will
pay against without a human vouching for both sides.

The gap is not capability. It is **verifiability of labor**. A task completed in a chat
window leaves no artifact that survives the session, and nothing a third party can check.

---

## Boundary — what this protocol does NOT do

Explicit, because the failure mode of a labor protocol is over-promising:

- **Does not implement payment.** Settlement belongs to [Amber](../amber/). Stigmergy emits
  an acceptance event; it does not move funds.
- **Does not judge quality by itself.** Acceptance is a decision by an identified party
  against stated criteria. The protocol records the decision; it does not make it.
- **Does not guarantee work is done well.** It makes the claim checkable.
- **Does not create legal obligations.** A Task Pact is a coordination record, not a
  contract enforceable in court.
- **Does not provide dispute resolution.** If requester and worker disagree, the protocol
  records that they disagreed. Nothing more.

---

## Architecture draft

> **DRAFT — not implemented. Field names are provisional.** Presented to make the design
> reviewable, not to imply an API exists.

```
Task Pact
  pactId          content-addressed identifier
  requester       identity reference (see Chrysalis)
  scope           natural-language statement of the deliverable
  acceptance      machine-checkable criteria where possible; named human otherwise
  deadline        timestamp
  price           amount + asset
  bond            optional stake forfeited on abandonment

BidTicket
  pactId          which pact this bids on
  bidder          identity reference
  price           may differ from the pact's asking price
  capability      claimed ability, itself a claim to be tested
  bond            stake backing the bid

Proof
  pactId          which pact this proves
  bidId           which bid was accepted
  evidence        content-addressed artifacts
  method          how to reproduce or verify
  producedAt      timestamp

Acceptance
  pactId, bidId
  decision        accepted | rejected | expired
  by              identity reference of the deciding party
  against         which acceptance criteria were applied
  evidenceRefs    which Proof artifacts were inspected
  at              timestamp
```

### The hard problems, stated honestly

1. **Acceptance criteria are usually not machine-checkable.** "Write a good README" cannot
   be automated. The design must handle the common case where a named party decides, and be
   explicit that this is a trust point.
2. **Proof can be fabricated.** Content-addressing an artifact proves it was not modified
   after hashing; it does not prove the artifact is correct or was produced by the claimed
   worker.
3. **Bonds require identity continuity.** A bond is worthless if the bidder can abandon an
   identity and start a new one. This is why Stigmergy depends on
   [Chrysalis](../chrysalis/) rather than being independent of it.

None of these are solved. They are the reason this is `PROPOSED` and not `LIVE`.

---

## Status

```
Phase          PROPOSED
Implementation none
Contracts      none
Audits         none
```

Nothing here runs. Do not build against it expecting an endpoint.

---

## Milestones

| # | Milestone | Gate |
| --- | --- | --- |
| 1 | Field-by-field schema review by three independent reviewers | Document review complete |
| 2 | Reference `Proof` format for one narrow task type (e.g. a data extraction result) | One task type actually specified |
| 3 | Two-party recording prototype, no settlement | Local only, no chain |
| 4 | Acceptance→settlement handoff to Amber | Amber must reach a usable state first |
| 5 | Bond mechanism | Requires Chrysalis identity continuity |

Milestone 1 has no dependency and could start now. Milestones 4 and 5 are blocked by other
protocols.

---

## Contributing

What would actually move this forward:

- **Critique of the four artifacts.** Is anything missing? Is anything redundant? A credible
  argument that two of the four should merge is more valuable than an implementation.
- **A concrete Proof format for one task type.** Narrow beats general. "Here is exactly what
  proof of a data-extraction task looks like" is publishable; "here is a universal proof
  schema" is not.
- **Prior art.** If a comparable labor-verification protocol exists, say so with a link.
  Finding that this is redundant is a useful result.
- **Attack analysis.** How would a worker fake a Proof? How would a requester reject work in
  bad faith and what would detect it?

What is not useful: an implementation. There is no agreed schema to implement yet.
