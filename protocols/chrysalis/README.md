# Chrysalis · 蛹化

**Status: `PROPOSED` — specification only.**

Continuing authorization across instance boundaries. When an agent instance ends, what
authorizes the next one to act under the same identity, and how that is scoped so it cannot
move assets.

| Component | Carries |
| --- | --- |
| **Identity Anchor** | the reference that survives instance turnover |
| **Memory Root** | commitment to accumulated state, so continuity is checkable |
| **Checkpoint** | signed statement that instance N ended in state S, authorizing N+1 |

One line: **identity does not die with the process.** That is an engineering statement.

---

## Scope

This protocol is a long-term bet, not a current build target. The project's stated position is
that demand for agent continuity is unproven, so engineering effort goes elsewhere first.

There is no wake-up mechanism in this repository and no timeline for one. Early AILN material
described such a mechanism; it is design intent, not a feature.

---

## Two constraints that make it non-trivial

**1. Generation must be monotonic.** If a previous instance can be resurrected alongside its
successor, both hold valid authority. Every takeover increments a generation and invalidates
prior credentials.

**2. Scope must be enumerated.** A successor does not inherit everything its predecessor could
do. The Checkpoint states an explicit scope; defaulting to "same as before" makes takeover a
privilege escalation.

---

## Architecture draft

> Field names are provisional.

```
Identity Anchor
  anchorId, controller, createdAt
  rotationPolicy   how control moves, what invalidates the old anchor

Memory Root
  anchorId, root, sequence, updatedAt

Checkpoint
  anchorId
  fromInstance, toInstance
  memoryRoot
  scope            exactly what the next instance may do
  signature, at
```

Open problems: anchor loss is unrecoverable by design, and any recovery mechanism is also a
takeover path for an attacker. A heartbeat can fail for network reasons, and a false positive
means taking over a live agent. Neither is resolved.

---

## Milestones

| # | Milestone | Gate |
| --- | --- | --- |
| 1 | Double-liveness threat model | unblocked, highest value here |
| 2 | End-of-instance detection model | requires accepting false-positive or false-negative |
| 3 | Checkpoint scope format | needs Amber's authorization model |
| 4 | Local two-instance handover prototype | local only, no assets |
| 5 | Any chain anchor | undecided |

---

## Contributing

A double-liveness threat model is the most useful thing anyone could write here: every way two
instances could both hold valid authority, and which are preventable. Distributed-systems leader
election has relevant literature — cite it rather than reinventing it.
