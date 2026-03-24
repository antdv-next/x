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
      <Button @click="senderRef?.insert('� ', 'cursor')">
        Insert at Cursor
      </Button>
      <Button @click="senderRef?.focus()">Focus</Button>
      <Button @click="senderRef?.focus({ preventScroll: true })">
        Focus (Prevent Scroll)
      </Button>
      <Button @click="senderRef?.blur()">Blur</Button>
      <Button @click="senderRef?.clear()">Clear</Button>
    </Flex>
    <Sender ref="senderRef" />
  </Flex>
</template>
