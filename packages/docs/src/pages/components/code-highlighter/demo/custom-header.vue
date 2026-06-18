<script setup lang="ts">
import { App } from "antdv-next";
import { ref } from "vue";

const code = `import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");`;

const theme = ref<"light" | "dark">("light");

const { message } = App.useApp();

function handleCopy(content: string) {
  message.success(`已复制 ${content.length} 个字符`);
}

function handleThemeChange(value: "light" | "dark") {
  theme.value = value;
}
</script>

<template>
  <ax-code-highlighter
    :content="code"
    language="typescript"
    :theme="theme"
    @copy="handleCopy"
    @update:theme="handleThemeChange"
  >
    <template #header="{ language, copied, copy, theme, toggleTheme }">
      <div class="custom-header">
        <span class="custom-title">{{ language }}</span>
        <a-space>
          <a-button size="small" @click="toggleTheme">
            {{ theme === "light" ? "🌙 Dark" : "☀️ Light" }}
          </a-button>
          <a-button type="primary" size="small" @click="copy">
            {{ copied ? "已复制" : "复制" }}
          </a-button>
        </a-space>
      </div>
    </template>
  </ax-code-highlighter>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--ant-color-fill-secondary, #fafafa);
  border-bottom: 1px solid var(--ant-color-border, #d9d9d9);
}

.custom-title {
  font-weight: 500;
  text-transform: uppercase;
}
</style>

<docs lang="zh-CN">
通过 `header` 插槽自定义头部内容。插槽作用域提供 `language`、`theme`、`copied` 状态以及 `copy`、`toggleTheme` 方法，可在自定义头部中复用复制与主题切换能力。
</docs>

<docs lang="en-US">
Customize header content via the `header` slot. The slot scope exposes the `language`, `theme`, and `copied` state along with the `copy` and `toggleTheme` methods, so you can reuse the copy and theme-toggle capabilities inside your custom header.
</docs>
