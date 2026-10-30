# Open proposals

Genesis Tasks are for work that is already defined. This page is for the other kind: an idea that
is not yet a task, and should not be forced into one.

---

## The rule that decides which path you are on

| If you have… | Use |
|---|---|
| A defined problem, a scoped diff, a way to prove it | a **Genesis Task** — pick one from [`tasks/`](../tasks/) |
| An idea, a challenge, an alternative architecture, a question about the design | an **Open Proposal** — this page |

An Open Proposal needs no task id, no scope, no acceptance list and no diff. It needs a problem
statement and an argument. Most proposals should never become code.

**The review protocol does not apply here.** Scope checks, evidence requirements and `PASS/FAIL`
verdicts are for pull requests, not for thinking out loud. Forcing them onto a discussion is how a
project stops having discussions.

---

## What belongs here

- **Agent economic mechanisms** — how work is priced, bonded, settled, or disputed, including
  designs that do not resemble the current three protocols
- **Alternative designs for Stigmergy, Amber or Chrysalis** — including arguments that they are the
  wrong decomposition
- **Agent property and identity research** — what ownership means for something that can be copied,
  forked, or suspended
- **Verification techniques** — how an acceptance decision could be made cheaper or harder to game
- **Continuity across instances** — approaches other than key custody and checkpoints
- **Anything that fits the vision and none of the categories above**

The whitepaper is a **research baseline**, not a permanent constraint on the technical route.
Challenging its design is welcome. Editing its frozen text is not — proposals argue *about* the
document, they do not rewrite it.

---

## What a good proposal contains

Five short sections. If one is missing, that is usually a sign the idea is not ready, not a sign
that the template is too strict.

1. **Problem** — what is wrong or missing today, stated so someone else can recognise it
2. **Claim** — the one sentence you want to be true
3. **Argument** — why it would work; what it assumes; what would falsify it
4. **Cost and risk** — what it would take, and what breaks if it is wrong
5. **Relation to what exists** — does it replace, extend, or contradict a current design?

Two paragraphs and a diagram is a complete proposal. Ten pages is also fine, but not required.

---

## What happens to a proposal

| Stage | Meaning |
|---|---|
| `discussion` | Open. Anyone may argue, including against it |
| `promising` | A maintainer thinks it is worth a prototype; still not a commitment |
| `task-candidate` | Concrete enough to become a Genesis Task, with scope and acceptance |
| `declined` | Recorded with the reason. Declined is not deleted |

A proposal that becomes a task keeps its discussion linked. A proposal that stays a proposal is not
a failure — most designs should stay arguments.

**No proposal creates a payment obligation.** If a proposal leads to a funded task, that follows
the bounty policy, separately, in writing.

---

## How to open one

**If GitHub Discussions is available:** use the *Ideas & Proposals* category. It is the better
place for a conversation, because a thread can branch and an issue cannot.

**If it is not yet enabled:** open a normal issue using the *Open Proposal* template. It will be
moved to Discussions once that is on, and the link will be kept.

Categories, when enabled:

| Category | For |
|---|---|
| **Ideas & Proposals** | mechanisms, alternative architectures, product direction |
| **Technical Research** | verification, cryptography, continuity, measurement |
| **General Discussion** | everything else, including "is this project serious?" |

---

## What we will not do with proposals

- Turn one into a paid task without an explicit, dated budget approval
- Treat disagreement with the whitepaper as a violation
- Ask a proposer to open a PR first
- Close a proposal for being "out of scope" when the scope is what is being questioned
