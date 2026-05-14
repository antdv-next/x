<script setup lang="ts">
import type { FolderTreeData, SelectedFileInfo } from "@antdv-next/x";

import { ref } from "vue";

const treeData: FolderTreeData[] = [
  {
    title: "x-chat-provider",
    path: "x-chat-provider",
    children: [
      {
        title: "SKILL.md",
        path: "SKILL.md",
        content: `---
name: x-chat-provider
version: 2.3.0
description: Focus on implementing custom Chat Provider, helping to adapt any streaming interface to Ant Design X standard format
---

# Skill Positioning

How to quickly adapt your streaming interface to Ant Design X's Chat Provider.`,
      },
      {
        title: "reference",
        path: "reference",
        children: [
          {
            title: "EXAMPLES.md",
            path: "EXAMPLES.md",
            content: `## Scenario 1

Use built-in provider for OpenAI-compatible services.

## Scenario 2

Use a custom provider when the response protocol is not standard.`,
          },
        ],
      },
    ],
  },
];

const selectedFile = ref<string[] | undefined>();

function onChange(info: SelectedFileInfo) {
  selectedFile.value = info.path;
}

function selectSkill() {
  selectedFile.value = ["x-chat-provider", "SKILL.md"];
}

function selectExamples() {
  selectedFile.value = ["x-chat-provider", "reference", "EXAMPLES.md"];
}

function clearSelection() {
  selectedFile.value = [];
}
</script>

<template>
  <div style="padding: 24px; height: 450px">
    <a-space style="margin-bottom: 16px">
      <a-button type="primary" @click="selectSkill">Select SKILL.md</a-button>
      <a-button type="primary" @click="selectExamples">
        Select EXAMPLES.md
      </a-button>
      <a-button @click="clearSelection">Clear Selection</a-button>
    </a-space>
    <div style="margin-bottom: 16px">
      <strong>Current Selected File:</strong>
      {{
        selectedFile && selectedFile.length > 0
          ? selectedFile.join("/")
          : "None"
      }}
    </div>
    <ax-folder
      :tree-data="treeData"
      :selected-file="selectedFile"
      @selected-file-change="onChange"
    >
      <template #directoryTitle>
        <div
          style="
            padding-inline: 16px;
            width: 100%;
            white-space: nowrap;
            padding-block: 8px;
            border-bottom: 1px solid #f0f0f0;
          "
        >
          Project File Browser
        </div>
      </template>
    </ax-folder>
  </div>
</template>

<docs lang="zh-CN">
受控文件选择。
</docs>

<docs lang="en-US">
Controlled file selection.
</docs>
