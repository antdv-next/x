<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

const treeData: FolderTreeData[] = [
  {
    title: "src",
    path: "src",
    children: [
      {
        title: "components",
        path: "components",
        children: [
          {
            title: "Button.tsx",
            path: "Button.tsx",
            content: "export const Button = () => <button>Click</button>;",
          },
          {
            title: "Input.tsx",
            path: "Input.tsx",
            content: "export const Input = () => <input />;",
          },
        ],
      },
      {
        title: "index.ts",
        path: "index.ts",
        content: "export * from './components';",
      },
    ],
  },
  {
    title: "package.json",
    path: "package.json",
    content: '{\n  "name": "demo-app"\n}',
  },
];
</script>

<template>
  <div style="height: 480px">
    <ax-folder
      :tree-data="treeData"
      :default-selected-file="['src', 'components', 'Button.tsx']"
    />
  </div>
</template>

<docs lang="zh-CN">
基础用法，展示文件树及选中文件的内容预览。
</docs>

<docs lang="en-US">
Basic usage. Render a file tree and preview the selected file's content.
</docs>
