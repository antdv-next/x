<script setup lang="ts">
import { EditOutlined, UserOutlined } from "@antdv-next/icons";
import { ref } from "vue";

const contentA = ref("editable bubble 1");
const contentB = ref("editable bubble 2");
const editingA = ref(false);
const editingB = ref(false);

const editItems = [
  {
    key: "edit",
    label: "edit",
  },
];

function handleEditClickA({ key }: { key?: string }) {
  editingA.value = key === "edit";
}

function handleEditClickB({ key }: { key?: string }) {
  editingB.value = key === "edit";
}

function handleEditConfirmA(value: string) {
  contentA.value = value;
  editingA.value = false;
}

function handleEditConfirmB(value: string) {
  contentB.value = value;
  editingB.value = false;
}
</script>

<template>
  <a-space direction="vertical" style="display: flex; width: 100%" :size="10">
    <ax-bubble
      :editable="editingA"
      :content="contentA"
      @edit-cancel="editingA = false"
      @edit-confirm="handleEditConfirmA"
    >
      <template #avatar>
        <a-avatar>
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
      <template #footer>
        <ax-actions :items="editItems" @click="handleEditClickA">
          <template #icon-render="items">
            <EditOutlined v-if="items.item.key === 'edit'" />
          </template>
        </ax-actions>
      </template>
    </ax-bubble>

    <ax-bubble
      placement="end"
      :editable="{ editing: editingB, okText: 'ok', cancelText: 'cancel' }"
      :content="contentB"
      @edit-cancel="editingB = false"
      @edit-confirm="handleEditConfirmB"
    >
      <template #avatar>
        <a-avatar>
          <template #icon>
            <UserOutlined />
          </template>
        </a-avatar>
      </template>
      <template #footer>
        <ax-actions :items="editItems" @click="handleEditClickB">
          <template #icon-render="items">
            <EditOutlined v-if="items.item.key === 'edit'" />
          </template>
        </ax-actions>
      </template>
    </ax-bubble>
  </a-space>
</template>

<docs lang="zh-CN">
可编辑气泡，支持 `string` 类型 `content` 的简单编辑，使用时应该在 `onEditing` 处进行 **_XSS_** 防护。
</docs>

<docs lang="en-US">
Editable bubble, support simple editing of `string` type `content`, and should be protected by **_XSS_** in `onEditing` when used.
</docs>
