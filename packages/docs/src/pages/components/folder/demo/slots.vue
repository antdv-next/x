<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

const treeData: FolderTreeData[] = [
  {
    title: "src",
    path: "src",
    children: [
      {
        title: "App.vue",
        path: "App.vue",
        content: "<template>Hello</template>",
      },
    ],
  },
];
</script>

<template>
  <div style="height: 420px">
    <ax-folder
      :tree-data="treeData"
      :default-selected-file="['src', 'App.vue']"
    >
      <template #directoryTitle>
        <strong>📁 Workspace</strong>
      </template>
      <template #previewTitle="{ title, path }">
        <span>{{ title }} — {{ path.join("/") }}</span>
      </template>
      <template #previewRender="{ file, originNode }">
        <div>
          <p style="margin: 0 0 8px; color: #888">
            Language: {{ file.language }}
          </p>
          <component :is="originNode" />
        </div>
      </template>
      <template #emptyRender>
        <div>Pick a file to preview.</div>
      </template>
    </ax-folder>
  </div>
</template>

<docs lang="zh-CN">
通过 `directoryTitle` / `previewTitle` / `previewRender` / `emptyRender` 插槽自定义渲染。
插槽优先级高于同名 prop。
</docs>

<docs lang="en-US">
Customize render via `directoryTitle` / `previewTitle` / `previewRender` / `emptyRender` slots.
Slots take precedence over the same-named props.
</docs>
