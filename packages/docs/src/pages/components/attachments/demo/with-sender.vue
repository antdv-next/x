<template>
  <a-app>
    <a-flex :style="{ minHeight: '250px' }" align="flex-end">
      <ax-sender
        ref="senderRef"
        :value="text"
        :on-change="onTextChange"
        :on-submit="onSubmit"
      >
        <template #header>
          <ax-sender-header
            title="Attachments"
            :open="open"
            :on-open-change="
              (val: boolean) => {
                open = val;
              }
            "
            :styles="{
              content: {
                padding: 0,
              },
            }"
          >
            <ax-attachments
              :before-upload="() => false"
              :items="items"
              @change="onChange"
              :placeholder="placeholder"
              :get-drop-container="() => senderRef?.nativeElement"
            >
              <template #placeholder-icon>
                <CloudUploadOutlined />
              </template>
            </ax-attachments>
          </ax-sender-header>
        </template>

        <template #prefix>
          <a-badge :dot="items.length > 0 && !open">
            <a-button
              @click="
                () => {
                  open = !open;
                }
              "
            >
              <template #icon>
                <LinkOutlined />
              </template>
            </a-button>
          </a-badge>
        </template>
      </ax-sender>
    </a-flex>
  </a-app>
</template>

<script setup lang="ts">
import type { SenderRef } from "@antdv-next/x";

import { CloudUploadOutlined, LinkOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { onBeforeUnmount, ref } from "vue";

interface Attachment {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  url?: string;
  thumbUrl?: string;
  percent?: number;
  response?: any;
  size?: number;
  originFileObj?: File;
}

const open = ref(true);
const items = ref<Attachment[]>([]);
const text = ref("");

const { notification } = App.useApp();
const senderRef = ref<SenderRef>();

onBeforeUnmount(() => {
  items.value.forEach(item => {
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
});

const onChange = ({
  file,
  fileList,
}: {
  file: Attachment;
  fileList: Attachment[];
}) => {
  items.value = fileList.map(item => {
    if (
      item.uid === file.uid &&
      file.status !== "removed" &&
      item.originFileObj
    ) {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
      return {
        ...item,
        url: URL.createObjectURL(item.originFileObj),
      };
    }
    return item;
  });
};

const placeholder = (type: "inline" | "drop") =>
  type === "drop"
    ? {
        title: "Drop file here",
      }
    : {
        title: "Upload files",
        description: "Click or drag files to this area to upload",
      };

const onTextChange = (value: string) => {
  text.value = value;
};

const submitDescription = () =>
  `You said: ${text.value || "(empty)"}\nAttachments count: ${items.value.length}\n${items.value.map(item => `- ${item.name}`).join("\n")}`;

const onSubmit = () => {
  notification.info({
    title: "Mock Submit",
    description: submitDescription(),
  });

  items.value = [];
  text.value = "";
};
</script>

<docs lang="zh-CN">
配合 Sender.Header 使用，在对话中插入附件。
</docs>

<docs lang="en-US">
Work with Sender.Header to insert file into the conversation.
</docs>
