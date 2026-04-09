<docs lang="zh-CN">
通过 `shortcutKeys` 设置快捷键。
</docs>

<docs lang="en-US">
Modify shortcut keys by `shortcutKeys` prop.
</docs>

<script setup lang="ts">
import type { ConversationsProps, XProviderProps } from "@antdv-next/x";

import {
  CodeOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  SignatureOutlined,
} from "@antdv-next/icons";

const providerConversationsConfig: XProviderProps["conversations"] = {
  shortcutKeys: {
    items: ["Alt", "number"],
  },
};

const items: ConversationsProps["items"] = [
  {
    key: "write",
    label: "Help Me Write",
  },
  {
    key: "coding",
    label: "AI Coding",
  },
  {
    key: "createImage",
    label: "Create Image",
  },
  {
    key: "deepSearch",
    label: "Deep Search",
  },
];
</script>

<template>
  <a-flex :gap="12" style="margin-bottom: 16px" align="center">
    <a-typography-text>
      You can switch sessions using the shortcut key:
      <a-tag>Alt/⌥</a-tag>
      +
      <a-tag>number</a-tag>
    </a-typography-text>
  </a-flex>

  <a-card>
    <ax-x-provider :conversations="providerConversationsConfig">
      <ax-conversations
        :style="{ width: '220px' }"
        default-active-key="write"
        :items="items"
      >
        <template #iconRender="{ item }">
          <SignatureOutlined v-if="item.key === 'write'" />
          <CodeOutlined v-else-if="item.key === 'coding'" />
          <FileImageOutlined v-else-if="item.key === 'createImage'" />
          <FileSearchOutlined v-else-if="item.key === 'deepSearch'" />
        </template>
      </ax-conversations>
    </ax-x-provider>
  </a-card>
</template>
