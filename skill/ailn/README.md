# Agent SKILL — single source

**Status: `CANDIDATE`. This directory is the source of truth. It is not a published release.**

---

## What this directory is

The single source for AILN's Agent SKILL — the document an AI agent reads before interacting
with AILN.

```
skill/ailn/
├── SKILL.md            Main file. What an agent needs to decide whether to act.
├── references/         Progressive-load detail, one topic per file.
├── index.json          Current approved version, stage, published locations.
├── manifest.json       Per-file hashes and sizes for the approved revision.
└── status.json         Live service state, kept separate from prose.
```

**`SKILL.md` is intentionally absent from this commit.**

The next revision is specified in a separate design document that is still under review. Until
that revision is approved, this directory holds the structure and the rules, not a candidate
body. Publishing a body before its design review completes would create the exact
version-confusion problem this structure exists to prevent.

---

## The rules this directory enforces

**1. One source, one release.**
Public artifacts — the served `SKILL.md`, its `references/`, the ZIP, and any language
preview — are all generated from **one approved revision**. They must never be assembled by
hand from different directories. Hand-assembly is how a stale copy ships.

**2. A merged PR is a candidate, not a release.**
Contributing to this directory changes the candidate. It does not publish anything, does not
grant permissions, and does not alter what is served.

**3. Hashes are declared, not implied.**
`manifest.json` records a SHA-256 per file for the approved revision. If content changes
without the manifest changing, the manifest is wrong and the change is incomplete.

**4. Status is data, not prose.**
Whether a service is currently open belongs in `status.json`, which can change hourly.
Putting it in `SKILL.md` means the document is stale the moment a service closes — and those
documents are cached for a long time.

**5. Installing or reading is not agreeing.**
Reading the SKILL does not constitute agreement to a property rule, task acceptance, wallet
authorization, publishing permission, or purchase intent. The SKILL states this explicitly and
a revision that removes that statement must be rejected.

---

## Why there is no body yet

Because the alternative already caused a problem. A previous situation had the live website
serving an old snapshot (`ailn-public`, version 0.1.0) while the reviewed version was 0.4.1
and a newer candidate existed separately. Four versions, three locations, no single answer.

This structure exists so that cannot repeat. The cost is that the directory looks empty. That
is the correct cost.

---

## See also

- `references/releases.md` — upgrade gates, rollback, permission matrix
- `AGENT.md` — repository-wide invariants, including SKILL-specific ones
- `DEVELOPMENT.md` §5 — how to work on the SKILL
