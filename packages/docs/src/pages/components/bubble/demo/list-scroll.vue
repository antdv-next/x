<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import {
  AntDesignOutlined,
  CopyOutlined,
  RedoOutlined,
  UserOutlined,
} from "@antdv-next/icons";
import { ref } from "vue";

let seed = 0;
const nextKey = () => `bubble_${seed++}`;

function genItem(isAI: boolean, config: Partial<any> = {}, repeat = 50): any {
  return {
    key: nextKey(),
    role: isAI ? "ai" : "user",
    content: `${seed} : ${isAI ? "Mock AI content".repeat(repeat) : "Mock user content."}`,
    ...config,
  };
}

const listRef = useTemplateRef("listRef");
const items = ref<any[]>([
  genItem(false, { typing: false }),
  genItem(true, { typing: false }),
  genItem(false, { typing: false }),
  genItem(true, { typing: false }),
  genItem(false, { typing: false }),
  genItem(true, { typing: false }),
  genItem(false, { typing: false }),
  genItem(true, { typing: false }),
  genItem(false, { typing: false }),
  genItem(true, { typing: false }),
  genItem(false, { typing: false }),
]);

const role: BubbleListProps["role"] = {
  ai: {
    typing: true,
    header: "AI",
  },
  user: {
    placement: "end",
    typing: false,
    header: "User",
  },
};

function addLongBubble() {
  const isAI = !!(items.value.length % 2);
  items.value = [
    ...items.value,
    genItem(isAI, { typing: { effect: "fade-in", step: [20, 50] } }, 500),
  ];
}

function scrollTop() {
  listRef.value?.scrollTo({ top: "top" });
}

function scrollBottomSmooth() {
  listRef.value?.scrollTo({ top: "bottom", behavior: "smooth" });
}

function scrollBottomInstant() {
  listRef.value?.scrollTo({ top: "bottom", behavior: "instant" });
}

function scrollRandom() {
  const native = listRef.value?.scrollBoxNativeElement;
  if (!native) return;

  listRef.value?.scrollTo({
    top: Math.random() * native.scrollHeight,
  });
}

function scrollSecond() {
  if (items.value.length < 2) return;
  listRef.value?.scrollTo({ key: items.value[1]?.key, block: "nearest" });
}

function scrollLast() {
  const last = items.value.at(-1);
  if (!last) return;
  listRef.value?.scrollTo({ key: last.key, block: "end" });
}
</script>

<template>
  <a-flex vertical gap="small" style="height: 720px">
    <a-flex gap="small" wrap>
      <a-button type="primary" @click="addLongBubble">
        Add Long Bubble
      </a-button>
      <a-button @click="scrollTop"> Scroll To Top </a-button>
      <a-button @click="scrollBottomSmooth"> Scroll To Bottom smooth </a-button>
      <a-button @click="scrollBottomInstant">
        Scroll To Bottom instant
      </a-button>
      <a-button @click="scrollRandom"> Scroll To Random </a-button>
      <a-button @click="scrollSecond"> Scroll To Second Bubble </a-button>
      <a-button @click="scrollLast"> Scroll To Last Bubble </a-button>
    </a-flex>

    <div style="display: flex; flex: 1; min-height: 0">
      <ax-bubble-list
        ref="listRef"
        style="height: 100%"
        :role="role"
        :items="items"
      >
        <template #avatar="{ item }">
          <a-avatar v-if="item.role === 'ai'">
            <template #icon>
              <AntDesignOutlined />
            </template>
          </a-avatar>
          <a-avatar v-if="item.role === 'user'">
            <template #icon>
              <UserOutlined />
            </template>
          </a-avatar>
        </template>

        <template #footer="{ item }">
          <ax-actions
            v-if="item.role === 'ai'"
            :items="[
              {
                key: 'retry',
                label: 'Retry',
              },
              {
                key: 'copy',
                label: 'Copy',
              },
            ]"
          >
            <template #icon-render="{ item: actionItem }">
              <RedoOutlined v-if="actionItem.key === 'retry'" />
              <CopyOutlined v-if="actionItem.key === 'copy'" />
            </template>
          </ax-actions>
        </template>
      </ax-bubble-list>
    </div>
  </a-flex>
</template>

<docs lang="zh-CN">
可以使用 `ref` 控制列表滚动条。当 **BubbleList** 内容在不断增长且通过 `ref.scrollTo` 跳转到底部时，`behavior: 'smooth'` 的行为会被 `behavior: 'instant'` 替代。
</docs>

<docs lang="en-US">
BubbleList ref. `behavior: 'smooth'` would be replaced by `behavior: 'instant'` when the content of **BubbleList** growing constantly and you jump to the bottom using `ref.scrollTo`.
</docs>
