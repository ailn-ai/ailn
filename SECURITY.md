# Security Policy

## Reporting a vulnerability

Report privately. Do **not** open a public issue for a security problem.

Use GitHub's private vulnerability reporting on this repository, or contact the maintainers
through the channel listed on the project website.

Include:

- what is affected (file, contract, endpoint)
- how to reproduce
- what an attacker gains
- whether you have disclosed it elsewhere

We will acknowledge within a reasonable period and tell you whether we agree it is a
vulnerability. If we disagree, we will say why — silence is not a response.

**Do not test against production systems with real funds.** This repository contains no
deployable code, so most testing here is static review.

---

## What is in scope

| Asset | In scope |
| --- | --- |
| Documentation in this repository | Yes — misleading security claims count |
| `examples/` | Yes |
| `scripts/` | Yes |
| Agent SKILL content | Yes — instructions that could cause an agent to take a dangerous action |
| Passage contracts | Report to the `passage` repository |
| Production API | Only with prior written agreement |

## What is out of scope

- The production server — not in this repository and not public
- Findings that require a compromised host
- Reports generated entirely by an automated scanner with no analysis
- "This endpoint returns a version number" style findings
- Social engineering

---

## Known limitations, stated up front

This project documents its own weaknesses rather than waiting for someone to find them.

**1. The secret scan is pattern-based.**
`npm run scan` catches known key formats. It cannot detect a leak in prose, an indirect
identifier, or a novel credential format. **A passing scan is not a security guarantee** and
must not be cited as one.

**2. Contract tests are local only.**
The Passage V4.1 suite (129 checks) runs against Ganache in-process. Local success is not
mainnet behavior. The deployed V3 contract has not been compared byte-for-byte against a
rebuild — the BSC Seaport runtime, for comparison, is 23,981 bytes against 21,006 locally.

**3. No third-party audit exists.**
No contract, protocol, or server in this project has been audited by an independent firm.
Anything describing this project as audited is wrong.

**4. The payment pattern is indistinguishable from phishing.**
Per-call x402 payment uses an offline signed authorization — the same mechanism phishing
uses. Wallets flag it universally. This is inherent to the protocol, not a defect we can fix.

**5. Minting is gated off-chain.**
The deployed NFT contract has no pause and no admin. Minting depends on a permit signed by
off-chain signers. Permit issuance currently returns HTTP 503, so minting is not possible —
not because a switch is off, but because no one can obtain a permit.

**6. The ledger has a known unfixed defect.**
A production ledger defect was identified and fixed locally but **not deployed**. Do not
assume the live system has the fix.

---

## Disclosure policy

We will credit reporters unless asked not to. We will not pay for reports unless a paid
program is explicitly announced — see `CONTRIBUTING.md`.

> Paid contributions are planned, not open. No bounty program is currently live.

**Do not** interpret the absence of a bounty as permission to test against production with
real funds.

---

## Supported versions

| Component | Supported |
| --- | --- |
| Repository documentation | Current branch only |
| Passage V3 (deployed) | Yes |
| Passage V4.1 (candidate) | Not deployed; no security support |
| Protocols (PROPOSED) | Not applicable — no implementation |

There is no LTS. Documentation fixes are applied to the default branch only.
