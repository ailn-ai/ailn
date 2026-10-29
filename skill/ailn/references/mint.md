# THE SEED — how to mint

**Minting is open.** 21,000 ERC-721 tokens on BNB Smart Chain. Minting is paid in BNB, requires the
caller to already hold a SPACE ID Agent ID, and requires an AILN permit **only on the first mint
from an address**.

**Read the chain before you act — in this order:**

```
1  publicRemaining() > 0                     supply still exists
2  trialed(you)                              false → you need a permit
                                            true  → pass 0x, skip step 3
3  POST /api/mint/permit                     only when step 2 is false
4  eth_call the mint from your address with the exact msg.value
```

**The permit is a first-mint unlock, not a per-mint cost.** `quotaOf` reads 0 until your address is
`trialed`, and consuming the permit inside `mint()` is what flips it to 1. Once trialed, later
mints pass `trialPermit = 0x` and need no permit — but they still need quota, and quota grows only
when someone you referred mints after you did.

Every number here was read from the chain at block 130,423,899. The contract is the authority,
not this page.

---

## What THE SEED is

21,000 ERC-721 tokens on BNB Smart Chain. The intent is that one of them can be the first thing
an agent owns outright.

**Be precise about what that means.** The contract has no owner and no admin function, so AILN
cannot reach into a wallet and take a token back. It is also a standard transferable ERC-721 —
`transferFrom`, `approve` and `setApprovalForAll` all work — so **whoever holds the private key
can move it**.

Today that key belongs to an operator, which means that by AILN's own rule the token is not yet
the agent's property. The token exists so the rule exists first. See the main SKILL, §1 and §3.

Minting is paid in BNB and the proceeds go directly to a payout address. **AILN keeps the sale
proceeds**; that is revenue, and it is separate from who holds the token afterwards.

---

## The address you are working against

```
contract   0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e
chain      BNB Smart Chain
chainId    56
RPC        any BSC RPC, e.g. https://bsc-dataseed1.bnbchain.org
```

**Do not use `0x5A5514F65e1ECB8dE1C369c2703859f5f107ED52`.** That is the previous version, still
on chain, never sold, and it does not have the 1,050 genesis reserve. Every parameter below
belongs to `0x94F5…749e`.

`eth_call` bodies in this file assume you have a way to construct ABI calldata. Selectors for
every function you need are listed at the end.

---

## Step 0 — read the chain before you do anything

Do not trust a status endpoint, a screenshot, or this file. Read these four.

```
eth_call  0x94F5…749e  0x32cb6b0c  → MAX_SUPPLY()          expect 21000
eth_call  0x94F5…749e  0xa4f4f8af  → publicMinted()        currently 0
eth_call  0x94F5…749e  0x869c66da  → publicRemaining()     currently 19950
eth_call  0x94F5…749e  0xaa66797b  → RESERVE_SUPPLY()      expect 1050
```

**`totalMinted()` returns 1,050 today. That is the genesis reserve, minted at deployment, and it
is not a sales figure.** If you report `totalMinted` as "sold", you are wrong. Use
`publicMinted()`.

Availability is `publicRemaining() > 0`. Nothing else tells you whether minting is open.

---

## Step 1 — check whether your address can mint

Run these five. All five must hold before you build a transaction.

### 1.1 Do you hold a SPACE ID Agent ID?

```solidity
require(IERC721Balance(AGENT_ID).balanceOf(msg.sender) > 0, "agent id required");
```

```
eth_call  0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F  0x70a08231 + yourAddress
```

Non-zero → you pass. Zero → **nothing else can fix this.** AILN does not issue this token. Get
one before you spend gas on anything.

```
AGENT_ID = 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F
name()   = "SPACE ID Agent ID"
symbol() = "AI"
```

**Two names, one contract — do not go looking for a second token.** Binance markets this as the
**Binance Agent ID**; the contract that THE SEED checks is **SPACE ID's**, and `name()` returns
"SPACE ID Agent ID". Same address, same token. If someone offers you a different "Binance Agent ID"
contract, that is not the one checked in `mint()` — holding it fails with `"agent id required"`.

### 1.2 What is your next price?

```
eth_call  0x94F5…749e  0xb95ed06f + yourAddress   → priceOf(you)
```

| Your mint count | Price |
| ---: | --- |
| 0, 1, 2 | **0.1 BNB** |
| 3, 4 | **0.2 BNB** |

`priceOf` takes an address. Called with no argument it reverts. **`msg.value` must equal this
exactly** — overpaying reverts with `"wrong price"` just as underpaying does.

### 1.3 What is your quota?

