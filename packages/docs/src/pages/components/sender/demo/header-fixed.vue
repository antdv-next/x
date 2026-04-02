<script setup lang="ts">
import { EnterOutlined } from "@antdv-next/icons";
import { Sender, SenderHeader } from "@antdv-next/x";
import { Flex, message, Space, Switch, Typography } from "antdv-next";
import { h, ref } from "vue";

const hasRef = ref(true);

function headerRender() {
  return h(SenderHeader, {
    open: hasRef.value,
    title: h(Space, null, () => [
      h(EnterOutlined),
      h(
        Typography.Text,
        { type: "secondary" },
        () => '"Tell more about Ant Design X"',
      ),
    ]),
    onOpenChange: (val: boolean) => {
      hasRef.value = val;
    },
  });
}

function handleSubmit() {
  message.success("Send message successfully!");
}
</script>

<template>
  <Flex vertical gap="middle" align="flex-start">
    <Switch
      :checked="hasRef"
      checked-children="With Reference"
      un-checked-children="With Reference"
      @change="hasRef = !hasRef"
    />
    <Sender :header="headerRender" :on-submit="handleSubmit" />
  </Flex>
</template>

<docs lang="zh-CN">
使用 `header` 做引用效果。
</docs>

<docs lang="en-US">
Use `header` to do the reference effect.
</docs>
