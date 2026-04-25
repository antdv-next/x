---
group:
  title: A2UI Protocol
  order: 2
title: A2UI v0.9
order: 1
packageName: x-card
---

## Code Example

<!-- prettier-ignore -->
<demo src="./demo/a2ui-v09-basic.vue">Basic</demo>
<demo src="./demo/a2ui-v09-progressive.vue">Progressive</demo>
<demo src="./demo/a2ui-v09-streaming.vue">Streaming</demo>
<demo src="./demo/a2ui-v09-nested-interaction.vue">Nested Interaction</demo>
<demo src="./demo/a2ui-v09-multi-card-sync.vue">Multi Card Sync</demo>
<demo src="./demo/a2ui-v09-filter-search.vue">Filter Search</demo>
<demo src="./demo/a2ui-v09-form-validation.vue">Form Validation</demo>

## API

Common props ref: [Common Props](/docs/vue/common-props)

### BoxProps

Box component serves as a container to manage Card instances and command dispatching.

| Property   | Description                                                                 | Type                             | Default | Version |
| ---------- | --------------------------------------------------------------------------- | -------------------------------- | ------- | ------- |
| children   | Child elements                                                              | VNodeChild                       | -       | -       |
| components | Custom component mapping, component names must start with uppercase letters | Record<string, Component>        | -       | -       |
| commands   | A2UI command object                                                         | XCardCommand                     | -       | -       |
| onAction   | Callback function when action is triggered inside Card                      | (payload: ActionPayload) => void | -       | -       |

### CardProps

Card component is used to render a single Surface.

| Property | Description                                        | Type   | Default | Version |
| -------- | -------------------------------------------------- | ------ | ------- | ------- |
| id       | Surface ID, corresponding to surfaceId in commands | string | -       | -       |

### ActionPayload

Data structure for action events.

| Property  | Description                                    | Type                | Default | Version |
| --------- | ---------------------------------------------- | ------------------- | ------- | ------- |
| name      | Event name                                     | string              | -       | -       |
| surfaceId | The surfaceId that triggered the action        | string              | -       | -       |
| context   | Complete dataModel snapshot of current surface | Record<string, any> | -       | -       |

### A2UICommand_v0_9

Command type for v0.9 version, supporting the following commands:

#### CreateSurfaceCommand

Create a new Surface.

| Property                | Description                               | Type   | Default | Version |
| ----------------------- | ----------------------------------------- | ------ | ------- | ------- |
| version                 | Version number                            | 'v0.9' | -       | -       |
| createSurface.surfaceId | Surface ID                                | string | -       | -       |
| createSurface.catalogId | Component catalog URL or local identifier | string | -       | -       |

#### UpdateComponentsCommand

Update components on a Surface.

| Property                    | Description    | Type                 | Default | Version |
| --------------------------- | -------------- | -------------------- | ------- | ------- |
| version                     | Version number | 'v0.9'               | -       | -       |
| updateComponents.surfaceId  | Surface ID     | string               | -       | -       |
| updateComponents.components | Component list | BaseComponent_v0_9[] | -       | -       |

#### BaseComponent_v0_9

```typescript
interface BaseComponent_v0_9 {
  id: string;
  component: string;
  child?: string;
  children?: string[];
  [key: string]: any | PathValue;
}
```

#### UpdateDataModelCommand

Update data model.

| Property                  | Description    | Type   | Default | Version |
| ------------------------- | -------------- | ------ | ------- | ------- |
| version                   | Version number | 'v0.9' | -       | -       |
| updateDataModel.surfaceId | Surface ID     | string | -       | -       |
| updateDataModel.path      | Data path      | string | -       | -       |
| updateDataModel.value     | Data value     | any    | -       | -       |

#### DeleteSurfaceCommand

Delete a Surface.

| Property                | Description    | Type   | Default | Version |
| ----------------------- | -------------- | ------ | ------- | ------- |
| version                 | Version number | 'v0.9' | -       | -       |
| deleteSurface.surfaceId | Surface ID     | string | -       | -       |

### PathValue

Data binding path object.

```typescript
interface PathValue {
  path: string;
}
```

### Catalog

Component catalog definition.

```typescript
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
```

### CatalogComponent

Component definition in Catalog.

```typescript
interface CatalogComponent {
  type: "object";
  allOf?: any[];
  properties?: Record<string, any>;
  required?: string[];
  [key: string]: any;
}
```

### Catalog Methods

#### registerCatalog

Register a local catalog.

```typescript
registerCatalog(catalog: Catalog): void
```

#### loadCatalog

Load a catalog (supports remote URL or locally registered schema).

```typescript
loadCatalog(catalogId: string): Promise<Catalog>
```

#### validateComponent

Validate whether a component conforms to catalog definition.

```typescript
validateComponent(catalog: Catalog, componentName: string, componentProps: Record<string, any>): boolean
```

#### clearCatalogCache

Clear catalog cache.

```typescript
clearCatalogCache(): void
```
