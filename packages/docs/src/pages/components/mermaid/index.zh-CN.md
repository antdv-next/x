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

<demo src="./demo/header-actions.vue">头部操作</demo>

<demo src="./demo/with-xmarkdown.vue">结合 XMarkdown</demo>

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

### ItemType

`actions.customActions` 使用 `ItemType[]`，结构如下：

```ts
type ItemType = {
  key?: string | number;
  label?: string;
  icon?: VNodeChild;
  onItemClick?: (info?: ItemType) => void;
  danger?: boolean;
  subItems?: Omit<
    ItemType,
    "subItems" | "triggerSubMenuAction" | "actionRender"
  >[];
  triggerSubMenuAction?: MenuProps["triggerSubMenuAction"];
  actionRender?: ((item: ItemType) => VNodeChild) | VNodeChild;
};
```

### 插槽

| 插槽名   | 说明         | 类型               |
| -------- | ------------ | ------------------ |
| `header` | 自定义头部区 | `() => VNodeChild` |

`header` 插槽优先级高于 `header` 属性；传入 `header={null}` 时可隐藏默认头部。

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

<demo src="./demo/semantic.vue" simplify>语义化结构</demo>

## 组件 Token

<ComponentTokenTable component="Mermaid"></ComponentTokenTable>
