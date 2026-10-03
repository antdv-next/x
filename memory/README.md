# Memory

This folder is the project's long-term record of **where this repo
intentionally diverges from its upstream and from marked**, and why. It exists
because the same "bug" keeps getting reported and re-litigated:

- `antdv-next/x` is a port of `ant-design/x` (see `.sync-upstream.json`), and
  parts of the port are _not_ 1:1 on purpose — upstream's approximation has
  real bugs that we fix downstream.
- Reviewers (human or model) diff our behaviour against the real parser
  (marked, DOMPurify, the browser). They keep finding cases where we decline to
  do something, which looks like a bug but is a deliberate, documented decision.

It is **not** user documentation. It is the memory that keeps settled
decisions settled.

## Rules

1. **Read before you change.** Before touching the areas below, read the
   matching file here, and check that your change does not undo a decision
   recorded in it.
2. **Write it down.** When a review, a bug report or a sync surfaces a new
   divergence, append it to the matching file: date, repro, what the real
   parser does (ground truth), what upstream does, what we do, the covering
   test, and why. Never delete a decision — if it changes, add a dated entry
   that supersedes it.
3. **Prefer "refuse" over "guess".** For the streaming splitter the invariant
   is `sectioned render ≡ whole-document render`; a case where we place _no_
   boundary is always safe, a wrong boundary is not. See
   `x-markdown-streaming-sections.md`.
4. **Do not re-derive a parser.** If a decision needs to know what markdown
   means, ask marked. Hand-written models of its grammar are what created this
   folder in the first place.

## Index

| File                                                                     | Covers                                                                                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`x-markdown-streaming-sections.md`](./x-markdown-streaming-sections.md) | `streaming.incremental` section boundaries: the contract, our divergences from `ant-design/x`, upstream bugs we fix, remaining limits               |
| [`x-markdown-latex.md`](./x-markdown-latex.md)                           | The bundled LaTeX plugin and `$` / `$$` / `\[` handling: which upstream fixes are synced, which were missed, how the splitter treats math           |
| [`upstream-sync.md`](./upstream-sync.md)                                 | Sync state: the `.sync-upstream.json` cursor, every ported upstream PR and where it landed, open `sync/*` branches, and what to record after a sync |
