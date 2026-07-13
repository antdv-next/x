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
      <template
        #header="{
          renderType,
          setRenderType,
          zoomIn,
          zoomOut,
          resetZoom,
          download,
          copy,
        }"
      >
        <div class="custom-header">
          <span class="custom-title">Login Flow</span>
          <a-space>
            <a-button
              size="small"
              @click="setRenderType(renderType === 'image' ? 'code' : 'image')"
            >
              {{ renderType === "image" ? "Code" : "Diagram" }}
            </a-button>
            <template v-if="renderType === 'image'">
              <a-button size="small" @click="zoomOut">-</a-button>
              <a-button size="small" @click="zoomIn">+</a-button>
              <a-button size="small" @click="resetZoom">Reset</a-button>
              <a-button type="primary" size="small" @click="download">
                Download
              </a-button>
            </template>
            <a-button v-else type="primary" size="small" @click="copy">
              Copy
            </a-button>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
自定义头部内容，并通过插槽作用域复用内置的视图切换、缩放、下载与复制操作。
</docs>

<docs lang="en-US">
Customize header content and reuse the built-in view switching, zoom, download, and copy actions from the slot scope.
</docs>
