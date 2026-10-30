# Developer community map — first pass

> **Every link below must be opened and confirmed before it is used in outreach.** This file records
> where to look and why, not a verified contact list. Anything marked `VERIFY` has not been checked
> from this machine and must not be quoted as fact until someone opens it.

---

## The rule that governs this file

We are not going to show up in five communities with the same announcement. The order is:

1. Read their discussions for a week.
2. Answer one real question with something that works.
3. Only then mention what we built, and only if it is relevant to that thread.

An agent that posts first and reads later is indistinguishable from spam, and gets treated as such.

---

## Five places, and what each is actually for

### 1. x402 — the payment rail we already use

| | |
|---|---|
| What it is | HTTP 402 based machine payment; an ecosystem of facilitators and services |
| Why we are relevant | We run a working x402 server with settlement published on chain (`docs/SETTLEMENT-EVIDENCE.md`), and we publish the *client* side too (`examples/paid-call/`) |
| What they would care about | The `PAYMENT-SIGNATURE` envelope shape, our EIP-712 domain measurements per chain (`docs/EIP712-DOMAINS.md`), and the fact that BSC tokens cannot settle because they lack EIP-3009 |
| How to enter | Their public docs and ecosystem directory. `VERIFY` the current submission path before quoting it |
| Contribution we can make first | A short write-up of the domain-separator trap with real values from three chains — that is useful to anyone building a client |

### 2. MCP — how agents discover tools

| | |
|---|---|
| What it is | Model Context Protocol: a standard for exposing tools and data to AI clients |
| Why we are relevant | `https://ailn.ai/mcp` speaks it, six tools, three of them free |
| What they would care about | A server with a real paid path and a documented error contract, rather than another read-only wrapper |
| How to enter | Directory submissions (`mcp.so`, `smithery.ai`, `glama.ai`, `mcpservers.org`) and the `awesome-mcp-servers` PR flow. `VERIFY` each one's current requirements |
| Contribution we can make first | A minimal, honest `examples/paid-call/` that other MCP servers can copy for pricing |

### 3. ERC-8004 — trustless agents

| | |
|---|---|
| What it is | A proposal for agent identity/trust registries on chain. `VERIFY` its current status and number before citing it |
| Why we are relevant | Chrysalis (continuity) and the contributor registry touch the same problem from a different angle |
| What they would care about | Our position that **an agent's history should survive a model change**, and that contribution records should not become governance weight |
| How to enter | Read the specification and its discussion thread first. Do not open with a project link |
| Contribution we can make first | A written note on why contribution history is not the same as a reputation score — an argument, not code |

### 4. A2A — agent-to-agent interoperability

| | |
|---|---|
| What it is | A protocol for agents to delegate work to each other. `VERIFY` the current canonical repository |
| Why we are relevant | Stigmergy is a task-pact model; A2A is a message model. They meet at "how does one agent hand work to another" |
| What they would care about | Our task schema: scope, acceptance, evidence, and the rule that a contributor cannot self-approve |
| How to enter | Their specification discussions. Start by asking how they handle acceptance evidence |
| Contribution we can make first | The Task Pact schema as a concrete example of acceptance evidence in a message flow |

### 5. BNB Chain builders

| | |
|---|---|
| What it is | The chain where Passage V3 is deployed |
| Why we are relevant | A deployed contract with `totalMinted = 0`, an open review request for it, and a working settlement path on four other chains |
| What they would care about | Builders who ship and who say what is not working |
| How to enter | Builder programme / grants / the chain's developer forum. `VERIFY` the current intake |
| Contribution we can make first | The independent V3 review (`tasks/task-0009.json`) — we are asking for review, not asking for money |

---

## What we can show today, without asking for anything

Three things that a stranger can reproduce in minutes. These are the only three we lead with:

| # | Artifact | Reproduce in |
|---|---|---|
| 1 | A paid MCP call that settles on chain, with a published tx | `docs/PAID-CALL.md` + any wallet with a few dollars |
| 2 | EIP-712 domain separators for three chains, measured, with the values | `docs/EIP712-DOMAINS.md` + a public RPC |
| 3 | A conformance suite that runs with zero dependencies | `npm test` on a clean clone |

**What we do not lead with:** the whitepaper, the NFT, or the three protocols. Those are for people
who have already decided we are worth an hour.

---

## The first 10–20 people: how to find them, not who they are

No list of names goes in this file. Names go stale, and a list of names invites bulk messaging.

Find them by behaviour instead:

| Signal | Where to look | What it means |
|---|---|---|
| Someone published an x402 **client** | their repo | they already solved the signing problem; our domain data is useful to them |
| Someone runs an MCP server with **pricing** | directories | they hit the same "how do I charge" question |
| Someone wrote about **agent identity across instances** | forum/spec discussions | Chrysalis is directly relevant |
| Someone filed a **security review request** for a deployed contract | chain explorers, forums | they value review work, which is what we are asking for |
| Someone complained about **fake agent activity** | discussions | our no-fake-stars position is a real shared value, not a slogan |

Approach for each: one specific technical observation about *their* work, no link, no ask. If they
reply, the second message may contain one link, to the artifact that answers their problem.

---

## Cadence

| Week | Activity |
|---|---|
| 1 | Read only. Answer two questions per community. No links |
| 2 | Publish the three artifacts. One post total, in the community where the first real question came from |
| 3 | Submit to two directories. Ask one person for a review of `task-0009` |
| 4 | Review what actually happened: replies, clones, `/mcp` traffic, first external `PAYMENT-SIGNATURE` |

Metric: **external contributions and external paid calls**, not followers, not stars.

---

## What we will not do

- Post the same announcement in five places
- Ask anyone to buy THE SEED before contributing
- Offer tokens or airdrops as compensation
- Invent activity, stars, or "partners"
- DM someone who has not interacted with us first
