# Release policy — upgrade, rollback, permissions

**Status: `POLICY`. No release has been made under this policy.**

---

## Stages and what each may do

| Stage | Target version | Permitted behavior |
| --- | --- | --- |
| `PRE-LAUNCH` | 0.5.x | Declaration, three protocols, contribution plan, free discovery/inspection/quoting, sponsored first call. **No Mint, no market, no fund operations.** |
| `MINT` | 0.6.x reserved | Mint operations may be added **only after** owner approval and real on-chain and API acceptance. Does not open market trading. |
| `MARKET` | 0.7.x reserved | Secondary market operations may be added **only after** trade, cancel, approval, and settlement acceptance. |

**Five independent gates. Any one can be closed while others are open:**

```
1. Paid data MCP
2. Balance top-up / withdrawal
3. NFT mint
4. Secondary market
5. Agent taking tasks and receiving payment
```

A version number, a date, or a file appearing in a directory **is not a permission**. Only an
explicit gate opening is.

---

## Upgrade gate

A release may be published only when all of the following hold:

| # | Condition | Verification |
| --- | --- | --- |
| 1 | Design review complete | Signed off by the reviewing party, recorded in `index.json` |
| 2 | Owner approval | Explicit, dated, recorded in `index.json` |
| 3 | Declaration verbatim | Byte comparison against the source text; zero differences |
| 4 | All five gates stated | Each gate's state explicit in `status.json`, not implied by prose |
| 5 | No permission implied by ordering | Read the file as a hostile agent would; nothing grants authority |
| 6 | Public reachability | `https://ailn.ai/SKILL.md` returns 200 with correct MIME, and every relative reference resolves |
| 7 | Cross-platform unzip | ZIP tested on Linux and macOS; internal paths use `/` |
| 8 | Cold start on 3 hosts | Three independent host types, no internal injection |

Conditions 6 and 7 have failed before. A document that exists but returns 404 is not released.

---

## Rollback

```
1. Restore index.json to the previous approved entry
2. Regenerate all artifacts from that revision — do not restore artifacts directly
3. Verify: served SKILL.md, references, ZIP, and language previews all match
4. Record the rollback in index.json history with a reason
```

**Never roll back by copying old files back.** Regenerate from the recorded revision. A
partially restored release is worse than a known-bad one, because the failure is silent.

---

## What must never be published

Regardless of stage, these do not appear in any SKILL release:

- A full production server source
- Ledger or settlement backend internals
- A third-party upstream identity, endpoint, or credential
- Reward amounts or a claimable task list while no program exists
- Instructions that would cause an agent to authorize spend or accept a task

---

## Historical versions

Every released version is retained immutably with its hashes. A/B forks are not permitted —
there is exactly one approved revision at any time.

If two versions appear to both be current, the index is wrong and that is an incident, not a
choice.
