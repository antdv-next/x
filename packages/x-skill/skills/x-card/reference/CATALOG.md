# Component Catalogs

A catalog is an optional schema that describes which components a Surface may use and which props they require. It gives the Agent a contract and gives the runtime something to validate against.

Catalogs are **optional**. Without one, every name in the `components` map renders; with one, invalid components log warnings but still render.

## Structure

```ts
interface Catalog {
  $schema?: string;
  $id?: string; // used as the registration id
  title?: string;
  description?: string;
  catalogId?: string; // fallback registration id
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

Example:

```json
{
  "$id": "local://booking-catalog.json",
  "components": {
    "Text": {
      "type": "object",
      "properties": {
        "text": { "type": "string" },
        "variant": { "enum": ["h1", "h2", "body"] }
      },
      "required": ["text"]
    },
    "Button": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "action": { "type": "object" }
      },
      "required": ["label"]
    },
    "TextField": {
      "type": "object",
      "properties": {
        "label": { "type": "string" },
        "value": { "type": ["string", "object"] }
      }
    }
  }
}
```

## Register and reference it

```ts
import { registerCatalog } from "@antdv-next/x-card";

import catalog from "./booking-catalog.json";

registerCatalog(catalog);
```

```ts
{
  version: "v0.9",
  createSurface: {
    surfaceId: "booking",
    catalogId: "local://booking-catalog.json",
  },
}
```

`registerCatalog` uses `catalog.$id` first, then `catalog.catalogId`. **If neither is present, registration silently does nothing.**

`createSurface` must reference the same id. If it references an unregistered `local://` id, `loadCatalog` returns an empty catalog (no error); validation is then effectively skipped.

## Loading

`loadCatalog(catalogId)` resolves in this order:

1. In-memory cache;
2. If the id starts with `local://` — an empty catalog (`{ $id, components: {} }`) when not registered;
3. Otherwise `fetch(catalogId)` and parse JSON; failures throw and are logged by the Box.

Remote catalogs are loaded automatically when a `createSurface` carries a `catalogId`. The Box caches one catalog per id and shares it across Surfaces.

```ts
import { clearCatalogCache } from "@antdv-next/x-card";

clearCatalogCache(); // drop all cached catalogs
```

## Validation behaviour

When a catalog is associated with a Surface, each rendered node is checked:

- the component name must exist in `catalog.components`;
- every field in `required` must be present in the node props.

Failures produce `console.warn` messages such as:

```
Component "Button" is not defined in catalog
Missing required field "label" for component "Button"
```

Validation is **advisory**: rendering continues, and a missing component map entry independently logs `XCard component "X" is not registered.` and renders nothing.

There is no public `validateComponent` export. Do not import one; validation is internal to rendering.

## Recommended practices

- Ship catalogs locally (`local://…`) and call `registerCatalog` before pushing commands. Avoid fetching schemas from an Agent-controlled URL in production.
- Keep catalog names identical to the keys in your `components` map and to the `component` field in commands.
- Use `required` for fields your component cannot render without; use `properties` for documentation even though only `required` is enforced.
- Keep catalogs small and domain-specific; register several catalogs if you have distinct flows.
