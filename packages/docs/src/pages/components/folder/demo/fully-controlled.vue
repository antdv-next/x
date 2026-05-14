<script setup lang="ts">
import type { FolderTreeData, SelectedFileInfo } from "@antdv-next/x";

import { ref } from "vue";

const treeData: FolderTreeData[] = [
  {
    title: "use-x-chat",
    path: "use-x-chat",
    children: [
      {
        title: "SKILL.md",
        path: "SKILL.md",
        content: `# use-x-chat

Build professional AI conversation applications with useXChat.`,
      },
      {
        title: "reference",
        path: "reference",
        children: [
          {
            title: "API.md",
            path: "API.md",
            content: `### XChatConfigReturnType

- abort
- isRequesting
- messages
- onRequest`,
          },
          {
            title: "CORE.md",
            path: "CORE.md",
            content: `### Message Management

You can set, remove, reload and queue messages.`,
          },
        ],
      },
    ],
  },
];

const selectedFile = ref<string[]>(["use-x-chat", "SKILL.md"]);
const expandedPaths = ref<string[]>(["use-x-chat", "use-x-chat/reference"]);

function onSelectedFileChange(info: SelectedFileInfo) {
  selectedFile.value = info.path;
}
</script>

<template>
  <div style="height: 420px">
    <ax-folder
      :tree-data="treeData"
      :selected-file="selectedFile"
      :expanded-paths="expandedPaths"
      @selected-file-change="onSelectedFileChange"
      @update:expanded-paths="expandedPaths = $event"
    />
  </div>
</template>

<docs lang="zh-CN">
完全受控模式。
</docs>

<docs lang="en-US">
Fully controlled mode.
</docs>
