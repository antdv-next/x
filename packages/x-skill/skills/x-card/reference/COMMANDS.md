# Command Reference

Every command is one JSON object. The runtime inspects its keys; commands can be interleaved and appended over time. `version` is only present on v0.9 commands — its absence marks a v0.8 command.

```ts
import type { XCardCommand } from "@antdv-next/x-card";
```

## v0.9 Commands (recommended)

### createSurface

Creates a Surface and optionally associates a catalog.

```ts
{
  version: "v0.9",
  createSurface: {
    surfaceId: "booking",
    catalogId: "local://booking-catalog.json", // optional
  },
}
```

| Field       | Type     | Required | Notes                                   |
| ----------- | -------- | -------- | --------------------------------------- |
| `surfaceId` | `string` | yes      | Must match `XCardCard id`               |
| `catalogId` | `string` | no       | Registered id or URL; loaded by the Box |

The command is processed by the Box (catalog loading and surface→catalog mapping). A Card does not need it to render.

### updateComponents

Defines or updates nodes using an adjacency list.

```ts
{
  version: "v0.9",
  updateComponents: {
    surfaceId: "booking",
    components: [
      { id: "root", component: "Column", children: ["title", "submit"] },
      { id: "title", component: "Text", text: "Confirm Reservation" },
      {
        id: "submit",
        component: "Button",
        label: "Confirm",
        action: { event: { name: "confirm", context: { guests: { path: "/guests" } } } },
      },
    ],
  },
}
```

| Field        | Type                   | Required | Notes                                      |
| ------------ | ---------------------- | -------- | ------------------------------------------ |
| `surfaceId`  | `string`               | yes      | Target Surface                             |
| `components` | `XCardComponent_v09[]` | yes      | Flat list; each needs `id` and `component` |

Component shape:

```ts
interface XCardComponent_v09 {
  id: string;
  component: string; // registered component name
  child?: string; // single child id
  children?: string[]; // multiple child ids
  [key: string]: any; // resolved props (literal or { path })
}
```

Semantics:

- Components are **merged by `id`**: an update with the same `id` replaces that node; omitted ids stay in the registry.
- The root rendered is always `id: "root"`.
- A component can be referenced by several parents; a child id that does not exist is skipped.
- Props are resolved before rendering; see [DATA_BINDING.md](DATA_BINDING.md).

### updateDataModel

Writes a value at a JSON Pointer path.

```ts
{
  version: "v0.9",
  updateDataModel: {
    surfaceId: "booking",
    path: "/reservation/guests",
    value: 3,
  },
}
```

| Field       | Type     | Required | Notes                                               |
| ----------- | -------- | -------- | --------------------------------------------------- |
| `surfaceId` | `string` | yes      | Target Surface                                      |
| `path`      | `string` | yes      | `/`-prefixed path; intermediate objects are created |
| `value`     | `any`    | yes      | New value (object, array, primitive)                |

Prefer fine-grained paths: `path: "/reservation/guests"` re-renders less than replacing `/reservation`.

### deleteSurface

Removes the Surface, its component registry, and its data model.

```ts
{ version: "v0.9", deleteSurface: { surfaceId: "booking" } }
```

The Card clears its tree and data model; the Box also drops the surface→catalog association. A later `createSurface` + `updateComponents` starts fresh.

## v0.8 Commands (legacy compatibility)

### surfaceUpdate

v0.8 has no explicit createSurface: the first `surfaceUpdate` implicitly creates the Surface. Component props are nested under the component type name.

```ts
{
  surfaceUpdate: {
    surfaceId: "booking",
    components: [
      {
        id: "root",
        component: {
          Column: { children: { explicitList: ["title"] } },
        },
      },
      {
        id: "title",
        component: {
          Text: { text: { literalString: "Confirm Reservation" } },
        },
      },
    ],
  },
}
```

Component shape:

```ts
interface XCardComponent_v08 {
  id: string;
  component: {
    [componentType: string]: {
      child?: string;
      children?: string[] | { explicitList: string[] };
      [key: string]: any;
    };
  };
}
```

Children may be `{ explicitList: [...] }` or a plain array.

### dataModelUpdate

v0.8 data values are encoded as strings.

```ts
{
  dataModelUpdate: {
    surfaceId: "booking",
    contents: [
      { key: "guests", valueString: "3" },
      {
        key: "guest",
        valueMap: [
          { key: "name", valueString: "Alice" },
          { key: "email", valueString: "alice@example.com" },
        ],
      },
    ],
  },
}
```

| Field                    | Type                     | Required | Notes                           |
| ------------------------ | ------------------------ | -------- | ------------------------------- |
| `contents[].key`         | `string`                 | yes      | Top-level key in the data model |
| `contents[].valueString` | `string`                 | one of   | Written as a string             |
| `contents[].valueMap`    | `{ key, valueString }[]` | one of   | Written as a flat object        |

Only top-level keys are supported by this encoding; use `updateDataModel` (v0.9) for nested paths.

### beginRendering

Selects the root component to render.

```ts
{ beginRendering: { surfaceId: "booking", root: "root" } }
```

If `beginRendering` arrives before the root exists, the Card stores it as pending and renders once `surfaceUpdate` provides that id.

## Mixed streams

```ts
const commands: XCardCommand[] = [
  // v0.8 legacy card
  { surfaceUpdate: { surfaceId: "legacy", components: [/* v0.8 nodes */] } },
  { beginRendering: { surfaceId: "legacy", root: "root" } },

  // v0.9 card in the same stream
  { version: "v0.9", createSurface: { surfaceId: "modern" } },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "modern", components: [/* v0.9 nodes */] },
  },
];
```

The runtime tracks the protocol version per Card: the last version-bearing command wins for that Surface. Do not mix component shapes inside one `surfaceUpdate` or `updateComponents`.
