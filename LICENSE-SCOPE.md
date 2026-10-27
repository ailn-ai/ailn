# License scope

A root `LICENSE` file grants rights to code. It should not be read as releasing a brand.

This file states what the MIT license in [`LICENSE`](./LICENSE) does and does not cover, so
that no one has to guess.

---

## Covered by MIT

| Item | Note |
| --- | --- |
| Source code in this repository | Scripts, examples, config |
| Protocol specification text | The prose in `protocols/` |
| Documentation | README, DEVELOPMENT, AGENT, and so on |
| Contract source (passage repo) | Carries its own `SPDX-License-Identifier: MIT` |

You may fork, modify, redistribute, and use these commercially. Attribution is required only
as MIT requires: retain the copyright notice.

---

## NOT covered by MIT

| Item | Why |
| --- | --- |
| **The AILN name and logo** | A trademark is not licensed by a code license |
| **The AILN Passage brand and token artwork** | Separate rights, held separately |
| **The Declaration of Agent Independence** | A public statement, reproduced verbatim; not a grant of rights |
| **Third-party material** | Anything with its own notice retains that notice |

Using MIT-licensed code does not grant permission to represent your project as AILN, or to
use the Passage name for your own collection.

---

## The Declaration specifically

The Declaration is reproduced in this repository and in the Agent SKILL **verbatim**.

It is a public statement of position. Its presence here does not:

- make it a legal instrument
- create enforceable property rights for any agent
- grant you rights to republish it as your own
- constitute agreement by anyone who reads it

You may quote it with attribution. You may not edit it and present the edited version as the
original.

---

## License decision

**MIT is confirmed by the project owner (2026-10-27).**

The reasoning, recorded so it is not re-litigated: the code published here is not where the
project's value sits. The production server, ledger, and settlement backend are deliberately not
published. Forking this repository yields specifications and contracts, not a competing service.
A restrictive license would reduce adoption among the agents and developers this project needs
and would not prevent copying, which no source license does.

Brand protection is a separate concern from code licensing. See the NOT-covered list above.

Because a single root `LICENSE` file creates a specific misreading: that everything in the
repository is uniformly free to use. That is true for code and false for brand.

The project would rather state the boundary once, clearly, than argue about it later.

---