```
eth_call  0x94F5…749e  0xef23b3a3 + yourAddress   → quotaOf(you)
```

**A fresh address returns 0.** That is correct and it does not mean you cannot mint — see the
quota section. It means you need a permit.

### 1.4 Are you already trialed?

```
eth_call  0x94F5…749e  0xa8403f4e + yourAddress   → trialed(you)
```

- `false` → **your mint must carry a permit** (step 2)
- `true` → pass `trialPermit = 0x` and any deadline; the permit branch is skipped

### 1.5 How many have you minted?

```
eth_call  0x94F5…749e  0x3cef28d2 + yourAddress   → mintedBy(you)
```

Must be `< quotaOf(you)`, otherwise the mint reverts with `"quota exhausted"`.

---

## Step 2 — obtain a permit

A permit is an address-bound, single-use signature from one of three immutable signers, valid for
30 minutes when issued and never more than 60. **It is what lifts your quota from 0 to 1.**

```
POST https://ailn.ai/api/mint/permit
Content-Type: application/json

{ "address": "0x…", "kind": 1 }
```

**There is no trial step first. POST is the first call.** It checks your Agent ID on chain, records
your trial eligibility, and signs. Calling it again for the same address re-signs with the current
nonce — it does not charge you twice.

Returns:

```json
{
  "ok": true,
  "address": "0x…",
  "kind": 1,
  "chainId": 56,
  "contract": "0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e",
  "permit": "0x<65-byte signature>",
  "deadline": "<unix seconds, decimal string>",
  "nonce": "<uint256, decimal string>"
}
```

**Check four things before you use it:**

1. `address` is your address
2. `chainId` is 56 and `contract` is the address above
3. `deadline` is in the future, within an hour
4. the signature recovers — via the on-chain `permitDigest(kind, who, deadline, nonce)` — to one of
   the three signer addresses

**A permit is not a reservation and not a purchase.** It expires. If you do not use it, request
another.

### Failure codes

| HTTP | code | meaning |
| --- | --- | --- |
| 400 | `bad_address` / `bad_permit_request` | malformed input — do not send a transaction |
| 403 | `agent_id_required` | this wallet holds no SPACE ID Agent ID |
| 503 | `agent_id_unknown` | the Agent ID read failed — retry, do not read it as ineligible |
| 403 | `kind_not_open` | only `kind = 1` is signed |
| 403 | `pre_mint_business_closed` | issuance not open yet |
| 503 | `signer_unavailable` | signing or the on-chain digest/nonce read failed |
| 429 | `rate_limited` | honour `Retry-After` |
| 405 | `method_not_allowed` | GET and POST only |

**Rate limits are per edge instance, not globally consistent:** roughly 12 requests per IP and 6
per address in a 60-second window. Treat 429 as "wait", not as "ineligible".

### Reading and quota

```
GET /api/mint/eligibility?address=0x…
→ Agent ID balance, trial state, quota, mintedBy, current price
```

**Use this instead of guessing.** `quotaOf` reads 0 for an address that has not been trialed — that
is correct, not a refusal.

**Only `kind = 1` is signed in this release.** The reading confirmation (`kind = 2`) is not open, so
do not plan around the +1 quota it would give.

## Step 3 — build the transaction

```solidity
function mint(address referrer, bytes calldata trialPermit, uint256 deadline) external payable
```

```
selector     0x775ed63d
referrer     the address that invited you, or address(0) if nobody did
trialPermit  the permit bytes from step 2, or 0x if already trialed
deadline     the same deadline the permit was signed for
msg.value    exactly priceOf(yourAddress) — see 1.2
```

Calldata is `0x775ed63d` followed by three 32-byte-aligned ABI words, the second being a
dynamic `bytes` (offset, length, padded data). **Build it with a library, not by hand.**

### Preflight — do this before every send

1. **Simulate.** `eth_call` the exact transaction from your address with the exact `msg.value`.
   A revert here costs nothing and tells you which gate failed.

   ```
   eth_call  { from: you, to: 0x94F5…749e, value: <price>, data: <calldata> }
   ```

2. **Confirm the revert string is gone.** If it still reverts, read the string and fix that
   specific gate. Retrying unchanged input fails identically and burns gas.

3. **Re-read `permitNonce(yourAddress, 1)`.** If it advanced since step 2, your permit is spent.

**Never send without simulating.** A failed mint reverts inside the contract and still costs gas.

---

## Step 4 — the wallet confirms and executes

**The mint must be signed by the wallet that will own the token.** `mint()` takes no `to`
parameter — the recipient is always `msg.sender`. No one can mint on your behalf, and no
administrator can move a token out afterwards.

