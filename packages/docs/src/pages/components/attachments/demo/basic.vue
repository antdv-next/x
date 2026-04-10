<template>
  <a-app>
    <div ref="containerRef">
      <a-flex vertical gap="middle" align="flex-start">
        <ax-sender>
          <template #prefix>
            <ax-attachments
              :before-upload="() => false"
              @change="onChange"
              :get-drop-container="getDropContainer"
              :placeholder="placeholder"
            >
              <template #placeholder-icon>
                <CloudUploadOutlined />
              </template>
              <a-button type="text">
                <template #icon>
                  <LinkOutlined />
                </template>
              </a-button>
            </ax-attachments>
          </template>
        </ax-sender>

        <a-switch
          v-model:checked="fullScreenDrop"
          checked-children="Full screen drop"
          un-checked-children="Full screen drop"
        />
      </a-flex>
    </div>
  </a-app>
</template>

<script setup lang="ts">
import { CloudUploadOutlined, LinkOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { ref } from "vue";
const { message } = App.useApp();

const fullScreenDrop = ref(false);
const containerRef = ref<HTMLDivElement>();

const placeholder = {
  title: "Drag & Drop files here",
  description: "Support file type: image, video, audio, document, etc.",
};

const getDropContainer = () =>
  fullScreenDrop.value ? document.body : containerRef.value;

const onChange = ({ file }: { file?: { name?: string } }) => {
  if (file?.name) {
    message.info(`Mock upload: ${file.name}`);
  }
};
</script>

<docs lang="zh-CN">
基础用法，可以通过 `getDropContainer` 支持拖拽上传。
</docs>

<docs lang="en-US">
Basic usage. You can use `getDropContainer` to support drag and drop upload.
</docs>
