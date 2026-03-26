# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Antdv X is a Vue 3 component library for AI interfaces, porting [Ant Design X (React)](https://github.com/ant-design/x) to Vue 3 using TSX and Composition API. Built with Vite+ unified toolchain.

**Requirements:** Node >=22.18.0, pnpm (managed by Vite+)

## Workspace Structure

```
antdv-x/
├── packages/x/              # @antdv-next/x — Main AI component library (bubble, sender, welcome, think...)
├── packages/x-markdown/     # @antdv-next/x-markdown — Markdown renderer (streaming, KaTeX, Mermaid, code highlight)
├── packages/x-sdk/          # @antdv-next/x-sdk — SDK layer (useXChat, useXConversations, XRequest, XStream, ChatProviders)
├── packages/x-skill/        # @antdv-next/x-skill — Skill components
└── packages/docs/            # @antdv-next/docs — Documentation site (Vite+)
```

## Toolchain: Vite+

This project uses **Vite+** (`vp` CLI) instead of Turbo. See `AGENTS.md` for full command reference.

**Key commands:**

```bash
pnpm docs:dev          # Start docs dev server
pnpm test:unit         # Run Vitest tests
pnpm type-check        # TypeScript check (excludes docs)
pnpm build:x           # Build @antdv-next/x only
pnpm build             # Build all packages (excludes docs)
```

**IMPORTANT:** Use `vp` commands (not raw pnpm/vitest) — see AGENTS.md pitfalls section.

## Component Conventions

@AGENTS.md <!-- Vite+ toolchain commands and pitfalls -->

Same conventions as antdv-next:

- `defineComponent<Props, Emits, string, SlotsType<Slots>>(...)`
- No `on*` props → all events through `emits`
- Slot > prop > null (via `getSlotPropFnRun`)
- Class prefix: `ant-*` / `antd-*`

## Upstream Reference

`../upstream/ant-design-x/` contains the React upstream (shallow clone, read-only).

- Compare implementations by reading local files directly
- Update: `cd ../upstream/ant-design-x && git pull`

## Git Setup

- **origin**: `antdv-next/x` (direct push, maintainer permission)
- **fork**: `shiqkuangsan/x` (legacy fork, kept as reference)

## Commit Conventions

Same as antdv-next — conventional commits enforced by Vite+ hooks:

- `feat:`, `fix:`, `docs:`, `dx:`, `style:`, `refactor:`, `perf:`, `test:`, `workflow:`, `build:`, `ci:`, `chore:`, `types:`, `wip:`, `release:`
- Example: `feat(bubble): add streaming animation`

**Important:**

- Commit messages must NOT contain AI-generated signatures (e.g., `Co-Authored-By: Claude`, `Generated with` etc.)
- `.claude/`, `CLAUDE.md`, `*.skill` files are gitignored and must NOT be committed

## Testing

- Framework: Vitest with jsdom environment
- Run: `pnpm test:unit`
- Test files: `packages/*/tests/*.test.ts(x)`
