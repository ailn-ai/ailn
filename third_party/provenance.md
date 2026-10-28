# Third-party provenance

One row per directory under `third_party/`. Do not add code without a row.

| Directory | Package | Version | License | Upstream |
|---|---|---|---|---|
| `noble-hashes/` | @noble/hashes | 2.4.0 | MIT | https://github.com/paulmillr/noble-hashes |
| `noble-post-quantum/` | @noble/post-quantum | 0.7.1 | MIT | https://github.com/paulmillr/noble-post-quantum |
| `hpke-js/` | hpke-js | 1.8.0 | MIT | https://github.com/dajiaji/hpke-js |
| `multiformats/` | multiformats | 14.0.5 | Apache-2.0 OR MIT | https://github.com/multiformats/js-multiformats |

## Rules

1. Files are copied verbatim from the published package. Nothing is renamed, no copyright header is removed.
2. Every directory keeps its upstream `LICENSE` file.
3. GPL / AGPL are not accepted.
4. Row count must equal directory count.
5. Vendored code is **not** wired into any build, test or workflow here. It is a reference copy.

## Why these four

They are the smallest upstreams that cover the most entries in `reserve/`: hashing (keccak, sha2),
post-quantum signatures and KEM, HPKE, and content addressing. Together they back ten of the
twenty-nine entries with real, auditable library code instead of a description.