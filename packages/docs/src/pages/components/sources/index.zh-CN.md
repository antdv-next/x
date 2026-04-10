---
title: Sources
subtitle: 来源引用
description: 展示引用的数据来源地址。
---

## 何时使用

- 在联网搜索模式下展示引用的数据来源地址。

## 代码演示

<!-- prettier-ignore -->
<demo src="./demo/basic.vue">基础用法</demo>
<demo src="./demo/icon.vue">使用图标</demo>
<demo src="./demo/expand.vue">展开</demo>
<demo src="./demo/inline.vue">行内模式</demo>
<demo src="./demo/render-slot.vue">插槽渲染</demo>

## API

### SourcesProps

| 属性                | 说明                 | 类型                                                 | 默认值  | 版本 |
| ------------------- | -------------------- | ---------------------------------------------------- | ------- | ---- |
| classes             | 样式类名             | [Record<SemanticType, string>](#semantic-dom)        | -       | -    |
| styles              | 样式 style           | [Record<SemanticType, CSSProperties>](#semantic-dom) | -       | -    |
| rootClass           | 根节点类名           | string                                               | -       | -    |
| title               | 标题内容             | VNodeChild                                           | -       | -    |
| items               | 来源内容             | SourcesItem[]                                        | -       | -    |
| expandIconPosition  | 折叠图标位置         | 'start' \| 'end'                                     | 'start' | -    |
| defaultExpanded     | 默认是否展开         | boolean                                              | true    | -    |
| expanded            | 是否展开             | boolean                                              | -       | -    |
| onClick             | 点击事件             | (item: SourcesItem) => void                          | -       | -    |
| inline              | 行内模式             | boolean                                              | false   | -    |
| activeKey           | 行内模式，激活的 key | string \| number                                     | -       | -    |
| popoverOverlayWidth | 弹出层宽度           | number \| string                                     | 300     | -    |

### 事件

| 事件名   | 说明               | 类型                        |
| -------- | ------------------ | --------------------------- |
| `expand` | 展开状态变化时触发 | `(expand: boolean) => void` |

```typescript
type SemanticType = "root" | "title" | "content";

interface SourcesItem {
  key?: string | number;
  title: VNodeChild;
  url?: string;
  icon?: VNodeChild;
  description?: VNodeChild;
}
```

### 插槽

| 插槽名        | 说明             | 类型                                          |
| ------------- | ---------------- | --------------------------------------------- |
| `title`       | 顶部标题插槽     | `({ originNode }) => VNodeChild`              |
| `iconRender`  | 来源图标渲染插槽 | `({ item, index, originNode }) => VNodeChild` |
| `titleRender` | 来源标题渲染插槽 | `({ item, index, originNode }) => VNodeChild` |
| `description` | 来源描述渲染插槽 | `({ item, index, originNode }) => VNodeChild` |

插槽优先级高于同名属性内容；inline 与默认展开模式都会复用同一套 item 插槽。

## 语义化 DOM {#semantic-dom}

<demo src="./demo/semantic.vue" simplify>Sources 语义结构</demo>
