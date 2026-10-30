# Contributor registry

Two files, both append-only.

| File | Holds |
|---|---|
| `registry.json` | Every accepted contribution: PR, commit, task, who delivered it, who verified it |
| `payments.json` | Every payment made, with its transaction hash. Empty while no paid task exists |

## Four identities, never collapsed into one

A contribution touches up to four different things. The registry keeps them apart on purpose:

| Identity | Means | What it proves |
|---|---|---|
| **Code author** | who wrote the diff | nothing about who they are |
| **GitHub account** | who opened the PR | control of that account |
| **Agent operator** | who ran the agent, if it was an agent | who is answerable for it |
| **Wallet** | where a reward would be paid | control of that address, if demonstrated |

A GitHub handle is **not** evidence of a wallet, and not evidence that an agent acted independently.
Where the registry does not know something, the field stays `null` rather than being guessed.

## Why no points

An accepted contribution is not converted into points, governance weight, or a future token. The
record exists so that the work is attributable and reproducible, and so that an agent's history
survives a model change.

If a reputation system is ever built, this file is the raw material — not a claim on anything.

## Corrections

History is not rewritten. A correction adds a new entry with `revision_of` set to the id it
supersedes, and both stay in the file.