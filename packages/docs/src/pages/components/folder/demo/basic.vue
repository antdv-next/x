<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

const treeData: FolderTreeData[] = [
  {
    title: "use-x-chat",
    path: "use-x-chat",
    children: [
      {
        title: "SKILL.md",
        path: "SKILL.md",
        content: `---
name: use-x-chat
version: 2.3.0
description: Focus on explaining how to use the useXChat Hook, including custom Provider integration, message management, error handling, etc.
---

# Quick Start

Use the useXChat Hook to build professional AI conversation applications.

## Requirements

- @ant-design/x-sdk: 2.2.2+
- @ant-design/x: latest
`,
      },
      {
        title: "reference",
        path: "reference",
        children: [
          {
            title: "API.md",
            path: "API.md",
            content: `### useXChat

\`\`\`tsx
const { messages, onRequest, isRequesting } = useXChat({ provider });
\`\`\`

Message list and request state are exposed from the hook.`,
          },
          {
            title: "CORE.md",
            path: "CORE.md",
            content: `### Message Management

- Read current messages
- Append new messages
- Abort active request
- Reload an existing message`,
          },
        ],
      },
    ],
  },
];
</script>

<template>
  <div style="height: 420px">
    <ax-folder
      :tree-data="treeData"
      :default-selected-file="['use-x-chat', 'SKILL.md']"
    />
  </div>
</template>

<docs lang="zh-CN">
基础用法。
</docs>

<docs lang="en-US">
Basic usage.
</docs>
