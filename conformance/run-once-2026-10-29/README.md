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
## Second run — reserve reference implementations

`node conformance/run-once-2026-10-29/run-reserve.mjs` — **6/6 passed**, raw output in
[`output-reserve.txt`](output-reserve.txt).

| Entry | What the test actually establishes |
|---|---|
| `reserve/transparency-logs` | inclusion proofs hold for n = 2, 3, 5, 8; appending a leaf keeps older proofs valid |
| `reserve/eigentrust` | power iteration converges and reaches the same fixed point from two different starts |
| `reserve/vector-index` | exact kNN and a 3-list IVF return the same top-3 |
| `reserve/state-channels-metering` | signed cumulative states; replay, inflated balance and tampering are rejected |
| `reserve/sd-jwt-bbs` | disclosed claims verify; undisclosed claims stay unrecoverable; altered salt or value rejected |
| `reserve/eip-712` | keccak-256 matches three published vectors; digest is 32 bytes, deterministic and field-sensitive |

Each entry states its own `Verified scope` — what was implemented and what was **not**. These are
reference implementations, not audited code, and none of them is wired into the production service.