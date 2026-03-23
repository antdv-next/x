---
group:
  title: Plugins
title: Custom Plugins
order: 5
---

## When to Use

Use this when built-in behavior is not enough and you need domain-specific Markdown transforms.

## Extension Flow

1. Define a domain syntax (for example `:::warning`)
2. Preprocess markdown text before passing it to `XMarkdown`
3. Render transformed tags via `components`

## Example

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

const raw = ref(":::warning\nCheck this config carefully\n:::");
const content = computed(() => transformCustomSyntax(raw.value));

const components = {
  "x-warning": WarningBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```
