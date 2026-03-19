<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";
import { ref } from "vue";

const code = `const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

// Calculate first 10 Fibonacci numbers
for (let i = 0; i < 10; i++) {
  console.log(fibonacci(i));
}`;

const showLineNumbers = ref(false);
</script>

<template>
  <div style="margin-bottom: 16px">
    <label style="display: flex; align-items: center; gap: 6px">
      <input v-model="showLineNumbers" type="checkbox" />
      显示行号
    </label>
  </div>
  <CodeHighlighter
    :content="code"
    language="typescript"
    :show-line-numbers="showLineNumbers"
  />
</template>

<docs lang="zh-CN">
通过 `showLineNumbers` 控制是否显示行号。
</docs>

<docs lang="en-US">
Use `showLineNumbers` to toggle line numbers.
</docs>
