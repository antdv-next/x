<script setup lang="ts">
import type { FolderTreeData, SelectedFileInfo } from "@antdv-next/x";

import { computed, ref } from "vue";

const treeData: FolderTreeData[] = [
  {
    title: "project-root",
    path: "project-root",
    children: [
      {
        title: "src",
        path: "src",
        children: [
          {
            title: "components",
            path: "components",
            children: [
              {
                title: "Header.tsx",
                path: "Header.tsx",
                content: "Header component implementation...",
              },
              {
                title: "Footer.tsx",
                path: "Footer.tsx",
                content: "Footer component implementation...",
              },
              {
                title: "Sidebar.tsx",
                path: "Sidebar.tsx",
                content: "Sidebar component implementation...",
              },
            ],
          },
          {
            title: "pages",
            path: "pages",
            children: [
              {
                title: "Home.tsx",
                path: "Home.tsx",
                content: "Home page component...",
              },
              {
                title: "About.tsx",
                path: "About.tsx",
                content: "About page component...",
              },
              {
                title: "Contact.tsx",
                path: "Contact.tsx",
                content: "Contact page component...",
              },
            ],
          },
          {
            title: "utils",
            path: "utils",
            children: [
              {
                title: "helpers.ts",
                path: "helpers.ts",
                content: "Helper functions...",
              },
              {
                title: "constants.ts",
                path: "constants.ts",
                content: "Application constants...",
              },
            ],
          },
        ],
      },
      {
        title: "public",
        path: "public",
        children: [
          {
            title: "index.html",
            path: "index.html",
            content: "<!DOCTYPE html>...",
          },
          {
            title: "favicon.ico",
            path: "favicon.ico",
            content: "Favicon file...",
          },
        ],
      },
      {
        title: "package.json",
        path: "package.json",
        content: '{\n  "name": "my-project"\n}',
      },
      {
        title: "README.md",
        path: "README.md",
        content: "# Project Documentation...",
      },
    ],
  },
];

const searchValue = ref("");
const selectedFile = ref<string[]>([
  "project-root",
  "src",
  "components",
  "Header.tsx",
]);

const filteredTreeData = computed(() =>
  filterTreeData(treeData, searchValue.value),
);

function filterTreeData(
  data: FolderTreeData[],
  keyword: string,
): FolderTreeData[] {
  if (!keyword) {
    return data;
  }

  const normalizedKeyword = keyword.toLowerCase();

  return data.reduce<FolderTreeData[]>((acc, item) => {
    const titleMatch = item.path.toLowerCase().includes(normalizedKeyword);
    const filteredChildren = item.children
      ? filterTreeData(item.children, keyword)
      : [];

    if (titleMatch || filteredChildren.length > 0) {
      acc.push({
        ...item,
        children: filteredChildren.length > 0 ? filteredChildren : item.children,
      });
    }

    return acc;
  }, []);
}

function countFiles(data: FolderTreeData[]): number {
  return data.reduce((count, item) => {
    if (!item.children) {
      return count + 1;
    }

    return count + countFiles(item.children);
  }, 0);
}

function onSelectedFileChange(info: SelectedFileInfo) {
  selectedFile.value = info.path;
}
</script>

<template>
  <div style="padding: 24px; height: 600px">
    <a-space direction="vertical" style="width: 100%; margin-bottom: 16px">
      <a-input-search
        v-model:value="searchValue"
        placeholder="Search files or folders..."
        allow-clear
      />
      <a-space>
        <a-tag color="blue">Total Files: {{ countFiles(treeData) }}</a-tag>
        <a-tag color="green">
          Matching Results: {{ countFiles(filteredTreeData) }}
        </a-tag>
      </a-space>
    </a-space>
    <ax-folder
      :tree-data="filteredTreeData"
      :selected-file="selectedFile"
      @selected-file-change="onSelectedFileChange"
    >
      <template #directoryTitle>
        <div
          style="
            white-space: nowrap;
            padding: 12px;
            border-bottom: 1px solid #f0f0f0;
          "
        >
          <strong>Project File Browser</strong>
          <div
            v-if="searchValue"
            style="font-size: 12px; color: #666; margin-top: 4px"
          >
            Search: "{{ searchValue }}"
          </div>
        </div>
      </template>
    </ax-folder>
  </div>
</template>

<docs lang="zh-CN">
可搜索的文件浏览器。
</docs>

<docs lang="en-US">
Searchable file browser.
</docs>
