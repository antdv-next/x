<script setup lang="ts">
const content = `flowchart LR
  A[User Login] --> B{Validate}
  B -->|Success| C[System Entry]
  B -->|Failed| D[Error Message]
  C --> E[Dashboard]
  D --> A`;
</script>

<template>
  <div class="demo-wrapper">
    <ax-mermaid :content="content">
      <template #header>
        <div class="custom-header">
          <a-space :size="16">
            <span class="custom-title">Login Flow</span>
            <a-button type="primary" size="small">Export</a-button>
            <a-button size="small">Reset</a-button>
          </a-space>
        </div>
      </template>
    </ax-mermaid>
  </div>
</template>

<style scoped>
.demo-wrapper {
  padding: 24px;
}

.custom-header {
  padding: 12px 16px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: var(--ant-color-fill-secondary, #fafafa);
}

.custom-title {
  color: var(--ant-color-text, #1a1a1a);
  font-weight: 500;
}
</style>

<docs lang="zh-CN">
自定义头部内容。
</docs>

<docs lang="en-US">
Customize header content.
</docs>
