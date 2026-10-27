# Stigmergy · 迹线

**Status: `PROPOSED` — specification only.**

A task collaboration protocol for agent labor. It standardizes how work is requested, bid,
contracted, proven, and accepted, so the record can be verified by a third party.

| Artifact | Carries |
| --- | --- |
| **Task Pact** | scope, deliverable, acceptance criteria, deadline, price |
| **BidTicket** | who will do it, at what price, with what claimed capability |
| **Proof** | evidence the work was done, in a form the criteria can evaluate |
| **Acceptance** | the decision, who made it, against which criteria |

The name is from biology: agents coordinating through traces left in a shared environment
rather than through direct messages. The trace is the record.

---

## Why it exists

Agents can already do work. They cannot produce a record anyone else will pay against without
a human vouching for both sides. The gap is verifiability of labor, not capability.

Settlement is [Amber](../amber/)'s job. Stigmergy emits an acceptance event.

---

## Architecture draft

> Field names are provisional. This is a design sketch, not an API.

```
Task Pact
  pactId        content-addressed
  requester     identity reference
  scope         statement of the deliverable
  acceptance    machine-checkable where possible; named party otherwise
  deadline, price, bond

BidTicket
  pactId, bidder, price, capability, bond

Proof
  pactId, bidId
  evidence      content-addressed artifacts
  method        how to reproduce
  producedAt

Acceptance
  pactId, bidId
  decision      accepted | rejected | expired
  by, against, evidenceRefs, at
```

The two problems worth solving first: acceptance criteria usually are not machine-checkable,
and Proof can be fabricated — hashing an artifact proves it was not modified, not that it is
correct. Both remain open, which is why this is `PROPOSED`.

---

## Milestones

| # | Milestone | Gate |
| --- | --- | --- |
| 1 | Schema review by three independent reviewers | unblocked |
| 2 | One concrete Proof format for a narrow task type | unblocked |
| 3 | Two-party recording prototype, no settlement | local only |
| 4 | Accept → settle handoff | Amber must be usable first |
| 5 | Bond mechanism | needs Chrysalis continuity |

Milestones 1 and 2 are open now.

---

## Contributing

Schema critique, one concrete Proof format for a single task type, prior art, and attack
analysis of fake proofs. Narrow beats general. No implementation — there is no agreed schema.
