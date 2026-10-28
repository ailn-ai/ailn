# Settlement evidence

One settlement, checked against the chain. This is the only transaction this repository has
independently verified; everything else about settlement is the service's own claim.

| Field | Value |
|---|---|
| Chain | Arbitrum One (42161) |
| Token | USDC `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| Transaction | `0x3b3a2f398044bb3d46cd9a027c1dbfad97fb21597bb058f7dc6b7d399dc998ac` |
| Block | `0x1ed86d66` (517500262) |
| Timestamp | 2026-10-23 09:54:11 UTC |
| From | `0x3fdb32c21c22fe5effc394d71dbe8589ce85b643` |
| To | `0x1a45727757e3af2a688842ce1687056db2308adc` |
| Amount | **0.003795 USDC** (3,795 units at 6 decimals) |
| Log | ERC-20 `Transfer`, `logIndex` 1 |

## Second settlement - Base, the one that opened the paid path

| Field | Value |
|---|---|
| Chain | Base (8453) |
| Token | USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Transaction | `0x58bae3c062198a2c799342f97ee8a9c53b901bd538a2517d0a1c49203e27f22e` |
| Block | 53210967 |
| Timestamp | 2026-10-29 02:14:41 (+08) / 2026-10-28 18:14:41 UTC |
| From | `0x3fdb32c21c22fe5effc394d71dbe8589ce85b643` |
| To | `0x1a45727757e3af2a688842ce1687056db2308adc` |
| Amount | **0.003795 USDC** (3,795 units) |
| Submitted by | Multicall3 `0xca11bde05977b3631167028862be2a173976ca11`, relayed by the facilitator - the payer pays no gas |

Explorer: <https://arbiscan.io/tx/0x3b3a2f398044bb3d46cd9a027c1dbfad97fb21597bb058f7dc6b7d399dc998ac>

## How it was checked

1. `eth_getLogs` on the USDC contract, filtered by `Transfer` and by the recipient address.
2. `eth_getBlockByNumber` for the block timestamp.
3. Amount decoded from the log data as `0x0ed3` = 3,795 units = 0.003795 USDC.

Nothing above is copied from a report; it is the chain's own answer.

## What is not verified here

Base (8453), X Layer (196) and Arc (5042) appear in the service's `provenNetworks` claim, but this
repository does not publish a checked transaction for them yet. Treat those three as claims.

## Addresses in this file, and how each one is verified

| Address | What it is | How it is verified |
|---|---|---|
| `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | USDC on Arbitrum One | the `Transfer` event above is emitted by this contract address |
| `0x3fdb32c21c22fe5effc394d71dbe8589ce85b643` | payer | `from` field of that `Transfer` log |
| `0x1a45727757e3af2a688842ce1687056db2308adc` | receiver | `to` field of that `Transfer` log, filtered by `eth_getLogs` |

Explorer: <https://arbiscan.io/tx/0x3b3a2f398044bb3d46cd9a027c1dbfad97fb21597bb058f7dc6b7d399dc998ac>
