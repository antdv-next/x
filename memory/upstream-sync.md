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

| Field                                      | Value                                                         |
| ------------------------------------------ | ------------------------------------------------------------- |
| `last_synced_commit`                       | `fc3a0cc` (latest tag `2.9.0`), `sync_count: 7`, `2026-10-13` |
| Newest upstream commit verified via GitHub | `fc3a0cc` (2026-10-12, merge of PR #2050)                     |

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

## 2026-10-13: Folder switcher hover alignment (#2050)

- Upstream: [ant-design/x#2050](https://github.com/ant-design/x/pull/2050),
  commit `fc3a0cc7f35993dbb1ea3f792e4ba978a7294ed1`; downstream tracking
  issue: [#240](https://github.com/antdv-next/x/issues/240).
- Repro: hover a Folder directory's expand/collapse switcher. The 10px
  background pseudo-element is not vertically centered with the icon.
- Ground truth: an absolutely positioned pseudo-element with `top: 50%`
  and `transform: translateY(-50%)` centers its own height within the switcher.
- Upstream adds these declarations in `style/index.tsx`; downstream ports
  them unchanged into `packages/x/components/folder/style/folder.ts`, where
  the equivalent style generator lives. There is no behavioral divergence.
- Landing branch: `sync/ant-design-x-2050`. The style fix and cursor advance
  are included together so merging the PR advances the cursor atomically.
- Coverage: existing `packages/x/components/folder/__tests__/index.test.tsx`
  and the workspace unit suite. No new CSS-value assertion was added for
  this two-declaration visual fix (upstream also has no new test).
- Decision: GitHub's comparison from `8b76d6a` to `fc3a0cc` contains exactly
  this one commit; advance the cursor to `fc3a0cc`, retain latest tag `2.9.0`,
  and increment `sync_count` to 7. The local-clone caveat above remains a
  historical limitation; this sync verifies the upstream range via GitHub.

## 2026-10-13: Browser repro supersedes the exact #2050 port

- Repro: a local-only Folder comparison in `packages/playground`, with both
  hover backgrounds visible, shows that a direct two-line port makes the
  background move upward instead of centering it. The comparison is not
  part of the submitted PR.
- Ground truth: DevTools computed styles show Tree's later
  `.ant-tree .ant-tree-switcher:before` rule wins the equal-specificity
  cascade for width, height and top. Before the port, the background is
  24x24px at top 0; after the direct port it is still 24x24px at top 0,
  but now has `translateY(-50%)`, moving it upward by 12px.
- Upstream adds only top and transform. Downstream also nests the switcher
  selector under `${antCls}-tree` to outrank Tree's own rules regardless of
  insertion order. Computed styles are now 10x10px at top 12px with a -5px
  transform, centered within the 24px switcher.
- Coverage: the local comparison renders two real Folder instances, restoring
  the pre-fix computed styles on the left, with synchronized expansion,
  persistent hover and optional 2x zoom. Browser verification covers the
  actual cascade; the existing Folder unit suite does not measure layout.
- Decision: retain the upstream positioning and add the more specific
  selector downstream. This supersedes the earlier no-divergence entry;
  an exact port is insufficient with the downstream Tree style order.

## 2026-10-17: cursor already at upstream HEAD; 8 open upstream PRs filed as issues

- Verification (GitHub API): `compare fc3a0cc...main` is `identical`
  (`total_commits: 0`), upstream `pushed_at` 2026-10-12 — no merged upstream
  commits since the 2026-10-13 sync. Cursor `fc3a0cc` (`sync_count: 7`) is
  current; `.sync-upstream.json` unchanged.
- Downstream state: the #2050 port is on `main` as `04dd85d` (#241); no
  `sync/*` branches remain locally or on `origin`.
- The 8 **open** (unmerged) upstream PRs were filed as tracking issues
  `#243`–`#250` (label `sync`), each with upstream diff evidence, downstream
  parity check (`file:line`), priority and porting criteria. Port only after
  the upstream PR merges; re-check the diff at merge time.
- PR → issue: #2066→#243, #2068→#244, #2067→#245, #2065→#246, #2055→#247,
  #2049→#248, #2058→#249, #2057→#250.
- Pre-sync findings recorded so the next sync does not re-litigate them:
  - **#2049 is likely N/A**: downstream `Suggestion.tsx` `onContentKeyDown`
    already `stopPropagation`s Space (with `#171` test coverage asserting
    `defaultPrevented === false`). Do not port upstream's
    `display: contents` wrapper on top of it; verify equivalence first.
  - **#2066 is a partial port**: downstream `x-request/index.ts`
    `jsonResponseHandler` already calls `finishRequest()` in the
    `success === false` branch; only the `requestSignal` identity guard is
    missing. Do not double-add the finishRequest call.
  - #2065/#2067 both touch `x-stream` `splitPart`; port them in one branch.

## 2026-10-18: the 5 fix issues ported (upstream PRs still open); #248 closed N/A

**Explicit decision: port now instead of waiting for the upstream PRs to
merge** — the 2026-10-17 entry said the opposite. All 8 upstream PRs were
re-checked that day and were still `OPEN` with unchanged head SHAs, #2049
having been open ~40 days; the fixes are wanted downstream regardless.

| Issue | Upstream PR (head) | Downstream PR (merge commit) | Branch                   |
| ----- | ------------------ | ---------------------------- | ------------------------ |
| #243  | #2066 `9c7f23336b` | #251 (`41d057a`)             | `sync/ant-design-x-2066` |
| #244  | #2068 `9baa2dc4b5` | #252 (`ac9981a`)             | `sync/ant-design-x-2068` |
| #245  | #2067 `2dd4977c4d` | #253 (`9533d55`)             | `sync/ant-design-x-2067` |
| #246  | #2065 `46fe77012b` | #254 (`c63e8e9`)             | `sync/ant-design-x-2065` |
| #247  | #2055 `8eae4ac5fc` | #255 (`d50013f`)             | `sync/ant-design-x-2055` |

- **The cursor deliberately does not move.** `.sync-upstream.json` stays at
  `fc3a0cc` (`sync_count: 7`): these ports come from _unmerged_ upstream PRs,
  so they sit outside the cursor range. When those PRs eventually merge, the
  next sync's `fc3a0cc..HEAD` enumeration **will re-find them** — check
  `git log --grep=<upstream PR number>` on `main` first and skip; do not port
  a second time.
- Supersedes the 2026-10-17 note "#2065/#2067 … port them in one branch": they
  shipped as **two separate PRs** (`#253`, `#254`) per explicit instruction.
  The two still compose — merging all five branches into one tree and running
  `vp run test:unit` gives 72 files / 1072 tests, 0 failures, and `splitPart`
  merges without a conflict.
- `#255` deviates from the upstream diff in two places: `Tokenizer.prototype.url`
  is called inline rather than through a module-level constant (the constant
  trips oxlint `unbound-method` and would lift the `vp check` warning baseline
  from 9 to 10), and `configureCjkAutolinks()` is mounted in **both** the
  constructor and `updateMarkedConfig`, which rebuilds the marked instance — a
  downstream-only method upstream does not have. The link/paragraph renderer
  differences this exposed are recorded in `x-markdown.md` §4.
- **#248 closed as not applicable** (`not planned`), evidence posted on the
  issue: downstream `Suggestion.tsx:186-199` `onContentKeyDown` already
  `stopPropagation`s Space and `:307` mounts it deeper than Cascader's root,
  so `BaseSelect`'s keyboard model never sees the key;
  `__tests__/index.test.tsx:412` and `:628` assert
  `defaultPrevented === false`. Upstream's `display: contents` wrapper would
  double up the handling, so it was not ported.
- **Deferred, then closed 2026-10-19**: #249 (#2058 sender composition
  callbacks) and #250 (#2057 actions custom tooltip). Both add public API, so
  they waited for their upstream PR to merge; both re-checked on 2026-10-18
  and still `OPEN` with unchanged heads. Closed as `not planned` on
  2026-10-19 — see the entry below.
- **Landed 2026-10-19 (merge commits filled in above)**: #251–#255 are all
  merged into `main`. Re-checked the same day: all five upstream PRs are
  **still `OPEN`** (#2055 last pushed 2026-10-01, #2065/#2067/#2068
  2026-10-13, #2066 2026-10-15; no merges, no maintainer response). Until they
  merge or get closed, `main` carries five fixes that exist upstream only as
  open PRs.
- **Merge-time reconciliation rule**: when one of these PRs merges, the
  `fc3a0cc..HEAD` enumeration re-finds it. Diff the upstream _merge commit_
  against the downstream landing commit above — not against the open-PR head —
  and reconcile by hand. #255 already deviates in two documented places, so a
  blind re-port would revert downstream-only fixes.

## 2026-10-19: #249/#250 closed not planned (upstream PRs still open)

- Both tracking issues closed as `not planned` with the reason posted on each:
  upstream [#2058](https://github.com/ant-design/x/pull/2058) and
  [#2057](https://github.com/ant-design/x/pull/2057) are still `OPEN` a month
  after filing (last upstream activity 2026-09-17/18, no maintainer response,
  unresolved CodeRabbit merge-risk notes on both).
- These two add public API, so the 2026-10-18 rule stands: port only after the
  upstream PR merges. The closure means "not now", not "never" — unlike #248
  (closed N/A on downstream parity evidence), no parity finding exists here.
- Reopen path: when either PR merges, the next sync's `fc3a0cc..HEAD`
  enumeration re-finds it (the cursor deliberately never moved for these);
  re-file a tracking issue then. Do not port from an open PR's head.
- **Why open upstream PRs become tracking issues at all** (asked 2026-10-19):
  the cursor only covers _merged_ upstream commits, so unmerged PRs are
  invisible to the `fc3a0cc..HEAD` enumeration by construction. On 2026-10-17
  the compare came back `identical`, the enumeration pass had nothing to list,
  and the run additionally enumerated upstream's open PRs, filing #243–#250.
  That is the only reason an unmerged PR shows up as a `sync` issue; the issue
  bodies themselves say "合并前不要移植".

## 2026-10-19: #251-#255 reverted (ports from unmerged upstream PRs)

- **Decision: drop the five ports.** #251 (`41d057a`), #252 (`ac9981a`),
  #253 (`9533d55`), #254 (`c63e8e9`) and #255 (`d50013f`) are reverted in one
  commit; `packages/x-sdk` and `packages/x-markdown/src` are byte-identical to
  the pre-port tree (`0b301c256`, verified with `git diff`). The five upstream
  PRs (#2055, #2065-#2068) are all still `OPEN` with unchanged heads, and
  carrying upstream-unmerged fixes on `main` was judged the worse trade: the
  fork has to be reconciled by hand at merge time (#255 already deviated in
  two places) and upstream may still rework or close the PRs.
- Supersedes the 2026-10-18 "port now instead of waiting" decision and its
  merge-time reconciliation rule; the 2026-10-17 rule (port only after the
  upstream PR merges) is the standing policy again.
- No downstream code depended on the ports: the only commits after them on
  `main` were `memory/` updates. Nothing else was reverted.
- `memory/x-markdown.md` §4 is **kept**, not reverted: its three renderer
  differences are pre-existing downstream behaviour (see the edited entry).
  Only the port-specific wording was updated.
- Re-port path: when an upstream PR merges, the `fc3a0cc..HEAD` enumeration
  finds it fresh (the cursor never moved and `main` no longer carries the
  port); port from the merge commit then. `git log --grep=<PR number>` is no
  longer needed as a skip check for these five — they are gone from `main`.
- Companion change: the `cross-repo-pr-sync` skill now forbids enumerating or
  porting unmerged upstream PRs at all (see the next entry).
