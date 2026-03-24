<script setup lang="ts">
import { SettingOutlined } from "@antdv-next/icons";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex, Input, Popover, Switch, Typography } from "antdv-next";
import { computed, onUnmounted, ref, watch } from "vue";

const { Text } = Typography;

const text = `# Ant Design X

Ant Design X 是一款 AI 应用复合工具集，融合了 UI 组件库、流式 Markdown 渲染引擎和 AI SDK，为开发者提供构建下一代 AI 驱动应用的完整工具链。

![Ant Design X](https://mdn.alipayobjects.com/huamei_yz9z7c/afts/img/0lMhRYbo0-8AAAAAQDAAAAgADlJoAQFr/original)

基于 Ant Design 设计体系的 React UI 库、专为 AI 驱动界面设计，开箱即用的智能对话组件、无缝集成 API 服务，快速搭建智能应用界面，查看详情请点击 [Ant Design X](https://github.com/ant-design/x)。`;

const content = ref("");
const enableAnimation = ref(true);
const enableCache = ref(true);
const tailEnabled = ref(false);
const tailContent = ref("▋");
const isStreaming = ref(false);
const index = ref(0);

let timerRef: number | null = null;

const clearTimer = () => {
  if (timerRef !== null) {
    window.clearTimeout(timerRef);
    timerRef = null;
  }
};

const tailConfig = computed(() => {
  if (!tailEnabled.value) return false;
  return { content: tailContent.value || "▋" };
});

const streamingConfig = computed(() => ({
  hasNextChunk: isStreaming.value && enableCache.value,
  enableAnimation: enableAnimation.value,
  tail: tailConfig.value,
}));

watch(index, () => {
  clearTimer();

  if (index.value >= text.length) {
    isStreaming.value = false;
    return;
  }

  isStreaming.value = true;
  timerRef = window.setTimeout(() => {
    index.value = Math.min(index.value + 1, text.length);
  }, 50);
});

const runStream = () => {
  clearTimer();
  index.value = 0;
  isStreaming.value = true;
};

onUnmounted(() => {
  clearTimer();
});

watch(
  isStreaming,
  () => {
    content.value = text.slice(0, index.value);
  },
  { immediate: true },
);

watch(index, () => {
  content.value = text.slice(0, index.value);
});
</script>

<template>
  <div style="padding: 24px; max-width: 800px; margin: 0 auto">
    <Flex vertical gap="middle">
      <Flex gap="small" justify="end">
        <Popover trigger="click" placement="bottomRight">
          <template #content>
            <Flex vertical gap="small">
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
        <Button type="primary" size="small" @click="runStream"
          >Run Stream</Button
        >
      </Flex>

      <div
        :style="{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 24,
          minHeight: 320,
          overflow: 'auto',
        }"
      >
        <XMarkdown
          :content="content"
          :streaming="streamingConfig"
          paragraph-tag="div"
        />
      </div>
    </Flex>
  </div>
</template>

<docs lang="zh-CN">
流式渲染演示，展示如何配置流式渲染能力，支持动画、语法缓存和尾部指示器。
</docs>

<docs lang="en-US">
Streaming rendering demo, demonstrating how to configure streaming rendering with animation, syntax cache, and tail indicator.
</docs>
