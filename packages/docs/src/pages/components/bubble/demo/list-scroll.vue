<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";

import {
  AntDesignOutlined,
  CopyOutlined,
  RedoOutlined,
  UserOutlined,
} from "@antdv-next/icons";
import { Actions, BubbleList } from "@antdv-next/x";
import { Avatar, Button, Flex } from "antdv-next";
import { h, ref } from "vue";

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

const listRef = ref<any>(null);
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
const actionItems = [
  {
    key: "retry",
    icon: h(RedoOutlined),
    label: "Retry",
  },
  {
    key: "copy",
    icon: h(CopyOutlined),
    label: "Copy",
  },
];

const role: BubbleListProps["role"] = {
  ai: {
    typing: true,
    header: "AI",
    avatar: () => h(Avatar, { icon: h(AntDesignOutlined) }),
    footer: () => h(Actions, { items: actionItems }),
  },
  user: {
    placement: "end",
    typing: false,
    header: "User",
    avatar: () => h(Avatar, { icon: h(UserOutlined) }),
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
  <Flex vertical gap="small" style="height: 720px">
    <Flex gap="small" wrap>
      <Button type="primary" @click="addLongBubble"> Add Long Bubble </Button>
      <Button @click="scrollTop"> Scroll To Top </Button>
      <Button @click="scrollBottomSmooth"> Scroll To Bottom smooth </Button>
      <Button @click="scrollBottomInstant"> Scroll To Bottom instant </Button>
      <Button @click="scrollRandom"> Scroll To Random </Button>
      <Button @click="scrollSecond"> Scroll To Second Bubble </Button>
      <Button @click="scrollLast"> Scroll To Last Bubble </Button>
    </Flex>

    <div style="display: flex; flex: 1; min-height: 0">
      <BubbleList
        ref="listRef"
        style="height: 100%"
        :role="role"
        :items="items"
      />
    </div>
  </Flex>
</template>

<docs lang="zh-CN">
可以使用 `ref` 控制列表滚动条。当 **BubbleList** 内容在不断增长且通过 `ref.scrollTo` 跳转到底部时，`behavior: 'smooth'` 的行为会被 `behavior: 'instant'` 替代。
</docs>

<docs lang="en-US">
BubbleList ref. `behavior: 'smooth'` would be replaced by `behavior: 'instant'` when the content of **BubbleList** growing constantly and you jump to the bottom using `ref.scrollTo`.
</docs>
