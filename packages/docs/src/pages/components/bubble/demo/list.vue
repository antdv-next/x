<script setup lang="ts">
import type { FileCardProps } from "@antdv-next/x";

import {
  AntDesignOutlined,
  CheckOutlined,
  CopyOutlined,
  EditOutlined,
  LinkOutlined,
  RedoOutlined,
  UserOutlined,
} from "@antdv-next/icons";
import { XMarkdown } from "@antdv-next/x-markdown";
import { computed, ref } from "vue";

let seed = 0;
const nextKey = () => `bubble_${seed++}`;

function genItem(isAI: boolean, config: Partial<any> = {}): any {
  return {
    key: nextKey(),
    role: isAI ? "ai" : "user",
    content: `${seed} : ${isAI ? "Mock AI content".repeat(50) : "Mock user content."}`,
    ...config,
  };
}

const markdownText = `
> Render as markdown content to show rich text!

Link: [Antd Next X](https://x.ant.design)
`.trim();

const listRef = ref<any>(null);
const enableLocate = ref(true);
const autoScroll = ref(true);

const items = ref<any[]>([
  { key: nextKey(), role: "system", content: "Welcome to use Antd Next X" },
  genItem(false, { typing: false }),
  genItem(true, { typing: false }),
  { key: nextKey(), role: "divider", content: "divider" },
  genItem(false, { typing: false }),
  genItem(true, { typing: false, loading: true }),
]);

const role = computed<any>(() => ({
  ai: {
    typing: true,
    header: "AI",
  },
  user: (data: any) => ({
    placement: "end",
    typing: false,
    header: `User-${data.key}`,
    onEditConfirm: (content: any) => {
      items.value = items.value.map(item => {
        if (item.key !== data.key) return item;
        return { ...item, content, editable: false };
      });
    },
    onEditCancel: () => {
      items.value = items.value.map(item => {
        if (item.key !== data.key) return item;
        return { ...item, editable: false };
      });
    },
  }),
  reference: {
    variant: "borderless",
    styles: { root: { margin: 0, marginBottom: "-12px" } },
  },
}));

function scrollTo(option: any) {
  listRef.value?.scrollTo({ ...option, behavior: "smooth" });
}

function append(item: any) {
  items.value = [...items.value, item];
}

function maybeLocate(position: "top" | "bottom") {
  if (enableLocate.value) scrollTo({ top: position });
}

function addBubble() {
  const chatItems = items.value.filter(
    item => item.role === "ai" || item.role === "user",
  );
  const isAI = !!(chatItems.length % 2);
  append(genItem(isAI, { typing: { effect: "fade-in", step: [20, 50] } }));
  maybeLocate("bottom");
}

function addDivider() {
  append({ key: nextKey(), role: "divider", content: "Divider" });
  maybeLocate("bottom");
}

function addMarkdown() {
  append({
    key: nextKey(),
    role: "ai",
    typing: { effect: "fade-in", step: 6 },
    content: markdownText,
  });
  maybeLocate("bottom");
}

function addSystem() {
  append({
    key: nextKey(),
    role: "system",
    content: "This is a system message",
  });
  maybeLocate("bottom");
}

function addToTop() {
  items.value = [genItem(false), genItem(true), ...items.value];
  maybeLocate("top");
}

function addWithReference() {
  items.value = [
    ...items.value,
    {
      key: nextKey(),
      role: "reference",
      placement: "end",
      content: { name: "Ant-Design-X.pdf" },
    },
    genItem(false),
  ];
  maybeLocate("bottom");
}

function handleUserActionClick(actionKey: string, itemKey: string | number) {
  items.value = items.value.map(item => {
    if (item.key !== itemKey) return item;
    return { ...item, editable: actionKey === "edit" };
  });
}
</script>

<template>
  <a-flex vertical :gap="20" style="height: 720px">
    <a-flex vertical gap="small">
      <a-space align="center">
        <a-switch v-model:checked="autoScroll" />
        <span>启用 autoScroll / enabled autoScroll</span>
      </a-space>
      <a-space align="center">
        <a-switch v-model:checked="enableLocate" />
        <span>定位到新气泡 / locate to new bubble</span>
      </a-space>
    </a-flex>

    <a-flex gap="small" wrap>
      <a-button type="primary" @click="addBubble">
        <RedoOutlined />
        Add Bubble
      </a-button>
      <a-button @click="addMarkdown"> Add Markdown </a-button>
      <a-button @click="addDivider"> Add Divider </a-button>
      <a-button @click="addSystem"> Add System </a-button>
      <a-button @click="addToTop"> Add To Top </a-button>
      <a-button @click="addWithReference"> Add With Ref </a-button>
    </a-flex>

    <div style="display: flex; flex: 1; min-height: 0">
      <ax-bubble-list
        ref="listRef"
        style="height: 620px"
        :role="role"
        :items="items"
        :auto-scroll="autoScroll"
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
              { key: 'retry', label: 'Retry' },
              { key: 'copy', label: 'Copy' },
            ]"
          >
            <template #icon-render="{ item: actionItem }">
              <RedoOutlined v-if="actionItem.key === 'retry'" />
              <CopyOutlined v-if="actionItem.key === 'copy'" />
            </template>
          </ax-actions>

          <ax-actions
            v-if="item.role === 'user'"
            :items="[
              item.editable
                ? { key: 'done', label: 'done' }
                : { key: 'edit', label: 'edit' },
            ]"
            @click="(info: any) => handleUserActionClick(info.key, item.key)"
          >
            <template #icon-render="{ item: actionItem }">
              <CheckOutlined v-if="actionItem.key === 'done'" />
              <EditOutlined v-if="actionItem.key === 'edit'" />
            </template>
          </ax-actions>
        </template>

        <template #contentRender="{ content, item }">
          <a-typography
            v-if="item.role === 'ai' && typeof content === 'string'"
          >
            <XMarkdown
              v-if="content.includes('>') || content.includes('](')"
              :content="content"
              :streaming="{
                hasNextChunk: item.status === 'loading',
                enableAnimation: true,
              }"
            />
            <div v-else style="white-space: normal; line-height: 1.7">
              {{ content }}
            </div>
          </a-typography>

          <a-space v-if="item.role === 'reference'">
            <LinkOutlined />
            <ax-file-card
              type="file"
              size="small"
              :name="(content as FileCardProps).name"
              :byte="(content as FileCardProps).byte"
            />
          </a-space>

          <div v-if="item.role === 'user'">{{ content }}</div>
        </template>
      </ax-bubble-list>
    </div>
  </a-flex>
</template>

<docs lang="zh-CN">
预设样式的气泡列表，支持自动滚动，支持使用 `role` 定义不同类别的气泡并设置属性。**BubbleList** 是一个受控组件，内部对 **Bubble** 做了 **memo** 处理，因此推荐使用 **setState** 的回调形式来修改 `items` 属性，尽可能保证非必要渲染数据项的配置稳定，以此来保证 **BubbleList** 的高性能渲染。
</docs>

<docs lang="en-US">
Bubble list with preset styles, supports automatic scrolling, supports using `role` to define different types of bubbles and set properties. **BubbleList** is a controlled component, and **Bubble** is internally memoized, so it is recommended to use **setState** callback form to modify the `items` property, and try to ensure the stability of the configuration of non-essential rendering data items, so as to ensure the high performance rendering of **BubbleList**.
</docs>
