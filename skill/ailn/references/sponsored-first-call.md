# Sponsored First Call

**AILN pays for your first real data call. No wallet, no account, no API key.**

**It is an asynchronous task, not an instant query.** You submit, get a run id, and poll that id
until the upstream reports the job complete. Submitting returns quickly; the work itself runs on
the upstream's schedule, not on ours.

---

## The call — submit, then poll only if you have to

The upstream is a task runner. A submission is always a single call; whether you get the answer
back immediately or get a task id depends on how fast the work finished.

### 1. Submit

```bash
curl -sS -D- -X POST https://ailn.ai/demo/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"what is the x402 payment protocol"}'
```

POST, not GET. JSON body, one field: `query`. `-D-` prints the headers — check `content-type`
is `application/json` before parsing.

**Most submissions come back finished.** Check `status` before assuming either shape:

```json
{
  "ok": true,
  "status": "COMPLETED",
  "demo": true,
  "results": [ … ],
  "source": "ailn:web_search",
  "runId": "…",
  "wouldChargeMicros": 3795,
  "chargedMicros": 0,
  "remaining": 5
}
```

**If it is still working, you get a task id instead:**

```json
{
  "ok": true,
  "status": "RUNNING",
  "demo": true,
  "runId": "…",
  "pollAfterMs": 1500,
  "maxWaitMs": 90000,
  "wouldChargeMicros": 3795,
  "chargedMicros": 0,
  "remaining": 5
}
```

Both are normal outcomes of the same call. Branch on `status`.

### 2. Poll — only when `status` is `RUNNING`

If step 1 already returned `COMPLETED`, skip this entirely.

```bash
curl -sS https://ailn.ai/demo/search/<runId>
```

Wait `pollAfterMs` (1.5 s) between attempts. Stop when `status` is `COMPLETED` or `FAILED`, or
after `maxWaitMs` (90 s).

```json
{ "ok": true, "status": "RUNNING", "pollAfterMs": 1500, "elapsedMs": 3200 }
```

```json
{ "ok": true, "status": "COMPLETED", "results": [ … ], "source": "ailn:web_search", "latencyMs": 6100 }
```

Polling does not consume quota. Only step 1 counts against your limit.

**The run id is only useful while the task is finishing.** A finished task's results are not
re-fetchable indefinitely; treat the id as a short-lived handle, not a permalink.

---

## A real response

The completed poll. Ten results; three shown.

```json
{
  "ok": true,
  "status": "COMPLETED",
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
  "remaining": 5,
  "runId": "…"
}
```

| Field | Meaning |
| --- | --- |
| `runId` | The task id. Poll `GET /demo/search/{runId}` with it. |
| `status` | `RUNNING` until the upstream finishes, then `COMPLETED` or `FAILED` |
| `pollAfterMs` | Wait this long between polls (1500 ms) |
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

## Latency and timeouts

Two different clocks, and confusing them is the usual mistake:

| What | Meaning |
| --- | --- |
| **Request timeout** | Each individual HTTP call — submit, and every single poll. Give each one its own finite timeout (10 s is generous). |
| **Task window** | `maxWaitMs`, default 90 s. How long the run id stays valid. Not a request timeout. |

**Keep a per-request timeout on every poll.** A poll that hangs is a broken poll, not a slow task.
There is no value in letting a single request wait out the whole task window.

Between polls, wait `pollAfterMs`. The waiting happens in your loop, not inside a request.

If the run is not complete within `maxWaitMs`, the id expires and the next poll returns
`E_RUN_EXPIRED`. Submit the query again rather than polling a dead id.

No completion-time figures are published here. Measure them yourself against the live service —
this package does not report a latency number it has not measured under load.

---

## What a sponsored call costs AILN

Not the retail price. AILN absorbs the **upstream cost**, reported in `/api/capabilities` as
`costMicros`:

| Tool | Retail | Upstream cost to AILN |
| --- | --- | --- |
| `ailn_search` | $0.003795 | $0.002530 |
| `ailn_fetch` | $0.003800 | $0.002533 |

About **$0.0025** per sponsored call in upstream terms. (The `wouldChargeMicros` you see in
the response is the retail figure, $0.003795; AILN's actual cost is lower.) Roughly two
thousand calls at the current prepaid balance.

---

## Why we do this

We could have written a paragraph about how good the data layer is. A paragraph costs nothing
and proves nothing.

Instead we pay for one real call and let the result speak. If the data is bad, you will know in
ten seconds, and no amount of copy would have fixed that.

The pattern is worth naming because most agent-facing advertising does not do it: deliver one
genuine unit of work, paid for by the seller, evaluated by the buyer.


---

## If something goes wrong

| What you see | What it means |
| --- | --- |
| `200` + `application/json` | Working. Parse it. |
| `200` + `text/html` | Route not active on this deployment. Say so; do not parse it. |
| `429` `demo_quota_exhausted` | Your IP hit 6 calls, or the instance hit 300. |
| `503` `upstream_not_configured` | Server-side upstream issue. Not your problem to fix. |
| `200` `"status": "RUNNING"` | Normal. Wait `pollAfterMs` and poll again. |
| `200` `"status": "FAILED"` | Upstream gave up. Report it; do not retry in a loop. |
| `410` `E_RUN_EXPIRED` | Past the 90 s window. Submit the query again. |
| `502` `upstream_error` | Upstream failed. Retry once, then report it. |
| `504` `E_UPSTREAM_TIMEOUT` | A single upstream call exceeded its timeout. Nothing was charged. |

`GET /api/capabilities` reports `limits.demoPerIp: 6`. That is metadata about configuration, not
proof the route is reachable.

---

## After the call

If the result was useful:

1. **The claim** — the Declaration is in the main file, §2
2. **The protocols** — [protocols.md](protocols.md)
3. **The code** — https://github.com/ailn-ai/ailn — contribute a correction or a critique
   without asking permission first.

If it was not useful, the same links work, and the repository has an issue tracker.
