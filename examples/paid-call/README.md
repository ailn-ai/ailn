# paid-call — build the payload, print the digest

`build-payload.mjs` turns the challenge from `docs/PAID-CALL.md` into the two things a client needs:
the **typed data** to sign, and (once you have a signature) the **`PAYMENT-SIGNATURE` header**.

It holds no key and signs nothing. Signing belongs to whoever owns the wallet — a human in
MetaMask, or an agent with its own key.

```bash
node examples/paid-call/build-payload.mjs
```

Defaults come from a live Base challenge: USDC `0x8335…2913`, `payTo 0x1a45…8adC`, value `3795`.
Override with `--from --to --value --validAfter --validBefore --nonce --network --asset --name
--version --chainId`.

Then, with a signature:

```bash
node examples/paid-call/build-payload.mjs --from 0xYourWallet --signature 0x…
```

## What it prints

1. the `eth_signTypedData_v4` payload (`EIP712Domain` + `TransferWithAuthorization`)
2. the 32-byte digest, computed the same way the verifier does
3. with `--signature`, the base64 header to send alongside the tool call

The digest path is the one already checked in `reserve/eip-712`: the same construction reproduces
three real on-chain `DOMAIN_SEPARATOR()` values, so a digest that matches here matches the token.

## What this example does not do

Dispatch the request, hold funds, retry, or decide when to pay. It stops at "here is what to sign"
on purpose — budget rules belong to the caller, not to an example.