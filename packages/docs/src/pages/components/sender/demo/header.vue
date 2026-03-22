<script setup lang="ts">
import { CloudUploadOutlined, PaperClipOutlined } from "@antdv-next/icons";
import { Sender, SenderHeader } from "@antdv-next/x";
import { Button, Flex, message, Typography } from "antdv-next";
import { h, ref } from "vue";

const open = ref(false);

function headerRender() {
  return h(
    SenderHeader,
    {
      title: "Upload Sample",
      open: open.value,
      onOpenChange: (val: boolean) => {
        open.value = val;
      },
    },
    {
      default: () =>
        h(
          Flex,
          { vertical: true, align: "center", gap: "small", style: { marginBlock: "24px" } },
          () => [
            h(CloudUploadOutlined, { style: { fontSize: "4em" } }),
            h(
              Typography.Title,
              { level: 5, style: { margin: 0 } },
              () => "Drag file here (just demo)",
            ),
            h(
              Typography.Text,
              { type: "secondary" },
              () => "Support pdf, doc, xlsx, ppt, txt, image file types",
            ),
            h(
              Button,
              { onClick: () => message.info("Mock select file") },
              () => "Select File",
            ),
          ],
        ),
    },
  );
}

function prefixRender() {
  return h(Button, {
    type: "text",
    style: { fontSize: "16px" },
    icon: h(PaperClipOutlined),
    onClick: () => {
      open.value = !open.value;
    },
  });
}

function handleSubmit() {
  message.success("Send message successfully!");
}
</script>

<template>
  <Flex :style="{ height: '350px' }" align="end">
    <Sender
      :header="headerRender"
      :prefix="prefixRender"
      placeholder="← Click to open"
      :on-submit="handleSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
通过 `Sender.Header` 配合 `prefix` 实现可折叠的头部上传面板。
</docs>

<docs lang="en-US">
Use `Sender.Header` with `prefix` to build a collapsible upload panel.
</docs>
