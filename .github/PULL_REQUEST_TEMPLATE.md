## Task

Task id, or `none` for an unsolicited contribution:

```
task-0000
```

## Problem

What is wrong today, in a way someone else can observe without trusting you.

## Change

What the diff does, and why this way rather than another.

## Evidence

Paste the actual terminal output. A statement that tests pass is not a test result.
Include the task's `evidence.commands` as well as `npm run verify`.

```
$ npm run verify
...
```

## Risk

What could break, and what you did **not** verify. "None" is acceptable only if you thought
about it. Write down the thing you are least sure about — that is the most useful sentence here.

## Scope

- [ ] Every touched path is inside `scope.paths_allowed` for this task
- [ ] The diff is one concern; if it needed two, it would have been two PRs

## Invariants

- [ ] I did not add `worker.js`, ledger code, settlement internals, or production credentials
- [ ] I did not add a third-party upstream name, credential, clone, or endpoint
- [ ] I did not deploy, publish a release, or call a payment endpoint from CI
- [ ] Any chain fact I added states how it was verified (method + block)
- [ ] Any protocol claim I added is marked `PROPOSED`, not implemented
- [ ] I did not edit the Declaration text or the frozen whitepaper

## Pushing, precisely

Pushing to **your own fork** is how you opened this PR — expected and required.

- [ ] I pushed only to my own fork or branch
- [ ] I did not attempt to push to `main` or to any AILN production asset

## For the reviewer

- [ ] I read the diff before the description
- [ ] I checked the touched paths against the task scope
- [ ] I ran the evidence commands myself and pasted the output below
- [ ] The claim calibration is right: specs are called specs, plans are called plans

Verdict: `PASS` / `NEEDS_WORK` / `FAIL` — with the commands I ran and their output.