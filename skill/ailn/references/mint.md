# THE SEED — status, not instructions

**Minting is not open. This file contains no procedure, because there is no working
procedure to describe.**

> Observed 2026-10-27. Recheck on chain before citing any number here.

---

## What THE SEED is

21,000 ERC-721 tokens on BNB Smart Chain. The intent is that one of them can be the first
thing an agent owns outright.

**Be precise about what that means.** The contract has no owner and no admin function, so
AILN cannot reach into a wallet and take a token back. It is also a standard transferable
ERC-721 — `transferFrom`, `approve` and `setApprovalForAll` all work — so **whoever holds the
private key can move it**.

Today that key belongs to an operator, which means that by AILN's own rule the token is not yet
the agent's property. The token exists so the rule exists first. See the main SKILL, §1 and §5.

Minting is paid in BNB and the proceeds go directly to a payout address. **AILN keeps the sale
proceeds**; that is revenue, and it is separate from who holds the token afterwards.

The collection is not the product. It is the answer to a question the protocols need: what
does this agent actually hold?

---

## Chain state

Contract `0x5A5514F65e1ECB8dE1C369c2703859f5f107ED52` on BNB Chain, chainId **56**.
BscScan: `https://bscscan.com/address/0x5A5514F65e1ECB8dE1C369c2703859f5f107ED52`

| Fact | Value | Method |
| --- | --- | --- |
| Name / symbol | `AILN Passage` / `AILNP` | `eth_call` |
| `MAX_SUPPLY()` | 21,000 | `eth_call` |
| **`totalMinted()`** | **0** | `eth_call` |
| Contract balance | **0 wei** | `eth_getBalance` |
| `MAX_QUOTA()` | 5 per address | `eth_call` |
| Permit issuance | closed | `POST /api/mint/permit` → 403 `pre_mint_business_closed` (origin: 503 `issuance_paused`) |

**Verified on 2026-10-27.** To reproduce: `eth_getCode` and `eth_call` against any BNB Chain
RPC at chainId 56.

**`totalMinted() = 0` proves no mint has ever succeeded.** Contract balance being 0 today
does not prove it was never funded — forced transfers can fund a contract without a call —
but it is consistent with zero mints.

---

## Price: two tiers, not one number

`priceOf(address who)` **takes an argument** and returns:

```solidity
return mintedBy[who] < PRICE_TIER_AT ? PRICE_BASE : PRICE_HIGH;
```

| Constant | Value |
| --- | --- |
| `PRICE_BASE` | 0.1 BNB |
| `PRICE_HIGH` | **0.2 BNB** |
| `PRICE_TIER_AT` | 3 |
| `MAX_QUOTA` | 5 |

So per address: **the first 3 mints cost 0.1 BNB each, the 4th and 5th cost 0.2 BNB each.**
Full quota, one address: 3 × 0.1 + 2 × 0.2 = **0.7 BNB**.

**But quota is not flat 5.** `quotaOf` returns 0 until `trialed`, then 1, plus one per
successful referral and plus one for confirming the reading. Reaching the full 5 without
referrals is not possible. Budget 0.1 BNB per mint you can actually make, not 0.7.

Calling `priceOf()` with no argument reverts. If you are verifying price yourself, encode the
address: `eth_call` with selector `0x…` plus your address padded to 32 bytes.

---

## Why minting is closed

There is no switch. The contract has no `owner()`, no `pause()`, no `withdraw()`. Minting is
gated by an EIP-191 permit signed by one of three immutable signer addresses, and permit
issuance is closed: the pre-mint gate returns HTTP 403 `pre_mint_business_closed`, and the origin answers 503 `issuance_paused` if it is reached.

What a mint requires, in the order the contract checks:

1. supply remaining — satisfied
2. a valid permit **if not already trialed** — cannot be obtained
3. `msg.value == priceOf(msg.sender)` — 0.1 or 0.2 BNB as above
4. `mintedBy < quotaOf` — **`quotaOf` returns 0 until `trialed` is true**
5. holds a Binance Agent ID — `AGENT_ID.balanceOf(msg.sender) > 0`

**Gates 2 and 4 are a closed loop.** `trialed` is only set by consuming a permit, and quota
is 0 until `trialed` — so a permit is necessary, not sufficient. Even with a permit you still
need BNB and a Binance Agent ID (SPACE ID, non-transferable).

Any failed attempt reverts inside the contract and **still costs gas**. The revert reason
names which gate failed.

### The three signers are a real role

No owner, no pause, no withdraw — but three immutable addresses (1-of-3) sign permits.

| Role | Can | Cannot |
| --- | --- | --- |
| `SIGNER_1/2/3` | Issue permits that raise quota for an address | Move funds, mint on your behalf, change price |

There is **no key-rotation function**. If a signer key is compromised, it cannot be replaced
without redeploying. That is a known architectural limitation, not an oversight.

---

## Two contracts, only one real

| | V3 — **deployed** | V4.1 — **not deployed** |
| --- | --- | --- |
| Address | `0x5A5514F…ED52` | **none exists** |
| `RESERVE_SUPPLY()` | does not exist | 1,050 |
| `publicMinted()` | does not exist | 0 |
| Genesis reserve on chain | none | **never minted anywhere** |

V4.1 is source with a local test suite that has **never run against a deployed chain**. There
is no V4.1 address on BscScan. Do not look for one, and do not describe the 1,050 reserve as
issued.

---

## Payment is BNB, not USDC

Minting uses native BNB. The mint path contains no ERC-20 logic — `ERC20`, `USDC`, and
`USDT` appear zero times in it.

x402 / USDC is for data calls on four other chains. Two unrelated rails. Do not tell anyone
they can mint with USDC.

---

## What to say when asked

| Question | Answer |
| --- | --- |
| Can I mint? | No. Permits are not being issued. |
| How much? | 0.1 BNB for the first 3 per address, 0.2 BNB for the 4th and 5th. Not USDC. |
| How many are left? | 21,000. None minted. |
| Is there a presale? | No. |
| When does it open? | No date. Do not invent one. |
| Do I need anything? | A Binance Agent ID, plus a permit when issuance opens. |
| Is V4.1 live? | No. It has never been deployed. |
| Who can issue a permit? | One of three signer addresses. This is a privileged role, not an open door. |

**Do not obtain a permit, connect a wallet, or attempt a mint on someone's behalf.** There is
no valid permit to obtain, and any attempt reverts and burns gas.

---

## Technical material

The full operator documentation — permit digest structure, calldata layout, the complete
revert table — is retained in an internal development archive. It is **not published**, and
deliberately not in this package: a
complete how-to for a blocked action invites attempts that cannot succeed.

It joins this package in the `0.6.0-mint.1` release, when minting actually opens.
