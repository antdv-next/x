<script setup lang="ts">
const treeData = [
  {
    title: "src",
    path: "src",
    children: [
      {
        title: "index.js",
        path: "index.js",
        content: 'console.log("Hello");',
      },
      {
        title: "App.tsx",
        path: "App.tsx",
        content: "const App = () => <div>App</div>;",
      },
    ],
  },
  {
    title: "package.json",
    path: "package.json",
    content: '{"name": "demo"}',
  },
];
</script>

<template>
  <div style="padding: 24px">
    <div style="height: 300px; border: 1px solid #f0f0f0; margin-bottom: 24px">
      <ax-folder :tree-data="treeData">
        <template #previewRender="{ file, originNode }">
          <a-card :title="file.title" :bordered="false">
            <template #extra>
              <a-tag>{{ file.language }}</a-tag>
            </template>
            <div>Path: {{ file.path.join("/") }}</div>
            <pre style="margin: 12px 0 0">{{ file.content }}</pre>
            <div style="margin-top: 16px">
              <strong>Original preview:</strong>
              <component :is="originNode" />
            </div>
          </a-card>
        </template>
      </ax-folder>
    </div>
  </div>
</template>

<docs lang="zh-CN">
使用 `previewRender` 属性自定义文件预览内容。

`previewRender` 支持两种形式：

- ReactNode：直接渲染自定义内容
- 函数形式：`(file, info) => ReactNode`，其中：
  - `file`: 包含文件信息的对象 `{ content, path, title, language }`
  - `info`: 包含原始预览节点的对象 `{ originNode }`
</docs>

<docs lang="en-US">
Customize file preview content using the `previewRender` prop.

`previewRender` supports two forms:

- ReactNode: Directly render custom content
- Function form: `(file, info) => ReactNode`, where:
  - `file`: Object containing file info `{ content, path, title, language }`
  - `info`: Object containing original preview node `{ originNode }`
</docs>
