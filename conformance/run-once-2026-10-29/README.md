# One-shot conformance run — 2026-10-29

Executed once, locally, on a machine with no hardware dependencies. Four checks, all dependency-free (Node.js only).

- Runtime: Node.js v24.17.0 on Windows
- Command: `node conformance/run-once-2026-10-29/run-all.mjs`
- Result: **4/4 passed**

| Check | Entry | Result |
|---|---|---|
| RFC 8785 canonicalisation is key-order independent | `reserve/jcs-rfc8785` | PASS |
| multihash sha2-256 against a public test vector | `reserve/cid-multihash` | PASS |
| Merkle inclusion proofs verify; tampered leaf rejected | `reserve/merkle-proofs` | PASS |
| Freivalds spot check accepts valid and rejects corrupted product | `reserve/freivalds` | PASS |

Raw output: [`output.txt`](output.txt).

Scope: this run covers four entries only. The other 25 entries remain `Status: reserve` — no output, no claim. Nothing here runs in AILN production.