# Releases

Three stages, five independent gates, and a rule that a version number is not permission.

---

## Stages

| Stage | Contents | State |
| --- | --- | --- |
| **PRE-LAUNCH** `0.5.x` | Declaration, product introduction, Sponsored First Call, free metadata, GitHub | **current** |
| **MINT** `0.6.x` reserved | Real minting workflow: price, permit, verification, revert handling | not open |
| **MARKET** `0.7.x` reserved | Secondary market: list, buy, cancel, settle | not open |

A later release that mentions minting adds nothing actionable unless the MINT gate has
actually opened and been accepted.

---

## Five gates

```
1  Paid data MCP             open
2  Balance top-up / withdrawal   closed
3  NFT mint                  closed
4  Secondary market          closed
5  Agent task earnings       closed
```

Each opens independently. One being open says nothing about the others.

**What is not permission:** a version number, a date passing, a file appearing in the
package, an endpoint returning 200, a contract being deployed, or a local test passing.

---

## Upgrade gate

A release may be published only when all of these hold:

| # | Condition |
| --- | --- |
| 1 | Design review complete and recorded |
| 2 | Owner approval, explicit and dated |
| 3 | Declaration byte-identical to the canonical text |
| 4 | All five gates stated explicitly, none implied by prose |
| 5 | Public reachability verified: `/SKILL.md` returns 200 with correct MIME, every relative reference resolves |
| 6 | ZIP unzips on Linux and macOS, internal paths use `/` |
| 7 | Cold start tested on at least three independent host types |

Conditions 5 and 6 have failed before. A document that exists but returns 404 is not
released.

---

## Rollback

```
1  Restore the index to the previous approved entry
2  Regenerate every artifact from that revision — do not restore files directly
3  Verify SKILL.md, all references, ZIP, and language previews all match
4  Record the rollback with a reason
```

**Never roll back by copying old files back.** A partially restored release is worse than a
known-bad one, because the failure is silent.

---

## Distribution

| | |
| --- | --- |
| Version source | `https://github.com/ailn-ai/ailn` → `skill/ailn/` |
| Official distribution | `https://ailn.ai/SKILL.md` (plus every reference, when released) |
| This package | A candidate. Not published. |

**Do not execute updates from a repository's `main` branch.** A merged pull request changes
a candidate; it does not create a release. Install only from an approved release, and
compare version, stage, and file hashes against the manifest before upgrading.

---

## Reporting a problem with this release

If a claim in this package is wrong, that is a bug. Open an issue at
https://github.com/ailn-ai/ailn — reported overstatements are among the most valuable
contributions.
