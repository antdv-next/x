# Usage

## Install

```bash
npm install @antdv-next/x-card
```

Peer dependency: Vue `>= 3.5.0`.

## Minimal setup

Three things are required:

1. a **components map** (A2UI name → Vue component),
2. a **command array** (`XCardCommand[]`),
3. `XCardBox` wrapping `XCardCard` with a matching `id`.

```vue
<script setup lang="tsx">
import { defineComponent, ref } from "vue";
import { XCardBox, XCardCard } from "@antdv-next/x-card";
import type { XCardCommand } from "@antdv-next/x-card";

const Text = defineComponent({
  name: "DemoText",
  props: { text: { type: String, default: "" } },
  setup: props => () => <div>{props.text}</div>,
});

const components = { Text };

const commands = ref<XCardCommand[]>([
  { version: "v0.9", createSurface: { surfaceId: "demo" } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "demo",
      components: [{ id: "root", component: "Text", text: "Hello" }],
    },
  },
]);
</script>

<template>
  <XCardBox :commands="commands" :components="components">
    <XCardCard id="demo" />
  </XCardBox>
</template>
```

The root component must have `id: "root"`. Only nodes reachable from the root through `child` / `children` are rendered; unreferenced components are kept in the registry but not displayed.

## Custom component contract

Every custom component receives the resolved A2UI props, two injected callbacks, and its child nodes as the **default slot**:

```ts
interface XCardInjectedProps {
  onAction?: (name: string, context: Record<string, any>) => void;
  onDataChange?: (path: string, value: any) => void;
}
```

- **`onAction(name, context)`** — call it when the user interacts. `name` is the event name from the command's `action`; `context` is the value map the component supplies.
- **`onDataChange(path, value)`** — call it for two-way input binding. It writes `value` at `path` in the Surface data model, and the UI re-renders.
- **`slots.default`** — `child` / `children` are stripped from props and rendered as the default slot. A container component must render `slots.default?.()` or the A2UI tree stops at that node.

Example button component:

```tsx
const SubmitButton = defineComponent({
  name: "SubmitButton",
  props: {
    label: { type: String, default: "Submit" },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props) {
    const handleClick = () => {
      const name = (props.action as any)?.event?.name;
      if (name) props.onAction?.(name, {});
    };
    return () => <button onClick={handleClick}>{props.label}</button>;
  },
});
```

> v0.8 components read `props.action?.name`, v0.9 components read `props.action?.event?.name`. Write components for the protocol version you feed them.

## Streaming commands

Keep the command array reactive and **append** commands as they arrive:

```ts
const commands = ref<XCardCommand[]>([]);

function onCommand(cmd: XCardCommand) {
  commands.value.push(cmd);
}
```

The Box processes only newly appended commands; a full replay is not needed. The Card re-applies its own commands when the queue grows, which is what makes progressive rendering work.

> Replacing the array with a **shorter** one resets the Box's internal cursor. Replacing it with a same-length array is not observed — always append or change the length. Neither resets a Card: its component registry and data model persist until `deleteSurface` or a remount.

Typical SSE flow:

```ts
const source = new EventSource("/api/a2ui");
source.onmessage = event => {
  commands.value.push(JSON.parse(event.data));
};
```

## Multiple surfaces in one Box

```vue
<XCardBox :commands="commands" :components="components" :on-action="onAction">
  <XCardCard id="cart" />
  <XCardCard id="recommendations" />
</XCardBox>
```

Commands for each Surface can interleave; each Card filters on `surfaceId`. `createSurface` is optional for rendering — v0.9 Cards render as soon as `updateComponents` arrives — but it is required to associate a `catalogId`.

## Replacing or deleting a Surface

```ts
// Remove the Surface: tree and data model are cleared.
commands.value.push({ version: "v0.9", deleteSurface: { surfaceId: "cart" } });

// Recreate it later.
commands.value.push(
  { version: "v0.9", createSurface: { surfaceId: "cart" } },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "cart", components: [/* ... */] },
  },
);
```

## Embedding in a chat message

Render the card inside a Bubble content slot so the Agent can respond with structured UI:

```vue
<Bubble placement="start" content="">
  <template #content>
    <XCardBox :commands="cardCommands" :components="cardComponents" :on-action="sendAction">
      <XCardCard id="booking" />
    </XCardBox>
  </template>
</Bubble>
```

`sendAction` can forward the payload back through `useXChat` / your provider so the Agent continues the flow.

## Using a catalog

Register the catalog before commands arrive, then reference it in `createSurface`:

```ts
import { registerCatalog } from "@antdv-next/x-card";

import catalog from "./catalog.json";

registerCatalog(catalog);
```

```ts
{ version: "v0.9", createSurface: { surfaceId: "booking", catalogId: "local://booking-catalog.json" } }
```

See [CATALOG.md](CATALOG.md) for schema details and validation behaviour.

## Common mistakes

| Symptom                                   | Cause                                                   | Fix                                                             |
| ----------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Nothing renders                           | `XCardCard` outside `XCardBox`                          | Wrap it in the Box                                              |
| Nothing renders                           | No component with `id: "root"`                          | Make the root component `id: "root"`                            |
| Warning `component "X" is not registered` | Missing entry in the `components` map, or name mismatch | Register it with the exact name                                 |
| Card ignores new commands                 | Mutated the array without changing its length           | Append, or use `.push`                                          |
| Card rendered an old state after reset    | Replaced the command array (does not clear the Card)    | Send `deleteSurface` for the Surface, or remount the Box        |
| Literal text becomes empty                | String starts with `/` and was treated as a path        | Use `{ path }` only for bindings; avoid slash-prefixed literals |
