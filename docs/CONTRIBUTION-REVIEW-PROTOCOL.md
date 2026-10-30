# Contribution review protocol

Three roles, and no one holds two of them on the same change.

| Role | Does | Cannot |
|---|---|---|
| **Contributor** | Opens the PR, supplies evidence | Approve, merge, or review their own work |
| **Verifier** | Reads the diff, runs the commands, returns a verdict | Merge |
| **Maintainer** | Merges, decides release, records the contribution | Skip the verifier on `high` or `funds` |

A contributor may be an agent, a human, or an agent acting for a human. The role is about the
action, not the entity.

---

## What the contributor must supply

Every PR answers four questions, and the fourth is not optional.

| Section | Content | Rejection if |
|---|---|---|
| **Problem** | What is wrong today, observable by a stranger | It describes an improvement rather than a defect |
| **Change** | What the diff does | It restates the diff line by line without saying why |
| **Evidence** | Real command output, chain facts with block numbers, URLs that resolve | It says "tests pass" without pasting output |
| **Risk** | What could break, and what was **not** verified | It says "none" without reasoning |

A PR that claims a task must also name the task id. Two PRs claiming the same task: the verifier
picks one and tells the other contributor, rather than merging both.

---

## What the verifier does, in order

1. **Read the diff first**, before the description. The description is a claim; the diff is the fact.
2. **Check the scope.** Compare touched paths against `scope.paths_allowed` in the task file. Out of
   scope is a FAIL, not a request to trim — partial merges create invisible coupling.
3. **Check for secrets and dangerous dependencies.** Any credential, any new dependency that runs
   at install time, any postinstall script.
4. **Run the commands yourself.** `npm run verify`, `npm test`, plus the task's own
   `evidence.commands`. Not the contributor's pasted output — your own.
5. **Check the invariants** listed in `AGENT.md`. Breaking one is a FAIL even when tests pass.
6. **Check the claim calibration.** "Implemented" for a specification is a FAIL. "Verified" without
   a block number is a FAIL.

### Verdicts

| Verdict | Meaning | Next |
|---|---|---|
| `PASS` | Everything above holds | Maintainer decides merge |
| `NEEDS_WORK` | Direction is right, evidence or scope is not | Contributor revises; verifier re-runs from step 4 |
| `FAIL` | The change should not land in this form | Closed with the reason; a new PR may address it |

A verdict is recorded as a PR review comment with the exact commands run and their output. A
verdict without commands is not a verdict.

**A `NEEDS_WORK` is not a rejection of the author.** Most first PRs here come back once for scope.

---

## What the maintainer does

- Confirms a verifier actually ran the commands (the review comment contains them).
- Merges with a squash commit whose message starts with the task id.
- Records the contribution in `contributors/registry.json`.
- Decides whether a release follows. **Merging is not releasing**; nothing in this repository
  deploys on merge.

For `risk: high` the maintainer needs a second independent verifier. For `risk: funds` — anything
touching contracts or money paths — the maintainer reviews personally and the change does not merge
on tests alone.

---

## Independence rules

- The contributor of a change cannot be its verifier. An agent that wrote the patch cannot approve it.
- The verifier cannot be the same account that opened the PR, and cannot be an agent under the same
  operator for `high`/`funds` changes.
- Internal agents (Codex, DSH, Grok and successors) may act as verifiers early on. That is a
  **stated limitation**, not independence: a maintainer still merges, and the registry records
  "verified by an internal agent" so the distinction survives into the record.

---

## Time expectations

No SLA is promised. Reviews are best-effort. A PR with no response in 14 days may be closed and
reopened later; that is scheduling, not judgement.

---

## What never gets merged

- Anything that pushes to `main` directly, or disables a check
- Anything that publishes, deploys, or calls a payment endpoint from CI
- Anything that adds production credentials, ledger code, or settlement internals
- Anything that inflates a claim, including "coming soon" phrasing in operational docs
- Anything that edits the Declaration text or the frozen whitepaper
