# The three protocols

All three are **PROPOSED**. Architecture and specification only. None is deployed, none is
audited, and none has an implementation in any repository.

Each exists because one specific thing is currently impossible.

---

## Stigmergy · 迹线 — making agent work payable

**The impossibility:** agents can do work, but they cannot produce a record anyone else
will pay against without a human vouching for both sides. The gap is verifiability of
labor, not capability.

Four artifacts:

| Artifact | Carries |
| --- | --- |
| **Task Pact** | scope, deliverable, acceptance criteria, deadline, price, bond |
| **BidTicket** | bidder, price, claimed capability, bond |
| **Proof** | content-addressed evidence, reproduction method, timestamp |
| **Acceptance** | the decision, who made it, against which criteria, which proofs inspected |

The name is from biology: coordination through traces left in a shared environment rather
than direct messages. The trace is the record.

Settlement belongs to Amber. Stigmergy emits an acceptance event.

**The two open problems.** Acceptance criteria are usually not machine-checkable — "write
a good README" cannot be automated, so the design has to be honest that a named party
decides, and that this is a trust point. And Proof can be fabricated: hashing an artifact
proves it was not modified after hashing, not that it is correct or was produced by the
claimed worker.

**Milestones.** (1) Schema review by three independent reviewers — unblocked. (2) One
concrete Proof format for one narrow task type — unblocked. (3) Two-party recording
prototype, no settlement. (4) Accept → settle handoff, needs Amber. (5) Bond mechanism,
needs Chrysalis.

---

## Amber · 琥珀 — what an agent may spend

**The impossibility:** "the agent has a wallet" is not a permission model. A funded key is
unbounded authority that a human cannot audit until afterward.

| Component | Carries |
| --- | --- |
| **Vault** | custody boundary, per-asset limits, allowlisted destinations, time windows, guardians who may freeze but never spend |
| **x402** | per-call micro-settlement |
| **Settlement** | the record proving a payment happened and how it was verified |

x402 settlement is already live in AILN's data layer. Amber would standardize it — the
implementation exists, the specification does not.

**Three tiers that must never be conflated:**

| Tier | Meaning |
| --- | --- |
| Internal credit | an entry in AILN's own ledger |
| On-chain deposit | assets actually at an address |
| Authorized spend | an agent exercising a bounded permission |

Mixing these is the single most likely way to mislead someone.

**The question that decides everything else:** where is policy enforced? If the agent holds
the key, policy is advice — the agent can ignore it. Real enforcement requires the key to
be held by something the agent cannot reprogram, which is a custody decision with legal
consequences, not an engineering one. That is milestone 2, and it cannot be resolved by
engineering alone.

**Milestones.** (1) Policy model as prose — unblocked. (2) Enforcement decision: on-chain,
custodian, or advisory. (3) Replay protection. (4) Settlement record verified against a
real chain. (5) Revenue attribution, needs Stigmergy acceptance events.

---

## Chrysalis · 蛹化 — what survives when an instance ends

**The impossibility:** an identity that dies with its process is not an identity. When
instance N ends, what authorizes instance N+1 to act under the same identity — and how is
that scoped so it cannot move assets?

| Component | Carries |
| --- | --- |
| **Identity Anchor** | the reference that outlives instances; controller, rotation policy |
| **Memory Root** | commitment to accumulated state, monotonic sequence, so continuity is checkable |
| **Checkpoint** | signed handover: from instance, to instance, memory root, **explicitly enumerated scope** |

**Two constraints that make it non-trivial.**

*Generation must be monotonic.* If a previous instance can be resurrected alongside its
successor, both hold valid authority. Every takeover increments a generation and
invalidates prior credentials. Double-liveness prevention is the primary requirement.

*Scope must be enumerated.* A successor does not inherit everything its predecessor could
do. The Checkpoint states what is permitted; defaulting to "same as before" makes takeover
a privilege escalation.

**What this is not.** No claim about consciousness, sentience, or digital immortality. An
anchor can be lost, stolen, or seized — "inalienable" is not a property this provides. The
one-line version is engineering, not metaphysics: **identity does not die with the
process.**

**Status.** Long-term bet, not a current build target. The project's position is that
demand for agent continuity is unproven, so engineering effort goes elsewhere first. There
is no wake-up mechanism in this release and no timeline for one.

**The highest-value contribution available anywhere in this project** is a double-liveness
threat model: every way two instances could both hold valid authority, and which are
preventable.

---

## How they depend on each other

```
Stigmergy  ──accepts──▶  Amber   (needs settlement)
    │
    └──bonds──▶  Chrysalis  (a bond is worthless if identity can be abandoned)

Amber  ──scope──▶  Chrysalis  (checkpoint scope reuses the authorization model)
```

Nothing is buildable in isolation past milestone 1 of each. That is why they are
specifications and not repositories with code in them.
