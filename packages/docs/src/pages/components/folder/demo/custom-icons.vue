<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

import { FileMarkdownOutlined, FolderOpenOutlined } from "@antdv-next/icons";
import { h } from "vue";

const treeData: FolderTreeData[] = [
  {
    title: "docs",
    path: "docs",
    children: [
      {
        title: "README.md",
        path: "README.md",
        content: "# Hello",
      },
    ],
  },
];

const directoryIcons = {
  directory: () => h(FolderOpenOutlined),
  md: () => h(FileMarkdownOutlined),
};
</script>

<template>
  <div style="height: 360px">
    <ax-folder :tree-data="treeData" :directory-icons="directoryIcons" />
  </div>
</template>

<docs lang="zh-CN">
通过 `directoryIcons` 自定义目录与按扩展名匹配的文件图标。
</docs>

<docs lang="en-US">
Customize directory icon and per-extension file icons via `directoryIcons`.
</docs>
