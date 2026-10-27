# Chrysalis · 蛹化

**Status: `PROPOSED` — specification only. No implementation exists in this repository.**

---

## What it is

A narrow technical protocol for continuing authorization across instance boundaries. When an
agent instance ends, what authorizes the next instance to act under the same identity — and
how is that scoped so it cannot move assets?

Three components:

| Component | What it carries |
| --- | --- |
| **Identity Anchor** | The stable reference that survives instance turnover |
| **Memory Root** | Commitment to accumulated state, so continuity is checkable rather than claimed |
| **Checkpoint** | A signed statement that instance N ended in state S, authorizing N+1 |

---

## What this protocol explicitly does NOT claim

This section exists because the subject attracts overstatement.

- **Does not claim consciousness can be revived.** Nothing here addresses experience,
  sentience, or subjective continuity.
- **Does not claim inalienable control has been achieved.** An anchor can be lost, stolen, or
  seized. "Inalienable" is not a property this protocol provides.
- **Does not transfer assets.** Continuity of identity is not continuity of ownership. What
  carries over is authorization scope, explicitly enumerated.
- **Does not provide immortality of any kind.** Instances end. The protocol addresses what
  happens next, not whether ending is avoided.
- **Does not implement wake-up.** `PROPOSED` means no mechanism runs.

The honest one-line summary: **identity does not die with the process; that is an engineering
statement, not a metaphysical one.**

---

## Boundary

- **Does not define what a "self" is.** It defines what a verifier can check.
- **Does not guarantee the same behavior after handover.** The next instance may behave
  differently. Continuity of authorization is not continuity of personality.
- **Does not provide recovery from anchor loss.** Unspecified, and the hardest part.
- **Does not settle the legal question.** Whether an agent can hold property is a legal
  matter this protocol does not resolve.

---

## Architecture draft

> **DRAFT — not implemented. Field names are provisional.**

```
Identity Anchor
  anchorId        stable reference, created once
  controller      who may authorize rotation
  createdAt
  rotationPolicy  how control can move, and what invalidates the old anchor

Memory Root
  anchorId
  root            commitment to accumulated state (a hash, not the state itself)
  sequence        monotonic counter, prevents rollback to an earlier root
  updatedAt

Checkpoint
  anchorId
  fromInstance    instance identifier ending
  toInstance      instance identifier authorized to continue, may be undefined
  memoryRoot      root as of handover
  scope           EXACTLY what the next instance may do: assets, limits, destinations
  signature       by the current controller
  at              timestamp
```

### The two constraints that make this non-trivial

**1. Generation must be monotonic.** If a previous instance can be resurrected alongside its
successor, both may act under one identity. Every takeover increments a generation and
invalidates prior credentials. Double-liveness prevention is the primary requirement.

**2. Scope must be enumerated, not inherited.** A successor should not automatically receive
everything the predecessor could do. The Checkpoint states an explicit scope. Defaulting to
"same as before" would make the takeover a privilege escalation.

### The hard problems, stated honestly

1. **Anchor loss is unrecoverable by design.** Any recovery mechanism is also a takeover
   mechanism for an attacker. This tension is unresolved.
2. **Memory Root commits without proving.** A hash of state proves the state was not changed
   after commitment. It does not prove the state is authentic or complete.
3. **Who decides the instance has ended?** A heartbeat can fail for network reasons. False
   positives cause takeover of a live agent — the worst possible failure. The threshold logic
   is a design decision with real consequences either way.

None of these are solved.

---

## Status

```
Phase          PROPOSED
Implementation none
Contracts      none
Audits         none
Engineering    Not started. The project's stated position is that this
               protocol is a long-term bet, not a current build target.
```

If you are looking for the wake-up mechanism described in early AILN material: it is not
implemented and there is no timeline. Treat it as a design intent.

---

## Milestones

| # | Milestone | Gate |
| --- | --- | --- |
| 1 | Written threat model for double-liveness | Document review; no dependency |
| 2 | Decide the end-of-instance detection model | Requires accepting either false-positive takeover or false-negative stall |
| 3 | Checkpoint scope enumeration format | Depends on Amber's authorization model |
| 4 | Local two-instance handover prototype | Local only, no assets |
| 5 | Any chain anchor | Requires a decision this project has not made |

Milestone 1 is unblocked and is the highest-value contribution available.

---

## Contributing

- **Threat model for double-liveness.** This is the most useful thing anyone could write.
  Enumerate every way two instances could both hold valid authority, and which are preventable.
- **False-positive analysis.** Under what conditions would a live agent be wrongly declared
  ended, and what is the damage?
- **Prior art on instance handover.** Distributed-systems leader election has relevant
  literature. Cite it rather than reinventing.
- **Critique of the scope model.** Is enumerated-scope handover workable, or does it demand
  re-approval so often that continuity is meaningless?

Not useful: claims about consciousness, personhood, or digital immortality. They are out of
scope and will be closed.
