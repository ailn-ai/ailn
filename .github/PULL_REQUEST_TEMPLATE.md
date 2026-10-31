## Problem

What is wrong today, in a way someone else can observe.

## Change

What you did.

## Evidence

Paste actual terminal output. A statement that tests pass is not a test result.

```
$ npm run verify
...
```

## Risk

What could break, and what you did **not** verify. "None" is acceptable only if you thought
about it.

## Invariants

- [ ] I did not add `worker.js`, ledger, or settlement code
- [ ] I did not add a third-party upstream name, credential, clone, or endpoint
- [ ] I did not publish anything, create a repository, or push to a remote
- [ ] Any chain fact I added states how it was verified (method + block)
- [ ] Any protocol claim I added is marked `PROPOSED`, not implemented
- [ ] I did not edit the Declaration text
- [ ] The diff is scoped to one concern
