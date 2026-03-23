<script setup lang="ts">
import { SettingOutlined } from "@antdv-next/icons";
import { Bubble } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  Button,
  Flex,
  Input,
  Popover,
  Space,
  Switch,
  Typography,
} from "antdv-next";
import { computed, h, onBeforeUnmount, ref, watch } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const text = `
# Ant Design X: AI Conversation UI Framework

> "Easily build AI-driven interfaces"
>
> — Ant Design X Team

## Features

- Best practices from enterprise-level AI products
- Flexible atomic components covering most AI scenarios
- Stream-friendly, extensible, and high-performance Markdown renderer
- Out-of-the-box model/agent integration
- Efficient management of large model data streams
- Rich template support
- Full TypeScript coverage
- Deep theme customization

## Atomic Components

Based on the RICH interaction paradigm:

### Core Components
- **Bubble**: Message bubble for displaying chat messages
- **Bubble.List**: Virtualized message list
- **Sender**: Input box for sending messages
- **Conversations**: Conversation history management
- **Welcome**: Welcome screen component

> Ant Design X is more than just a component library—it's a complete solution for building AI-powered applications.
`;

const { Text } = Typography;
const { isDark } = useDarkMode();

const enableAnimation = ref(true);
const enableTail = ref(false);
const tailContent = ref("▋");
const enableDebug = ref(false);
const hasNextChunk = ref(true);
const index = ref(0);

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const contentRef = ref<HTMLElement | null>(null);
let timerRef: ReturnType<typeof setTimeout> | null = null;

const clearTimer = () => {
  if (timerRef !== null) {
    clearTimeout(timerRef);
    timerRef = null;
  }
};

watch(
  index,
  () => {
    clearTimer();

    if (index.value >= text.length) {
      hasNextChunk.value = false;
      return;
    }

    timerRef = setTimeout(() => {
      index.value = Math.min(index.value + 2, text.length);
    }, 40);
  },
  { immediate: true },
);

watch(index, () => {
  if (!contentRef.value || index.value <= 0 || index.value >= text.length) {
    return;
  }

  const { scrollHeight, clientHeight } = contentRef.value;
  if (scrollHeight > clientHeight) {
    contentRef.value.scrollTo({
      top: scrollHeight,
      behavior: "smooth",
    });
  }
});

onBeforeUnmount(clearTimer);

const runStream = () => {
  clearTimer();
  index.value = 0;
  hasNextChunk.value = true;
};

const renderMarkdown = (content: string) =>
  h(XMarkdown, {
    content,
    debug: enableDebug.value,
    streaming: {
      enableAnimation: enableAnimation.value,
      tail: enableTail.value ? { content: tailContent.value || "▋" } : false,
      hasNextChunk: hasNextChunk.value,
      animationConfig: { fadeDuration: 400 },
    },
  });
</script>

<template>
  <div
    style="
      height: 400px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    "
  >
    <Space
      align="center"
      style="
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
        margin-bottom: 8px;
      "
      wrap
    >
      <Popover trigger="click" placement="bottomRight">
        <template #content>
          <Flex vertical :gap="10" style="padding: 4px">
            <Flex
              align="center"
              justify="space-between"
              :gap="16"
              style="min-width: 180px"
            >
              <Text style="font-size: 12px; margin: 0; white-space: nowrap"
                >Animation</Text
              >
              <Switch size="small" v-model:checked="enableAnimation" />
            </Flex>
            <Flex
              align="center"
              justify="space-between"
              :gap="16"
              style="min-width: 180px"
            >
              <Text style="font-size: 12px; margin: 0; white-space: nowrap"
                >Tail</Text
              >
              <Switch size="small" v-model:checked="enableTail" />
            </Flex>
            <Flex
              align="center"
              justify="space-between"
              :gap="16"
              style="min-width: 180px"
            >
              <Text style="font-size: 12px; margin: 0; white-space: nowrap"
                >Tail Content</Text
              >
              <Input
                size="small"
                style="width: 80px"
                v-model:value="tailContent"
                :disabled="!enableTail"
              />
            </Flex>
            <Flex
              align="center"
              justify="space-between"
              :gap="16"
              style="min-width: 180px"
            >
              <Text style="font-size: 12px; margin: 0; white-space: nowrap"
                >Debug Panel</Text
              >
              <Switch size="small" v-model:checked="enableDebug" />
            </Flex>
          </Flex>
        </template>
        <Button type="default" size="small">
          <template #icon>
            <SettingOutlined />
          </template>
          Config
        </Button>
      </Popover>
      <Button type="primary" size="small" @click="runStream">Run Stream</Button>
    </Space>

    <Flex
      vertical
      style="flex: 1; min-height: 0; overflow: auto"
      :class="markdownClass"
      ref="contentRef"
    >
      <Bubble
        style="width: 100%"
        :styles="{
          body: { width: '100%' },
        }"
        variant="borderless"
        :content="text.slice(0, index)"
        :content-render="renderMarkdown"
      />
    </Flex>
  </div>
</template>

<docs lang="zh-CN">
渲染控制示例：演示淡入动画、尾部指示器和 debug 面板配置。
</docs>

<docs lang="en-US">
Rendering-controls demo: configure fade animation, tail cursor, and debug panel.
</docs>
