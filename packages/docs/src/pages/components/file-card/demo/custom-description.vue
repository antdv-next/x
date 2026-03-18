<script setup lang="ts">
import { DownloadOutlined } from "@antdv-next/icons";
import { FileCard } from "@antdv-next/x";
import { Button, Flex, message, Typography } from "antdv-next";
import { h } from "vue";

const { Text } = Typography;

const [messageApi, contextHolder] = message.useMessage();

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
  messageApi.info(`Clicked download: ${fileName},${url}`);
};
</script>

<template>
  <component :is="contextHolder" />
  <Flex vertical gap="middle">
    <FileCard
      v-for="(file, index) in fileData"
      :key="index"
      :name="file.name"
      :src="file.src"
      :byte="file.byte"
      :description="
        ({ size, src, name }) =>
          h(
            Flex,
            {
              align: 'center',
              justify: 'space-between',
              style: { width: '100%' },
            },
            {
              default: () => [
                h(
                  Text,
                  {
                    type: 'secondary',
                    style: { fontSize: '12px' },
                  },
                  {
                    default: () => `Size: ${size}`,
                  },
                ),
                h(
                  Button,
                  {
                    type: 'text',
                    size: 'small',
                    icon: h(DownloadOutlined),
                    onClick:
                      src && name
                        ? (e: Event) => {
                            e.stopPropagation();
                            handleDownload(src, name);
                          }
                        : undefined,
                    style: {
                      fontSize: '12px',
                      padding: '2px 8px',
                      height: 'auto',
                      lineHeight: 1.5,
                    },
                  },
                  {
                    default: () => 'Download',
                  },
                ),
              ],
            },
          )
      "
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
    />
  </Flex>
</template>

<docs lang="zh-CN">
自定义描述信息，包含文件大小和下载按钮。
</docs>

<docs lang="en-US">
Custom description with file size and download button.
</docs>
