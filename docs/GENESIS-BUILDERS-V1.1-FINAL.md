# Genesis Builders V1.1 — final

Base commit at start: `02b84f5`. This file records what is **verified** and what is **not**, and it
does not upgrade the second into the first.

---

## Status

```
GENESIS BUILDERS — READY FOR EXTERNAL CONTRIBUTORS
（附三项 NOT_VERIFIED，见下表）
```

The label is only as strong as the checks below. Three things a stranger would rely on have not
been exercised by a real outsider yet, and they are marked as such.

---

## Verified

| # | Claim | How it was checked |
|---|---|---|
| 1 | A stranger can find a task and understand the flow | Simulated twice by agents with only the repo URL; both reached a claimable task and named their next action |
| 2 | A stranger can produce a valid contribution | Simulated: one agent produced a 27-line diff, a patch and a PR body conforming to the template, without pushing |
| 3 | The review protocol rejects weak evidence | Simulated: a reviewer given a constructed PR returned `NEEDS_WORK` and named the fabricated line |
| 4 | CI gates the four deterministic checks | `verify`, `scan`, `tasks`, `conformance` all green on `main`; each is status-check eligible |
| 5 | The task pool is machine-validated | `node scripts/validate-tasks.mjs` → `task pacts OK`, wired into `npm test` and CI |
| 6 | A clean clone passes the front door | `npm run verify` and `npm test` pass on a fresh clone (this failed before `faa2758`) |
| 7 | The steward cannot escalate | Runs on the base commit, executes no contributor code, `contents: read`, holds no secret |

## NOT_VERIFIED

| # | Claim | Why it is not verified | What would verify it |
|---|---|---|---|
| A | The steward can post its report on a **fork** PR | No external GitHub account was available to open a fork PR. GitHub gives fork PRs a read-only `GITHUB_TOKEN`, so the comment call is expected to return 403 and fall back to the job summary — but that path has only been reasoned about, not observed | One real fork PR; check the run log for `could not post the report: HTTP 403` and confirm the summary contains the report |
| B | A real outsider can complete a task end to end | Both simulations were internal agents, and neither pushed a PR | One external contributor, one merged PR |
| C | `contributors/registry.json` can record a contribution | It is empty, because nothing has been merged | The first merge |

**None of A, B or C is described as working anywhere in the repository.** Where the docs mention
them, they say what will happen, not what has happened.

---

## What changed in V1.1

| Area | Change |
|---|---|
| P0 steward | Every API call's status is checked; pagination followed; existing report updated in place; report always written to the job summary; a 403 on a fork PR is reported as expected, not as success |
| P1 CI | `example` distinguishes exit 2 (unreachable) from any other failure (protocol error → red). The four gating jobs are unchanged |
| P1 proposals | `docs/GENESIS-BUILDERS-OPEN-PROPOSALS.md` + a proposal issue template; the review protocol explicitly does **not** apply to discussions |
| P1 tasks | `task-0001/0002/0006` rewritten as verification tasks, because the fixes they described were already merged; `task-0009` marked as a historical V3 review, distinct from V4.1 |
| Docs | Outreach drafts A and B, this file |

The link to `README`, `CONTRIBUTING` and `AGENT.md` is unchanged from V1; the additions are
`docs/GENESIS-BUILDERS-OPEN-PROPOSALS.md` and the proposal template.

---

## Five things only the owner can do

| # | Action | Where | Consequence of not doing it |
|---|---|---|---|
| 1 | Protect `main`: require PR, require `verify`/`scan`/`tasks`/`conformance`, block force-push and deletion, **`enforce_admins: false`** | Settings → Branches → Add rule | "PR required" stays a convention. Anyone with write access can push to main |
| 2 | Check whether Copilot code review is available | Settings → Copilot (or org settings) | If available, PRs get a semantic first pass. If not, nothing is lost — the deterministic steward still runs |
| 3 | Enable Discussions and create three categories: *Ideas & Proposals*, *Technical Research*, *General Discussion* | Settings → General → Features → Discussions | Proposals land as issues, which branch poorly. The proposal template works either way |
| 4 | Approve or reject the bounty policy draft | `docs/GENESIS-BOUNTY-POLICY-DRAFT.md` | No paid task can be posted. Every task stays `reward: none` |
| 5 | Review outreach copy A and B before any posting | `docs/GENESIS-BUILDERS-OUTREACH.md` | Nothing is published by an agent; the drafts wait |

**Do not enable `pull_request_target`** without reading the steward first. The current design needs
no elevated token; switching would create one.

---

## What this round deliberately did not do

- No Stigmergy, Amber or Chrysalis implementation
- No change to production payment, NFT, mint or the SKILL release route
- No LLM reviewer, no new AI watch system
- No new institutional document beyond the proposal entry
- No contributor record pre-filled, no fake activity

---

## The weekly loop this is meant to enable

1. Read the open PR list. Each PR carries one Chinese report with a recommendation.
2. For `建议接受（以 CI 结果为准）`: run the commands it lists, then merge.
3. For `要求修改`: reply with the one item that must change.
4. Read `contributors/registry.json` — it should grow; if it does not, the bottleneck is the task
   pool, not the docs.

If steps 1–4 take more than fifteen minutes in a week with no new PRs, something here is too
heavy and should be cut rather than extended.
