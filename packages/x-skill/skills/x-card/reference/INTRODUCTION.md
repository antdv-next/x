# Introduction to x-card and A2UI

## What is A2UI?

A2UI (Agent-to-User Interface) is an open protocol in which an AI Agent describes UI intent as a sequence of declarative JSON messages. A client runtime — here, `@antdv-next/x-card` — interprets those messages and renders them with native Vue components.

Three ideas define it:

1. **Streaming messages** — UI updates arrive as an ordered stream of JSON commands.
2. **Declarative components** — the UI is described as data, not code.
3. **Data binding** — structure is decoupled from state, so data updates re-render reactively.

## Why not let the model generate HTML?

| Concern          | A2UI                                                 | AI-generated HTML                          |
| ---------------- | ---------------------------------------------------- | ------------------------------------------ |
| Security         | Only registered components render; no code execution | Can contain scripts and injection payloads |
| Cross-platform   | One JSON structure per platform runtime              | HTML needs per-platform adaptation         |
| Streaming        | Progressive rendering as commands arrive             | Needs the full document first              |
| LLM friendliness | Flat adjacency list, incremental generation          | Large nested HTML is error-prone           |
| Maintenance      | Components managed centrally in code                 | Every generated page is one-off            |

## Architecture

```
Agent (LLM)
   │  A2UI JSON commands
   ▼
Transport (SSE / WebSocket / A2A / in-memory)
   │
   ▼
XCardBox  ── command queue, catalog loading, action callback
   │
   ▼
XCardCard id="surfaceId"  ── applies matching commands, owns the data model
   │
   ▼
NodeRenderer → components map → your Vue components
```

### Roles

| Piece          | Responsibility                                              |
| -------------- | ----------------------------------------------------------- |
| `XCardBox`     | Receives commands and the component map, dispatches actions |
| `XCardCard`    | One Surface: component tree + data model                    |
| Components map | Maps A2UI type names to Vue components                      |
| Catalog        | Optional schema describing available components             |

## Surfaces

A **Surface** is an isolated UI container with its own component tree and JSON data model. Every command carries a `surfaceId`; a Card renders exactly one Surface. Multiple Cards inside one Box can render different Surfaces, and commands for different Surfaces can interleave in the same stream.

Use a new Surface when:

- rendering a second independent card;
- resetting a card completely (`deleteSurface` then `createSurface` again).

## Protocol Versions

The runtime supports v0.8 and v0.9 in the same command stream. Version is detected per command: a `version: "v0.9"` field means v0.9; its absence means v0.8.

| Feature          | v0.8                                                    | v0.9                                          |
| ---------------- | ------------------------------------------------------- | --------------------------------------------- |
| Version field    | None                                                    | `version: "v0.9"`                             |
| Surface creation | Implicit (`surfaceUpdate`)                              | Explicit `createSurface`                      |
| Component shape  | `component: { Name: { props } }`                        | `component: "Name"` + flat props              |
| Children         | `children: { explicitList }` or array                   | `children: string[]`                          |
| Data update      | `dataModelUpdate.contents` (`valueString` / `valueMap`) | `updateDataModel.path` + `value`              |
| Path binding     | `{ path }` or `{ literalString }`                       | `{ path }` (bare `/...` strings also resolve) |
| Root selection   | `beginRendering.root`                                   | Always `"root"`                               |
| Status           | Legacy compatibility                                    | **Recommended**                               |

Do not mix formats inside a single update call: one `updateComponents` must contain v0.9-shaped components, and one `surfaceUpdate` must contain v0.8-shaped components.

## What the package gives you

- A streaming-friendly command pipeline (`XCardBox` → `XCardCard`).
- A per-Surface data model with JSON Pointer-style path binding.
- Two-way binding: custom components receive `onDataChange(path, value)`.
- Action routing: custom components receive `onAction(name, context)`; the runtime can write returned values back into the data model.
- Optional catalog validation: required-field checks with console warnings.

## When to use x-card

- Agent-generated forms, booking flows, checkout panels.
- Dynamic lists, filters, and search results with live state.
- Workflow stages where the next UI is decided by the Agent.
- Interactive cards embedded in a chat message.

## When not to use it

- Static pages and ordinary chat UI — use `@antdv-next/x` components directly.
- Rendering arbitrary HTML produced by a model — this package deliberately does not do that.

## Next steps

- [USAGE.md](USAGE.md) — wire a working page.
- [COMMANDS.md](COMMANDS.md) — the full command reference.
- [DATA_BINDING.md](DATA_BINDING.md) — bind state to props.
- [ACTIONS.md](ACTIONS.md) — handle interactions.
- [CATALOG.md](CATALOG.md) — constrain component schemas.
