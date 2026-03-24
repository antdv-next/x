<script setup lang="ts">
import type { SenderProps } from "@antdv-next/x";

// TODO: 待实现 Attachments 组件 + slotConfig 后完善
// 当前为占位 demo，展示禁用发送逻辑 + 词槽配置的组合场景
import { PaperClipOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Badge, Button, Flex, Tooltip } from "antdv-next";
import { computed, h, ref } from "vue";

// TODO: slotConfig 需要 SlotTextArea 组件支持
// const slotConfig = [
//   { type: 'text', value: 'Please help me search for news about ' },
//   {
//     type: 'select',
//     key: 'search_type',
//     props: {
//       options: ['AI', 'Technology', 'Entertainment'],
//       placeholder: 'Please select a category',
//     },
//   },
// ];

const loading = ref(false);
const open = ref(false);
const value = ref("");
const fileCount = ref(0);

const submitDisabled = computed(
  () => fileCount.value === 0 && !value.value && !loading.value,
);

const senderRef = ref<InstanceType<typeof Sender>>();

const senderHeader = h(
  Sender.Header,
  {
    title: "Attachments",
    open: open.value,
    onOpenChange: (val: boolean) => {
      open.value = val;
    },
    styles: { content: { padding: 0 } },
  },
  {
    default: () =>
      h(
        "div",
        {
          style: {
            padding: "24px",
            textAlign: "center",
            color: "#999",
            border: "1px dashed #d9d9d9",
            borderRadius: "8px",
            margin: "8px",
          },
        },
        "TODO: Attachments 组件占位",
      ),
  },
);

const suffixRender: SenderProps["suffix"] = (_oriNode, { components }) => {
  const { SendButton, LoadingButton } = components;
  if (loading.value) {
    return h(
      Tooltip,
      { title: "点击取消" },
      {
        default: () => h(LoadingButton),
      },
    );
  }
  return h(SendButton, { disabled: submitDisabled.value });
};

const onSubmit = () => {
  senderRef.value?.clear();
  fileCount.value = 0;
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};
</script>

<template>
  <Flex :style="{ height: '350px' }" align="end">
    <Sender
      ref="senderRef"
      submit-type="enter"
      :header="senderHeader"
      :on-change="
        (v: string) => {
          value = v;
        }
      "
      placeholder="按 Enter 发送消息"
      :suffix="suffixRender"
      :on-submit="onSubmit"
    >
      <!-- TODO: slotConfig 支持后添加 :slot-config="slotConfig" -->
      <template #prefix>
        <Badge :dot="fileCount > 0 && !open">
          <Button type="text" @click="open = !open">
            <template #icon>
              <PaperClipOutlined :style="{ fontSize: '16px' }" />
            </template>
          </Button>
        </Badge>
      </template>
    </Sender>
  </Flex>
</template>
