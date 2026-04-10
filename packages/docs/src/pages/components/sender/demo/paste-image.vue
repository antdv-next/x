<script setup lang="ts">
import type {
  AttachmentsProps,
  AttachmentsRef,
  SenderRef,
} from "@antdv-next/x";

import { CloudUploadOutlined, PaperClipOutlined } from "@antdv-next/icons";
import { onBeforeUnmount, ref } from "vue";

type Attachment = Exclude<AttachmentsProps["items"], undefined>[number];

const open = ref(false);
const text = ref("");
const items = shallowRef<Attachment[]>([]);

const senderRef = ref<SenderRef>();
const attachmentsRef = ref<AttachmentsRef>();

onBeforeUnmount(() => {
  items.value.forEach(item => {
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
});

const onPasteFile = (files: FileList) => {
  for (const file of files) {
    attachmentsRef.value?.upload(file);
  }
  open.value = true;
};

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
        title: "Paste or upload files",
        description: "Paste files into the input box or click to select files",
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
          @click="
            open ? (open = false) : attachmentsRef?.select({ multiple: true })
          "
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
