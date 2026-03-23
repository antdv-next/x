---
group:
  title: Components
  order: 5
title: Rich Text Enhancement
order: 4
---

Rich text enhancement is commonly used for code highlighting, line numbers, and copy actions.

## Example

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import CodeHighlighter from "./CodeHighlighter.vue";

const components = {
  pre: CodeHighlighter,
};

const content = `\`\`\`ts\nconst msg = 'hello markdown'\n\`\`\``;
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

## See Also

- [Overview](./components-en)
- [Chat Enhancement](./chat-enhancement-en)
- [Data Display](./data-display-en)
