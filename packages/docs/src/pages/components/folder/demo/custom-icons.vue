<script setup lang="ts">
import type { FolderTreeData } from "@antdv-next/x";

import {
  CodeOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  FileMarkdownOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FolderOutlined,
} from "@antdv-next/icons";
import { h } from "vue";

const treeData: FolderTreeData[] = [
  {
    title: "my-project",
    path: "my-project",
    children: [
      {
        title: "docs",
        path: "docs",
        children: [
          {
            title: "README.md",
            path: "README.md",
            content: "# Project Documentation",
          },
          {
            title: "API.pdf",
            path: "API.pdf",
            content: "API Documentation PDF",
          },
        ],
      },
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
                content: "Button component code...",
              },
              {
                title: "styles.css",
                path: "styles.css",
                content: "/* CSS styles */",
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
                content: "Utility functions...",
              },
            ],
          },
        ],
      },
      {
        title: "assets",
        path: "assets",
        children: [
          {
            title: "logo.png",
            path: "logo.png",
            content: "Company logo image",
          },
          {
            title: "banner.jpg",
            path: "banner.jpg",
            content: "Website banner image",
          },
        ],
      },
      {
        title: "data",
        path: "data",
        children: [
          {
            title: "users.xlsx",
            path: "users.xlsx",
            content: "User data spreadsheet",
          },
          {
            title: "report.docx",
            path: "report.docx",
            content: "Monthly report document",
          },
          {
            title: "archive.zip",
            path: "archive.zip",
            content: "Project archive",
          },
        ],
      },
      {
        title: "package.json",
        path: "package.json",
        content: '{\n  "name": "my-project"\n}',
      },
    ],
  },
];

const iconWithColor = (icon: any, color: string) => () =>
  h(icon, { style: { color } });

const directoryIcons = {
  directory: iconWithColor(FolderOutlined, "#faad14"),
  md: iconWithColor(FileMarkdownOutlined, "#722ed1"),
  pdf: iconWithColor(FilePdfOutlined, "#ff4d4f"),
  tsx: iconWithColor(CodeOutlined, "#13c2c2"),
  css: iconWithColor(CodeOutlined, "#13c2c2"),
  ts: iconWithColor(CodeOutlined, "#13c2c2"),
  png: iconWithColor(FileImageOutlined, "#1890ff"),
  jpg: iconWithColor(FileImageOutlined, "#1890ff"),
  xlsx: iconWithColor(FileExcelOutlined, "#52c41a"),
  docx: iconWithColor(FileWordOutlined, "#1890ff"),
  zip: iconWithColor(FileZipOutlined, "#faad14"),
  json: iconWithColor(FileTextOutlined, "#666"),
};
</script>

<template>
  <div style="padding: 24px; height: 500px">
    <ax-folder
      :tree-data="treeData"
      :default-selected-file="['my-project', 'package.json']"
      :directory-icons="directoryIcons"
    >
      <template #directoryTitle>
        <div
          style="
            padding: 12px;
            white-space: nowrap;
            border-bottom: 1px solid #f0f0f0;
          "
        >
          <strong>Custom Icon File Browser</strong>
          <div style="font-size: 12px; color: #666; margin-top: 4px">
            Display different icons based on file type
          </div>
        </div>
      </template>
    </ax-folder>
  </div>
</template>

<docs lang="zh-CN">
自定义文件图标。
</docs>

<docs lang="en-US">
Custom file icons.
</docs>
