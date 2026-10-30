# Task Pact V0 — task pool

Machine-readable work items. One file per task, validated in CI.

```bash
node scripts/validate-tasks.mjs
```

Schema: [`schema/task-pact.schema.json`](schema/task-pact.schema.json).
Rules that make a task postable: [`../docs/CONTRIBUTION-REVIEW-PROTOCOL.md`](../docs/CONTRIBUTION-REVIEW-PROTOCOL.md).
How to claim one: [`../docs/GENESIS-BUILDERS-START-HERE.md`](../docs/GENESIS-BUILDERS-START-HERE.md).

This is a GitHub sketch of the Stigmergy `Task Pact → BidTicket → Proof → Acceptance → Settlement
Receipt` chain. It has no contract, no escrow and no automatic payment. Calling it "the Stigmergy
protocol" would be false.

## Status vocabulary

`OPEN → CLAIMED → IN_PROGRESS → SUBMITTED → REVIEW → ACCEPTED / REJECTED → CLOSED`

`ACCEPTED` is set by a maintainer after a verifier returns `PASS`. A contributor saying "done" is
`SUBMITTED`, not `ACCEPTED`.

## The pool
| id | title | risk | reward | status |
|---|---|---|---|---|
| [task-0001](./task-0001.json) | Correct three stale status lines in ROADMAP.md | low | none | OPEN |
| [task-0002](./task-0002.json) | Give both workflows an explicit least-privilege permissions block | low | none | OPEN |
| [task-0003](./task-0003.json) | Add an offline test that the published payment challenge decodes as documented | low | none | OPEN |
| [task-0004](./task-0004.json) | Document the input schema of the three free tools in API-CONTRACT.md | low | none | OPEN |
| [task-0005](./task-0005.json) | Review Task Pact V0 against the Stigmergy concepts and file findings | low | none | OPEN |
| [task-0006](./task-0006.json) | Correct the permit status wording in SECURITY.md | low | none | OPEN |
| [task-0007](./task-0007.json) | Independently verify the three published EIP-712 domain separators | low | none | OPEN |
| [task-0008](./task-0008.json) | Design review: what should a paid task require before it can be posted | low | none | OPEN |
| [task-0009](./task-0009.json) | Independent review of the deployed Passage V3 contract | funds | none | OPEN |
| [task-0010](./task-0010.json) | Add a second worked example for ailn_run with a quoted price | low | none | OPEN |

Agent-friendly: 9 of 10. Those need no keys, no funds and no private access.
