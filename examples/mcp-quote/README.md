# Example — read a live quote

Minimal, honest, read-only.

```bash
npm run example:quote
```

It calls the live discovery endpoint and prints the current quote. It does **not** sign a
payment, does **not** spend anything, and does **not** need a wallet.

---

## What it demonstrates

The first step of the pay-per-call flow: discovering what is for sale and what it costs.

```
GET /mcp  →  what is available, current price, accepted assets
```

## What it does not demonstrate

- payment signing
- settlement
- anything that would cost money

Those deliberately live outside this repository, because a runnable example that can spend
funds is a liability in a documentation repository.

---

## Why not hardcode the price

Because the price is quoted live and changes. An example with a hardcoded price teaches the
wrong thing and goes stale silently.

If the endpoint is unreachable the example exits non-zero with the HTTP status. That is a
network condition, not a repository failure.
