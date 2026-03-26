<script setup lang="ts">
import type { ConversationsProps } from "@antdv-next/x";

import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@antdv-next/icons";
import { Conversations } from "@antdv-next/x";
import { useXConversations } from "@antdv-next/x-sdk";
import { Button, Flex, Input, Modal, theme } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const { token } = theme.useToken();
const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    add: isCN ? "新建会话" : "Add Conversation",
    rename: isCN ? "重命名" : "Rename",
    delete: isCN ? "删除" : "Delete",
    renameTitle: isCN ? "重命名会话" : "Rename Conversation",
    newName: isCN ? "新名称" : "New name",
    ok: isCN ? "确认" : "OK",
    cancel: isCN ? "取消" : "Cancel",
    conversation: isCN ? "会话" : "Conversation",
  };
});

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
  removeConversation,
  setConversation,
} = useXConversations({
  defaultConversations: [
    { key: "conv_1", label: "Conversation 1" },
    { key: "conv_2", label: "Conversation 2" },
    { key: "conv_3", label: "Conversation 3" },
  ],
  defaultActiveConversationKey: "conv_1",
});

const conversationStyle = computed(() => ({
  width: "256px",
  background: token.value.colorBgContainer,
  borderRadius: `${token.value.borderRadius}px`,
}));

let counter = 4;
const renameVisible = ref(false);
const renameKey = ref("");
const renameValue = ref("");

function handleAdd() {
  const key = `conv_${counter}`;
  addConversation({ key, label: `${locale.value.conversation} ${counter}` });
  setActiveConversationKey(key);
  counter++;
}

function openRename(key: string, currentLabel: string) {
  renameKey.value = key;
  renameValue.value = currentLabel;
  renameVisible.value = true;
}

function handleRename() {
  if (renameKey.value && renameValue.value.trim()) {
    setConversation(renameKey.value, {
      key: renameKey.value,
      label: renameValue.value.trim(),
    });
  }
  renameVisible.value = false;
}

function handleDelete(key: string) {
  removeConversation(key);
  if (activeConversationKey.value === key) {
    const remaining = conversations.value.filter(c => c.key !== key);
    setActiveConversationKey(remaining[0]?.key ?? "");
  }
}

const menuConfig = computed<ConversationsProps["menu"]>(
  () => conversation => ({
    items: [
      {
        key: "rename",
        label: locale.value.rename,
        icon: h(EditOutlined),
      },
      {
        key: "delete",
        label: locale.value.delete,
        icon: h(DeleteOutlined),
        danger: true,
      },
    ],
    onClick: ({ key, domEvent }) => {
      domEvent.stopPropagation();
      const conv = conversation as { key: string; label?: string };
      if (key === "rename") {
        openRename(conv.key, String(conv.label ?? ""));
      } else if (key === "delete") {
        handleDelete(conv.key);
      }
    },
  }),
);

const conversationItems = computed<ConversationsProps["items"]>(() =>
  conversations.value.map(c => ({ key: c.key, label: c.label })),
);
</script>

<template>
  <Flex vertical gap="middle">
    <Button :icon="h(PlusOutlined)" type="primary" @click="handleAdd">
      {{ locale.add }}
    </Button>
    <Conversations
      :items="conversationItems"
      :active-key="activeConversationKey"
      :menu="menuConfig"
      :style="conversationStyle"
      :on-active-change="setActiveConversationKey"
    />
    <Modal
      v-model:open="renameVisible"
      :title="locale.renameTitle"
      :ok-text="locale.ok"
      :cancel-text="locale.cancel"
      @ok="handleRename"
    >
      <Input v-model:value="renameValue" :placeholder="locale.newName" />
    </Modal>
  </Flex>
</template>

<docs lang="zh-CN">
通过 `addConversation`、`removeConversation`、`setConversation` 实现会话的增删改操作，配合 `menu` 属性提供右键操作菜单。
</docs>

<docs lang="en-US">
Use `addConversation`, `removeConversation`, and `setConversation` for CRUD operations on conversations, combined with the `menu` property for context menu actions.
</docs>
