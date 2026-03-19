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
import { Actions, BubbleList, FileCard } from "@antdv-next/x";
import { Avatar, Button, Flex, Space, Switch, Typography } from "antdv-next";
import MarkdownIt from "markdown-it";
import { computed, h, ref } from "vue";

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

Link: [Ant Design X](https://x.ant.design)
`.trim();

const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

function renderMarkdown(value: string) {
  return h("div", {
    class: "leading-[1.7] whitespace-normal",
    innerHTML: md.render(value),
  });
}

const listRef = ref<any>(null);
const enableLocate = ref(true);
const autoScroll = ref(true);
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
const items = ref<any[]>([
  { key: nextKey(), role: "system", content: "Welcome to use Ant Design X" },
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
    avatar: () => h(Avatar, { icon: h(AntDesignOutlined) }),
    footer: () => h(Actions, { items: actionItems }),
  },
  user: (data: any) => ({
    placement: "end",
    typing: false,
    header: `User-${data.key}`,
    avatar: () => h(Avatar, { icon: h(UserOutlined) }),
    footer: () =>
      h(Actions, {
        items: [
          data.editable
            ? { key: "done", icon: h(CheckOutlined), label: "done" }
            : { key: "edit", icon: h(EditOutlined), label: "edit" },
        ],
        onClick: ({ key }) => {
          items.value = items.value.map(item => {
            if (item.key !== data.key) return item;
            return { ...item, editable: key === "edit" };
          });
        },
      }),
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
    avatar: () => "",
    contentRender: (content: FileCardProps) =>
      h(Space, null, {
        default: () => [
          h(LinkOutlined),
          h(FileCard, {
            type: "file",
            size: "small",
            name: content.name,
            byte: content.byte,
          }),
        ],
      }),
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
    contentRender: (content: string) =>
      h(Typography, null, {
        default: () => [renderMarkdown(content)],
      }),
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
</script>

<template>
  <Flex vertical :gap="20" style="height: 720px">
    <Flex vertical gap="small">
      <Space align="center">
        <Switch v-model:checked="autoScroll" />
        <span>启用 autoScroll / enabled autoScroll</span>
      </Space>
      <Space align="center">
        <Switch v-model:checked="enableLocate" />
        <span>定位到新气泡 / locate to new bubble</span>
      </Space>
    </Flex>

    <Flex gap="small" wrap>
      <Button type="primary" @click="addBubble">
        <RedoOutlined />
        Add Bubble
      </Button>
      <Button @click="addMarkdown"> Add Markdown </Button>
      <Button @click="addDivider"> Add Divider </Button>
      <Button @click="addSystem"> Add System </Button>
      <Button @click="addToTop"> Add To Top </Button>
      <Button @click="addWithReference"> Add With Ref </Button>
    </Flex>

    <div style="display: flex; flex: 1; min-height: 0">
      <BubbleList
        ref="listRef"
        style="height: 620px"
        :role="role"
        :items="items"
        :auto-scroll="autoScroll"
      />
    </div>
  </Flex>
</template>

<docs lang="zh-CN">
预设样式的气泡列表，支持自动滚动，支持使用 `role` 定义不同类别的气泡并设置属性。**BubbleList** 是一个受控组件，内部对 **Bubble** 做了 **memo** 处理，因此推荐使用 **setState** 的回调形式来修改 `items` 属性，尽可能保证非必要渲染数据项的配置稳定，以此来保证 **BubbleList** 的高性能渲染。
</docs>

<docs lang="en-US">
Bubble list with preset styles, supports automatic scrolling, supports using `role` to define different types of bubbles and set properties. **BubbleList** is a controlled component, and **Bubble** is internally memoized, so it is recommended to use **setState** callback form to modify the `items` property, and try to ensure the stability of the configuration of non-essential rendering data items, so as to ensure the high performance rendering of **BubbleList**.
</docs>
