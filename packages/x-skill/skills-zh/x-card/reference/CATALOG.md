# 组件目录（Catalog）

Catalog 是一个可选 schema，描述 Surface 可以使用哪些组件、需要哪些必填属性。它为 Agent 提供契约，也为运行时提供校验依据。

Catalog 是**可选**的。没有它时，`components` 映射中的每个名称都会渲染；有它时，不合规的组件会打印警告，但仍会渲染。

## 结构

```ts
interface Catalog {
  $schema?: string;
  $id?: string; // 用作注册 id
  title?: string;
  description?: string;
  catalogId?: string; // 注册 id 的兜底字段
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

示例：

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

## 注册与引用

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

`registerCatalog` 优先使用 `catalog.$id`，其次 `catalog.catalogId`。**两者都不存在时，注册会静默失效。**

`createSurface` 必须引用相同的 id。如果引用未注册的 `local://` id，`loadCatalog` 会返回 `{ $id, components: {} }`（不报错）。由于 `components` 是空对象（真值），每个渲染节点都会在 catalog 查找中失败，并打印 `Component "X" is not defined in catalog`。请在使用前注册 catalog，或省略 `catalogId`。

## 加载

`loadCatalog(catalogId)` 按以下顺序解析：

1. 内存缓存；
2. id 以 `local://` 开头 —— 未注册时返回空 catalog（`{ $id, components: {} }`）；
3. 其他情况 `fetch(catalogId)` 并解析 JSON；失败会抛错，并由 Box 记录日志。

当 `createSurface` 携带 `catalogId` 时，远程 catalog 会自动加载。Box 按 id 缓存，并在多个 Surface 之间共享。

```ts
import { clearCatalogCache } from "@antdv-next/x-card";

clearCatalogCache(); // 清空所有缓存的 catalog
```

## 校验行为

当 Surface 关联了 catalog 时，每个渲染节点都会检查：

- 组件名必须存在于 `catalog.components`；
- `required` 中的每个字段必须出现在节点属性中。

失败会产生 `console.warn`，例如：

```
Component "Button" is not defined in catalog
Missing required field "label" for component "Button"
```

校验是**提示性的**：渲染继续；而组件映射缺少条目会独立打印 `XCard component "X" is not registered.` 并且不渲染。

包中没有公开的 `validateComponent` 导出。不要尝试导入；校验内置于渲染过程。

## 推荐做法

- 将 catalog 随包发布（`local://…`），并在推送指令前调用 `registerCatalog`。生产环境避免从 Agent 控制的 URL 拉取 schema。
- catalog 名称、`components` 映射的键、指令中的 `component` 字段三者保持一致。
- 对组件无法渲染的字段使用 `required`；`properties` 仅用于文档说明，运行时只强制 `required`。
- catalog 保持小而聚焦；不同流程可以注册多个 catalog。
