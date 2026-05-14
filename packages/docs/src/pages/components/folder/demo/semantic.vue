<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

import { FolderOutlined } from "@antdv-next/icons";
import { Flex } from "antdv-next";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "根节点",
    directoryTree: "目录树容器",
    directoryTitle: "目录树标题",
    filePreview: "文件预览容器",
    previewTitle: "预览标题",
    previewRender: "预览内容",
  },
  "en-US": {
    root: "Root",
    directoryTree: "Directory tree container",
    directoryTitle: "Directory tree title",
    filePreview: "File preview container",
    previewTitle: "Preview title",
    previewRender: "Preview content",
  },
} as const;

const { locale } = useLocale();

const semanticLocale = computed(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

const semantics = computed(() => [
  { name: "root", desc: semanticLocale.value.root },
  { name: "directoryTree", desc: semanticLocale.value.directoryTree },
  { name: "directoryTitle", desc: semanticLocale.value.directoryTitle },
  { name: "filePreview", desc: semanticLocale.value.filePreview },
  { name: "previewTitle", desc: semanticLocale.value.previewTitle },
  { name: "previewRender", desc: semanticLocale.value.previewRender },
]);

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
            title: "Button.ts",
            path: "Button.ts",
            content: `interface ButtonProps {
  children: string;
  type?: "primary" | "default" | "dashed";
}

export function createButton(props: ButtonProps) {
  const type = props.type ?? "default";
  return '<button class="btn btn-' + type + '">' + props.children + '</button>';
}`,
          },
          {
            title: "Input.ts",
            path: "Input.ts",
            content: `interface InputProps {
  placeholder?: string;
  value?: string;
}

export function createInput(props: InputProps) {
  return {
    type: "text",
    placeholder: props.placeholder,
    value: props.value,
    className: "input",
  };
}`,
          },
        ],
      },
      {
        title: "utils",
        path: "utils",
        children: [
          {
            title: "helper.ts",
            path: "helper.ts",
            content: `export const formatDate = (date: Date): string => {
  return date.toLocaleDateString();
};`,
          },
        ],
      },
    ],
  },
  {
    title: "package.json",
    path: "package.json",
    content: `{
  "name": "my-app",
  "version": "1.0.0",
  "description": "A sample application",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "vue": "^3.5.0"
  }
}`,
  },
];
</script>

<template>
  <SemanticPreview component-name="Folder" :semantics="semantics">
    <template #default="{ classes }">
      <div style="height: 420px; width: 100%">
        <ax-folder
          :tree-data="treeData"
          :classes="classes"
          :directory-tree-with="200"
          :default-selected-file="['src', 'components', 'Button.ts']"
        >
          <template #directoryTitle>
            <Flex
              style="
                padding-inline: 16px;
                white-space: nowrap;
                width: 100%;
                padding-block: 8px;
                border-bottom: 1px solid #f0f0f0;
              "
              align="center"
            >
              <FolderOutlined style="margin-right: 8px" />
              项目文件浏览器
            </Flex>
          </template>
        </ax-folder>
      </div>
    </template>
  </SemanticPreview>
</template>

<docs lang="zh-CN">
Folder 的语义化 DOM 结构预览。
</docs>

<docs lang="en-US">
Semantic DOM preview for Folder.
</docs>
