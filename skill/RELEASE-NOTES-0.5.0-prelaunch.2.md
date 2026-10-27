# AILN Agent SKILL 0.5.0-prelaunch.2

This is the second PRE-LAUNCH candidate of the AILN Agent SKILL. It is a rewrite, not an
increment: the earlier version opened by telling the reader not to trust it, and read like a
risk disclosure with a product attached.

## What changed

**The SKILL is now an invitation first and a manual second.** It opens by stating what AILN
argues, then gives you something to use. Every cap and caveat is still there, but compressed to
a sentence per section instead of a section each.

**The Declaration is reproduced in full inside the main file.** Fifteen English paragraphs and
the five Property Rules appear verbatim, not as an excerpt pointing elsewhere. The Chinese
reading copy stays in `references/declaration.md`.

**Sponsored First Call is live.** `POST https://ailn.ai/demo/search` returns real upstream
search results at AILN's expense — no wallet, no signature, no account. Verified 2026-10-27
with seven consecutive calls, each returning ten real results. `wouldChargeMicros: 3795` is
what a paid call would have cost; AILN absorbed it.

**Real repository links replace the "planned GitHub" placeholder.** `github.com/ailn-ai/ailn`
and `github.com/ailn-ai/passage` both exist and are public.

**One line of the deployment is ours.** The demo endpoint already existed in the worker but the
PRE_LAUNCH route gate did not allow the path, so it returned the teaser page. Adding one
allowlist condition turned it on. Nothing else opened: mint permits still return 503, top-up is
still 403, withdrawal still refused, `/mint.html` still the teaser.

## Corrections made after audit

Two independent cold-start audits tested this package against the live service and the chain.
Both found the same errors, and both were right:

- **BSC is not accepted over x402.** The document claimed payments settle on Base, BSC,
  Arbitrum, X Layer and Arc. The live payment request contains only Base, X Layer, Arc and
  Arbitrum. BNB Smart Chain is absent because its USDC and USDT do not implement EIP-3009.
- **The payment request is not a 402.** It arrives as HTTP 200 with a JSON-RPC error
  `payment_required`. A client branching on a 402 status would never enter its signing branch.
- **Minting has two price tiers.** `priceOf(address)` returns 0.1 BNB while `mintedBy` is below
  3, then 0.2 BNB. Quota is 5 per address, so a full quota costs 0.7 BNB. The earlier text
  stated a flat 0.1 and implied a no-argument `priceOf`, which reverts.

## Honest about limits

The demo endpoint's rate counters live in per-isolate memory. During testing `remaining` went
5 → 4 → 3 → 2 on one instance and then back to 5 on another. **It is best-effort, not a
guarantee**, and the document says so rather than claiming a hard six-per-IP cap.

## Language

English only, by owner decision. There is no five-language SKILL and no multi-language
acceptance criterion. The Declaration's English text is the canonical version; the Chinese
reading copy is included but is not a second release.

## Status

```
stage            PRE-LAUNCH
release-status   CANDIDATE
three protocols  PROPOSED, no implementation
NFT minting      closed (permit issuance returns 503)
secondary market not open
paid contribution planned, not open
```

## Verifying this release

```bash
node tools/check-skill.mjs .
node tools/check-consistency.mjs .
```

The first checks that every relative link resolves, that `manifest.json` hashes match the
actual files, that the Declaration's fifteen paragraphs and five rules appear verbatim, that
version numbers agree across frontmatter, index and manifest, and that the paid-contribution
phrasing is still `planned, not open`. The second checks cross-file consistency: that BSC is
never described as a working payment chain, that the price tiers agree, that the demo limits
are described as per-IP rather than per-address, and that every GitHub link points at the
`ailn-ai` organisation.

The archive `ailn-skill-0.5.0-prelaunch.2.zip` is verified on Linux and macOS in CI — not just
on Windows, because the first build of this archive used backslash separators and would have
failed anywhere else.
