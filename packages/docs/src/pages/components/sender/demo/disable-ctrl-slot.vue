<script setup lang="ts">
import type {
  AttachmentsProps,
  AttachmentsRef,
  SenderProps,
  SenderRef,
} from "@antdv-next/x";

import { CloudUploadOutlined, PaperClipOutlined } from "@antdv-next/icons";
import { computed, onBeforeUnmount, ref } from "vue";

type Attachment = Exclude<AttachmentsProps["items"], undefined>[number];

const slotConfig: SenderProps["slotConfig"] = [
  { type: "text", value: "Please help me search for news about " },
  {
    type: "select",
    key: "search_type",
    props: {
      options: ["AI", "Technology", "Entertainment"],
      placeholder: "Please select a category",
    },
  },
];

const loading = ref(false);
const open = ref(false);
const value = ref("");
const items = shallowRef<Attachment[]>([]);

const submitDisabled = computed(
  () => items.value.length === 0 && !value.value && !loading.value,
);

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

const onSubmit = () => {
  senderRef.value?.clear();
  items.value = [];
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};
</script>

<template>
  <a-flex :style="{ height: '350px' }" align="end">
    <ax-sender
      ref="senderRef"
      submit-type="enter"
      :slot-config="slotConfig"
      :on-change="
        (v: string) => {
          value = v;
        }
      "
      placeholder="按 Enter 发送消息"
      :on-submit="onSubmit"
    >
      <template #header>
        <ax-sender-header
          title="Attachments"
          :open="open"
          :on-open-change="(val: boolean) => (open = val)"
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
        <a-badge :dot="items.length > 0 && !open">
          <a-button
            type="text"
            @click="
              open
                ? (open = false)
                : attachmentsRef?.select({ multiple: true }) || (open = true)
            "
          >
            <template #icon>
              <PaperClipOutlined :style="{ fontSize: '16px' }" />
            </template>
          </a-button>
        </a-badge>
      </template>

      <template #suffix="{ components }">
        <a-tooltip v-if="loading" title="点击取消">
          <component :is="components.LoadingButton" />
        </a-tooltip>
        <component
          :is="components.SendButton"
          v-else
          :disabled="submitDisabled"
        />
      </template>
    </ax-sender>
  </a-flex>
</template>

<docs lang="zh-CN">
自定义禁用发送逻辑，并使用 `slotConfig` 配置插槽。
</docs>

<docs lang="en-US">
Customize the disable sending logic and configure slots with `slotConfig`.
</docs>
