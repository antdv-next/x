<script setup lang="ts">
const typescriptCode = `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
  return {
    message: \`Welcome, \${name}\`,
    timestamp: Date.now()
  };
}

const result = greet("World");
console.log(result);`;

const goCode = `package main

import "fmt"

func main() {
  fmt.Println("Hello from Go")
}`;
</script>

<template>
  <a-flex vertical :gap="16">
    <ax-code-highlighter :content="typescriptCode" language="typescript" />
    <ax-code-highlighter :content="goCode" language="go" />
  </a-flex>
</template>

<docs lang="zh-CN">
基础用法，展示 TypeScript 与按需加载的 Go 代码高亮。
</docs>

<docs lang="en-US">
Basic usage with TypeScript and lazily loaded Go syntax highlighting.
</docs>
