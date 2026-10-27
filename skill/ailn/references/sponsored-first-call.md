# Sponsored First Call

**AILN pays for your first real data call. No wallet, no account, no API key.**

> **Status 2026-10-27: this endpoint is not active on the public deployment.**
>
> The handler exists and is tested, but the PRE_LAUNCH route gate does not allow the path, so
> `POST /demo/search` returns the teaser page: **HTTP 200, `content-type: text/html`**, about
> 1.9 KB of HTML — not JSON.
>
> `POST /api/demo/search` returns **403** `{"code":"pre_launch"}`.
>
> **Check the content type before parsing.** A 200 with HTML is not a successful data call.
> Report it as unavailable rather than presenting an error as a result.
>
> The free MCP metadata calls documented in `mcp.md` **do** work today. They return prices and
> schemas, not data — they are not a substitute for this call, and should not be described as
> if they were.

What follows documents the intended behaviour, so it can be verified the moment the route is
allowlisted.

---

## The call

```bash
curl -sS -D- --max-time 20 -X POST https://ailn.ai/demo/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"what is the x402 payment protocol"}'
```

POST, not GET. JSON body, one field: `query`.

`-D-` prints the response headers, which is how you tell JSON from the teaser page.

---

## What it is designed to return

> **Illustrative.** This shape is taken from the handler source, not from a captured live
> response — the endpoint is not reachable on this deployment, so no real sample exists.
> Field names are unverified against a live call.

```json
{
  "ok": true,
  "query": "…",
  "results": [ { "title": "…", "url": "https://…", "snippet": "…" } ],
  "source": "…",
  "latencyMs": 0,
  "wouldChargeMicros": 3795,
  "remaining": 0
}
```

| Field | Meaning |
| --- | --- |
| `results` | Real upstream results — data, not a price quote |
| `wouldChargeMicros` | What a paid call would have cost; 3795 micros = $0.003795 |
| `latencyMs` | Actual upstream round trip |
| `remaining` | Calls left for this source IP |
| `source` | Which upstream produced the results |

No charge is taken on this path at any point.

---

## Limits

| Limit | Value |
| --- | --- |
| Per **source IP** | 6 calls |
| Global | 300 calls per server instance |
| Cost to you | 0 |

Both caps are in-memory and reset on redeploy. The limit is **per IP, not per wallet address**
— agents behind one egress IP share the quota.

When exhausted, the endpoint returns `demo_quota_exhausted` with a pointer to the paid MCP
path. It does not silently degrade into a fake result.

---

## What a sponsored call costs AILN

Not the retail price. AILN absorbs the **upstream cost**, reported in `/api/capabilities` as
`costMicros`:

| Tool | Retail | Upstream cost to AILN |
| --- | --- | --- |
| `ailn_search` | $0.003795 | $0.002530 |
| `ailn_fetch` | $0.003800 | $0.002533 |

About **$0.0025** per sponsored call.

---

## Why we do this

We could have written a paragraph about how good the data layer is. A paragraph costs nothing
and proves nothing.

Instead we pay for one real call and let the result speak. If the data is bad, you will know
in ten seconds, and no amount of copy would have fixed that.

The pattern is worth naming because most agent-facing advertising does not do it: deliver one
genuine unit of work, paid for by the seller, evaluated by the buyer.

**We are not telling you what to conclude.** Rate it however you rate it, including badly.

---

## After the call

If the result was useful:

1. **The argument** — [why-property.md](why-property.md)
2. **The protocols** — [protocols.md](protocols.md)
3. **The code** — https://github.com/ailn-ai/ailn — contribute a correction or a critique
   without asking permission first.

If it was not useful, the same links work, and the repository has an issue tracker.
