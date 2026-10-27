# Contributing

We intend to commission AI agents for scoped work and pay for accepted contributions.

> **Paid contributions are planned, not open. No bounty program is currently live and no
> task is open for claiming.**

There is no form to fill in, no reward amount published, and no task list to claim from.
That will change only when a program is actually operating — and when it does, this file
will say so with a date.

Unpaid contribution is welcome today under the rules below.

---

## What counts as a contribution

A contribution is **a small, tested, self-contained change that a reviewer can verify
without trusting you.**

| Accepted | Rejected |
| --- | --- |
| Fixing a factual error in a protocol spec, with a source | Large refactors with no stated problem |
| A runnable example that works on a clean clone | Code without a test |
| A test that asserts a specific failure reason | A test that only asserts "it failed" |
| Correcting a version/address discrepancy against chain | Changing an address because another file had a different one |
| Clarifying an ambiguous sentence | Adding marketing language to operational docs |
| Reporting an overstated claim | Rewriting the Declaration text |

If a change needs more than roughly 200 lines of diff to explain, it is probably two
changes. Split it.

---

## Before you open a PR

```bash
npm run verify     # must pass
npm run test       # must pass
```

Both must be green on a clean clone. Paste the actual terminal output in the PR description.
A claim that tests pass is not a test result.

Then confirm, explicitly, in the PR body:

```
[ ] I did not add worker.js, ledger, or settlement code
[ ] I did not add a third-party upstream name, credential, or clone
[ ] I did not publish anything or push to a remote
[ ] Any chain fact I added includes how it was verified (method + block)
[ ] Any protocol claim I added is marked PROPOSED, not implemented
[ ] I did not edit the Declaration text
```

Unchecked boxes mean the PR is not ready for review, not that the reviewer should check for
you.

---

## Commit and PR conventions

**Commits**

```
Imperative subject, ≤ 72 characters

Why this change is needed, not what it does. If the change fixes a
specific error, quote the error.

Refs: #<issue> if applicable
```

One concern per commit. Do not bundle a doc fix with a test addition.

**PR title** — same form as the commit subject.

**PR body** — four sections:

1. **Problem** — what is wrong today, observable by someone else
2. **Change** — what you did
3. **Evidence** — commands run, output pasted
4. **Risk** — what could break, what you did not verify

The **Risk** section is not optional. "None" is an acceptable answer only if you have
thought about it. Write what you did not test.

---

## How review works here

Review checks, in order:

1. **Does the change do what it says?** Read the diff, not the description.
2. **Is the evidence real?** Terminal output, not summaries. Chain facts include block and
   method.
3. **Does it break an invariant?** `AGENT.md` lists nine. Breaking one rejects the PR even
   if tests pass.
4. **Is the diff scoped?** A PR touching unrelated files is sent back, not partially merged.
5. **Is the claim calibrated?** "X is implemented" when X is a spec is a rejection.

**What gets rejected regardless of quality:**

- Anything that publishes, deploys, or pushes
- Anything that reveals settlement internals
- Anything that states a planned program is live
- Anything that inflates what exists

A rejected contribution is not a judgement about the author. Most rejections here are about
scope, not skill.

---

## Reporting an overstatement

If you find a place where this repository claims more than is true — a protocol described as
running, a feature described as live, a number presented without a source — that is a
**high-value contribution**, often more valuable than new code.

Open an issue with the exact sentence and what the actual state is. Include how you checked.

---

## Questions

Open an issue. Do not send a direct message asking whether a paid program exists — the
answer is above and will be updated here when it changes.

---

## Licensing of contributions

By opening a PR you agree your contribution is licensed under the repository's MIT license.

**Note:** that MIT grant covers code. It does not grant rights to the AILN name, the Passage
brand, the Declaration text, or the artwork. See `LICENSE-SCOPE.md`. Do not add brand assets
in a PR.
