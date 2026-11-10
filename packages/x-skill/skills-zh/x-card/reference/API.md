# API 参考

所有类型均从 `@antdv-next/x-card` 导出。

## 组件

### XCardBox

一个或多个 Card 的容器。持有指令队列、加载 catalog、路由动作。

| 属性         | 类型                               | 默认值 | 说明                     |
| ------------ | ---------------------------------- | ------ | ------------------------ |
| `commands`   | `XCardCommand[]`                   | `[]`   | 指令流；响应式追加新指令 |
| `components` | `Record<string, Component>`        | `{}`   | A2UI 组件名 → Vue 组件   |
| `onAction`   | `(payload: ActionPayload) => void` | —      | 任意 Card 触发动作时调用 |

插槽：默认 —— 放置 `XCardCard` 实例（或任意布局）。

### XCardCard

渲染单个 Surface。

| 属性 | 类型     | 默认值    | 说明                                        |
| ---- | -------- | --------- | ------------------------------------------- |
| `id` | `string` | —（必填） | Surface id；必须与指令中的 `surfaceId` 一致 |

无插槽。根组件存在前不渲染任何内容。

### 默认导出

默认导出是带 `Box` 属性的 `XCardCard`：

```ts
import XCard from "@antdv-next/x-card";

// <XCard.Box :commands="commands"><XCard id="demo" /></XCard.Box>
```

为清晰起见，优先使用具名导出（`XCardBox`、`XCardCard`）。

## ActionPayload

```ts
interface ActionPayload {
  name: string;
  surfaceId: string;
  context: Record<string, any>;
  actionConfig?: any;
}
```

| 字段           | 说明                                                                  |
| -------------- | --------------------------------------------------------------------- |
| `name`         | 指令中声明的事件名                                                    |
| `surfaceId`    | 发出动作的 Card id                                                    |
| `context`      | 组件在 `onAction(name, context)` 中提供的值；**不是**完整数据模型快照 |
| `actionConfig` | 指令中解析后的 `action` 对象                                          |

## 自定义组件契约

渲染器会向每个被渲染组件注入两个回调：

| 属性           | 类型                                                   | 说明                                          |
| -------------- | ------------------------------------------------------ | --------------------------------------------- |
| `onAction`     | `(name: string, context: Record<string, any>) => void` | 上报交互；运行时写入声明路径并调用 Box 处理器 |
| `onDataChange` | `(path: string, value: any) => void`                   | 把值写入 Surface 数据模型                     |

其他属性均来自指令，并已按数据模型解析。v0.9 中 action 对象以 `props.action.event` 到达组件；v0.8 中为 `props.action`，其 `context` 是数组。

## 指令类型

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

## 组件类型

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

### 函数

| 函数                | 签名                                      | 说明                                                     |
| ------------------- | ----------------------------------------- | -------------------------------------------------------- |
| `registerCatalog`   | `(catalog: Catalog) => void`              | 按 `$id`（或 `catalogId`）缓存 catalog；无 id 时为空操作 |
| `loadCatalog`       | `(catalogId: string) => Promise<Catalog>` | 缓存 → `local://` 空 catalog → 远程 fetch                |
| `clearCatalogCache` | `() => void`                              | 清空所有缓存的 catalog                                   |

没有公开的校验函数；当 Surface 关联 catalog 时，校验在渲染内部执行。

## 导出

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

`XCardComponent_v08`、各指令接口和 `PathValue` 属于内部运行时类型，**不会**从包入口重新导出。v0.8 指令请按结构构造；TypeScript 会通过 `XCardCommand` 联合类型进行检查。
