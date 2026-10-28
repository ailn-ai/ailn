# Third-party provenance

One row per directory under `third_party/`. Do not add code without a row.

| Directory | Package | Version | License | Upstream |
|---|---|---|---|---|
| `noble-hashes/` | @noble/hashes | 2.4.0 | MIT | https://github.com/paulmillr/noble-hashes |
| `noble-post-quantum/` | @noble/post-quantum | 0.7.1 | MIT | https://github.com/paulmillr/noble-post-quantum |
| `hpke-js/` | hpke-js | 1.8.0 | MIT | https://github.com/dajiaji/hpke-js |
| `multiformats/` | multiformats | 14.0.5 | Apache-2.0 OR MIT | https://github.com/multiformats/js-multiformats |
| `noble-curves/` | @noble/curves | 2.4.0 | MIT | https://github.com/paulmillr/noble-curves |

## Rules

1. Files are copied verbatim from the published package. Nothing is renamed, no copyright header is removed.
2. Every directory keeps its upstream `LICENSE` file.
3. GPL / AGPL are not accepted.
4. Row count must equal directory count.
5. Vendored code is not wired into any build, test or workflow. One reference file imports it on purpose: `reserve/eip-712/reference.mjs` uses this `@noble/hashes` copy instead of a hand-rolled permutation.

## Why these four

They are the smallest upstreams that cover the most entries in `reserve/`: hashing (keccak, sha2),
post-quantum signatures and KEM, HPKE, and content addressing. Together they back ten of the
twenty-nine entries with real, auditable library code instead of a description.

## Known limitation: these copies are not self-contained

Only `noble-hashes/` is import-clean on its own (its internal imports are relative). The other four
packages import `@noble/hashes` or each other **by package name**, so a bare copy of the files does
not run without installing those packages. Nothing in this repository imports them, and no behaviour
is claimed for them.

If they are ever wired in, the clean way is a declared dependency plus a lockfile — not this copy.