<script setup lang="ts">
import type { FolderTreeData, SelectedFileInfo } from "@antdv-next/x";

import { ref } from "vue";

const treeData: FolderTreeData[] = [
  {
    title: "src",
    path: "src",
    children: [
      {
        title: "App.vue",
        path: "App.vue",
        content: "<template>App</template>",
      },
      {
        title: "main.ts",
        path: "main.ts",
        content: "import App from './App.vue';",
      },
    ],
  },
];

const selectedFile = ref<string[]>(["src", "App.vue"]);

function onChange(info: SelectedFileInfo) {
  selectedFile.value = info.path;
}
</script>

<template>
  <div style="height: 420px">
    <ax-folder
      :tree-data="treeData"
      :selected-file="selectedFile"
      @selected-file-change="onChange"
    />
  </div>
</template>

<docs lang="zh-CN">
通过 `selectedFile` + `@selected-file-change` 实现受控选中。
</docs>

<docs lang="en-US">
Controlled file selection via `selectedFile` + `@selected-file-change`.
</docs>
