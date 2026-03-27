---
title: Mermaid
subtitle: 图表工具
description: 渲染 Mermaid 图表，支持图形/代码双视图、缩放拖拽、下载与复制操作。
group:
  title: 反馈
  order: 4
---

## 何时使用

- 在对话或 AI 输出中展示流程图、时序图等 Mermaid 图表。
- 需要在图形视图与源码视图之间切换。
- 需要查看细节、缩放拖拽或导出图表。

## 代码演示

<demo src="./demo/basic.vue">基础用法</demo>

<demo src="./demo/custom-header.vue">自定义 Header</demo>

<demo src="./demo/header-actions.vue">Header Actions</demo>

## API

### 属性

| 属性                 | 说明                                        | 类型                                                                                                   | 默认值                                                         |
| -------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| content              | Mermaid 源码内容                            | `string`                                                                                               | -                                                              |
| renderType           | 渲染模式（受控）                            | `'image' \| 'code'`                                                                                    | -                                                              |
| defaultRenderType    | 初始渲染模式（非受控）                      | `'image' \| 'code'`                                                                                    | `'image'`                                                      |
| header               | 自定义头部内容，传 `null` 可隐藏头部        | `VNodeChild \| null`                                                                                   | -                                                              |
| config               | Mermaid 初始化配置                          | `MermaidConfig`                                                                                        | -                                                              |
| actions              | 头部操作配置                                | `{ enableZoom?: boolean; enableDownload?: boolean; enableCopy?: boolean; customActions?: ItemType[] }` | `{ enableZoom: true, enableDownload: true, enableCopy: true }` |
| codeHighlighterProps | 代码模式下内置 `CodeHighlighter` 的额外参数 | `Partial<Omit<CodeHighlighterProps, 'content' \| 'language'>>`                                         | -                                                              |
| classes              | 语义化类名覆写                              | `Partial<Record<'root' \| 'header' \| 'graph' \| 'code', string>>`                                     | -                                                              |
| styles               | 语义化样式覆写                              | `Partial<Record<'root' \| 'header' \| 'graph' \| 'code', CSSProperties>>`                              | -                                                              |

### 事件

| 事件              | 说明                 | 参数                                |
| ----------------- | -------------------- | ----------------------------------- |
| update:renderType | 渲染模式切换时触发   | `(next: 'image' \| 'code') => void` |
| renderTypeChange  | 渲染模式切换别名事件 | `(next: 'image' \| 'code') => void` |

### Ref

| 属性          | 说明       | 类型             |
| ------------- | ---------- | ---------------- |
| nativeElement | 根节点 DOM | `HTMLDivElement` |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>Mermaid 语义结构</demo>

## 迁移说明

### React API 到 Vue API 对照

| 旧版（React）               | 新版（Vue）                                  | 说明                                      |
| --------------------------- | -------------------------------------------- | ----------------------------------------- |
| `<Mermaid>{code}</Mermaid>` | `<Mermaid :content="code" />`                | 不再使用 `children`，统一改为 `content`。 |
| `onRenderTypeChange`        | `@render-type-change` / `v-model:renderType` | 同时支持事件与双向绑定。                  |
| `className` / `classNames`  | `class` / `classes`                          | 对齐当前 Vue 组件命名约定。               |
| `highlightProps`            | `codeHighlighterProps`                       | 用于透传代码模式下高亮组件参数。          |

### 快速示例

```vue
<script setup lang="ts">
import { Mermaid } from "@antdv-next/x";

const code = `graph TD\nA-->B`;
</script>

<template>
  <Mermaid :content="code" v-model:renderType="mode" />
</template>
```
