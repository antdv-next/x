<script setup lang="ts">
import { ref } from "vue";

const code = [
  "import { createApp } from 'vue';",
  "import App from './App.vue';",
  "",
  "const app = createApp(App);",
  "app.mount('#app');",
].join("\n");

const theme = ref<"light" | "dark">("light");
</script>

<template>
  <ax-code-highlighter
    :content="code"
    language="typescript"
    :show-theme-toggle="true"
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
