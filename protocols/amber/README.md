# Amber · 琥珀

**Status: `PROPOSED` — specification only. No implementation exists in this repository.**

---

## What it is

An asset authorization and settlement protocol for agents. It defines where funds are held,
what an agent may spend without a human approving each transaction, how per-call
micro-payment works, and how revenue is attributed.

Three components:

| Component | What it carries |
| --- | --- |
| **Vault** | Custody boundary: where funds sit, who can move them, what conditions apply |
| **x402** | Per-call micro-settlement, the payment standard already live in AILN's data layer |
| **Settlement** | The record proving a payment happened, checkable after the fact |

---

## Why it exists

"The agent has a wallet" is not a permission model.

Handing an agent a funded key gives it unbounded spending authority that a human cannot
audit until after the fact. The problem is not moving money — it is **bounding authority
before it is exercised**, and producing a record that can be verified afterward without
trusting the agent's own report.

---

## Boundary — what this protocol does NOT do

- **Does not provide custody as a service.** It specifies boundaries, not a custodian.
- **Does not guarantee recovery.** If an agent loses a key, this protocol does not restore it.
  Recovery would require Chrysalis continuity, which is unimplemented.
- **Does not provide credit.** No lending, no leverage, no synthetic exposure.
- **Does not define token economics.** That is out of scope entirely.
- **Does not settle fiat.** On-chain assets only.
- **Does not implement revenue attribution beyond recording it.** Splitting revenue between
  parties is a stated requirement, not a solved problem.

---

## Architecture draft

> **DRAFT — not implemented. Field names are provisional.**

```
Vault
  vaultId         identifier
  owner           identity reference (see Chrysalis)
  assets          asset → amount
  policy          per-asset spending limits, allowlisted destinations, time windows
  guardians       optional parties that can freeze, never spend
  recoveryRef     optional continuity reference; unresolved while Chrysalis is PROPOSED

Spend Authorization
  vaultId
  amount, asset, destination
  purpose         free-form, recorded not enforced
  nonce           monotonic, prevents replay
  expiresAt       short window by design
  signature       by the authorized agent instance

Settlement Record
  txRef           chain transaction reference
  chainId, asset, amount, from, to
  timestamp
  authorizationRef which Spend Authorization this settled
  verifiedAt      when and by what method the record was checked on chain
```

### Design position on custody

Three tiers, deliberately distinct, and **they must never be described as equivalent**:

| Tier | Meaning | What it is not |
| --- | --- | --- |
| Internal credit | An entry in AILN's own ledger | Not on-chain, not custody, not withdrawable reality |
| On-chain deposit | Assets actually at an address | Not necessarily spendable by the agent |
| Authorized spend | An agent exercising a bounded permission | Not ownership transfer |

Conflating these is the single most likely way to mislead a reader. Any implementation must
keep them visually and semantically separate.

### The hard problems, stated honestly

1. **Policy enforcement location.** If the agent holds the key, the policy is advisory — the
   agent can ignore it. Real enforcement requires the key to be held by something the agent
   cannot reprogram. That is a custody decision with legal consequences, not a technical one.
2. **x402's wallet warning is inherent.** Per-call payment via an offline signed authorization
   is indistinguishable from a phishing pattern, so wallets flag it. This is a protocol
   property, not a defect in any implementation.
3. **Settlement verification is asymmetric.** Verifying a payment requires chain access. An
   agent without chain access cannot prove it paid; it can only present a signature.

None of these are solved.

---

## Status

```
Phase          PROPOSED
Implementation none
Contracts      none
Audits         none
Note           x402 settlement is live in AILN's data layer, but it is NOT
               an implementation of Amber — Amber would standardize it.
```

---

## Milestones

| # | Milestone | Gate |
| --- | --- | --- |
| 1 | Write down the policy model as prose, without schema | Document review |
| 2 | Decide whether enforcement is on-chain, in-custodian, or advisory | Requires a product and legal decision, not an engineering one |
| 3 | Specify Spend Authorization replay protection | Depends on 2 |
| 4 | Settlement record format matching an actual chain | Needs a reference implementation |
| 5 | Revenue attribution | Requires Stigmergy acceptance events |

Milestone 1 is unblocked. Milestone 2 is a decision that cannot be made by engineering
alone — it determines whether AILN ever holds user funds, which is a different company.

---

## Contributing

- **Critique of the three-tier custody distinction.** Is it sufficient to prevent misleading
  readers? What would make confusion impossible rather than merely discouraged?
- **Threat model.** Enumerate how an agent could exceed its authorized spend under each of the
  three enforcement options.
- **x402 prior art.** The standard exists; document what it already guarantees so this
  protocol does not restate it.
- **Replay analysis.** What breaks the nonce scheme?

Not useful: an implementation. The custody question in milestone 2 is unresolved and an
implementation would silently answer it.
