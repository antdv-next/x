<script setup lang="ts">
import { Bubble } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex, Space } from "antdv-next";
import { computed, h, onBeforeUnmount, ref, watch } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const text = `
# Ant Design X: The Ultimate AI Conversation UI Framework

> "Easily build AI-driven interfaces"
>
> — Ant Design X Team

## ✨ Features

- 🌈 Best practices from enterprise-level AI products: Based on RICH interaction paradigms, providing excellent AI interaction experience
- 🧩 Flexible atomic components: Covering most AI scenarios, helping you quickly build personalized AI interaction pages
- ✨ Stream-friendly, extensible, and high-performance Markdown renderer: Supports streaming formulas, code highlighting, mermaid diagrams, etc.
- 🚀 Out-of-the-box model/agent integration: Easily connect to OpenAI-compatible model/agent services
- ⚡️ Efficient management of large model data streams: Provides handy data stream management features for more efficient development
- 📦 Rich template support: Multiple templates for quick LUI app development
- 🛡 Full TypeScript coverage: Developed with TypeScript, providing complete type support for better experience and reliability
- 🎨 Deep theme customization: Fine-grained style adjustments for personalized needs in various scenarios

## 🧩 Atomic Components

Based on the RICH interaction paradigm, we provide many atomic components for different interaction stages to help you flexibly build your AI application:

### Core Components
- **Bubble**: Message bubble for displaying chat messages
- **Bubble.List**: Virtualized message list for handling large datasets
- **Sender**: Input box for sending messages
- **Conversations**: Conversation history management
- **Welcome**: Welcome screen component

### Input Components
- **Prompts**: Quick suggestion prompts
- **Attachments**: File upload and preview

### Display Components
- **ThoughtChain**: AI reasoning process display
- **Sources**: Reference and citation display
- **FileCard**: File preview cards

## 🔗 Ecosystem

### Related Packages
- **@antdv-next/x-markdown**: Advanced markdown rendering with streaming support
- **@antdv-next/x-sdk**: AI model integration and data stream management

### Framework Integrations
- **Next.js**: Server-side rendering support
- **Vite**: Fast development experience
- **Create React App**: Zero configuration setup
- **Umi**: Enterprise-grade framework

> Ant Design X is more than just a component library—it's a complete solution for building the next generation of AI-powered applications. Start building today and create experiences that delight your users.
`;

const { isDark } = useDarkMode();

const index = ref(0);
const hasNextChunk = ref(false);
const contentRef = ref<HTMLElement | null>(null);

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

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
      index.value = Math.min(index.value + 5, text.length);
    }, 20);
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

const handleReRender = () => {
  clearTimer();
  index.value = 0;
  hasNextChunk.value = true;
};

const renderMarkdown = (content: string) =>
  h(XMarkdown, {
    content,
    debug: true,
    streaming: {
      enableAnimation: true,
      hasNextChunk: hasNextChunk.value,
    },
  });
</script>

<template>
  <div
    style="
      height: 600px;
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
    >
      <Button size="small" @click="handleReRender">Re-Render</Button>
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
Debug 面板示例：开启 `debug` 查看流式渲染中的性能监控信息。
</docs>

<docs lang="en-US">
Debug panel demo: enable `debug` to inspect streaming rendering performance.
</docs>
