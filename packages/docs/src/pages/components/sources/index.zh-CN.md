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

## API

### SourcesProps

| 属性                | 说明                 | 类型                                                 | 默认值  | 版本 |
| ------------------- | -------------------- | ---------------------------------------------------- | ------- | ---- |
| classes             | 样式类名             | [Record<SemanticType, string>](#semantic-dom)        | -       | -    |
| styles              | 样式 style           | [Record<SemanticType, CSSProperties>](#semantic-dom) | -       | -    |
| title               | 标题内容             | VNodeChild                                           | -       | -    |
| items               | 来源内容             | SourcesItem[]                                        | -       | -    |
| expandIconPosition  | 折叠图标位置         | 'start' \| 'end'                                     | 'start' | -    |
| defaultExpanded     | 默认是否展开         | boolean                                              | true    | -    |
| expanded            | 是否展开             | boolean                                              | -       | -    |
| onExpand            | 展开事件             | (expand: boolean) => void                            | -       | -    |
| onClick             | 点击事件             | (item: SourcesItem) => void                          | -       | -    |
| inline              | 行内模式             | boolean                                              | false   | -    |
| activeKey           | 行内模式，激活的 key | string \| number                                     | -       | -    |
| popoverOverlayWidth | 弹出层宽度           | number \| string                                     | 300     | -    |

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
