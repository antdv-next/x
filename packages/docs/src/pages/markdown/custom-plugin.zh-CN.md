---
group:
  title: 插件集
title: 自定义插件
order: 5
---

## 何时使用

当内置能力不足，需要按业务语法对 Markdown 做额外转换时。

## 扩展流程

1. 定义一套领域语法（例如 `:::warning`）
2. 在输入 `XMarkdown` 前做文本预处理
3. 将转换后的标签交给 `components` 渲染

## 示例

```ts
export function transformCustomSyntax(input: string): string {
  return input
    .replace(/:::warning\n([\s\S]*?)\n:::/g, "<x-warning>$1</x-warning>")
    .replace(/@@([^@]+)@@/g, "<kbd>$1</kbd>");
}
```

```vue
<script setup>
import { computed, ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";
import WarningBlock from "./WarningBlock.vue";
import { transformCustomSyntax } from "./transformCustomSyntax";

const raw = ref(":::warning\n请注意配置项\n:::");
const content = computed(() => transformCustomSyntax(raw.value));

const components = {
  "x-warning": WarningBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```
