<script setup lang="ts">
import type { FileContentService, FolderTreeData } from "@antdv-next/x";

const treeData: FolderTreeData[] = [
  {
    title: "x-request",
    path: "x-request",
    children: [
      {
        title: "SKILL.md",
        path: "SKILL.md",
      },
      {
        title: "reference",
        path: "reference",
        children: [
          {
            title: "API.md",
            path: "API.md",
          },
          {
            title: "CORE.md",
            path: "CORE.md",
          },
          {
            title: "EXAMPLES_SERVICE_PROVIDER.md",
            path: "EXAMPLES_SERVICE_PROVIDER.md",
          },
        ],
      },
    ],
  },
];

const fileContentService: FileContentService = {
  async loadFileContent(filePath) {
    const mockFiles: Record<string, string> = {
      "x-request/SKILL.md": `---
name: x-request
version: 2.3.0-beta.1
description: Focus on explaining the practical configuration and usage of XRequest, providing accurate configuration instructions based on official documentation
---

# Skill Positioning

This skill focuses on solving how to correctly configure XRequest to adapt to various streaming interface requirements.`,
      "x-request/reference/API.md": `### XRequest

Use XRequest to connect streaming and non-streaming services with a consistent API.`,
      "x-request/reference/CORE.md": `### Core Configuration

- Basic request setup
- Stream response adaptation
- Error handling
- Retry strategy`,
      "x-request/reference/EXAMPLES_SERVICE_PROVIDER.md": `### Service Provider Examples

- OpenAI-compatible endpoint
- Custom SSE endpoint
- JSON chunk endpoint`,
    };

    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFiles[filePath] ?? `// File not found: ${filePath}`;
  },
};
</script>

<template>
  <div style="height: 420px">
    <ax-folder
      :tree-data="treeData"
      :file-content-service="fileContentService"
      :default-selected-file="['x-request', 'SKILL.md']"
    />
  </div>
</template>

<docs lang="zh-CN">
自定义文件内容服务。
</docs>

<docs lang="en-US">
Custom file content service.
</docs>
