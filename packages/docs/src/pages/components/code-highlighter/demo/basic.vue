<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";

const code = `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
  return {
    message: \`Welcome, \${name}\`,
    timestamp: Date.now()
  };
}

// Call the function
const result = greet("World");
console.log(result);`;
</script>

<template>
  <CodeHighlighter :content="code" language="typescript" />
</template>

<docs lang="zh-CN">
基础用法，展示代码高亮组件的基本功能。
</docs>

<docs lang="en-US">
Basic usage of the code highlighter component.
</docs>
