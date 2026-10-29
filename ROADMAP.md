# Roadmap

> **Every item below is a plan, not a commitment.** Dates are absent on purpose: this project
> has repeatedly found that publishing a date creates pressure to declare things done.

Status vocabulary is fixed: `PLANNED` / `IN DESIGN` / `IN PROGRESS` / `DONE` / `BLOCKED`.

---

## Where things actually stand

| Area | Status | Note |
| --- | --- | --- |
| Pay-per-call data API | **DONE** | Live on four chains, real settlement verified |
| Passage V3 contract | **DONE** | Deployed on BNB Chain, `totalMinted = 0` |
| Passage V4.1 contract | **DONE (local)** | 129 tests pass, never deployed |
| Agent SKILL | **IN DESIGN** | `skill/ailn/` is a candidate; not published |
| Stigmergy protocol | **IN DESIGN** | Specification only |
| Amber protocol | **IN DESIGN** | Specification only |
| Chrysalis protocol | **IN DESIGN** | Specification only, deliberately deprioritized |
| This open-source repository | **IN PROGRESS** | Local candidate, not published |
| Paid contribution program | **PLANNED** | No program exists |
| NFT mint open | **BLOCKED** | Permit issuance is closed: 403 `pre_mint_business_closed` at the gate, 503 `issuance_paused` at the origin |

---

## Near term — unblocked, could start today

| # | Item | Status | Why it matters |
| --- | --- | --- | --- |
| 1 | Publish this repository (owner approval required) | **PLANNED** | Nothing here is reachable until it is public |
| 2 | Stigmergy artifact review by outside reviewers | **PLANNED** | Milestone 1 of that protocol, no dependency |
| 3 | Chrysalis double-liveness threat model | **PLANNED** | Highest-value contribution available anywhere in this project |
| 4 | Fix the mint status API's `saleOpen` and `totalSupply` fields | **PLANNED** | `saleOpen` reads true while minting is impossible; `totalSupply` returns `MAX_SUPPLY` |
| 5 | BSC fork regression for Seaport assumptions | **PLANNED** | Local runtime does not match the deployed one |

Item 4 is a real bug that has already caused confusion. It is small and unblocked.

---

## Blocked, with what blocks it

| Item | Blocked by |
| --- | --- |
| SKILL public release | Owner approval of a specific revision; currently no approved release |
| Amber enforcement model | A product and legal decision on whether AILN ever holds user funds |
| Stigmergy settlement handoff | Amber reaching a usable state |
| Stigmergy bond mechanism | Chrysalis identity continuity |
| Chrysalis chain anchor | A decision this project has not made |

**Do not read the blocked list as a schedule.** Several entries have no owner and no date.

---

## Explicitly not planned

Stated so it stops being asked about:

- Lending, borrowing, leverage, or any credit product
- Fractionalized NFTs
- A token sale schedule or price
- Staking or yield products
- Any mechanism paying for social actions (follow, retweet, referral spam)
- An AMM or liquidity pool
- Multi-collection marketplace
- Claims that any protocol is audited — none are

---

## How this file stays honest

If an item here is marked `DONE` and it is not, that is a bug. Report it as an issue. The
same goes for anything in `README.md`.

A roadmap that overstates is worse than no roadmap, because people build against it.
