<script setup lang="ts">
import { Mermaid } from "@antdv-next/x";
import { Button, Space } from "antdv-next";

const content = `flowchart LR
  A[User Login] --> B{Validate}
  B -->|Success| C[System Entry]
  B -->|Failed| D[Error Message]
  C --> E[Dashboard]
  D --> A`;
</script>

<template>
  <Mermaid :content="content">
    <template #header>
      <div class="custom-header">
        <Space>
          <span class="custom-title">Login Flow</span>
          <Button type="primary" size="small">Export</Button>
          <Button size="small">Reset</Button>
        </Space>
      </div>
    </template>
  </Mermaid>
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
