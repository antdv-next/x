# 使用指南

## 安装

```bash
npm install @antdv-next/x-card
```

Peer 依赖：Vue `>= 3.5.0`。

## 最小配置

需要三样东西：

1. **组件映射**（A2UI 名称 → Vue 组件），
2. **指令数组**（`XCardCommand[]`），
3. 用 `XCardBox` 包裹 `XCardCard`，并保证 `id` 匹配。

```vue
<script setup lang="tsx">
import { defineComponent, ref } from "vue";
import { XCardBox, XCardCard } from "@antdv-next/x-card";
import type { XCardCommand } from "@antdv-next/x-card";

const Text = defineComponent({
  name: "DemoText",
  props: { text: { type: String, default: "" } },
  setup: props => () => <div>{props.text}</div>,
});

const components = { Text };

const commands = ref<XCardCommand[]>([
  { version: "v0.9", createSurface: { surfaceId: "demo" } },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "demo",
      components: [{ id: "root", component: "Text", text: "Hello" }],
    },
  },
]);
</script>

<template>
  <XCardBox :commands="commands" :components="components">
    <XCardCard id="demo" />
  </XCardBox>
</template>
```

根组件必须使用 `id: "root"`。只有通过 `child` / `children` 从根可达的节点才会渲染；未被引用的组件保留在注册表中但不显示。

## 自定义组件契约

每个自定义组件都会收到解析后的 A2UI 属性，以及两个注入回调：

```ts
interface XCardInjectedProps {
  onAction?: (name: string, context: Record<string, any>) => void;
  onDataChange?: (path: string, value: any) => void;
}
```

- **`onAction(name, context)`** —— 用户交互时调用。`name` 是指令 `action` 中的事件名；`context` 是组件提供的值映射。
- **`onDataChange(path, value)`** —— 用于双向输入绑定。它把 `value` 写入 Surface 数据模型的 `path`，并触发 UI 重新渲染。

按钮组件示例：

```tsx
const SubmitButton = defineComponent({
  name: "SubmitButton",
  props: {
    label: { type: String, default: "Submit" },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
  },
  setup(props) {
    const handleClick = () => {
      const name = (props.action as any)?.event?.name;
      if (name) props.onAction?.(name, {});
    };
    return () => <button onClick={handleClick}>{props.label}</button>;
  },
});
```

> v0.8 组件读取 `props.action?.name`，v0.9 组件读取 `props.action?.event?.name`。请按你下发的协议版本编写组件。

## 流式指令

保持指令数组响应式，并在指令到达时**追加**：

```ts
const commands = ref<XCardCommand[]>([]);

function onCommand(cmd: XCardCommand) {
  commands.value.push(cmd);
}
```

Box 只处理新追加的指令，无需完整重放。Card 会在队列增长时重新应用自己的指令，这正是渐进渲染的工作方式。

> 用**更短**的数组替换会重置 Box 的内部游标。替换为等长数组不会被观察到 —— 请始终追加或改变长度。

典型 SSE 流程：

```ts
const source = new EventSource("/api/a2ui");
source.onmessage = event => {
  commands.value.push(JSON.parse(event.data));
};
```

## 一个 Box 中的多个 Surface

```vue
<XCardBox :commands="commands" :components="components" :on-action="onAction">
  <XCardCard id="cart" />
  <XCardCard id="recommendations" />
</XCardBox>
```

各 Surface 的指令可以交错；每个 Card 按 `surfaceId` 过滤。渲染并不强制要求 `createSurface` —— v0.9 Card 在 `updateComponents` 到达后即可渲染 —— 但要关联 `catalogId` 时必须使用它。

## 替换或删除 Surface

```ts
// 移除 Surface：组件树和数据模型都会被清空。
commands.value.push({ version: "v0.9", deleteSurface: { surfaceId: "cart" } });

// 之后重新创建。
commands.value.push(
  { version: "v0.9", createSurface: { surfaceId: "cart" } },
  {
    version: "v0.9",
    updateComponents: { surfaceId: "cart", components: [/* ... */] },
  },
);
```

## 嵌入聊天消息

把卡片渲染到 Bubble 的 content 插槽中，让 Agent 以结构化 UI 回复：

```vue
<Bubble placement="start" content="">
  <template #content>
    <XCardBox :commands="cardCommands" :components="cardComponents" :on-action="sendAction">
      <XCardCard id="booking" />
    </XCardBox>
  </template>
</Bubble>
```

`sendAction` 可以把 payload 通过 `useXChat` / 你的 provider 转发回 Agent，继续流程。

## 使用 catalog

在指令到达前注册 catalog，然后在 `createSurface` 中引用：

```ts
import { registerCatalog } from "@antdv-next/x-card";

import catalog from "./catalog.json";

registerCatalog(catalog);
```

```ts
{ version: "v0.9", createSurface: { surfaceId: "booking", catalogId: "local://booking.json" } }
```

schema 细节与校验行为见 [CATALOG.md](CATALOG.md)。

## 常见错误

| 现象                                   | 原因                                  | 修复                                        |
| -------------------------------------- | ------------------------------------- | ------------------------------------------- |
| 什么都不渲染                           | `XCardCard` 在 `XCardBox` 外          | 用 Box 包裹                                 |
| 什么都不渲染                           | 没有 `id: "root"` 的组件              | 把根组件设为 `id: "root"`                   |
| 警告 `component "X" is not registered` | `components` 映射缺少条目或名称不匹配 | 用准确名称注册                              |
| Card 忽略新指令                        | 修改了数组但长度未变                  | 追加，或使用 `.push`                        |
| 重置后 Card 仍显示旧状态               | 用等长数组替换了指令                  | 推送不同长度的新数组或重新挂载 Box          |
| 字面文本变空                           | 字符串以 `/` 开头被当作路径           | 只对绑定使用 `{ path }`，避免斜杠前缀字面量 |
