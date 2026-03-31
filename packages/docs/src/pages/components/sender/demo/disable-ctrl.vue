<script setup lang="ts">
import type { SenderProps } from "@antdv-next/x";

// TODO: 待实现 Attachments 组件后，替换为真实的文件上传面板
import { PaperClipOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Badge, Button, Flex, Tooltip } from "antdv-next";
import { computed, h, ref } from "vue";

const loading = ref(false);
const open = ref(false);
const value = ref("");
const fileCount = ref(0); // TODO: 替换为 Attachments items

const submitDisabled = computed(
  () => fileCount.value === 0 && !value.value && !loading.value,
);

const senderRef = ref<InstanceType<typeof Sender>>();

// TODO: 替换为真实 Attachments 组件
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
  value.value = "";
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
      :value="value"
      :on-change="
        (v: string) => {
          value = v;
        }
      "
      placeholder="按 Enter 发送消息"
      :suffix="suffixRender"
      :on-submit="onSubmit"
    >
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

<docs lang="zh-CN">
自定义禁用发送逻辑。
</docs>

<docs lang="en-US">
Customize the disable sending logic.
</docs>
