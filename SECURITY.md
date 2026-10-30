# Security Policy

## Reporting a vulnerability

Report privately. Do **not** open a public issue for a security problem.

**Two channels, either is fine:**

| Channel | Use it when |
| --- | --- |
| **`ailnlab@ailn.ai`** | Preferred. Monitored by a maintainer. Works if you have no GitHub account or want it out of GitHub entirely. |
| GitHub private vulnerability reporting | You prefer to keep it on-platform. Use the Security tab on this repository. |

The mailbox is AILN's official address and forwards to the maintainer on duty. **Do not send
secrets, private keys, or wallet seed phrases by email** — describe the vulnerability and we
will arrange a channel for anything sensitive.

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
permit issuance is closed (403 `pre_mint_business_closed` at the pre-mint gate, 503 `issuance_paused` at the origin), so minting is impossible in practice.

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