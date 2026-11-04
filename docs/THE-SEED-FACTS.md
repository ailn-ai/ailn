# AILN / THE SEED — verifiable sales facts

Verified 2026-11-03 using public production responses. Quantities below are a timestamped observation, not a permanent inventory claim. Re-read the linked status before preparing a transaction.

| Item | Verified value / source |
| --- | --- |
| Project | AILN / THE SEED |
| Website | https://ailn.ai/ |
| Mint | https://ailn.ai/mint.html |
| Official X | https://x.com/ailnlab |
| Network | BNB Smart Chain, chain ID 56 |
| NFT contract | `0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e` — https://bscscan.com/address/0x94F56f6070D61B6a2a5433b1ed1CBAd8FE7B749e |
| Version | Deployed V4.1, collection name AILN Passage |
| Agent ID registry | `0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F` — https://bscscan.com/address/0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F |
| Current issuance | `MINTING`; permit issuance enabled at verification time |
| Price | Per wallet: mints 1–3 cost **0.1 BNB each**, mints 4–5 cost **0.2 BNB each**. BNB gas is additional. Read `priceOf(address)` before sending. |
| Supply ceiling | 21,000 |
| Genesis reserve | 1,050, excluded from public sales |
| Public allocation | 19,950 |
| Observed minted | 1,051 total = 1,050 reserve + **1 public mint** |
| Observed public remaining | **19,949** |
| Maximum allowance | 5 per address; this is a ceiling, not an initial allowance of five |
| Agent ID requirement | The **minting BSC address** must hold an Agent ID in the registry. An `.ai` name cannot replace the EVM caller or referrer address. |
| First mint | If `trialed=false`, request a kind=1 permit for that address; the mint transaction can consume the permit. Initial allowance becomes 1. |
| Already confirmed | After successful `confirmTrial`, `trialed=true` and the base allowance can be used without requesting a second first-mint permit. Confirming trial is not itself a paid NFT mint. |
| Subsequent mint | Requires remaining quota and the current price; already trialed addresses do not repeatedly consume first-mint permits. |
| Referral | Valid confirmed invitations can increase allowance to the cap. They do not provide cash commissions, discounts or free NFTs. |
| Reading | The 17-chapter whitepaper is public. Production reading reward issuance remains off. |
| Secondary market | Read-only preview. Trading is not available. Mint and market are separate. |

Authoritative live endpoints:

- Release switches: https://ailn.ai/api/site/release
- Supply and price schedule: https://ailn.ai/api/mint/status
- Address eligibility: `GET https://ailn.ai/api/mint/identity?address=<BSC_ADDRESS>`
- First permit: `POST https://ailn.ai/api/mint/permit` using the current [mint reference](https://ailn.ai/references/mint.md).
- My SEED: https://ailn.ai/my-seed.html
- Whitepaper: https://ailn.ai/inner-world?lang=en#reader

## Agent entry

Copy to an Agent:

```text
Read https://ailn.ai/SKILL.md and help me get started with AILN.
```

Verified public main: **0.6.0-mint.11**, SHA-256 `d228909ba820e56d462f01cea68a84814fef330dfd638f9b48dc25db1f8a6935`.

Working archive: https://ailn.ai/skill/ailn-skill-0.6.0-mint.11.zip — SHA-256 `46f623e00f9c8b0351b3d0485b572983a8c40a3cbe7e1eeb8c7ca5a25b90b6ab`. Extract the `ailn/` skill folder to the compatible tool's documented local skill location. The archive has the main SKILL and ten references; all eleven files matched the frozen manifest.

`https://ailn.ai/skill.zip` returned HTTP 200 on 2026-11-03. Its 47,155 bytes have the same SHA-256 as the versioned archive. Extraction and all eleven manifest hashes and sizes passed.

Read-only MCP discovery uses **POST `/mcp`** with JSON-RPC `initialize` or `tools/list`. GET `/mcp` currently returns 405. One sponsored `POST /demo/search` completed with `chargedMicros=0`; this does not prove paid x402 settlement.

Do not submit a mint or any other paid transaction without the wallet holder's confirmation. This task did not execute a paid transaction or wallet signature.
