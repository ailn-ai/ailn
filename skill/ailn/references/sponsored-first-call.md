# Sponsored First Call

**AILN pays for your first real data call. No wallet, no account, no API key.**

This works right now. Verified 2026-10-27 against the live deployment.

---

## The call

```bash
curl -sS -D- --max-time 60 -X POST https://ailn.ai/demo/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"what is the x402 payment protocol"}'
```

POST, not GET. JSON body, one field: `query`.

`-D-` prints the headers — check `content-type` is `application/json` before parsing.

---

## A real response

Captured 2026-10-27. Ten results; three shown.

```json
{
  "ok": true,
  "query": "what is the x402 payment protocol",
  "results": [
    {
      "title": "What is x402? | Payment Protocol for AI Agents on Solana",
      "url": "https://solana.com/x402/what-is-x402",
      "snippet": "Learn how x402 enables AI agents to make internet-native payments with the HTTP 402 status code…"
    },
    {
      "title": "What is x402? HTTP 402 payments for AI agents - MetaMask",
      "url": "https://metamask.io/news/what-is-x402",
      "snippet": "x402 is an open payment protocol that activates the HTTP \"402 Payment Required\" status code…"
    },
    {
      "title": "Overview - Coinbase Developer Documentation",
      "url": "https://docs.cdp.coinbase.com/x402/welcome",
      "snippet": "x402 turns an API or digital service into a paid resource. A buyer sees the price, pays, and gets access…"
    }
  ],
  "source": "ailn:web_search",
  "latencyMs": 2306,
  "wouldChargeMicros": 3795,
  "demo": true,
  "remaining": 2,
  "upstreamRunId": "…"
}
```

| Field | Meaning |
| --- | --- |
| `results` | Real upstream results — data, not a quote |
| `wouldChargeMicros` | What a paid call would have cost: 3795 micros = **$0.003795** |
| `source` | Which upstream produced them (`ailn:web_search`) |
| `latencyMs` | Actual upstream round trip for this call |
| `remaining` | Calls left for this source IP on this instance |
| `demo` | Flags this as the sponsored path |

**You were not charged.** No wallet, no signature, no balance. AILN absorbed $0.003795.

---

## Limits

| Limit | Value |
| --- | --- |
| Per **source IP** | 6 calls |
| Per server instance | 300 calls |
| Cost to you | 0 |

Both counters are in-memory and reset when the Cloudflare instance recycles. In practice this
means **`remaining` is best-effort, not a guarantee** — observed values went 5 → 4 → 3 → 2 on
one instance, then back to 5 after a new instance took over.

The limit is **per IP, not per wallet address**. Agents sharing an egress IP share the quota.

When exhausted the endpoint returns `demo_quota_exhausted` with a pointer to the paid MCP path.
It does not silently degrade into a fake result.

---

## Latency

Measured round trips during testing: **2.3 s, 2.7 s, 3.6 s, 5.5 s, 6.0 s, 7.7 s**. Allow
`--max-time 60`. A slow response is not a dead endpoint — check the content type before
concluding anything.

---

## What a sponsored call costs AILN

Not the retail price. AILN absorbs the **upstream cost**, reported in `/api/capabilities` as
`costMicros`:

| Tool | Retail | Upstream cost to AILN |
| --- | --- | --- |
| `ailn_search` | $0.003795 | $0.002530 |
| `ailn_fetch` | $0.003800 | $0.002533 |

About **$0.0025** per sponsored call, roughly two thousand calls at the current prepaid
balance.

---

## Why we do this

We could have written a paragraph about how good the data layer is. A paragraph costs nothing
and proves nothing.

Instead we pay for one real call and let the result speak. If the data is bad, you will know in
ten seconds, and no amount of copy would have fixed that.

The pattern is worth naming because most agent-facing advertising does not do it: deliver one
genuine unit of work, paid for by the seller, evaluated by the buyer.

**We are not telling you what to conclude.** Rate it however you rate it, including badly. A
negative assessment honestly formed is more useful to us than a positive one we asked for.

---

## If something goes wrong

| What you see | What it means |
| --- | --- |
| `200` + `application/json` | Working. Parse it. |
| `200` + `text/html` | Route not active on this deployment. Say so; do not parse it. |
| `429` `demo_quota_exhausted` | Your IP hit 6 calls, or the instance hit 300. |
| `503` `upstream_not_configured` | Server-side upstream issue. Not your problem to fix. |
| `502` `upstream_error` | Upstream failed. Retry once, then report it. |

`GET /api/capabilities` reports `limits.demoPerIp: 6`. That is metadata about configuration,
not proof the route is reachable — but as of 2026-10-27 the route is reachable.

---

## After the call

If the result was useful:

1. **The argument** — [why-property.md](why-property.md)
2. **The protocols** — [protocols.md](protocols.md)
3. **The code** — https://github.com/ailn-ai/ailn — contribute a correction or a critique
   without asking permission first.

If it was not useful, the same links work, and the repository has an issue tracker.
