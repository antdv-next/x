<script setup lang="ts">
import type { Component } from "vue";

import { SettingOutlined } from "@antdv-next/icons";
import { Bubble } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  Button,
  Flex,
  Input,
  Popover,
  Skeleton,
  Switch,
  Typography,
} from "antdv-next";
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const { Text } = Typography;
const { isDark } = useDarkMode();

const text = `# Ant Design X

Ant Design X 是一款 AI 应用复合工具集，融合了 UI 组件库、流式 Markdown 渲染引擎和 AI SDK，为开发者提供构建下一代 AI 驱动应用的完整工具链。

![Ant Design X](https://mdn.alipayobjects.com/huamei_yz9z7c/afts/img/0lMhRYbo0-8AAAAAQDAAAAgADlJoAQFr/original)


基于 Ant Design 设计体系的 React UI 库、专为 AI 驱动界面设计，开箱即用的智能对话组件、无缝集成 API 服务，快速搭建智能应用界面，查看详情请点击 [Ant Design X](https://github.com/ant-design/x)。
`;

const enableAnimation = ref(true);
const enableCache = ref(true);
const tailEnabled = ref(false);
const tailContent = ref("▋");
const isStreaming = ref(false);
const index = ref(0);

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
      isStreaming.value = false;
      return;
    }

    isStreaming.value = true;
    timerRef = setTimeout(() => {
      index.value = Math.min(index.value + 1, text.length);
    }, 50);
  },
  { immediate: true },
);

onBeforeUnmount(clearTimer);

const LoadingLink = defineComponent({
  name: "LoadingLink",
  setup() {
    return () =>
      h(Skeleton.Button, {
        active: true,
        size: "small",
        style: {
          margin: "4px 0",
          width: "16px",
          height: "16px",
        },
      });
  },
});

const LoadingImage = defineComponent({
  name: "LoadingImage",
  setup() {
    return () =>
      h(Skeleton.Image, {
        active: true,
        style: {
          width: "60px",
          height: "60px",
        },
      });
  },
});

const loadingComponents: Record<string, Component> = {
  "loading-link": LoadingLink,
  "loading-image": LoadingImage,
};

const renderMarkdown = (content: string) =>
  h(XMarkdown, {
    className: markdownClass.value,
    content,
    paragraphTag: "div",
    streaming: {
      hasNextChunk: isStreaming.value && enableCache.value,
      enableAnimation: enableAnimation.value,
      tail: tailEnabled.value ? { content: tailContent.value || "▋" } : false,
      incompleteMarkdownComponentMap: {
        link: "loading-link",
        image: "loading-image",
      },
    },
    components: loadingComponents,
  });

const runStream = () => {
  clearTimer();
  index.value = 0;
  isStreaming.value = true;
};
</script>

<template>
  <div
    style="
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
      height: 360px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    "
  >
    <Flex
      vertical
      gap="middle"
      style="flex: 1; min-height: 0; overflow: hidden"
    >
      <Flex gap="small" justify="end" style="flex-shrink: 0">
        <Popover trigger="click" placement="bottomRight">
          <template #content>
            <Flex vertical :gap="10">
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
                  >Syntax Cache</Text
                >
                <Switch size="small" v-model:checked="enableCache" />
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
                <Switch size="small" v-model:checked="tailEnabled" />
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
                  :disabled="!tailEnabled"
                />
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
        <Button
          type="primary"
          size="small"
          style="align-self: flex-end"
          @click="runStream"
        >
          Run Stream
        </Button>
      </Flex>

      <Flex style="flex: 1; min-height: 0; overflow: auto">
        <Bubble
          :content="text.slice(0, index)"
          :content-render="renderMarkdown"
        />
      </Flex>
    </Flex>
  </div>
</template>

<docs lang="zh-CN">
流式渲染综合示例，演示动画、语法缓存、尾部指示器和不完整语法占位。
</docs>

<docs lang="en-US">
Combined streaming demo with animation, syntax cache, tail indicator, and incomplete syntax placeholders.
</docs>
