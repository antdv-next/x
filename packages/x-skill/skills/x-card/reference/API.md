# API Reference

All types are exported from `@antdv-next/x-card`.

## Components

### XCardBox

Container for one or more Cards. Owns the command queue, loads catalogs, and routes actions.

| Prop         | Type                               | Default | Description                                    |
| ------------ | ---------------------------------- | ------- | ---------------------------------------------- |
| `commands`   | `XCardCommand[]`                   | `[]`    | Command stream; append new commands reactively |
| `components` | `Record<string, Component>`        | `{}`    | A2UI component name → Vue component            |
| `onAction`   | `(payload: ActionPayload) => void` | —       | Called when any Card emits an action           |

Slots: default — put `XCardCard` instances (or any layout) here.

### XCardCard

Renders one Surface.

| Prop | Type     | Default      | Description                                    |
| ---- | -------- | ------------ | ---------------------------------------------- |
| `id` | `string` | — (required) | Surface id; must match `surfaceId` in commands |

No slots. Renders nothing until a root component exists.

### Default export

The default export is `XCardCard` with a `Box` property:

```ts
import XCard from "@antdv-next/x-card";

// <XCard.Box :commands="commands"><XCard id="demo" /></XCard.Box>
```

Prefer the named exports (`XCardBox`, `XCardCard`) for clarity.

## ActionPayload

```ts
interface ActionPayload {
  name: string;
  surfaceId: string;
  context: Record<string, any>;
  actionConfig?: any;
}
```

| Field          | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `name`         | Event name declared in the command                                                                |
| `surfaceId`    | Card id that emitted the action                                                                   |
| `context`      | Values supplied by the component in `onAction(name, context)`; **not** a full data-model snapshot |
| `actionConfig` | The resolved `action` object from the command                                                     |

## Custom component contract

The renderer injects two callbacks into every rendered component:

| Prop           | Type                                                   | Description                                                                        |
| -------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `onAction`     | `(name: string, context: Record<string, any>) => void` | Report an interaction; the runtime writes declared paths and calls the Box handler |
| `onDataChange` | `(path: string, value: any) => void`                   | Write a value into the Surface data model                                          |

Every other prop comes from the command, resolved against the data model. In v0.9 the action object reaches the component as `props.action.event`; in v0.8 as `props.action` with a `context` array.

`child` / `children` are removed from props and passed as the **default slot** (`<Component {...props}>{children}</Component>`). Container components must render `slots.default?.()`.

## Command types

```ts
type XCardCommand =
  | CreateSurfaceCommand
  | UpdateComponentsCommand
  | UpdateDataModelCommand
  | DeleteSurfaceCommand
  | SurfaceUpdateCommand
  | DataModelUpdateCommand
  | BeginRenderingCommand;
```

The protocol version is tracked per Surface/Card: the last version-bearing command (or v0.8 command) determines prop and action resolution for that Surface.

### v0.9

```ts
interface CreateSurfaceCommand {
  version?: "v0.9";
  createSurface: { surfaceId: string; catalogId?: string };
}

interface UpdateComponentsCommand {
  version?: "v0.9";
  updateComponents: { surfaceId: string; components: XCardComponent_v09[] };
}

interface UpdateDataModelCommand {
  version?: "v0.9";
  updateDataModel: { surfaceId: string; path: string; value: any };
}

interface DeleteSurfaceCommand {
  version?: "v0.9";
  deleteSurface: { surfaceId: string };
}
```

### v0.8

```ts
interface SurfaceUpdateCommand {
  surfaceUpdate: { surfaceId: string; components: XCardComponent_v08[] };
}

interface DataModelUpdateCommand {
  dataModelUpdate: {
    surfaceId: string;
    contents: Array<{
      key: string;
      valueString?: string;
      valueMap?: Array<{ key: string; valueString: string }>;
    }>;
  };
}

interface BeginRenderingCommand {
  beginRendering: { surfaceId: string; root: string };
}
```

## Component types

```ts
interface XCardComponent_v09 {
  id: string;
  component: string;
  child?: string;
  children?: string[];
  [key: string]: any;
}

interface XCardComponent_v08 {
  id: string;
  component: {
    [componentType: string]: {
      child?: string;
      children?: string[] | ExplicitList;
      [key: string]: any;
    };
  };
}

interface ExplicitList {
  explicitList: string[];
}

interface XCardNode {
  type: string;
  props: Record<string, any>;
  children?: string[];
}

interface PathValue {
  path: string;
}

interface LiteralStringValue {
  literalString: string;
}
```

## Catalog

```ts
interface Catalog {
  $schema?: string;
  $id?: string;
  title?: string;
  description?: string;
  catalogId?: string;
  components?: Record<string, CatalogComponent>;
  functions?: Record<string, any>;
  $defs?: Record<string, any>;
}

interface CatalogComponent {
  type: "object";
  allOf?: any[];
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}
```

### Functions

| Function            | Signature                                 | Description                                                    |
| ------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `registerCatalog`   | `(catalog: Catalog) => void`              | Cache a catalog by `$id` (or `catalogId`); no-op without an id |
| `loadCatalog`       | `(catalogId: string) => Promise<Catalog>` | Cache → `local://` empty catalog → remote fetch                |
| `clearCatalogCache` | `() => void`                              | Clear all cached catalogs                                      |

There is no public validation function; validation runs internally during rendering when a catalog is associated with the Surface.

## Exports

```ts
export { Box as XCardBox, Card as XCardCard };
export { clearCatalogCache, loadCatalog, registerCatalog };
export type {
  ActionPayload,
  XCardBoxProps,
  XCardCardProps,
  Catalog,
  XCardCommand,
  XCardComponent_v09,
  XCardNode,
};
export default XCardWithSub;
```

`XCardComponent_v08`, the individual command interfaces, and `PathValue` are internal runtime types and are **not** re-exported from the package entry. Construct v0.8 commands structurally; TypeScript checks them through the `XCardCommand` union.
