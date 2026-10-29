# Payments

Per-call settlement over x402. The accepted chain list is narrower than the service's own
tooling implies, and one chain people will reach for does not work at all.

---

## The flow

```
1  POST call                → payment request
2  sign authorization       offline, no transaction, no gas
3  POST call + signature    → server verifies settlement, returns data
```

Step 2 is the part wallets warn about. Signing an offline authorization that lets a server
pull a bounded amount is the same pattern phishing uses. **The warning is correct behavior,
not a false positive.** Use a dedicated small-balance wallet and check the amount cap and
validity window before confirming.

---

## What is actually accepted

Verified against a live `PAYMENT-REQUIRED` payload on 2026-10-27:

| Network | Chain | Asset | EIP-3009 |
| --- | --- | --- | --- |
| `eip155:8453` | Base | USDC | yes |
| `eip155:196` | X Layer | USDC, USD Coin, USDT | yes |
| `eip155:5042` | Arc | USDC | yes |
| `eip155:42161` | Arbitrum | USDC | yes |

**BNB Smart Chain (`eip155:56`) is absent.** BSC's USDC (`0x8ac7…`) and USDT (`0x55d3…`)
do not implement EIP-3009, so x402 cannot settle there. The service's own capability
endpoint lists both as `unsupportedNetworks`.

**If you hold funds only on BSC, you cannot pay by x402.** The service's capability
endpoint does describe a prepaid-balance model for BSC users, but the top-up route returns
403 in the current PRE-LAUNCH deployment, so that path is designed rather than open. Do not
sign a BSC x402 payment; nothing will accept it. Do not assume top-up works because a
capability listing mentions it — check, then believe.

USDT appears only on X Layer. Base, Arc, and Arbitrum are USDC only.

---

## The payment request is an error, not a status code

On the MCP path, a paid call returns **HTTP 200**. The body is a JSON-RPC result whose text
payload contains:

```json
{ "error": "payment_required", "message": "…", "accepts": [ … ] }
```

The `PAYMENT-REQUIRED` block travels base64-encoded inside that payload.

**Write `if "payment_required" in body`, not `if status == 402`.** A client that checks for
402 will treat every payment request as success and every response as missing data.

---

## The EIP-712 domain trap

Each token has its own EIP-712 domain. `name` and `version` differ across deployments, and
**getting either wrong makes every signature fail** — usually without a useful error.

Parameters used here were verified against each token's on-chain `DOMAIN_SEPARATOR()`, not
copied from documentation, because the documentation for these tokens is inconsistent across
chains. If you add a chain, verify the domain on chain first.

---

## Settlement is checked, not assumed

The server does not serve data because a signature verified. It serves data because
settlement was confirmed.

> A signature that verifies against an address with no funds is not payment.

---

## What this does not cover

No refunds. No credit. No subscription — every call priced individually. No fiat. No custody
of your funds at any point.

---

## What is not open

| Capability | State |
| --- | --- |
| Paid data calls | Live (Base / X Layer / Arc / Arbitrum) |
| Top-up | Not open |
| Withdrawal | Not open |
| NFT minting | Open — paid in **BNB**, a different rail entirely |
| Secondary market | Not open |

Minting is not an x402 payment. Do not tell anyone they can mint with USDC; they cannot.
