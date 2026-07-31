<script setup lang="ts">
import { computed, ref } from "vue";

const snippets = {
  typescript: {
    label: "TypeScript",
    code: `function greet(name: string) {
  console.log(\`Hello, \${name}!\`);
  return { message: \`Welcome, \${name}\`, timestamp: Date.now() };
}

const result = greet("World");
console.log(result);`,
  },
  go: {
    label: "Go",
    code: `package main

import "fmt"

func main() {
  fmt.Println("Hello from Go")
}`,
  },
  rust: {
    label: "Rust",
    code: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}`,
  },
  python: {
    label: "Python",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(10)])`,
  },
  bash: {
    label: "Bash",
    code: `#!/bin/bash
count=$(ls *.txt 2>/dev/null | wc -l)
echo "Found $count text files"`,
  },
} as const;

const options = [
  ...Object.entries(snippets).map(([value, { label }]) => ({ value, label })),
  { value: "text", label: "Plain Text" },
];

const language = ref<string>("go");

const current = computed(() => {
  if (language.value === "text") {
    return {
      code: "This is plain text without a recognized grammar, so no syntax highlighting is applied.",
      language: "text",
    };
  }
  const key = language.value as keyof typeof snippets;
  return { code: snippets[key].code, language: key };
});
</script>

<template>
  <a-flex vertical :gap="16">
    <a-segmented v-model:value="language" :options="options" />
    <ax-code-highlighter :content="current.code" :language="current.language" />
  </a-flex>
</template>

<docs lang="zh-CN">
组件根据 `language` 按需加载 Shiki 内置语言及其官方别名（如 `go`、`rust`、`rs`、`c++`），切换语言时自动加载对应语法；无法识别的语言会安全降级为纯文本显示。
</docs>

<docs lang="en-US">
The component loads bundled Shiki languages and their official aliases (e.g. `go`, `rust`, `rs`, `c++`) on demand based on `language`. Switching languages automatically loads the matching grammar, while unrecognized languages safely fall back to plain text.
</docs>
