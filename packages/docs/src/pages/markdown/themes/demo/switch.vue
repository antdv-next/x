<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed, ref } from "vue";

const dark = ref(false);
const markdownClass = computed(() =>
  dark.value
    ? "x-markdown-dark theme-shell-dark"
    : "x-markdown-light theme-shell-light",
);
const content = `# Theme Switch\n\nToggle between light and dark appearance.`;
</script>

<template>
  <div>
    <label
      style="
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      "
    >
      <input v-model="dark" type="checkbox" />
      <span>Dark Mode</span>
    </label>
    <div :class="markdownClass" class="theme-shell">
      <XMarkdown :content="content" />
    </div>
  </div>
</template>

<style scoped>
.theme-shell {
  border: 1px solid var(--ant-color-border, #d9d9d9);
  border-radius: 8px;
  padding: 12px;
}

.theme-shell-dark {
  background: #0f172a;
  color: #e2e8f0;
}

.theme-shell-light {
  background: #fff;
  color: #111827;
}
</style>

<docs lang="zh-CN">
主题切换示例：在同一渲染器中切换浅色/深色主题。
</docs>

<docs lang="en-US">
Theme switch demo: toggle light and dark themes in one renderer.
</docs>
