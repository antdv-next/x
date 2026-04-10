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
            :closable="false"
            :force-render="true"
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
              ref="attachmentsRef"
              :multiple="true"
              :max-count="MAX_COUNT"
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
            <a-dropdown
              :trigger="['click']"
              :menu="{
                items: acceptItems,
                onClick: ({ key }) => {
                  selectFile(String(key));
                },
              }"
              placement="topLeft"
              :arrow="{ pointAtCenter: true }"
            >
              <template #iconRender="{ key }">
                <FileImageOutlined v-if="key === 'image'" />
                <FileWordOutlined v-else-if="key === 'docs'" />
              </template>

              <a-button :disabled="items.length >= MAX_COUNT" type="text">
                <template #icon>
                  <LinkOutlined />
                </template>
              </a-button>
            </a-dropdown>
          </a-badge>
        </template>
      </ax-sender>
    </a-flex>
  </a-app>
</template>

<script setup lang="ts">
import type { AttachmentsRef, SenderRef } from "@antdv-next/x";

import {
  CloudUploadOutlined,
  FileImageOutlined,
  FileWordOutlined,
  LinkOutlined,
} from "@antdv-next/icons";
import { notification } from "antdv-next";
import { onBeforeUnmount, ref, watch } from "vue";

const MAX_COUNT = 5;

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

const open = ref(false);
const items = ref<Attachment[]>([]);
const text = ref("");

const senderRef = ref<SenderRef>();
const attachmentsRef = ref<AttachmentsRef>();

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

const selectFile = (key: string) => {
  attachmentsRef.value?.select({
    accept: key === "image" ? ".png,.jpg,.jpeg" : ".doc,.docx",
    multiple: true,
  });
};

const acceptItems = [
  {
    key: "image",
    label: "Image",
  },
  {
    key: "docs",
    label: "Docs",
  },
];

const onTextChange = (value: string) => {
  text.value = value;
};

watch(
  () => items.value.length,
  length => {
    open.value = length > 0;
  },
  {
    immediate: true,
  },
);

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
调用 `ref.select` 方法可以打开选择文件对话框，来区分类型进行上传，同时设置 `multiple` 为 true 可以支持多选，设置 `maxCount` 可以限制最多选择的文件数量。
</docs>

<docs lang="en-US">
Calling the `ref.select` method can open the file selection dialog to upload files by type. Setting `multiple` to true enables multi-selection, and setting `maxCount` can limit the maximum number of files that can be selected.
</docs>
