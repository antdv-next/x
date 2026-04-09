<script setup lang="ts">
const content = `flowchart LR
  A[User Login] --> B{Validate}
  B -->|Success| C[System Entry]
  B -->|Failed| D[Error Message]
  C --> E[Dashboard]
  D --> A`;
</script>

<template>
  <ax-mermaid :content="content">
    <template #header>
      <div class="custom-header">
        <a-space>
          <span class="custom-title">Login Flow</span>
          <a-button type="primary" size="small">Export</a-button>
          <a-button size="small">Reset</a-button>
        </a-space>
      </div>
    </template>
  </ax-mermaid>
</template>

<style scoped>
.custom-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--ant-color-border, #d9d9d9);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: var(--ant-color-fill-secondary, #fafafa);
}

.custom-title {
  font-weight: 500;
}
</style>

<docs lang="zh-CN">
通过 `header` 插槽自定义头部内容。
</docs>

<docs lang="en-US">
Customize header content via the `header` slot.
</docs>
