---
group:
  title: 组件
  order: 5
title: 总览
order: 1
---

`components` 是 `@antdv-next/x-markdown` 最核心的扩展入口。你可以把 Markdown/HTML 节点映射成自定义 Vue 组件，统一处理渲染、状态和业务逻辑。

## 基础注册方式

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import CodeBlock from "./CodeBlock.vue";
import MermaidBlock from "./MermaidBlock.vue";

const content = `\`\`\`ts\nconsole.log('hello')\n\`\`\`\n\n<mermaid>graph TD; A-->B</mermaid>`;

const components = {
  pre: CodeBlock,
  mermaid: MermaidBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## ComponentProps

| 属性         | 说明                                                   | 类型                      | 默认值 |
| ------------ | ------------------------------------------------------ | ------------------------- | ------ |
| streamStatus | 当前节点的流式状态                                     | `'loading' \| 'done'`     | -      |
| lang         | 代码块语言                                             | `string`                  | -      |
| block        | 是否块级代码                                           | `boolean`                 | -      |
| 其他属性     | 透传的 DOM 属性（如 `href`、`src`、`title`、`data-*`） | `Record<string, unknown>` | -      |

## 最佳实践

1. 保持组件引用稳定，避免在 `components` 中写内联函数组件。
2. 对流式内容使用 `streamStatus` 区分加载态与完成态。
3. 需要做复杂数据解析时，尽量在 `streamStatus === 'done'` 后执行。
4. 自定义标签命名建议语义化，避免与原生标签冲突。

## 组件场景

- [聊天增强](./chat-enhancement)
- [数据展示](./data-display)
- [富文本增强](./rich-text)
