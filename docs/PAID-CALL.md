# Making a paid call

Everything below was captured from a real call on 2026-10-29 that settled **0.003795 USDC on
Base** (tx [`0x29e30de0…12a6`](https://basescan.org/tx/0x29e30de0967721b56934276476d2d0c305452830bd8ac78321900d3157f312a6)).
Nothing here is a sketch.

---

## Step 1 — ask, and get a price

```json
POST https://ailn.ai/mcp
{"jsonrpc":"2.0","id":1,"method":"tools/call",
 "params":{"name":"ailn_search","arguments":{"query":"chain test"}}}
```

Without payment this answers HTTP 200 (not 402) with a JSON-RPC result whose text is:

```json
{"error":"payment_required",
 "message":"本次调用需支付 3795 micros（$0.003795）…",
 "PAYMENT-REQUIRED":"<base64 of the challenge below>"}
```

Decoded, the challenge is:

```json
{"x402Version":2,
 "accepts":[{"scheme":"exact",
   "network":"eip155:8453",
   "asset":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
   "payTo":"0x1a45727757E3aF2A688842ce1687056DB2308adC",
   "amount":"3795",
   "resource":"https://ailn.ai/mcp",
   "description":"AILN ailn_search — one call",
   "mimeType":"application/json",
   "maxTimeoutSeconds":120,
   "extra":{"name":"USD Coin","version":"2"}}]}
```

`amount` is a string in token base units: `"3795"` = 0.003795 USDC (6 decimals).
`extra.name` / `extra.version` are the EIP-712 domain fields for that token, and they match what the
contract reports on chain — see [`EIP712-DOMAINS.md`](./EIP712-DOMAINS.md).

Pick one entry from `accepts`. Several are offered: Base, X Layer (three assets), Arc, Arbitrum.

---

## Step 2 — sign an EIP-3009 authorization, offline

Typed data, `primaryType: "TransferWithAuthorization"`:

| Field | Type | Value used |
|---|---|---|
| `from` | address | the payer wallet |
| `to` | address | `accept.payTo` |
| `value` | uint256 | `accept.amount` |
| `validAfter` | uint256 | `now - 600` |
| `validBefore` | uint256 | `now + 900` |
| `nonce` | bytes32 | 32 random bytes |

Domain: `name` and `version` from `accept.extra`, `chainId` from `accept.network`, and
`verifyingContract` = `accept.asset`.

Sign with `eth_signTypedData_v4`. **No transaction is sent and no gas is paid by the payer.**

---

## Step 3 — retry with the proof

```
POST https://ailn.ai/mcp
content-type: application/json
PAYMENT-SIGNATURE: <base64 of {"authorization": {…}, "signature": "0x…"}>
```

The header is base64(JSON) with exactly two members: the six-field `authorization` above and the
`signature`. Nothing else is wrapped around it.

---

## Step 4 — the response

```json
{"ok":true,
 "tool":"ailn_search",
 "chargedMicros":3795,
 "result":{
   "query":"chain test",
   "results":[{"title":"Chain testing: all you need to know",
               "url":"https://www.testlearning.net/en/posts/chain-testing",
               "snippet":"Chain testing is a form of software testing …"}],
   "source":"ailn:web_search"},
 "upstream":{"runId":"01M62PJ2Z19280XME21A2EQA15"},
 "paymentState":"settled",
 "paymentId":"0xec77135b06104ca5274e42133d6888a0634854fadd4784e5195476285273a99d",
 "settleTxHash":"0x29e30de0967721b56934276476d2d0c305452830bd8ac78321900d3157f312a6",
 "paidFrom":"0x3fdb32c21c22fe5effc394d71dbe8589ce85b643",
 "paidValueMicros":"3795",
 "network":"eip155:8453",
 "symbol":"USDC",
 "settlementNote":"支付已通过 facilitator 上链结算（Base · USDC）。"}
```

`results` was trimmed to one item here; the call returned ten.

| Field | Meaning |
|---|---|
| `ok` | the call ran and the payment settled |
| `chargedMicros` | what was charged, in millionths of a dollar — 3795 = $0.003795 |
| `paymentState` | `settled` — data is released only after settlement |
| `settleTxHash` | the on-chain transaction, checkable on any explorer |
| `paidFrom` / `paidValueMicros` | payer and amount actually settled |
| `upstream.runId` | the upstream execution id, for support questions |

---

## Error shapes worth handling

| Response | Meaning |
|---|---|
| `payment_required` + `PAYMENT-REQUIRED` | no payment sent; pay and retry with the same arguments |
| `payment_invalid`, `reason: "missing_authorization"` | `PAYMENT-SIGNATURE` did not carry an `authorization` member |
| `payment_invalid` with another reason | signature, amount, nonce or window did not check out; nothing was executed |

The server distinguishes **verification passed** from **settled**. Data is returned only on the
second, so a well-formed signature against an empty wallet does not get you a free result.

---

## Cost per call

| Chain | Token | Caller pays | Settlement fee (facilitator) | Upstream cost |
|---|---|---|---|---|
| Base | USDC | 0.003795 USD | ~0.00209 USD | ~0.00253 USD |

At this price a single call is slightly loss-making once settlement and upstream are counted, so the
paid path exists to make the service genuinely callable rather than to earn. Repricing is a separate
decision.
