<script setup lang="ts">
import { EnterOutlined } from "@antdv-next/icons";
import { App } from "antdv-next";
import { ref } from "vue";
const { message } = App.useApp();

const hasRef = ref(true);

function handleSubmit() {
  message.success("Send message successfully!");
}
</script>

<template>
  <a-flex vertical gap="middle" align="flex-start">
    <a-switch
      :checked="hasRef"
      checked-children="With Reference"
      un-checked-children="With Reference"
      @change="hasRef = !hasRef"
    />
    <ax-sender :on-submit="handleSubmit">
      <template #header>
        <ax-sender-header
          :open="hasRef"
          :on-open-change="(val: boolean) => (hasRef = val)"
        >
          <template #title>
            <a-space>
              <EnterOutlined />
              <a-typography-text type="secondary">
                "Tell more about Ant Design X"
              </a-typography-text>
            </a-space>
          </template>
        </ax-sender-header>
      </template>
    </ax-sender>
  </a-flex>
</template>

<docs lang="zh-CN">
使用 `header` 做引用效果。
</docs>

<docs lang="en-US">
Use `header` to do the reference effect.
</docs>
