---
name: x-card
version: 0.0.4
description: 使用 @antdv-next/x-card 渲染 A2UI 动态卡片时使用，覆盖 XCardBox、XCardCard、A2UI v0.8/v0.9 指令、数据绑定、动作事件、组件目录以及自定义组件契约。
---

# 🎯 技能定位

**本技能覆盖 `@antdv-next/x-card`** —— 一个基于 [A2UI 协议](https://a2ui.org/concepts/data-flow/) 的动态卡片渲染器。AI Agent 发送结构化 JSON 指令（创建 Surface、定义组件、更新数据），运行时用**你注册的 Vue 组件**把它们渲染出来。

它不是静态卡片组件。当 UI 结构本身由 Agent 生成或流式下发时，才使用它。

> **前置说明**：普通聊天 UI（气泡、输入框、消息列表）请使用 `x-components` 技能。本技能只覆盖 A2UI 层。

## 目录

- [📦 包职责](#-包职责)
- [🧠 心智模型](#-心智模型)
- [🚀 快速开始](#-快速开始)
- [🗂️ 参考指南](#️-参考指南)
- [🚨 开发规则](#-开发规则)
- [🤝 技能协作](#-技能协作)
- [🔗 参考资源](#-参考资源)

# 📦 包职责

| 导出                                                                                                                   | 类型 | 用途                                                          |
| ---------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------- |
| `XCardBox`                                                                                                             | 组件 | 容器：持有指令队列、加载 catalog、提供上下文、调用 `onAction` |
| `XCardCard`                                                                                                            | 组件 | 渲染单个 Surface；`id` 必须等于 `surfaceId`                   |
| `registerCatalog`                                                                                                      | 函数 | 本地注册 catalog 对象                                         |
| `loadCatalog`                                                                                                          | 函数 | 按 id 加载 catalog（本地注册表或远程 URL）                    |
| `clearCatalogCache`                                                                                                    | 函数 | 清空 catalog 缓存                                             |
| `ActionPayload` / `XCardCommand` / `XCardComponent_v09` / `Catalog` / `XCardNode` / `XCardBoxProps` / `XCardCardProps` | 类型 | TypeScript 定义                                               |

```bash
npm install @antdv-next/x-card
```

Peer 依赖：Vue `>= 3.5.0`。

# 🧠 心智模型

```
Agent → A2UI JSON 指令 → XCardBox（指令队列、catalog）
                                   ↓
                              XCardCard id="surfaceId"
                                   ↓
                        XCardNodeRenderer → 你的组件映射
```

1. **Box** 接收 `commands` 和 `components` 映射。只有它了解完整的指令流。
2. **Card** 筛选 `surfaceId` 与自身 `id` 匹配的指令，按顺序应用并渲染根节点。
3. **组件映射**把 A2UI 组件名（`"Text"`、`"Button"`…）转换为 Vue 组件。名称必须以大写字母开头，并与指令完全一致。
4. **数据模型**按 Surface 隔离。通过 `{ path: "/foo" }` 绑定的属性会响应式解析；`updateDataModel` 只重新渲染变化的部分。
5. **动作**从你的组件经 Box 的 `onAction` 回流到应用。

# 🚀 快速开始

```vue
<script setup lang="tsx">
import { defineComponent, ref } from "vue";
import { XCardBox, XCardCard } from "@antdv-next/x-card";
import type { ActionPayload, XCardCommand } from "@antdv-next/x-card";

const Text = defineComponent({
  name: "DemoText",
  props: { text: { type: String, default: "" } },
  setup: props => () => <div>{props.text}</div>,
});

const components = { Text };

const commands = ref<XCardCommand[]>([
  {
    version: "v0.9",
    createSurface: { surfaceId: "demo" },
  },
  {
    version: "v0.9",
    updateComponents: {
      surfaceId: "demo",
      components: [{ id: "root", component: "Text", text: "Hello XCard" }],
    },
  },
  {
    version: "v0.9",
    updateDataModel: {
      surfaceId: "demo",
      path: "/status",
      value: "ready",
    },
  },
]);

function handleAction(payload: ActionPayload) {
  console.log(payload.name, payload.context);
}
</script>

<template>
  <XCardBox
    :commands="commands"
    :components="components"
    :on-action="handleAction"
  >
    <XCardCard id="demo" />
  </XCardBox>
</template>
```

# 🗂️ 参考指南

| 如果你需要…                                          | 先读                                         |
| ---------------------------------------------------- | -------------------------------------------- |
| 理解 A2UI、何时使用 x-card、v0.8 与 v0.9 的差异      | [INTRODUCTION.md](reference/INTRODUCTION.md) |
| 搭建页面、连接 Box + Card、流式指令                  | [USAGE.md](reference/USAGE.md)               |
| 查询指令字段（`createSurface`、`updateComponents`…） | [COMMANDS.md](reference/COMMANDS.md)         |
| 把属性绑定到状态、双向输入、嵌套路径                 | [DATA_BINDING.md](reference/DATA_BINDING.md) |
| 处理按钮/字段动作并回写数据                          | [ACTIONS.md](reference/ACTIONS.md)           |
| 注册 catalog 并校验组件                              | [CATALOG.md](reference/CATALOG.md)           |
| 准确的属性、类型与导出                               | [API.md](reference/API.md)                   |

# 🚨 开发规则

- **`XCardBox` 必须包裹每个 `XCardCard`** —— Card 通过 inject 获取 Box 上下文；放在 Box 外将渲染为空。
- **`XCardCard` 的 `id` 必须等于指令中的 `surfaceId`**。一个 Surface 对应一个 Card；多个 Card 可共享一个 Box。
- **组件名必须以大写字母开头，并与指令中的名称完全一致。** 在 `components` 映射中注册；未注册的名称会打印警告并且不渲染。
- **追加指令，不要用更短的数组原地重建。** Box 只处理新追加的指令，仅在长度变短时重置自身游标。替换数组**不会**重置 Card 的组件注册表或数据模型 —— 需要发送 `deleteSurface` 或重新挂载 Box。流式场景请向响应式数组 `push`。
- **同一指令流中可以出现两个版本的指令，但协议版本按 Card/Surface 跟踪。** 对该 Surface 而言，最后一条带版本信息（或 v0.8）的指令生效；不要为同一个 Surface 混用版本。不同 Surface 之间混用 v0.8 与 v0.9 是安全的。不要在同一个 `updateComponents` / `surfaceUpdate` 调用中混用两种组件格式。
- **动态属性使用 `{ path: "/foo" }`。** 在 v0.9 中，任何以 `/` 开头的裸字符串也会被当作路径 —— 类似 URL 或斜杠前缀的字面量（`"/search"`）不要直接作为属性传入。
- **动作分为两部分**：`action.event.context` 声明回写目标（`{ key: { path } }`），组件调用 `onAction(name, context)` 提供值。运行时会先把这些值写入数据模型，再以**组件提供的 context** 调用 Box 的 `onAction`，而不是完整的数据模型快照。
- **生产环境优先使用 `registerCatalog` 而不是远程 catalog。** 从 Agent 控制的 URL 拉取的 catalog 属于不可信输入；请使用 `local://` id 引用随包发布的 schema。
- **不要寻找 `validateComponent`** —— 包只导出 `registerCatalog`、`loadCatalog`、`clearCatalogCache`。存在 catalog 时校验在渲染内部执行，且仅打印警告。

# 🤝 技能协作

| 场景                          | 技能组合                                                       |
| ----------------------------- | -------------------------------------------------------------- |
| 在聊天回复中渲染结构化卡片    | `use-x-chat` + `x-components`（Bubble content 插槽）+ `x-card` |
| Agent 生成的表单 / 预订流程   | `x-card` + `x-chat-provider`（通过 SSE 流式下发指令）          |
| 仅普通对话 UI                 | `x-components`                                                 |
| 自定义卡片组件内渲染 Markdown | `x-card` + `x-markdown`                                        |

# 🔗 参考资源

- [INTRODUCTION.md](reference/INTRODUCTION.md) —— A2UI 概念、架构、协议版本
- [USAGE.md](reference/USAGE.md) —— 安装、Box/Card 连接、流式、多卡片
- [COMMANDS.md](reference/COMMANDS.md) —— v0.9 与 v0.8 指令参考
- [DATA_BINDING.md](reference/DATA_BINDING.md) —— 路径、字面量、双向绑定
- [ACTIONS.md](reference/ACTIONS.md) —— 动作契约与数据回写
- [CATALOG.md](reference/CATALOG.md) —— catalog 与校验
- [API.md](reference/API.md) —— 组件属性与导出类型

## 官方文档

- [x-card 介绍](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/card/index.zh-CN.md)
- [A2UI v0.9](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/card/a2ui-v09.zh-CN.md)
- [A2UI v0.8](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/card/a2ui-v08.zh-CN.md)
