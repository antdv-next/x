<script setup lang="ts">
import { DownloadOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
const { message } = App.useApp();

const fileData = [
  {
    name: "Project Document.docx",
    byte: 2457600,
    src: "/downloads/project-document.docx",
  },
  {
    name: "Design Files.sketch",
    byte: 10485760,
    src: "/downloads/design-files.sketch",
  },
  {
    name: "Product Prototype.fig",
    byte: 5242880,
    src: "/downloads/product-prototype.fig",
  },
];

const handleDownload = (url: string, fileName: string) => {
  message.info(`Clicked download: ${fileName},${url}`);
};
</script>

<template>
  <a-flex vertical gap="middle">
    <ax-file-card
      v-for="(file, index) in fileData"
      :key="index"
      :name="file.name"
      :src="file.src"
      :byte="file.byte"
      :styles="{
        file: {
          width: 300,
          padding: '12px 16px',
        },
        description: {
          marginTop: 4,
          lineHeight: 1.5,
        },
      }"
    >
      <template #description="{ info }">
        <a-flex align="center" justify="space-between" style="width: 100%">
          <a-typography-text type="secondary" style="font-size: 12px">
            文件大小：{{ info.size }}
          </a-typography-text>
          <a-button
            type="text"
            size="small"
            :disabled="!info.src || !info.name"
            style="
              font-size: 12px;
              padding: 2px 8px;
              height: auto;
              line-height: 1.5;
            "
            @click.stop="handleDownload(info.url, info.name)"
          >
            <template #icon>
              <DownloadOutlined />
            </template>
            下载
          </a-button>
        </a-flex>
      </template>
    </ax-file-card>
  </a-flex>
</template>

<docs lang="zh-CN">
自定义描述信息，包含文件大小和下载按钮。
</docs>

<docs lang="en-US">
Custom description with file size and download button.
</docs>
