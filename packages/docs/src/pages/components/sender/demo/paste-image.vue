<script setup lang="ts">
import type {
  AttachmentsProps,
  AttachmentsRef,
  SenderRef,
} from "@antdv-next/x";

import { CloudUploadOutlined, PaperClipOutlined } from "@antdv-next/icons";
import { ref } from "vue";

type Attachment = Exclude<AttachmentsProps["items"], undefined>[number];

const open = ref(false);
const text = ref("");
const items = shallowRef<Attachment[]>([]);

const senderRef = ref<SenderRef>();
const attachmentsRef = ref<AttachmentsRef>();

const onPasteFile = (files: FileList) => {
  for (const file of files) {
    attachmentsRef.value?.upload(file);
  }
  open.value = true;
};

const onChange = ({ fileList }: { fileList: Attachment[] }) => {
  items.value = fileList;
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

const onSubmit = () => {
  items.value = [];
  text.value = "";
};
</script>

<template>
  <a-flex :style="{ height: '220px' }" align="end">
    <ax-sender
      ref="senderRef"
      :value="text"
      :on-change="
        (v: string) => {
          text = v;
        }
      "
      :on-paste-file="onPasteFile"
      :on-submit="onSubmit"
    >
      <template #header>
        <ax-sender-header
          title="Attachments"
          :open="open"
          force-render
          :on-open-change="
            (val: boolean) => {
              open = val;
            }
          "
          :styles="{ content: { padding: 0 } }"
        >
          <ax-attachments
            ref="attachmentsRef"
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
        <a-button
          type="text"
          :style="{ fontSize: '16px' }"
          @click="open = !open"
        >
          <template #icon>
            <PaperClipOutlined />
          </template>
        </a-button>
      </template>
    </ax-sender>
  </a-flex>
</template>

<docs lang="zh-CN">
使用 `onPasteFile` 获取黏贴的文件，配合 Attachments 进行文件上传。
</docs>

<docs lang="en-US">
Use `onPasteFile` to get pasted files, and upload them with Attachments.
</docs>
