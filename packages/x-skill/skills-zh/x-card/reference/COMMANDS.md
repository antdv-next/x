# 指令参考

每条指令都是一个 JSON 对象。运行时检查其键名；指令可以交错并随时间追加。`version` 只出现在 v0.9 指令上 —— 缺失即表示 v0.8 指令。

```ts
import type { XCardCommand } from "@antdv-next/x-card";
```

## v0.9 指令（推荐）

### createSurface

创建 Surface，并可选关联 catalog。

```ts
{
  version: "v0.9",
  createSurface: {
    surfaceId: "booking",
    catalogId: "local://booking-catalog.json", // 可选
  },
}
```

| 字段        | 类型     | 必填 | 说明                          |
| ----------- | -------- | ---- | ----------------------------- |
| `surfaceId` | `string` | 是   | 必须与 `XCardCard id` 一致    |
| `catalogId` | `string` | 否   | 已注册 id 或 URL；由 Box 加载 |

该指令由 Box 处理（catalog 加载与 surface→catalog 映射）。Card 渲染本身不依赖它。

### updateComponents

使用邻接表定义或更新节点。

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

| 字段         | 类型                   | 必填 | 说明                                   |
| ------------ | ---------------------- | ---- | -------------------------------------- |
| `surfaceId`  | `string`               | 是   | 目标 Surface                           |
| `components` | `XCardComponent_v09[]` | 是   | 扁平列表；每项需要 `id` 与 `component` |

组件结构：

```ts
interface XCardComponent_v09 {
  id: string;
  component: string; // 已注册的组件名
  child?: string; // 单个子节点 id
  children?: string[]; // 多个子节点 id
  [key: string]: any; // 解析后的属性（字面量或 { path }）
}
```

语义：

- 组件按 `id` **合并**：相同 `id` 的更新会替换该节点；未出现的 id 保留在注册表中。
- 始终渲染 `id: "root"` 的组件。
- 一个组件可以被多个父节点引用；不存在的子 id 会被跳过。
- 属性在渲染前解析；见 [DATA_BINDING.md](DATA_BINDING.md)。

### updateDataModel

在 JSON Pointer 路径写入值。

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

| 字段        | 类型     | 必填 | 说明                             |
| ----------- | -------- | ---- | -------------------------------- |
| `surfaceId` | `string` | 是   | 目标 Surface                     |
| `path`      | `string` | 是   | `/` 前缀路径；中间对象会自动创建 |
| `value`     | `any`    | 是   | 新值（对象、数组或原始值）       |

优先使用细粒度路径：`path: "/reservation/guests"` 的重新渲染范围小于替换整个 `/reservation`。

### deleteSurface

移除 Surface、其组件注册表和数据模型。

```ts
{ version: "v0.9", deleteSurface: { surfaceId: "booking" } }
```

Card 清空组件树和数据模型；Box 同时移除 surface→catalog 关联。之后的 `createSurface` + `updateComponents` 会从头开始。

## v0.8 指令（旧版兼容）

### surfaceUpdate

v0.8 没有显式 createSurface：第一个 `surfaceUpdate` 隐式创建 Surface。组件属性嵌套在组件类型名下。

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

组件结构：

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

子节点可以是 `{ explicitList: [...] }` 或普通数组。

### dataModelUpdate

v0.8 数据值以字符串编码。

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

| 字段                     | 类型                     | 必填   | 说明             |
| ------------------------ | ------------------------ | ------ | ---------------- |
| `contents[].key`         | `string`                 | 是     | 数据模型的顶层键 |
| `contents[].valueString` | `string`                 | 二选一 | 作为字符串写入   |
| `contents[].valueMap`    | `{ key, valueString }[]` | 二选一 | 作为扁平对象写入 |

该编码只支持顶层键；嵌套路径请使用 v0.9 的 `updateDataModel`。

### beginRendering

选择要渲染的根组件。

```ts
{ beginRendering: { surfaceId: "booking", root: "root" } }
```

如果 `beginRendering` 在根组件存在之前到达，Card 会将其记为待处理，等 `surfaceUpdate` 提供该 id 后再渲染。

## 混合指令流

```ts
const commands: XCardCommand[] = [
  // v0.8 旧卡片
  { surfaceUpdate: { surfaceId: "legacy", components: [/* v0.8 节点 */] } },
  { beginRendering: { surfaceId: "legacy", root: "root" } },

  // 同一流中的 v0.9 卡片
  { version: "v0.9", createSurface: { surfaceId: "modern" } },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "modern", components: [/* v0.9 节点 */] },
  },
];
```

运行时按 Card 跟踪协议版本：对该 Surface 而言，最后一条带版本信息（或 v0.8）的指令生效。不要在同一个 `surfaceUpdate` 或 `updateComponents` 中混用组件形态。
