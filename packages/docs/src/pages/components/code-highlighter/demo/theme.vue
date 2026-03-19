<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";
import { ref } from "vue";

const code = `import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');`;

const theme = ref<"light" | "dark">("light");
</script>

<template>
  <CodeHighlighter
    :content="code"
    language="typescript"
    :theme="theme"
    @update:theme="theme = $event"
  />
</template>

<docs lang="zh-CN">
支持 `light` 和 `dark` 两种主题切换，点击主题按钮即可切换。
</docs>

<docs lang="en-US">
Supports `light` and `dark` themes. Click the theme button to switch.
</docs>
