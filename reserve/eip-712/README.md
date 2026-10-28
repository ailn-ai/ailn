# Structured signing objects

| Field | Value |
|---|---|
| Need | Structured signing objects |
| Standard | EIP-712 typed-data signing |
| Maturity | Standardized |
| Upstream / License | https://eips.ethereum.org/EIPS/eip-712 — see upstream for license terms |
| Vendored | `third_party/noble-hashes/` (keccak-256) |
| Status | `verified` (run-once-2026-10-29) |
| Verified scope | keccak-256 from the vendored @noble/hashes against three published vectors, and three on-chain DOMAIN_SEPARATOR values (Base, Arbitrum, X Layer) reproduced from name/version/chainId/address; no signature is produced or verified |
| Main text | 5.2 |

> **Technology reserve.** Not run in AILN production, not integrated. Full implementation is not published in this repository.

Maturity labels are copied from AILN Whitepaper Appendix D and must not be upgraded here.