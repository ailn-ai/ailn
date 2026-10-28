# Structured signing objects

| Field | Value |
|---|---|
| Need | Structured signing objects |
| Standard | EIP-712 typed-data signing |
| Maturity | Standardized |
| Upstream / License | https://eips.ethereum.org/EIPS/eip-712 — see upstream for license terms |
| Vendored | `third_party/noble-hashes/` (keccak-256) |
| Status | `verified` (run-once-2026-10-29) |
| Verified scope | keccak-256 comes from the vendored `@noble/hashes`, checked against three published vectors; the EIP-712 digest is assembled here and is not cross-checked against a third-party signer |
| Main text | 5.2 |

> **Technology reserve.** Not run in AILN production, not integrated. Full implementation is not published in this repository.

Maturity labels are copied from AILN Whitepaper Appendix D and must not be upgraded here.