# 动作（Actions）

动作把用户交互从已渲染组件带回应用（通常再转发给 Agent）。

## 动作的两侧

| 侧       | 位置                             | 作用                                                 |
| -------- | -------------------------------- | ---------------------------------------------------- |
| 指令声明 | A2UI 指令中的 `component.action` | 命名事件，并声明哪些 context 键映射到数据模型路径    |
| 组件实现 | 你的 Vue 组件                    | 调用 `onAction(name, context)` 提供值                |
| 运行时   | `XCardCard`                      | 把提供的值回写到声明的路径，再调用 Box 的 `onAction` |

> **版本说明**：动作回写使用 Card 当前的协议版本（每个 Surface 以最后一条带版本信息的指令为准）。向 v0.9 Surface 混入 v0.8 指令后，v0.9 的 `action.event.context` 将不再产生回写。请为每个 Surface 保持单一版本。

## v0.9

### 声明

```ts
{
  id: "submit-btn",
  component: "Button",
  label: "Confirm",
  action: {
    event: {
      name: "confirm_booking",
      context: {
        datetime: { path: "/reservation/datetime" },
        guests: { path: "/reservation/guests" },
      },
    },
  },
}
```

`context` 中的值是**回写目标**，不是要读取的值。它们会原样传给组件，不会预先解析。

### 实现组件

```tsx
const Button = defineComponent({
  name: "CardButton",
  props: {
    label: { type: String, default: "" },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props) {
    const handleClick = () => {
      const event = (props.action as any)?.event;
      if (!event?.name) return;
      // 键必须与 action.event.context 的键一致，回写才会发生。
      props.onAction?.(event.name, {
        datetime: "2025-12-16T19:00:00Z",
        guests: 3,
      });
    };
    return () => <button onClick={handleClick}>{props.label}</button>;
  },
});
```

### 运行时做了什么

1. 遍历 `action.event.context` 中值为 `{ path }` 的键，如果组件提供了同名键，就把提供的值写入该路径。
2. 用以下结构调用 `XCardBox` 的 `onAction`：

```ts
interface ActionPayload {
  name: string; // "confirm_booking"
  surfaceId: string; // Card id
  context: Record<string, any>; // 组件提供的值
  actionConfig?: any; // 解析后的 action 对象
}
```

重要的本地行为：

- **`payload.context` 是组件提供的 context**，不是完整数据模型快照，也不会从声明的路径自动解析。即使 `action.event.context` 声明了路径，只要组件传 `{}`，`payload.context` 就是 `{}`。
- 只有组件实际提供的键（值不为 `undefined`）才会触发回写。
- 组件提供的额外键会出现在 `payload.context` 中，但不会写入数据模型。

因此，组件负责提供值；指令只告诉运行时把这些值存到哪里。

## v0.8

v0.8 的 action 是扁平对象，使用 `{ key, value }` 数组：

```ts
{
  id: "submit",
  component: {
    Button: {
      label: { literalString: "Confirm" },
      action: {
        name: "confirm_booking",
        context: [{ key: "formData", value: { path: "/formData" } }],
      },
    },
  },
}
```

组件：

```tsx
const handleClick = () => {
  const action = props.action as any;
  if (!action?.name) return;
  props.onAction?.(action.name, { formData: { guests: 3 } });
};
```

运行时会提取每个条目的 `value.path`，把提供的 `formData` 写入该路径，然后像 v0.9 一样发出 `ActionPayload`。

## 处理 payload

```ts
function handleAction(payload: ActionPayload) {
  // 1. 检查发生了什么
  console.log(payload.name, payload.surfaceId, payload.context);

  // 2. 继续流程：发给 Agent 或更新本地状态
  sendToAgent({
    type: "userAction",
    name: payload.name,
    context: payload.context,
  });
}
```

Agent 的典型响应：

- `updateComponents` / `updateDataModel` —— 继续当前 Surface；
- `deleteSurface` —— 结束流程；
- `createSurface` —— 打开新 Surface（例如成功页）。

## 不涉及动作的交互

纯状态编辑（输入框输入、勾选复选框）优先使用 `onDataChange(path, value)`，而不是动作。动作用于 Agent 应作出反应的事件；数据变更用于本地双向绑定。见 [DATA_BINDING.md](DATA_BINDING.md)。

## 检查清单

- [ ] 指令中设置了事件名，且组件从正确位置读取（v0.9 为 `action.event.name`，v0.8 为 `action.name`）。
- [ ] 组件提供的 context 键与声明的 `context` 键一致。
- [ ] Box 提供了 `onAction` 处理器。
- [ ] 处理器没有假设 `payload.context` 包含完整数据模型。
