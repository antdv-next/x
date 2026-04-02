<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { Button, Flex } from "antdv-next";
import { ref } from "vue";

const senderRef = ref<InstanceType<typeof Sender>>();
</script>

<template>
  <Flex vertical gap="middle">
    <Flex gap="middle" wrap>
      <Button @click="senderRef?.insert('Hello ', 'start')">
        Insert at Start
      </Button>
      <Button @click="senderRef?.insert(' World', 'end')">
        Insert at End
      </Button>
      <Button @click="senderRef?.insert('🐛 ', 'cursor')">
        Insert at Cursor
      </Button>
      <Button @click="senderRef?.focus()"> Focus </Button>
      <Button @click="senderRef?.focus({ cursor: 'start' })">
        Focus at Start
      </Button>
      <Button @click="senderRef?.focus({ cursor: 'end' })">
        Focus at End
      </Button>
      <Button @click="senderRef?.focus({ cursor: 'all' })"> Select All </Button>
      <Button @click="senderRef?.focus({ preventScroll: true })">
        Focus (Prevent Scroll)
      </Button>
      <Button @click="senderRef?.blur()"> Blur </Button>
      <Button @click="senderRef?.clear()"> Clear </Button>
    </Flex>
    <Sender ref="senderRef" />
  </Flex>
</template>

<docs lang="zh-CN">
使用 `ref` 选项控制聚焦、文本插入等。
</docs>

<docs lang="en-US">
Use the `ref` option to control focus, text insertion, and more.
</docs>
