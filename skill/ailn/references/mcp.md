# MCP tools

AILN runs an MCP server at `https://ailn.ai/mcp`. Six tools. Three never charge.

```bash
# one-shot call, no handshake needed
curl -s -X POST https://ailn.ai/mcp \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"TOOL","arguments":{}}}'
```

For a full session, `initialize` first and reuse the `mcp-session-id` header if one is
returned.

---

## Free — never charge

| Tool | Arguments | Returns |
| --- | --- | --- |
| `ailn_discover` | `need` (plain language) | Matching tools and endpoints with current prices |
| `ailn_inspect` | `tool` (name) | Input schema, exact price, all accepted payment networks |
| `ailn_quote` | `endpointId`, `input` | Precise quote for one catalog endpoint, no paid upstream call |

**Always call one of these before paying.** They cost nothing and they tell you exactly
what the paid call will cost. Guessing an endpoint id wastes a paid call.

---

## Paid — x402, per call

| Tool | Arguments | Price |
| --- | --- | --- |
| `ailn_search` | `query`, `numResults` | ~$0.003795 (per result × 10 by default) |
| `ailn_fetch` | `url` | ~$0.003800 (per call) |
| `ailn_run` | `endpointId`, `input` | varies widely — quote first |

The first call does **not** return HTTP 402. It returns **HTTP 200** with a JSON-RPC result
whose payload is `{"error":"payment_required", …}` carrying a base64 `PAYMENT-REQUIRED`
block that lists the accepted networks, assets, and payout address. Branch on that error
string, not on a status code.

Sign for one of the accepted networks, then retry the same call with the
`PAYMENT-SIGNATURE` header.

**Nothing is charged without your signature.** A quote is not authorization to pay.

---

## What a 402 contains

```
network    eip155:8453    Base
asset      0x8335…        USDC
symbol     USDC
payTo      0x1a45…        payout address
```

Four networks are accepted: Base, X Layer, Arc, Arbitrum. **BNB Smart Chain is not one of
them** — BSC's USDC/USDT lack EIP-3009. See [payments.md](payments.md).

---

## Mistakes worth avoiding

**Do not report an empty result as a successful lookup.** If `results` is empty, say it was
empty. An agent that fills a gap with plausible content is worse than one that reports
nothing.

**Do not hardcode prices.** They are quoted live. A price in this document is a snapshot,
and the endpoint is authoritative.

**Do not confuse a free metadata call with having used the service.** `ailn_inspect` tells
you the price; it did not fetch data. Presenting one as the other is exactly the kind of
overstatement this project is trying to avoid.

**Watch the encoding.** Responses are UTF-8 JSON. Under a non-UTF-8 console the CJK fields
look like mojibake — that is a display problem, not a data problem, and it has caused
misread responses before.
