# x-card 与 A2UI 介绍

## 什么是 A2UI？

A2UI（Agent-to-User Interface）是一种开放协议：AI Agent 用一系列声明式 JSON 消息描述 UI 意图，客户端运行时 —— 这里是 `@antdv-next/x-card` —— 解释这些消息并用原生 Vue 组件渲染。

它由三个核心理念构成：

1. **流式消息** —— UI 更新以有序的 JSON 指令流到达。
2. **声明式组件** —— UI 被描述为数据，而不是代码。
3. **数据绑定** —— 结构与状态解耦，数据更新触发响应式渲染。

## 为什么不让模型直接生成 HTML？

| 关注点      | A2UI                           | AI 生成的 HTML           |
| ----------- | ------------------------------ | ------------------------ |
| 安全        | 只渲染已注册组件；无代码执行   | 可能包含脚本和注入载荷   |
| 跨平台      | 一份 JSON 结构适配各平台运行时 | HTML 需要逐平台适配      |
| 流式        | 指令到达即可渐进渲染           | 需要完整文档             |
| 对 LLM 友好 | 扁平邻接表，支持增量生成       | 大型嵌套 HTML 容易出错   |
| 维护        | 组件在代码中集中管理           | 每个生成页面都是一次性的 |

## 架构

```
Agent (LLM)
   │  A2UI JSON 指令
   ▼
传输层（SSE / WebSocket / A2A / 内存）
   │
   ▼
XCardBox  ── 指令队列、catalog 加载、动作回调
   │
   ▼
XCardCard id="surfaceId"  ── 应用匹配指令，持有数据模型
   │
   ▼
NodeRenderer → 组件映射 → 你的 Vue 组件
```

### 角色

| 角色        | 职责                            |
| ----------- | ------------------------------- |
| `XCardBox`  | 接收指令与组件映射，分发动作    |
| `XCardCard` | 单个 Surface：组件树 + 数据模型 |
| 组件映射    | 把 A2UI 类型名映射到 Vue 组件   |
| Catalog     | 描述可用组件的可选 schema       |

## Surface

**Surface** 是一个隔离的 UI 容器，拥有自己的组件树和 JSON 数据模型。每条指令都携带 `surfaceId`；一个 Card 只渲染一个 Surface。同一个 Box 内的多个 Card 可以渲染不同 Surface，不同 Surface 的指令可以在同一流中交错。

以下情况应创建新 Surface：

- 渲染第二张独立卡片；
- 完整重置一张卡片（`deleteSurface` 后重新 `createSurface`）。

## 协议版本

运行时在同一指令流中同时支持 v0.8 和 v0.9。版本按指令检测：存在 `version: "v0.9"` 字段即为 v0.9，否则为 v0.8。

| 特性         | v0.8                                                     | v0.9                                        |
| ------------ | -------------------------------------------------------- | ------------------------------------------- |
| 版本字段     | 无                                                       | `version: "v0.9"`                           |
| Surface 创建 | 隐式（`surfaceUpdate`）                                  | 显式 `createSurface`                        |
| 组件形态     | `component: { Name: { props } }`                         | `component: "Name"` + 扁平属性              |
| 子节点       | `children: { explicitList }` 或数组                      | `children: string[]`                        |
| 数据更新     | `dataModelUpdate.contents`（`valueString` / `valueMap`） | `updateDataModel.path` + `value`            |
| 路径绑定     | `{ path }` 或 `{ literalString }`                        | `{ path }`（以 `/` 开头的裸字符串也会解析） |
| 根节点选择   | `beginRendering.root`                                    | 始终为 `"root"`                             |
| 状态         | 旧版兼容                                                 | **推荐**                                    |

不要在单次更新调用中混用格式：一个 `updateComponents` 只能包含 v0.9 形态的组件，一个 `surfaceUpdate` 只能包含 v0.8 形态的组件。

## 包提供的能力

- 面向流式的指令管线（`XCardBox` → `XCardCard`）。
- 按 Surface 隔离的数据模型，支持 JSON Pointer 风格路径绑定。
- 双向绑定：自定义组件接收 `onDataChange(path, value)`。
- 动作路由：自定义组件接收 `onAction(name, context)`；运行时可以把值回写到数据模型。
- 可选 catalog 校验：检查必填字段并打印控制台警告。

## 何时使用 x-card

- Agent 生成的表单、预订流程、结算面板。
- 带实时状态的动态列表、筛选和搜索结果。
- 由 Agent 决定下一步 UI 的工作流阶段。
- 嵌入聊天消息中的交互卡片。

## 何时不要使用

- 静态页面和普通聊天 UI —— 直接使用 `@antdv-next/x` 组件。
- 渲染模型生成的任意 HTML —— 本包刻意不提供该能力。

## 下一步

- [USAGE.md](USAGE.md) —— 搭建可运行页面。
- [COMMANDS.md](COMMANDS.md) —— 完整指令参考。
- [DATA_BINDING.md](DATA_BINDING.md) —— 把状态绑定到属性。
- [ACTIONS.md](ACTIONS.md) —— 处理交互。
- [CATALOG.md](CATALOG.md) —— 约束组件 schema。
