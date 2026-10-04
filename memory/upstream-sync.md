# Upstream sync state (`ant-design/x` -> `antdv-next/x`)

**Tracked files:** `.sync-upstream.json` (the cursor), `.agents/skills/cross-repo-pr-sync/SKILL.md`
(the procedure + priority rules + branch management references).
**Why this file exists:** `.sync-checklist-*.md` and `.sync-upstream.local.json`
are gitignored, and the per-sync reports have lived in untracked notes. The
durable outcome of every sync - what was ported, where, and what deviated -
belongs here.

## How a sync works

1. Read `.sync-upstream.json` for the cursor (`last_synced_commit`) and the
   package mapping.
2. Enumerate upstream PRs/commits from the cursor to upstream HEAD (the skill
   clones upstream to a temp dir with `--filter=blob:none` and fans out one
   worker per package mapping).
3. Port each PR into a `sync/ant-design-x-<pr>` branch with a checklist, then
   into a normal PR on `main`.
4. Verify, then advance the cursor (`chore/sync-upstream-<sha>` branch) and
   record the result below.

Package mapping:

| Upstream              | Downstream            |
| --------------------- | --------------------- |
| `packages/x`          | `packages/x`          |
| `packages/x-sdk`      | `packages/x-sdk`      |
| `packages/x-markdown` | `packages/x-markdown` |
| `packages/x-card`     | `packages/x-card`     |
| `packages/x-skill`    | `packages/x-skill`    |

## Cursor

| Field                                  | Value                                                  |
| -------------------------------------- | ------------------------------------------------------ |
| `last_synced_commit`                   | `8b76d6a` (tag `2.9.0`), `sync_count: 6`, `2026-09-29` |
| Newest upstream commit visible locally | `8b76d6a` (2026-09-20, merge of PR #2061)              |

The `8b76d6a` advance landed on `main` as `e8f1bf1` "chore: update upstream
sync cursor" (2026-09-30), together with the #2061 port on `main` as `7b6b587`.

## Synced PRs

| Upstream PR                                                                                                                                        | Upstream commit | Downstream landing                                                                                            | Notes                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [#2035](https://github.com/ant-design/x/pull/2035) fix(mermaid): zoom cap / full export                                                            | `614a63a`       | `2a2c789` (#206)                                                                                              | Ported; the `sync/ant-design-x-2035` branch also carries a different, unmerged variant `d7d0616`                                           |
| [#1969](https://github.com/ant-design/x/pull/1969) chore(deps): marked 15.x -> 16.x                                                                | `37877ef`       | `9fd614e` (#214)                                                                                              | Token API migration in `core/Parser.ts` / `core/VueRenderer.ts`                                                                            |
| [#2056](https://github.com/ant-design/x/pull/2056) fix(mermaid): blank graph on first render                                                       | `90dfa88`       | `3a28202` + `ab60748` (#213)                                                                                  | Upstream's antd bump and snapshot updates are N/A downstream                                                                               |
| [#1997](https://github.com/ant-design/x/pull/1997) fix(markdown): avoid parsing currency as LaTeX                                                  | `7470e60`       | `c463ec1` (#188)                                                                                              | See `x-markdown.md` (LaTeX math)                                                                                                           |
| [#2061](https://github.com/ant-design/x/pull/2061) feat+perf(x-markdown): streaming preset (incremental sections, incomplete markdown, typewriter) | `8b76d6a`       | `7b6b587` (#226), `6ea3c9d` (#229), plus the round 7-9 fixes on `fix/x-markdown-section-tracker-continuation` | **Not a 1:1 port** - the section tracker deliberately diverges. Read `x-markdown.md` (section boundaries) before touching or "aligning" it |

## Branches left around

| Branch                                             | Head              | Contents                                                                                                   |
| -------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `sync/ant-design-x-1969`, `sync/ant-design-x-2056` | checklist commits | Content already on `main`; branches are history only                                                       |
| `sync/ant-design-x-2061`                           | `6317ff1`         | The streaming-preset feature branch; superseded by `main` + the current fix branch                         |
| `sync/ant-design-x-2035`                           | `617f11b`         | Older cursor/state variant (`614a63a`, `sync_count: 4`) plus `d7d0616`; the port that shipped is `2a2c789` |
| `sync/ant-design-x-614a63a`                        | `a837928`         | "record sync status (25aad7b9..614a63a)"; state only                                                       |
| `chore/sync-upstream-8b76d6a`                      | `b42dc98`         | Cursor advance to `8b76d6a`; superseded by `main`'s `e8f1bf1` (same state), branch is history only         |

## What to record after every sync

For each ported PR: upstream PR number + merge commit, the downstream commit(s),
and - most important - **where the port deviates from upstream and why**, with a
link to the matching memory file. A port that "fixes" a documented divergence
is a regression, not an improvement: check the memory files first (see the
table above; `x-markdown.md`).

## Verification

- `vp check` (format + lint + type check) and `vp run test:unit`.
- Package-specific differential checks where a memory file describes one
  (the streaming splitter's per-character whole-vs-sectioned equivalence is in
  `packages/x-markdown/src/XMarkdown/__tests__/incremental.test.ts`).
- If a sync changes `packages/x-markdown` streaming or LaTeX behaviour, update
  the matching memory file in the same PR.

## Caveats

- The upstream clone available in this environment ends at `8b76d6a`
  (`2026-09-20`). With no network, newer upstream commits cannot be compared -
  say so instead of guessing.
- `sync_count` in `.sync-upstream.json` is the only machine-readable cursor
  history; keep this file in sync with it when the cursor moves.
