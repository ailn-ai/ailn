# Security Policy

## Reporting a vulnerability

Report privately. Do **not** open a public issue for a security problem.

Use GitHub's private vulnerability reporting on this repository.

Include what is affected, how to reproduce, and what an attacker gains. We will acknowledge and
tell you whether we agree it is a vulnerability. If we disagree, we will say why.

**Do not test against production systems with real funds.**

---

## In scope

Documentation in this repository, `examples/`, `scripts/`, and the Agent SKILL content —
including instructions that could cause an agent to take a dangerous action.

Passage contracts: report to the `passage` repository.

---

## Known limits

**The secret scan is pattern-based.** It catches known credential formats. It cannot detect a
leak in prose. A passing scan is not a security guarantee.

**Nothing here has been audited by a third party.** No contract, protocol, or server. Anything
describing this project as audited is wrong.

**The ledger has a known unfixed defect.** Identified and fixed locally, not deployed. Do not
assume the live system has the fix.

**Minting depends on off-chain permits.** The deployed contract has no pause and no admin;
permit issuance currently returns HTTP 503, so minting is impossible in practice.

---

## Disclosure

We will credit reporters unless asked not to. We do not pay for reports unless a paid program
is announced.

> Paid contributions are planned, not open. No bounty program is currently live.

The absence of a bounty is not permission to test against production with real funds.

---

## Supported versions

Current branch only. There is no LTS. Passage V3 is supported; V4.1 is not deployed and has no
security support.
