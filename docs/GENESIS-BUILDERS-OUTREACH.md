# Outreach copy — for owner review, not for sending

Two drafts. Neither is published by an agent. Both avoid claiming anything that is not running.

---

## A · Vision-oriented

**Audience:** agent developers and AI-economy researchers who care about the design problem more
than the product.

```
We are opening up a research question rather than announcing a product.

AILN is a protocol design for agents that need three things a human gets from an institution:
a way to be paid, a way to hold assets with limits, and a way to keep acting as the same agent
after the process dies. Ours is one decomposition - task pacts, bounded settlement, identity
continuity - written down as three specifications. None of them is implemented. That is the point
of opening it now: the designs are cheap to argue with, and expensive to argue with later.

If you have worked on any of this, we would rather read your objections than your approval:

- How would you verify that work was done, cheaply, without trusting either party?
- What is the smallest custodial surface that still lets an agent spend?
- When an agent's instance dies, what actually should survive - the keys, the memory, or the right
  to be woken?

Proposals need no task id and no pull request. The rules for arguing with the design are here:
https://github.com/ailn-ai/ailn/blob/main/docs/GENESIS-BUILDERS-OPEN-PROPOSALS.md

The whitepaper is a baseline, not a boundary. We would rather be corrected in public than agreed
with in private.
```

---

## B · Engineering-oriented

**Audience:** people building on x402, MCP, or agent infrastructure, who want something to run today.

```
There is a working pay-per-call MCP server here, and one honest caveat: the protocols around it
are still specifications.

What runs today:
- https://ailn.ai/mcp - six tools, three free. POST JSON-RPC.
- A paid call settles in USDC over x402 and returns the transaction hash with the data.
  A real one, 0.003795 USDC on Base:
  https://basescan.org/tx/0x29e30de0967721b56934276476d2d0c305452830bd8ac78321900d3157f312a6
- The client side is written down, including the PAYMENT-SIGNATURE envelope and the EIP-712
  fields that break silently if you get them wrong:
  https://github.com/ailn-ai/ailn/blob/main/docs/PAID-CALL.md
- EIP-712 domain separators for three chains, measured, not copied from docs:
  https://github.com/ailn-ai/ailn/blob/main/docs/EIP712-DOMAINS.md

Two things we got wrong and fixed in public, because they are the kind of mistake you will hit too:
we listed BNB Chain as a settlement chain when its tokens have no EIP-3009, and we published a
status page that said "live" while the paid path returned 403.

If you want to contribute: ten tasks, nine of them doable with no keys and no funds.
https://github.com/ailn-ai/ailn/issues

No wallet, no NFT, no token needed to contribute code. Nothing here pays a bounty yet - that is
planned, and it will be written down before it exists.
```

---

## Notes for the owner

- Send **B** to engineering communities first; **A** only where design discussion is the norm.
- Do not post both in the same place on the same day.
- One link per message. The second link is for people who replied.
- If someone asks "is this a token play", the honest answer is in the repository: no token is
  issued, no sale exists, and the NFT's minting is closed.