<script setup lang="ts">
// TODO: 待实现 Attachments 组件后，替换占位为真实文件上传面板
import { PaperClipOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Button, Flex } from "antdv-next";
import { ref } from "vue";

const open = ref(false);
const text = ref("");
const pastedFiles = ref<string[]>([]);

const senderRef = ref<InstanceType<typeof Sender>>();

const onPasteFile = (files: FileList) => {
  // TODO: 替换为 Attachments.upload(file)
  for (const file of files) {
    pastedFiles.value.push(file.name);
  }
  open.value = true;
};

const onSubmit = () => {
  pastedFiles.value = [];
  text.value = "";
};
</script>

<template>
  <Flex :style="{ height: '220px' }" align="end">
    <Sender
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
        <Sender.Header
          title="Attachments"
          :open="open"
          :on-open-change="
            (val: boolean) => {
              open = val;
            }
          "
          :styles="{ content: { padding: 0 } }"
        >
          <!-- TODO: 替换为 Attachments 组件 -->
          <div
            :style="{
              padding: '24px',
              textAlign: 'center',
              color: '#999',
              border: '1px dashed #d9d9d9',
              borderRadius: '8px',
              margin: '8px',
            }"
          >
            <div v-if="pastedFiles.length">
              已粘贴文件: {{ pastedFiles.join(", ") }}
            </div>
            <div v-else>
              TODO: Attachments 组件占位 — 请尝试粘贴文件到输入框
            </div>
          </div>
        </Sender.Header>
      </template>
      <template #prefix>
        <Button type="text" :style="{ fontSize: '16px' }" @click="open = !open">
          <template #icon>
            <PaperClipOutlined />
          </template>
        </Button>
      </template>
    </Sender>
  </Flex>
</template>

<docs lang="zh-CN">
使用 `onPasteFile` 获取黏贴的文件，配合 Attachments 进行文件上传。
</docs>

<docs lang="en-US">
Use `onPasteFile` to get pasted files, and upload them with Attachments.
</docs>
