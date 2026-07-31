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
  javascript: {
    label: "JavaScript",
    code: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return { message: \`Welcome, \${name}\`, timestamp: Date.now() };
}

const result = greet("World");
console.log(result);`,
  },
  python: {
    label: "Python",
    code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(10)])`,
  },
  json: {
    label: "JSON",
    code: `{
  "name": "antdv-next",
  "version": "1.1.3",
  "dependencies": {
    "vue": "^3.5.0",
    "antdv-next": "catalog:latest"
  }
}`,
  },
  html: {
    label: "HTML",
    code: `<!DOCTYPE html>
<html lang="en">
  <body>
    <h1 id="title">Hello World</h1>
    <button onclick="alert('hi')">Click</button>
  </body>
</html>`,
  },
  css: {
    label: "CSS",
    code: `.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  color: var(--text-color);
}`,
  },
} as const;

const options = [
  ...Object.entries(snippets).map(([value, { label }]) => ({ value, label })),
  { value: "text", label: "Plain Text" },
];

const language = ref<string>("typescript");

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
组件内置 `typescript`、`javascript`、`python`、`json`、`html`、`css` 六种常用语言，切换时按需加载对应语法；其他语言可通过 `setupCodeHighlighter` 注入自定义加载器扩展。
</docs>

<docs lang="en-US">
The component ships with six built-in languages: `typescript`, `javascript`, `python`, `json`, `html`, and `css`, loading each grammar on demand. Additional languages can be added via `setupCodeHighlighter`.
</docs>
