# Amber · 琥珀

**Status: `PROPOSED` — specification only.**

Asset authorization and settlement for agents: where funds sit, what an agent may spend
without per-transaction human approval, how per-call micro-payment works, and how revenue is
attributed.

| Component | Carries |
| --- | --- |
| **Vault** | custody boundary, spending policy, guardians |
| **x402** | per-call micro-settlement |
| **Settlement** | the record proving a payment happened |

---

## Why it exists

"The agent has a wallet" is not a permission model. A funded key gives unbounded authority
that a human cannot audit until afterward. The problem is bounding authority before it is
exercised, and producing a record checkable afterward.

x402 settlement is already live in AILN's data layer. Amber would standardize it — the
implementation exists, the specification does not.

---

## The three tiers, kept distinct

| Tier | Meaning |
| --- | --- |
| Internal credit | an entry in AILN's ledger |
| On-chain deposit | assets actually at an address |
| Authorized spend | an agent exercising a bounded permission |

Conflating these is the most likely way to mislead someone. Any implementation keeps them
visually separate.

---

## Architecture draft

> Field names are provisional.

```
Vault
  vaultId, owner
  assets        asset → amount
  policy        per-asset limits, allowlisted destinations, time windows
  guardians     may freeze, never spend
  recoveryRef   unresolved while Chrysalis is PROPOSED

Spend Authorization
  vaultId, amount, asset, destination, purpose
  nonce         monotonic, prevents replay
  expiresAt     short by design
  signature

Settlement Record
  txRef, chainId, asset, amount, from, to, timestamp
  authorizationRef, verifiedAt
```

The open question that decides everything else: **where is policy enforced?** If the agent
holds the key, policy is advisory. Real enforcement needs the key held by something the agent
cannot reprogram — a custody decision with legal consequences, not an engineering one.

That question is milestone 2 and it is unblocked only as a written decision.

---

## Milestones

| # | Milestone | Gate |
| --- | --- | --- |
| 1 | Write the policy model as prose, no schema | unblocked |
| 2 | Decide enforcement: on-chain, custodian, or advisory | product + legal decision |
| 3 | Replay protection for Spend Authorization | depends on 2 |
| 4 | Settlement record verified against a real chain | reference implementation |
| 5 | Revenue attribution | needs Stigmergy acceptance events |

---

## Contributing

Critique of the three-tier model. Threat models for each enforcement option. x402 prior art —
document what the standard already guarantees so this does not restate it.
