# EIP-712 domain parameters, read from the contracts

Read on **2026-10-29** with `eth_call` at `latest`, no documentation involved:

| Chain | Token | `name()` | `version()` | `DOMAIN_SEPARATOR()` |
|---|---|---|---|---|
| Base (8453) | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | `USD Coin` | `2` | `0x02fa7265e7c5d81118673727957699e4d68f74cd74b7db77da710fe8a2c7834f` |
| Arbitrum (42161) | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | `USD Coin` | `2` | `0x08d11903f8419e68b1b8721bcbe2e9fc68569122a77ef18c216f10b3b5112c78` |
| X Layer (196) | `0x74b7f16337b8972027f6196a17a631ac6de26d22` | `USD Coin` | `2` | `0xb1671065a2ea487729c4ff0e2f8beb2105e3ce63315ad07483374a3476b83972` |

Three identical-looking tokens, three different separators. The domain includes the chain id and the
verifying contract, so the separator is per-chain even when `name` and `version` match. Copying one
chain value into another chain's signing code is a silent failure: the signature is well formed and
simply never verifies.

## How to check any chain

```bash
cast call <token> "name()(string)"
cast call <token> "version()(string)"
cast call <token> "DOMAIN_SEPARATOR()(bytes32)"
```

or any RPC with `eth_call` and the selectors `0x06fdde03`, `0x54fd4d50`, `0x3644e515`.

## About the example in `reserve/eip-712`

That reference builds its own synthetic domain (`name = "AILN"`, the Passage contract, chain id 56) to
show how a digest is assembled. It is not any token's domain and is not used for signing anything.