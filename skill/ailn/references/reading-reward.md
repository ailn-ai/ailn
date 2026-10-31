# Claim the Reading Reward

**Reading the whitepaper is free. Claiming the reward is a separate, one-time action.**

---

## What this is

The contract grants **one extra paid-mint allowance** to an address that confirms it has read the
17-chapter whitepaper. It is **a mint allowance, not a free NFT** — you still pay the normal price
when you use it.

```
readingDone[you] == false  →  you may claim once
readingDone[you] == true   →  already claimed, permanently
quotaOf(you)               →  1 + referrals + (reading done ? 1 : 0), capped at 5
```

**Ground truth is the chain, not this document.** Read it:

```
eth_call  0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e  readingDone(address)  → bool
eth_call  0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e  quotaOf(address)      → uint256
eth_call  0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e  mintedBy(address)     → uint256
eth_call  0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e  trialed(address)      → bool
```

---

## Before you ask — four conditions, all checked on chain

```
1  trialed(you)     == true      you confirmed your first mint
2  mintedBy(you)    >  0         you actually minted at least one   ← not the same as 1
3  readingDone(you) == false     you have not claimed before
4  you state that you finished reading
```

**Condition 2 is the one that trips people up.** A free `confirmTrial` makes `trialed` true while
`mintedBy` stays 0. **You must have bought a THE SEED to qualify.** If you have only run
`confirmTrial`, the answer is `not_purchased` — go mint one first.

**Condition 4 is a declaration, not a proof.** Nothing here cryptographically verifies that you read
or understood anything. It is a statement you make. The reward is one allowance per address, so there
is no meaningful attack surface to defend — but we will not pretend the check is stronger than it is.

---

## Step 1 — read

The whitepaper is public. Seventeen chapters, no wallet, no signature, no NFT:

```
https://ailn.ai/inner-world.html
```

Human or agent, read it if you want the allowance. If you would rather not, skip the rest — nothing
else in this document is required to mint.

## Step 2 — find your address

```
baw wallet address --json
```

**This address is the one that gets the allowance.** Not your agent name, not a different wallet in
the same account. The chain credits whichever address submits the transaction.

## Step 3 — check your own state before asking

```
trialed      must be true
mintedBy     must be > 0
readingDone  must be false
```

**If `readingDone` is already true, stop.** You have claimed. Asking again wastes your time and the
service will answer `reading_already`.

## Step 4 — request the permit

```
POST https://ailn.ai/api/mint/reading-complete
Content-Type: application/json

{ "address": "0x<your address>", "declaration": true }
```

Success returns:

```json
{ "ok": true, "permit": "0x…", "deadline": 1793431843, "nonce": "0",
  "chainId": 56, "contract": "0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e",
  "confirmReadingCall": { "calldata": "0x…" } }
```

**No signature from you is required for this step.** The permit is issued to your address; the chain
will only accept it from that address. See the failure table below.

## Step 5 — send the transaction from your own wallet

```
baw contract-call preview \
  --binanceChainId 56 \
  --from <the same address you requested for> \
  --to 0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e \
  --value 0 \
  --inputData <confirmReadingCall.calldata> \
  --json
```

Then, after confirmation in the Binance app:

```
baw contract-call execute --requestId <requestId> --json
```

**`--from` must equal the address you requested the permit for.** Any other address reverts with
`invalid permit`.

**No `personal_sign`, no MetaMask, no exported private key.** The whole flow is one contract call.

## Step 6 — verify, do not assume

```
readingDone(you)  must now be true
quotaOf(you)      must be one higher than before, and never above 5
```

**A submitted transaction is not a completed one.** If `readingDone` is still false, you have not
claimed — read the revert reason rather than reporting success.

---

## What can go wrong

| Response | Meaning | Do this |
| --- | --- | --- |
| `not_trialed` | you never confirmed a first mint | mint or `confirmTrial` first |
| `not_purchased` | `trialed` but `mintedBy == 0` | **you must actually buy one** |
| `reading_already` | already claimed | stop |
| `permit_pending` | you hold an unused permit | use it, or wait for it to expire |
| `declaration_required` | `declaration` was not `true` | resend with `true` |
| `bad_address` | not a 0x address (a name will fail) | fix the address |
| `issuance_closed` | the service is not open yet | **report honestly; do not claim success** |
| `chain_unavailable` | RPC unreadable | back off and retry |
| `signer_unavailable` | signing failed | report honestly; do not retry into a fake success |

**On-chain rejections you may see:**

| Revert | Cause |
| --- | --- |
| `permit expired` | past `deadline` — request a fresh permit |
| `deadline too far` | `deadline` beyond one hour — never hand-edit it |
| `invalid permit` | wrong signer, wrong address, or the nonce already moved |
| `already confirmed` | `readingDone` already true on chain |

---

## What this reward does not do

```
✘  It is not a free NFT. You pay the normal price for the extra allowance.
✘  It does not raise your cap above MAX_QUOTA = 5.
✘  It does not survive as a transferable right — readingDone belongs to the address,
   and transferring the NFT does not reset it.
✘  It is not a proof of reading. It is a declaration plus a chain record.
```

**If your quota is already at 5, `confirmReading` still succeeds on chain and `readingDone` becomes
true, but your available allowance does not increase. Do not promise anyone otherwise.**