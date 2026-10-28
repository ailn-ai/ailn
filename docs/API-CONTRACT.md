# API contract — measured, not described

Captured from `GET https://ailn.ai/api/capabilities` at **2026-10-28T17:10Z**. If this file and
the README disagree on a field, **this file wins** — it is copied from the live response.

## Tools

| Tool | Pricing | Price to caller | Upstream cost | Callable now |
|---|---|---|---|---|
| `ailn_discover` | free | — | — | yes |
| `ailn_inspect` | free | — | — | yes |
| `ailn_quote` | free | — | — | yes |
| `ailn_search` | per-result x10 (default) | $0.003795 | 2,530 micro-USD | yes |
| `ailn_fetch` | per call | $0.003800 | 2,533 micro-USD | yes |
| `ailn_run` | dynamic — ask `ailn_quote` with an `endpointId` | quoted per endpoint | varies | yes |

The paid path opened on 2026-10-29: one call was quoted, signed and settled on Base for 0.003795
USDC. Free discovery, quoting and the sponsored demo at `POST /demo/search` keep working alongside it.

## Networks

| Network | Asset | Accepted | Why |
|---|---|---|---|
| Base (8453) | USDC | yes | EIP-3009 |
| Arc (5042) | USDC | yes | EIP-3009 |
| X Layer (196) | USDC / USDT | yes | EIP-3009 |
| Arbitrum (42161) | USDC | yes | EIP-3009 |
| BNB Smart Chain (56) | USDC / USDT | **no** | token lacks EIP-3009 — use balance top-up |

The server states this itself under `wallet.x402State.unsupportedNetworks`; the four accepted
networks appear under `provenNetworks` and `verifiedNetworks`.

## Payment semantics

`verifies: true`, `settles: true`. An authorization is checked off-chain (EIP-3009) and settled
on-chain; **the result is returned only after settlement succeeds**. A valid signature against an
address with no balance is not sufficient — that trap is documented in `docs/X402.md`.

## What is still missing here

- **One chain is evidenced, three are claims.** A single Arbitrum transfer is checked and published in
  [`docs/SETTLEMENT-EVIDENCE.md`](./SETTLEMENT-EVIDENCE.md); Base, X Layer and Arc appear only under the
  service own `provenNetworks` claim.
- **No rate limits, SLA or refund policy** are written down.
- **No request/response example for the paid path** — it is closed, so there is nothing honest to
  capture yet.