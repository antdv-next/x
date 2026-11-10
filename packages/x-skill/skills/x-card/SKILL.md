---
name: x-card
version: 0.0.3
description: Use when rendering A2UI dynamic cards with @antdv-next/x-card — covers XCardBox, XCardCard, A2UI v0.8/v0.9 commands, data binding, action events, component catalogs, and custom component contracts.
---

# 🎯 Skill Positioning

**This skill covers `@antdv-next/x-card`** — a dynamic card renderer based on the [A2UI protocol](https://a2ui.org/concepts/data-flow/). An AI Agent sends structured JSON commands (create a surface, define components, update data), and the runtime renders them with **your registered Vue components**.

It is **not** a static card component. Use it when the UI structure itself is generated or streamed from an Agent.

> **Prerequisite**: For ordinary chat UI (bubbles, sender, message list), use the `x-components` skill. This skill only covers the A2UI layer.

## Table of Contents

- [📦 Package Overview](#-package-overview)
- [🧠 Mental Model](#-mental-model)
- [🚀 Quick Start](#-quick-start)
- [🗂️ Reference Guide](#️-reference-guide)
- [🚨 Development Rules](#-development-rules)
- [🤝 Skill Collaboration](#-skill-collaboration)
- [🔗 Reference Resources](#-reference-resources)

# 📦 Package Overview

| Export                                                                                                                 | Kind      | Purpose                                                                                |
| ---------------------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------- |
| `XCardBox`                                                                                                             | component | Container: holds the command queue, loads catalogs, provides context, calls `onAction` |
| `XCardCard`                                                                                                            | component | Renders one Surface; `id` must equal `surfaceId`                                       |
| `registerCatalog`                                                                                                      | function  | Register a catalog object locally                                                      |
| `loadCatalog`                                                                                                          | function  | Load a catalog by id (local registry or remote URL)                                    |
| `clearCatalogCache`                                                                                                    | function  | Clear the catalog cache                                                                |
| `ActionPayload` / `XCardCommand` / `XCardComponent_v09` / `Catalog` / `XCardNode` / `XCardBoxProps` / `XCardCardProps` | types     | TypeScript definitions                                                                 |

```bash
npm install @antdv-next/x-card
```

Peer dependency: Vue `>= 3.5.0`.

# 🧠 Mental Model

```
Agent → A2UI JSON commands → XCardBox (command queue, catalogs)
                                   ↓
                              XCardCard id="surfaceId"
                                   ↓
                        XCardNodeRenderer → your components map
```

1. **Box** receives `commands` and a `components` map. It is the only place that knows the whole command stream.
2. **Card** selects the commands whose `surfaceId` matches its `id`, applies them in order, and renders the root node.
3. **Component map** turns A2UI component names (`"Text"`, `"Button"`, …) into Vue components. Names must start with an uppercase letter and match the commands.
4. **Data model** is per Surface. Props bound with `{ path: "/foo" }` resolve reactively; `updateDataModel` re-renders only what changed.
5. **Actions** flow from your components back through `onAction` on the Box.

# 🚀 Quick Start

```vue
<script setup lang="tsx">
import { defineComponent, ref } from "vue";
import { XCardBox, XCardCard } from "@antdv-next/x-card";
import type { ActionPayload, XCardCommand } from "@antdv-next/x-card";

const Text = defineComponent({
  name: "DemoText",
  props: { text: { type: String, default: "" } },
  setup: props => () => <div>{props.text}</div>,
});

const components = { Text };

const commands = ref<XCardCommand[]>([
  {
    version: "v0.9",
    createSurface: { surfaceId: "demo" },
  },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "demo",
      components: [{ id: "root", component: "Text", text: "Hello XCard" }],
    },
  },
  {
    version: "v0.9",
    updateDataModel: {
      surfaceId: "demo",
      path: "/status",
      value: "ready",
    },
  },
]);

function handleAction(payload: ActionPayload) {
  console.log(payload.name, payload.context);
}
</script>

<template>
  <XCardBox
    :commands="commands"
    :components="components"
    :on-action="handleAction"
  >
    <XCardCard id="demo" />
  </XCardBox>
</template>
```

# 🗂️ Reference Guide

| If you need to...                                                | Read first                                   |
| ---------------------------------------------------------------- | -------------------------------------------- |
| Understand A2UI, when to use x-card, v0.8 vs v0.9                | [INTRODUCTION.md](reference/INTRODUCTION.md) |
| Build a page, wire Box + Card, stream commands                   | [USAGE.md](reference/USAGE.md)               |
| Look up a command field (`createSurface`, `updateComponents`, …) | [COMMANDS.md](reference/COMMANDS.md)         |
| Bind props to state, two-way input, nested paths                 | [DATA_BINDING.md](reference/DATA_BINDING.md) |
| Handle button/field actions and write data back                  | [ACTIONS.md](reference/ACTIONS.md)           |
| Register catalogs and validate components                        | [CATALOG.md](reference/CATALOG.md)           |
| Exact props, types, and exports                                  | [API.md](reference/API.md)                   |

# 🚨 Development Rules

- **`XCardBox` must wrap every `XCardCard`** — the Card injects the Box context; rendering it outside the Box renders nothing.
- **`XCardCard`'s `id` must equal the `surfaceId`** used in the commands. One Card per Surface; multiple Cards can share one Box.
- **Component names must start with an uppercase letter and match the command names exactly.** Register them in the `components` map; unregistered names log a warning and render nothing.
- **Append commands; do not rebuild the array in place with a shorter one.** The Box processes only newly appended commands and resets its cursor only when the length shrinks. Replacing the array does **not** reset a Card's component registry or data model — send `deleteSurface` or remount the Box for that. Push to a reactive array for streaming.
- **Commands from both versions may appear in one stream, but the protocol version is tracked per Card/Surface.** The last version-bearing command (or a v0.8 command) wins for that Surface; do not mix versions for one Surface. Mixing v0.8 and v0.9 across different Surfaces is safe. Do not mix component formats within one `updateComponents` / `surfaceUpdate` call.
- **Use `{ path: "/foo" }` for dynamic props.** In v0.9, any bare string starting with `/` is also treated as a path — keep URL-like or slash-prefixed literals (`"/search"`) outside the data model or bind them through the model.
- **Actions are two-part**: `action.event.context` declares write-back targets (`{ key: { path } }`), and the component calls `onAction(name, context)` with the values. The runtime writes those values into the data model, then calls the Box's `onAction` with **the component-supplied context**, not a full data-model snapshot.
- **Prefer `registerCatalog` over remote catalogs in production.** Remote catalogs fetched from an Agent-controlled URL are untrusted input; use `local://` ids for shipped schemas.
- **Do not look for `validateComponent`** — the package exports only `registerCatalog`, `loadCatalog`, and `clearCatalogCache`. Validation runs internally when a catalog is present and only logs warnings.

# 🤝 Skill Collaboration

| Scenario                                     | Skill combination                                              |
| -------------------------------------------- | -------------------------------------------------------------- |
| Render a structured card inside a chat reply | `use-x-chat` + `x-components` (Bubble content slot) + `x-card` |
| Agent-generated forms / booking flows        | `x-card` + `x-chat-provider` (stream commands over SSE)        |
| Plain conversation UI only                   | `x-components`                                                 |
| Markdown inside a custom card component      | `x-card` + `x-markdown`                                        |

# 🔗 Reference Resources

- [INTRODUCTION.md](reference/INTRODUCTION.md) — A2UI concepts, architecture, protocol versions
- [USAGE.md](reference/USAGE.md) — installation, Box/Card wiring, streaming, multi-card
- [COMMANDS.md](reference/COMMANDS.md) — v0.9 and v0.8 command reference
- [DATA_BINDING.md](reference/DATA_BINDING.md) — paths, literals, two-way binding
- [ACTIONS.md](reference/ACTIONS.md) — action contract and write-back
- [CATALOG.md](reference/CATALOG.md) — catalogs and validation
- [API.md](reference/API.md) — component props and exported types

## Official Documentation

- [x-card Introduction](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/card/index.en-US.md)
- [A2UI v0.9](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/card/a2ui-v09.en-US.md)
- [A2UI v0.8](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/card/a2ui-v08.en-US.md)
