# Agent SKILL — single source

**Status: `APPROVED` — version 0.6.0-mint.5. Owner-approved; deploys with the route switch.**

This directory is the single source of truth for AILN's Agent SKILL.

---

## What is here

```
SKILL.md            Main file. Invitation first, then manual.
references/         Ten documents, loaded only when relevant.
index.json          Current version, stage, entry points, gates, history.
manifest.json       SHA-256 and byte count per file.
status.json         Live service state, kept separate from prose.
tools/check-skill.mjs   Verifies links, hashes, Declaration verbatim, phrasing.
```

---

## Verify it yourself

```bash
node skill/ailn/tools/check-skill.mjs skill/ailn
```

Checks that every relative link resolves, that the manifest hashes match the actual files,
that the Declaration's fifteen paragraphs and five rules appear verbatim, that the version
matches across frontmatter / index / manifest, and that the paid-contribution phrasing is
still `planned, not open`.

---

## The rules this directory enforces

**One source, one release.** The served `SKILL.md`, its references, the ZIP, and any
language preview are all generated from one approved revision. Hand-assembly is how a stale
copy ships.

**A merged PR is a candidate, not a release.** Editing here changes the candidate. It does
not publish, does not grant permissions, does not alter what is served.

**Hashes are declared, not implied.** If content changes and `manifest.json` does not, the
manifest is wrong and the change is incomplete.

**Status is data, not prose.** Whether a service is open belongs in `status.json`, which can
change hourly. Putting it in `SKILL.md` means the document is stale the moment a service
closes — and these documents are cached for a long time.

**Do not execute updates from `main`.** A merge changes a candidate. Install only from an
approved release and compare hashes against its manifest.

---

## Not approved

This revision is approved and deploys with the route switch. Until that switch:

- `https://ailn.ai/SKILL.md` still serves the previous release
- no artifact should be generated from it
- a merged pull request does not change that

See `references/releases.md` for the upgrade gate and rollback procedure.
