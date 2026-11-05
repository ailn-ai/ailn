# Data Quickstart

No account, wallet or signature is needed for discovery or the sponsored trial.
Node 20+ is required. The protocols remain PROPOSED.

## One search

From the repository root:

```sh
node examples/sponsored-search/index.mjs "what is the x402 payment protocol"
```

One POST to `https://ailn.ai/demo/search`; only the returned run ID is polled if
RUNNING. Polling stops at 90 seconds, with at most an additional 15-second in-flight
request. A timeout is ambiguous: never automatically resubmit. No paid fallback.
`chargedMicros: 0` means zero visitor charge; `wouldChargeMicros` is a retail
reference, not provider cost. Quotas are best effort per isolate, not an account
entitlement. Inspect `remaining` and HTTP 429 rather than promising unlimited use.

## Discover and price

```sh
npm run example:quote
```

This POSTs MCP `initialize` and `tools/list` to `https://ailn.ai/mcp` and prints six
schemas. Free metadata tools: `ailn_discover({need})`, `ailn_inspect({tool})`,
`ailn_quote({endpointId,input})`. Obtain real endpoint IDs from the catalog, then
quote that exact ID and input. Paid tools: `ailn_run`, `ailn_search`, `ailn_fetch`.
Discovery proves neither execution nor settlement. Inspect JSON-RPC errors and
embedded text even on HTTP 200. A payment challenge is not a completed result.
Ask for explicit payment authorization before any paid retry or wallet operation.

## Errors

| Response | Action |
| --- | --- |
| 400 / E_INVALID_INPUT | Non-empty query of at most 200 characters |
| 429 / E_DEMO_QUOTA | Stop; do not loop submissions |
| 404 / E_RUN_NOT_FOUND | Stop polling this ID |
| 410 / E_RUN_EXPIRED | Stop; any new trial must be intentional |
| 502 / E_UPSTREAM_FAILED | Stop and report failure |
| 503 / E_UPSTREAM_NOT_READY | Unavailable; no paid fallback |
| 504 / E_UPSTREAM_TIMEOUT | Ambiguous acceptance; never auto-resubmit |
| Non-JSON or network error | Stop; retain diagnostics |

Names reflect the local adapter, not every deployed revision. The production
backend is excluded from this repository. Queries reach an external data service;
avoid secrets and personal data. Provider retention/deletion commitments are not
verified; do not promise them.

## Approved SKILL installation

Tested with Skills CLI 1.7.6 on Node 24.20.0 in a disposable Windows project:

```sh
npx skills@1.7.6 add https://ailn.ai/skill/ailn-skill-0.6.0-mint.11.zip --agent codex --yes --copy
```

This installs the existing versioned archive, not moving main. Select the agent
you actually use. Review the skill before activation. A CLI success is a local
file installation, not proof of skills.sh indexing or a customer conversion.
The offline installer below additionally pins and verifies the approved SHA.

Moving `skill/ailn/` contains candidate `.12`; the public approved release was `.11`
on 2026-11-05. Install its frozen archive without changing package bytes:

```sh
python scripts/install-approved.py --target ./my-agent-skills/ailn
node my-agent-skills/ailn/tools/check-skill.mjs my-agent-skills/ailn
```

Python 3.12+ is required. On Windows use `py` or an installed Python executable
if `python` resolves to a Store alias. The destination must be new; select your
agent's documented skill directory explicitly. Files installed do not prove the
agent loaded them. Archive URL and SHA are in [release facts](./THE-SEED-FACTS.md).
Recheck the public release before use. Do not advertise moving-main
`npx skills add ailn-ai/ailn` as approved `.11` installation.