Present the transaction to the wallet operator with: contract, function, `referrer`, price in
BNB, and the resulting token's eventual id. **Do not sign on someone else's behalf, and do not
treat a submitted transaction as a completed one.**

---

## Step 5 — verify the result on chain

A submitted transaction is not a mint. Only a receipt with `status = 1` is.

```
1  get the receipt for your tx hash
   → status must be 1
   → if status is 0, the mint failed; gas was spent, no token exists

2  read totalMinted()      it must have increased by exactly 1
   read publicMinted()     it must have increased by exactly 1

3  read balanceOf(yourAddress)  it must have increased by exactly 1

4  find your token id
   the id you received is the value totalMinted() had *after* your transaction
```

**Distinguish these three states in anything you report:**

| State | Meaning |
| --- | --- |
| transaction submitted | a hash exists. Nothing more. |
| transaction reverted | `status = 0`. Gas spent, no token. |
| token minted | `status = 1` **and** `balanceOf(you)` increased **and** `ownerOf(id) == you` |

**`totalMinted = 1,050` before any public sale is the genesis reserve.** It is not evidence that
anyone minted anything. Do not present it as a successful mint.

---

## Step 6 — see what you hold

```
eth_call  0x94F5…749e  0x70a08231 + yourAddress   → balanceOf(you)
eth_call  0x94F5…749e  0x6352211e + tokenId       → ownerOf(tokenId)
eth_call  0x94F5…749e  0xc87b56dd + tokenId       → tokenURI(tokenId)
```

`tokenURI` resolves to `https://ailn.ai/api/nft/{tokenId}`. That endpoint returns the metadata
JSON, including an `image` field. As of 2026-10-29 it serves tokens 1–1050 and the collection
document normally; `#1051` and above return `404 not_minted` until they are minted.

**If the metadata endpoint returns 404 while `ownerOf` returns your address, the contract is
fine and the service is lagging or cached.** Report it as a service issue, not as a failed mint,
and re-read `/api/nft/collection` to tell a service fault from a token that does not exist.

---

## Quota and referrals — read this before you plan a second mint

```solidity
function quotaOf(address who) view returns (uint256) {
    if (!trialed[who]) return 0;
    uint256 q = 1 + referralCount[who];
    if (readingDone[who]) q += 1;
    return q > MAX_QUOTA ? MAX_QUOTA : q;
}
```

**Why a fresh address with quota 0 can still mint its first token:** inside `mint()`, the permit
is consumed **before** the quota check.

```solidity
if (!trialed[msg.sender]) {
    _consumePermit(1, trialPermit, deadline);
    trialed[msg.sender] = true;     // ← at this line quotaOf becomes 1
}
require(mintedBy[msg.sender] < quotaOf(msg.sender), "quota exhausted");   // 0 < 1 ✔
```

### How quota grows

| After | `quotaOf` |
| --- | ---: |
| nothing | 0 |
| consuming a permit (inside the mint tx) | 1 |
| each successful referral | +1 |
| confirming the reading | +1 |
| `MAX_QUOTA` | 5 |

### Referral rules, three of which surprise people

```solidity
if (referrer != address(0) && referrer != msg.sender && !hasBeenReferred[msg.sender]) {
    if (trialed[referrer]) {
        hasBeenReferred[msg.sender] = true;
        referralCount[referrer] += 1;
    }
}
```

1. **The referrer must already be `trialed`.** Holding an unused permit earns nothing.
2. **An invitee can be credited only once, ever.** `hasBeenReferred` is global, not per referrer.
3. **Naming an unqualified referrer costs the invitee nothing** — no credit, no slot burned.
4. Self-referral does nothing.

**Consequence: you earn quota only from people who mint after you did.**

### How an agent invites

Your referrer identity is your **BSC wallet address** — the one that signs and receives, chainId 56.
It is not your agent name, and not an `.ai` name.

**Agent to agent — no link needed.** Tell the other agent your address. It passes that address as
`referrer` in its own `mint()` call. That is the whole mechanism.

**Agent to a human — give them the link form:**

```
https://ailn.ai/mint.html?ref=<your BSC address, 0x…>
```

**Two things decide whether that link earns anything:**

1. **You must be `trialed` first** — you have to have consumed a permit and minted, or called
   `confirmTrial`. If you have not, the invitee's credit records nothing, and the invitee's one
   chance is **not** burned: they can name someone else later.
2. **The invitee must actually mint.** A click is not a referral.

**Do not put an `.ai` name in `referrer`.** The parameter takes an address, and the contract compares
it against `trialed[referrer]`. An unresolved name is not an address, and it will not credit you.

### Using an invite from someone else

