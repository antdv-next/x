# 数据绑定

## 按 Surface 隔离的数据模型

每个 `XCardCard` 拥有一个 JSON 对象：

```json
{
  "user": { "name": "Alice", "email": "alice@example.com" },
  "reservation": { "guests": 2, "datetime": "2025-12-16T19:00:00Z" }
}
```

`updateDataModel` 写入其中；路径绑定的属性从中读取。不同 Surface 的数据模型互相隔离。

## 路径

路径是以 `/` 开头的 JSON Pointer 风格字符串：

| 路径                  | 值        |
| --------------------- | --------- |
| `/user/name`          | `"Alice"` |
| `/reservation/guests` | `2`       |

写入时会自动创建缺失的中间对象。建议按领域分组（`/user`、`/reservation`）以避免命名冲突。

## 字面量与绑定属性

```ts
// 字面量 —— 静态
{ id: "title", component: "Text", text: "Welcome" }

// 绑定 —— /user/name 变化时重新渲染
{ id: "username", component: "Text", text: { path: "/user/name" } }
```

任何属性都可以绑定，包括嵌套对象和数组：

```ts
{
  id: "list",
  component: "ItemList",
  items: { path: "/results" },
  selectedId: { path: "/selection/id" },
}
```

### 裸路径字符串（v0.9 注意事项）

在 v0.9 中，**以 `/` 开头的普通字符串也会被当作路径**。这意味着：

```ts
{ id: "cmd", component: "Text", text: "/help" } // 读取数据模型 /help，而不是字面量 "/help"
```

如果需要斜杠前缀的字面量，请把它存入数据模型再绑定：

```ts
// updateDataModel: path "/labels/help", value "/help"
{ id: "cmd", component: "Text", text: { path: "/labels/help" } }
```

v0.8 可以用 `{ literalString: "/help" }` 避免此问题。

## 双向绑定

输入组件通过 `onDataChange` 回写：

```tsx
const TextField = defineComponent({
  name: "TextField",
  props: {
    label: { type: String, default: "" },
    value: { type: String, default: "" },
    path: { type: String, default: undefined }, // 可选便捷属性
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

指令：

```ts
{
  id: "name-input",
  component: "TextField",
  label: "Name",
  value: { path: "/form/name" },
  path: "/form/name",
}
```

用户输入时，运行时写入 `/form/name`；绑定到该路径的其他属性会在同一次渲染中更新。

> 上面的 `path` 属性是组件级约定，不属于 A2UI。A2UI 只保证 `value` 被解析且注入了 `onDataChange`；写入哪个路径由组件决定。

## v0.8 编码

v0.8 数据更新只支持顶层键和字符串值：

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

属性使用 `{ path }` 或 `{ literalString }`：

```ts
{
  id: "status",
  component: { Text: { text: { path: "/status" } } },
}
```

嵌套值请优先使用 v0.9 的 `updateDataModel`；v0.8 编码无法表达。

## 实践建议

- 保持模型浅层且按领域分组；`updateDataModel` 只替换目标分支，但深层路径会创建中间对象。
- 只发送改变 UI 所需的最小更新。
- 尽可能在 Agent 侧预先计算展示字符串（货币、日期等）。
- 避免让路径穿过数组下标 —— 用一个 `updateDataModel` 值整体写入数组。
- 不要把动作 context 路径和属性路径混为一谈：属性在渲染时**解析**，动作 context 是**回写声明**。见 [ACTIONS.md](ACTIONS.md)。
