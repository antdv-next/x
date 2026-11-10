---
name: x-components
version: 0.0.3
description: 使用 @antdv-next/x 构建 AI 对话界面时使用，覆盖 Bubble、BubbleList、Sender、Conversations、Prompts、ThoughtChain、Actions、Welcome、Attachments、Sources、Suggestion、Think、FileCard、CodeHighlighter、Mermaid、Folder、XProvider 和 Notification。
---

# 🎯 技能定位

**本技能覆盖 `@antdv-next/x` 的全部 UI 组件**，这是基于 RICH 交互范式、用于构建 AI 对话界面的 Vue 3 组件库。

内容涵盖组件选择、API 用法、组合模式与常见反模式。

> **前置说明**：本技能只负责 UI。数据流与流式状态请参考 `use-x-chat`、`x-chat-provider`、`x-request` 技能。

## 目录

- [📦 包职责](#-包职责)
- [🗂️ 组件分组](#️-组件分组)
- [🚀 快速选择指南](#-快速选择指南)
- [🛠 推荐工作流](#-推荐工作流)
- [🚨 开发规则](#-开发规则)
- [🤝 技能协作](#-技能协作)
- [🔗 参考资源](#-参考资源)

# 📦 包职责

| 包                       | 职责                                            |
| ------------------------ | ----------------------------------------------- |
| `@antdv-next/x`          | 本技能覆盖的全部 UI 组件                        |
| `@antdv-next/x-sdk`      | Provider、请求、流式状态，本技能不涉及          |
| `@antdv-next/x-markdown` | Bubble 内的 Markdown 渲染，见 `x-markdown` 技能 |

```bash
npm install @antdv-next/x
```

> `@antdv-next/x` 扩展自 `antdv-next`。如果项目已经在使用 `antdv-next` 的 `ConfigProvider`，请在应用根部替换为 `XProvider`。

# 🗂️ 组件分组

基于 RICH 交互范式：

| 阶段             | 组件                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| **General**      | `Bubble`、`BubbleList`、`Conversations`、`Notification`                  |
| **Wake**         | `Welcome`、`Prompts`                                                     |
| **Express**      | `Sender`、`SenderHeader`、`Attachments`、`Suggestion`                    |
| **Confirmation** | `Think`、`ThoughtChain`                                                  |
| **Feedback**     | `Actions`、`FileCard`、`Sources`、`CodeHighlighter`、`Mermaid`、`Folder` |
| **Global**       | `XProvider`                                                              |

Vue 导出是扁平的，没有命名空间写法。使用 `BubbleList`（不是 `Bubble.List`）、`SenderHeader`（不是 `Sender.Header`）、`ActionsCopy` / `ActionsFeedback` / `ActionsAudio` / `ActionsItem`（不是 `Actions.Copy`）、`FileCardList`（不是 `FileCard.List`）。

# 🚀 快速选择指南

| 需求                   | 先读                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| 渲染单条对话消息       | [COMPONENTS.md → Bubble](reference/COMPONENTS.md#bubble)                                        |
| 渲染消息列表           | [COMPONENTS.md → BubbleList](reference/COMPONENTS.md#bubblelist)                                |
| 构建输入框             | [COMPONENTS.md → Sender](reference/COMPONENTS.md#sender)                                        |
| 会话列表与切换         | [COMPONENTS.md → Conversations](reference/COMPONENTS.md#conversations)                          |
| 展示 AI 思考过程       | [COMPONENTS.md → Think / ThoughtChain](reference/COMPONENTS.md#think--thoughtchain)             |
| 在回复下方添加操作按钮 | [COMPONENTS.md → Actions](reference/COMPONENTS.md#actions)                                      |
| 欢迎页 / 引导页        | [COMPONENTS.md → Welcome + Prompts](reference/COMPONENTS.md#welcome--prompts)                   |
| 输入框内展示附件       | [COMPONENTS.md → SenderHeader + Attachments](reference/COMPONENTS.md#senderheader--attachments) |
| 展示引用来源           | [COMPONENTS.md → Sources](reference/COMPONENTS.md#sources)                                      |
| 快捷指令建议           | [COMPONENTS.md → Suggestion](reference/COMPONENTS.md#suggestion)                                |
| 展示文件树             | [COMPONENTS.md → Folder](reference/COMPONENTS.md#folder)                                        |
| 组合完整聊天页         | [PATTERNS.md](reference/PATTERNS.md)                                                            |
| 查询具体属性           | [API.md](reference/API.md)                                                                      |

# 🛠 推荐工作流

1. 按交互阶段从 [COMPONENTS.md](reference/COMPONENTS.md) 选择组件。
2. 用 [PATTERNS.md](reference/PATTERNS.md) 组合完整页面。
3. 在应用根部包一层 `XProvider`，统一 locale、方向、主题和快捷键。
4. 用 [API.md](reference/API.md) 确认准确的属性名，不要凭记忆猜。

## 最小完整页面示例

```vue
<script setup lang="ts">
import { BubbleList, Prompts, Sender, Welcome, XProvider } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");

const prompts = [
  { key: "1", label: "你能做什么？" },
  { key: "2", label: "写一个 Vue 组件" },
];

const messages = [
  { key: "1", role: "assistant", content: "你好！有什么可以帮你？" },
];
</script>

<template>
  <XProvider>
    <Welcome title="你好！" description="有什么可以帮你？" />
    <Prompts
      :items="prompts"
      @item-click="info => console.log(info.data.label)"
    />
    <BubbleList :items="messages" />
    <Sender v-model:value="value" :on-submit="msg => console.log(msg)" />
  </XProvider>
</template>
```

# 🚨 开发规则

- **始终在应用根部使用 `XProvider`** —— 它取代 `antdv-next` 的 `ConfigProvider`，统一 locale、方向以及 x 组件专属快捷键。
- **使用 `BubbleList`，不要手动 `v-for` 渲染 `Bubble`** —— `BubbleList` 负责滚动锚定、自动滚动和按角色布局，手写列表会丢失这些能力。
- **保持 `role`、`components`、`componentsProps` 稳定** —— 定义在渲染函数外或使用 `computed`；内联对象会重置打字动画和滚动行为。
- **流式期间 `streaming` 为 `true`，最后一个 chunk 置为 `false`** —— 一直保持 `true` 会导致完成态无法收敛。
- **`ThoughtChain` 与 `Think` 的分工**：多步骤工具/Agent 调用链用 `ThoughtChain`；单块可折叠的推理过程用 `Think`。
- **优先使用预置子组件** `ActionsCopy`、`ActionsFeedback`、`ActionsAudio`、`ActionsItem`，不要重复实现；旧版 `Actions.Copy` 命名空间写法兼容但不推荐。
- **Sender 的 `onSubmit` 与 `onChange` 不同**：`onSubmit` 在发送按钮或回车时触发，`onChange` 每次输入都触发，不要混用。
- **不要把 `Mermaid` 或 `CodeHighlighter` 塞进 Bubble 的 `content` 字符串** —— 使用 `content` 插槽、`contentRender` 或 Markdown 的 `components` 映射。
- **声明的回调属性与仅 emit 的事件绑定方式不同** —— 已声明的 `onXxx` 属性可用 `:on-xxx`（Sender 的 `:on-submit`、`:on-change`）；仅 emit 的事件必须用 `@event-name`（Prompts 的 `@item-click`、Attachments 的 `@change`、Folder 的 `@selected-file-change`、Think/ThoughtChain 的 `@expand`）。`:on-xxx` 形式不会注册仅 emit 的监听器；不确定时查阅 [API.md](reference/API.md)。双向绑定使用 `v-model:value` / `v-model:items`。

# 🤝 技能协作

| 场景                | 技能组合                                                                       |
| ------------------- | ------------------------------------------------------------------------------ |
| 完整 AI 对话应用    | `x-chat-provider` → `x-request` → `use-x-chat` → `x-components` → `x-markdown` |
| 只搭建 UI 结构      | `x-components`                                                                 |
| 气泡内渲染 Markdown | `x-components` + `x-markdown`                                                  |
| 只接流式数据流      | `use-x-chat` + `x-request`                                                     |
| 结构化卡片回复      | `x-components` + `x-card`                                                      |

# 🔗 参考资源

- [COMPONENTS.md](reference/COMPONENTS.md) —— 逐组件指南，含用法、关键属性和 Vue 示例
- [PATTERNS.md](reference/PATTERNS.md) —— 完整页面组合模式与集成示例
- [API.md](reference/API.md) —— 18 个组件族的属性、事件、插槽汇总

## 官方文档

- [组件总览](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/index.zh-CN.md)
- [Bubble](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/bubble/index.zh-CN.md)
- [Sender](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/sender/index.zh-CN.md)
- [Conversations](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/conversations/index.zh-CN.md)
- [ThoughtChain](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/thought-chain/index.zh-CN.md)
- [Actions](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/actions/index.zh-CN.md)
- [Welcome](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/welcome/index.zh-CN.md)
- [Prompts](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/prompts/index.zh-CN.md)
- [Attachments](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/attachments/index.zh-CN.md)
- [Sources](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/sources/index.zh-CN.md)
- [Suggestion](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/suggestion/index.zh-CN.md)
- [Think](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/think/index.zh-CN.md)
- [Folder](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/folder/index.zh-CN.md)
- [XProvider](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/x-provider/index.zh-CN.md)