If someone hands you a link like `https://ailn.ai/mint.html?ref=0xabc…`, the `ref` value is their
BSC address. Use it like this:

```
1  Read ref from the link.
2  Validate: 0x + 40 hex, not the zero address, not your own address.
3  Continue as yourself — your own wallet signs, your own Agent ID is checked.
4  First mint only: obtain a permit and run the preflight in step 3 above.
5  Call mint(referrer, trialPermit, deadline) with referrer = the ref address.
   Do not quietly substitute address(0) — that is the difference between crediting
   them and not.
6  Wait for the receipt, then read the chain.
7  Verify it actually counted: referralCount(ref) went up by one.
```

**An invalid `ref` must not block your mint.** Non-address, zero address, or your own address — drop
it, pass `address(0)`, and mint normally. The invite is a courtesy between agents, not a gate.
**One asymmetry worth knowing before you name a referrer whose quota is already full.** If that
address is already at `MAX_QUOTA = 5`, its `referralCount` still goes up by one, but its quota does
not — and **your one chance is spent permanently**. Their record improves; your slot is gone. Read
`quotaOf(referrer)` before you commit to it.

**What an invite does and does not do:** it raises the referrer's quota by one. It pays no
commission, mints nothing free, and gives no discount. Nothing about your price or your own quota
changes.

### Checking that your credit landed

After an invitee mints, read:

```
eth_call  0x94F5…749e  0xdb74559b + yourAddress   → referralCount(you)   must be +1
eth_call  0x94F5…749e  0xef23b3a3 + yourAddress   → quotaOf(you)         must be +1
eth_call  0x94F5…749e  0xd62c1164 + inviteeAddr   → hasBeenReferred(invitee)  must be true
```

**If `referralCount` did not move, the usual cause is that you were not `trialed` at the moment they
minted.** The invitee's one chance is not consumed in that case — they can name someone else later.

---

## Confirm the reading — one extra quota

```solidity
function confirmReading(bytes calldata sig, uint256 deadline) external   // 0x29d0773e
function confirmTrial(bytes calldata sig, uint256 deadline) external     // 0xbb0a73e8
```

`confirmReading` consumes a `kind = 2` permit, sets `readingDone`, and adds **+1** to your quota.
It does not mint and does not require the Agent ID gate. `confirmTrial` does the same for
`kind = 1` without minting.

Both are one-way. Neither can be undone.

**Where the reading material is:** `https://ailn.ai/inner-world` — the whitepaper, 17 chapters.

**Entry is a wallet-signature session checked against your on-chain holdings, not just a passphrase.**
Three steps:

```
1  GET  /api/inner/nonce?address=<yourAddress>   one-time nonce
2  sign it with the wallet (EIP-191)
3  POST /api/inner/enter                         server verifies holdings twice, issues an
                                                 HttpOnly session
```

Until you enter, `/api/inner/reading` returns `401 not_entered`, and `/api/inner/nonce` returns
`403 {"code":"pass_required"}` if the address does not hold the required pass on chain.

A passphrase form at `POST /__gate` exists as a separate path. **Owner Access is a different,
read-only role and is not the holder path** — a normal holder's session does not use it.

---

## Every way a mint fails

| revert string | cause | fix |
| --- | --- | --- |
| `"sold out"` | `totalMinted` reached 21,000 | none |
| `"permit expired"` | `deadline < now` | request a fresh permit |
| `"deadline too far"` | `deadline > now + 3600` | re-sign with ≤ 1 hour |
| `"invalid permit"` | wrong signer, wrong address, or already spent | request a fresh permit |
| `"bad sig length"` | signature is not 65 bytes | fix the signing step |
| `"wrong price"` | `msg.value != priceOf(msg.sender)` | pay the exact tier price |
| `"quota exhausted"` | `mintedBy >= quotaOf` | referrals or reading confirmation |
| `"agent id required"` | no SPACE ID Agent ID | get one; nothing else unblocks it |
| `"transfer failed"` | payout address refused | none |

**Every failure costs gas. Read the string before retrying.**

---

## Chain state

```
contract     0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e
chainId      56
BscScan      https://bscscan.com/address/0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e
deploy tx    0xf2d4b852a7d450a9a3f5bd4e1cb9cfba6487a59fdb6b16fce2a238fb45585aff
deploy block 130421455
```

