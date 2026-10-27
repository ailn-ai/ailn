# Development

How to get this repository running, what each command does, and where the boundaries are.

Node ≥ 20. No native build steps. No database. No chain node required for the default
commands.

---

## 1. Setup

```bash
git clone <repo>
cd ailn
npm install
```

`npm install` pulls dev dependencies only (a linter and the test runner). The example talks
to a live HTTP endpoint and needs no SDK.

---

## 2. Verify before you change anything

```bash
npm run verify
```

This runs three checks and must pass on a clean checkout. If it fails on a clean clone, that
is a bug in the repository, not in your environment — open an issue.

| Check | What it does | What it does not do |
| --- | --- | --- |
| docs lint | heading structure, required sections present | judge whether writing is good |
| link check | every relative link resolves to a real file | check external URLs |
| secret scan | pattern scan for keys, tokens, private keys | guarantee files are safe |

**A passing scan is not a security guarantee.** It catches known patterns. It cannot tell
whether a document leaks information in prose.

---

## 3. The example

```bash
npm run example:quote
```

Calls the live discovery endpoint, prints the current quote and payment options, and stops.
It does not sign, does not pay, and does not require a wallet.

Expected shape:

```
endpoint   https://ailn.ai/mcp
price      <quoted at call time>
options    <chains and assets currently offered>
```

The price is read live. Do not hardcode it anywhere — quoting is the point.

If the endpoint is unreachable, the example exits non-zero with the HTTP status. That is a
network condition, not a repository failure.

---

## 4. Working on protocol specs

Everything under `protocols/` is a specification. **There is no code behind it.**

Each protocol directory contains:

```
README.md        positioning, boundary, architecture draft, status, milestones
CONTRIBUTING.md  what help would actually move this forward
```

When editing:

- Keep `Status:` at the top accurate. All three are currently `PROPOSED`.
- Any interface sketch must be labeled `DRAFT — not implemented`.
- Do not add a contract address, endpoint, or SDK reference for a protocol that has none.
- If you propose a conflict with an existing protocol, state which one and why.

A protocol README that reads like documentation of a running system is a defect. The test
is: could a reader tell, from the first screen, that nothing is implemented? If not, fix it.

---

## 5. Working on the SKILL

`skill/ailn/` is the single source for the Agent SKILL. It is a **candidate**, not a
release.

Rules:

1. **A merged PR changes the candidate. It does not publish anything.** Publishing is a
   separate owner-approved step that generates the public artifacts from one approved
   revision.
2. The Declaration text is reproduced verbatim. Do not edit wording, punctuation, or line
   breaks. If you believe there is an error, open an issue; do not fix it in a PR.
3. Version, manifest, and hashes are declared in `skill/ailn/` index files. A PR that
   changes content without updating them is incomplete.
4. Progressive disclosure: the main `SKILL.md` holds what an agent needs to decide whether
   to act; `references/` holds detail loaded only when relevant.

See `skill/ailn/references/releases.md` for the upgrade and rollback rules.

---

## 6. Testing

```bash
npm run test     # runs every test that exists
```

Current state: this repository has verification scripts, not a unit-test suite, because the
code here is documentation and a thin example. The substantive test suites live elsewhere:

| Suite | Location | Count |
| --- | --- | --- |
| Passage V4.1 contract | `passage` repo | 129 |
| NFT market | separate repo (frozen) | 95 |
| Ledger | not public | 82 |

If you add executable code to this repository, it needs a test, and the test must assert the
**reason** for a failure, not merely that a failure occurred.

---

## 7. Boundaries

What you must not do in this repository, regardless of what would make a doc read better:

```
✘ add or reconstruct the production server
✘ add the ledger or any settlement backend
✘ add a third-party upstream name, credential, or clone
✘ publish anything, create a repository, or push to a remote
✘ claim a protocol is implemented
✘ add reward amounts or "claim this task" flows
✘ edit the Declaration text
✘ add an address that was not verified on chain
```

See `docs/WHAT-IS-NOT-HERE.md` for why each excluded item is excluded.

---

## 8. Known environment issues

**Windows.** Script execution policy may block `.ps1`. Prefer running Node directly. CJK
output can corrupt under a non-UTF-8 code page; set `chcp 65001` or use JSON output.

**Network.** Outbound access may be proxied. If `example:quote` times out, check proxy
environment variables before assuming the endpoint is down.

**Numeric precision.** BNB and USDC amounts must stay in integer base units. Do not pass
token amounts through floating point at any point — do the arithmetic in `BigInt` and format
only at the display boundary.

---

## 9. Getting help

Open an issue with:

- what you ran
- what you expected
- what happened

For anything involving chain state, include the block number and the method you used to
read it. "It says X on the website" is not a source.
