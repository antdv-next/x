<script setup lang="ts">
import { Mermaid } from "@antdv-next/x";

const content = `graph TD
  A[Start] --> B{Data Valid?}
  B -->|Yes| C[Process Data]
  B -->|No| D[Error Handling]
  C --> E[Generate Report]
  D --> E
  E --> F[End]`;
</script>

<template>
  <Mermaid :content="content" />
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