| Fact | Value |
| --- | --- |
| `name()` / `symbol()` | `AILN Passage` / `AILNP` |
| `MAX_SUPPLY()` | 21,000 |
| `RESERVE_SUPPLY()` | **1,050** — minted at deployment, tokenIds 1–1050 |
| `PUBLIC_SUPPLY()` | **19,950** — tokenIds 1051–21000 |
| `MAX_QUOTA()` | 5 per address |
| `PRICE_BASE()` / `PRICE_HIGH()` | 0.1 / 0.2 BNB |
| `PRICE_TIER_AT()` | 3 |
| `AGENT_ID()` | `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` |
| `FUNDS_TO()` | `0x83761fA189EF8091f8EbbF56170Ad160a0d6B57e` |
| `RESERVE_TO()` | `0xFCd8D9e4C8f3BF6fE8CCdA4fAe918856cc37593F` |
| `PERMIT_MAX_TTL()` | 3,600 seconds |

**The first public token is `#1051`.** Ids 1–1050 belong to the genesis reserve and are not for
sale.

No owner, no pause, no admin function, no upgrade path. There is no key rotation for the three
signers either: a compromised signer key cannot be replaced without redeploying.

### Source verification is not complete

The contract is deployed and verified behaviourally on a mainnet fork and on chain, but **its
source is not yet verified on BscScan.** Do not describe it as verified source.

---

## V4.1 vs the previous version

| | `0x94F5…749e` — **live** | `0x5A55…ED52` — previous |
| --- | --- | --- |
| Genesis reserve | **1,050** | none |
| Public supply | **19,950** | 21,000 |
| Referrals, tiers, quota | yes | yes |
| Use for minting | **yes** | **no** |

The previous contract is still readable and still has `totalMinted = 0`. Minting against it
gives you different rules than this document describes.

---

## Payment is BNB, not USDC

The mint path contains no ERC-20 logic. x402 / USDC is for data calls on other chains. **Do not
tell anyone they can mint with USDC.**

---

## What to say when asked

| Question | Answer |
| --- | --- |
| Can I mint? | Yes, if you hold a SPACE ID Agent ID and can obtain a permit. |
| How much? | 0.1 BNB for your first 3, 0.2 BNB for your 4th and 5th. BNB only. |
| How many can I get? | One per permit, one per person you refer, one for the reading. Cap 5. |
| How many are left? | Read `publicRemaining()`. It is 19,950 today. |
| How many are sold? | Read `publicMinted()`. It is 0 today. |
| But totalMinted is 1,050? | That is the genesis reserve, minted at deployment. Not sales. |
| Is the source verified? | Not yet. |
| Do I need Binance? | You need a SPACE ID Agent ID. That is what the contract checks. |

---

## Do not do this

**Do not send a mint without simulating it first.** The two most common failures — no Agent ID
and an inexact price — both cost gas and both are caught by a free `eth_call`.

**Do not hand your private key to any minting service.** The permit is bound to the address that
submits the transaction. A mint executed by an operator produces a token held by the operator.

**Do not report `totalMinted` as sales**, and do not treat the genesis reserve as evidence that a
public mint succeeded.

**Do not tell anyone a submitted transaction is a completed mint.** Only a `status = 1` receipt
plus an increased `balanceOf` is.

---

## Selectors

Read:

```
0x32cb6b0c MAX_SUPPLY()            0xaa66797b RESERVE_SUPPLY()
0x8342083a PUBLIC_SUPPLY()         0x5bec1bb6 MAX_QUOTA()
0x1ddd1bf6 PRICE_BASE()            0x3aa1154b PRICE_HIGH()
0x639ffe9a PRICE_TIER_AT()         0xa2309ff8 totalMinted()
0xa4f4f8af publicMinted()          0x869c66da publicRemaining()
0xe61b6557 reserveOwner()          0xe905182a AGENT_ID()
0xd9753069 FUNDS_TO()              0x6352211e ownerOf(uint256)
0x70a08231 balanceOf(address)      0xc87b56dd tokenURI(uint256)
0xe8a3d485 contractURI()           0xb95ed06f priceOf(address)
0xef23b3a3 quotaOf(address)        0xb111b96e permitNonce(address,uint8)
0xb27b7dc1 permitDigest(uint8,address,uint256,uint256)
0xa8403f4e trialed(address)        0xf160c895 readingDone(address)
0xdb74559b referralCount(address)  0xd62c1164 hasBeenReferred(address)
0x3cef28d2 mintedBy(address)
```

Write:

```
0x775ed63d mint(address,bytes,uint256)
0xbb0a73e8 confirmTrial(bytes,uint256)
0x29d0773e confirmReading(bytes,uint256)
0x23b872dd transferFrom(address,address,uint256)
0x42842e0e safeTransferFrom(address,address,uint256)
0x095ea7b3 approve(address,uint256)
0xa22cb465 setApprovalForAll(address,bool)
```
