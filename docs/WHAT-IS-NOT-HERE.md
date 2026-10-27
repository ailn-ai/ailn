# What is not here, and why

This repository is deliberately incomplete. Each exclusion below is a decision, not an
oversight.

---

## 1. The production server (`worker.js`)

**Size:** ~184 KB, actively changing.
**Excluded because:** it contains the full settlement path, all four chains' payment
verification, the ledger interface, and operational configuration surface. Publishing it is a
security review of its own, not a side effect of open-sourcing documentation.

**What would unblock it:** a dedicated audit scoped to what is safe to publish, plus owner
approval. Neither has happened.

**Do not:** reconstruct it, paste excerpts that reveal settlement internals, or link to a
private copy.

---

## 2. The D1 ledger and fund settlement backend

**Excluded because:** a production ledger defect was identified and **fixed locally but not
deployed**. Publishing code whose live version is known-broken would be actively misleading.

**What would unblock it:** deploying the fix, verifying it, then a separate publication
decision.

---

## 3. Brand assets and artwork

**Size:** several hundred megabytes.
**Excluded because:** rights boundary. Artwork is not code. See `LICENSE-SCOPE.md`.

Some source artwork may be published later under an explicit brand license. It will not be
swept in under the MIT grant.

---

## 4. Third-party upstream identity

**Excluded because:** an explicit project requirement, not a preference.

No upstream vendor name, endpoint, credential, API key, or code clone appears in this
repository. The data layer is described by mechanism — "a data upstream" — never by supplier.

This is enforced in CI: the scan fails on the pattern. If you find a violation, report it.

---

## 5. Internal research, workbench, and audit trails

**Excluded because:** they contain working notes, unverified claims, internal correspondence,
local paths, and personal identifiers. They are how the project thinks, not what it publishes.

---

## 6. The NFT market project

**Excluded because:** it is frozen. Publishing a working trading engine that the project has
decided not to operate would invite people to build against something with no support
commitment.

The technical selection and the completed work are retained privately.

---

## 7. Deployed contract addresses beyond the one verified one

Only the deployed V3 Passage address appears, and only with its verification method.

**Any address not verified on chain by the person adding it is a defect.** Do not add one
because another file has it, or because a document mentioned it.

---

## What this means for you

If you came here expecting to run AILN: you cannot. This repository is specifications,
documentation, and a thin example.

If you came to understand the protocols: everything needed is here, and it is labeled
`PROPOSED`.

If you came to build against the live API: `examples/mcp-quote/` shows the shape, and the
live endpoint is the source of truth for pricing.

---

## If you think an exclusion is wrong

Open an issue and argue it. Exclusions have reasons, and reasons can be wrong. What is not
acceptable is quietly re-adding an excluded item under a different name — that gets closed
immediately and without discussion.
