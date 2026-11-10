# Data Binding

## Per-Surface data model

Each `XCardCard` owns a JSON object:

```json
{
  "user": { "name": "Alice", "email": "alice@example.com" },
  "reservation": { "guests": 2, "datetime": "2025-12-16T19:00:00Z" }
}
```

`updateDataModel` writes into it; path-bound props read from it. Data models are isolated between Surfaces.

## Paths

Paths are `/`-prefixed JSON Pointer-style strings:

| Path                  | Value     |
| --------------------- | --------- |
| `/user/name`          | `"Alice"` |
| `/reservation/guests` | `2`       |

Missing intermediate objects are created on write. Prefer domain-grouped keys (`/user`, `/reservation`) to avoid collisions.

## Literal vs. bound props

```ts
// Literal — static
{ id: "title", component: "Text", text: "Welcome" }

// Bound — re-renders when /user/name changes
{ id: "username", component: "Text", text: { path: "/user/name" } }
```

Binding works for any prop, including nested objects and arrays:

```ts
{
  id: "list",
  component: "ItemList",
  items: { path: "/results" },
  selectedId: { path: "/selection/id" },
}
```

### Bare path strings (v0.9 gotcha)

In v0.9, a **plain string starting with `/` is also treated as a path**. This means:

```ts
{ id: "cmd", component: "Text", text: "/help" } // reads data model at /help, not the literal "/help"
```

If you need a slash-prefixed literal, store it in the data model and bind it:

```ts
// updateDataModel: path "/labels/help", value "/help"
{ id: "cmd", component: "Text", text: { path: "/labels/help" } }
```

v0.8 avoids this with `{ literalString: "/help" }`.

## Two-way binding

Input components write back through `onDataChange`:

```tsx
const TextField = defineComponent({
  name: "TextField",
  props: {
    label: { type: String, default: "" },
    value: { type: String, default: "" },
    path: { type: String, default: undefined }, // optional convenience
    onDataChange: { type: Function, default: undefined },
  },
  setup(props) {
    return () => (
      <label>
        {props.label}
        <input
          value={props.value}
          onInput={(event: Event) => {
            const next = (event.target as HTMLInputElement).value;
            if (props.path) props.onDataChange?.(props.path, next);
          }}
        />
      </label>
    );
  },
});
```

Command:

```ts
{
  id: "name-input",
  component: "TextField",
  label: "Name",
  value: { path: "/form/name" },
  path: "/form/name",
}
```

When the user types, the runtime writes `/form/name`; every other prop bound to that path updates in the same render pass.

> The `path` prop above is a component-level convention, not part of A2UI. A2UI only guarantees that `value` is resolved and `onDataChange` is injected; the component decides which path to write.

## v0.8 encoding

v0.8 data updates only support top-level keys and string values:

```ts
{
  dataModelUpdate: {
    surfaceId: "demo",
    contents: [
      { key: "status", valueString: "ready" },
      { key: "user", valueMap: [{ key: "name", valueString: "Alice" }] },
    ],
  },
}
```

Props use `{ path }` or `{ literalString }`:

```ts
{
  id: "status",
  component: { Text: { text: { path: "/status" } } },
}
```

For nested values, prefer v0.9 `updateDataModel`; the v0.8 encoding cannot express them.

## Practical guidance

- Keep the model shallow and grouped; `updateDataModel` replaces only the addressed branch, but deep paths create intermediate objects.
- Send the smallest update that changes the UI.
- Pre-compute display strings (currency, dates) on the Agent side when possible.
- Avoid paths through array indices — write the whole array with one `updateDataModel` value instead.
- Never put action context paths and prop paths in the same mental bucket: props are **resolved** on render, action contexts are **write-back declarations**. See [ACTIONS.md](ACTIONS.md).
