<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp run test:unit` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Clipboard callback boundary

`Sender` clipboard callbacks (`onPaste`, `onCopy`, and `onCut`) are escape
hatches for application-owned edge cases. They expose the native
`ClipboardEvent` and selection context, but the framework must not interpret
callback return values or provide a return-value protocol for replacing text,
rewriting clipboard payloads, or restoring structured slots. Consumers that
take over an operation must call `event.preventDefault()` and update their
controlled state or clipboard data themselves.

The framework remains responsible for routing these callbacks from every
built-in editing surface, honoring `event.preventDefault()`, providing correct
selection information, and enforcing `disabled` and `readOnly` invariants.

## Memory: read the history before changing ported behaviour

`memory/` is the project's record of where this repo deliberately diverges from
its upstream (`ant-design/x`) and from the real parser (marked, DOMPurify, the
browser), and why. It is what stops settled decisions from being re-litigated
as bugs by the next review.

Rules:

- **Every task: read `memory/README.md` first** (it is short and lists what is
  covered). **Before** changing an area a memory file covers — currently
  `packages/x-markdown` streaming / `incremental` behaviour and the LaTeX
  plugin / `$` / math handling — read that file too.
- **After** a review, bug report or sync surfaces a new divergence, append it
  to the matching `memory/` file: date, repro, ground truth, upstream
  behaviour, our behaviour, covering test, and the decision. Supersede entries
  with a new dated entry; never delete them.
- **Every upstream sync**: start from `memory/upstream-sync.md` (cursor, what
  each `sync/*` branch holds, and how to record the outcome), and update it in
  the same PR that advances `.sync-upstream.json`.
- When a `memory/` entry says a case is deliberate, a review finding about it is
  **not** a bug. Check the entry (and, for the splitter, whether the
  whole-document render keeps that line inside an open block) before reporting.
- Do not re-add a hand-written model of marked's block grammar to make a single
  input split again, and do not "align" a documented divergence back to
  upstream without first reading why it exists.

Further reading: `.sync-upstream.json` for the sync cursor and package mapping,
the `DESIGN CONTRACT` comment above `trackSectionBoundary` in
`packages/x-markdown/src/XMarkdown/composables/useStreaming.ts` for the
splitter's contract, and
`packages/x-markdown/src/XMarkdown/__tests__/incremental.test.ts` (whose "does
not split" assertions are the specification).
