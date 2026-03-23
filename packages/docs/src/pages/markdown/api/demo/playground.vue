<script setup lang="ts">
import { SettingOutlined } from "@antdv-next/icons";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  Button,
  Card,
  Flex,
  Input,
  Popover,
  Segmented,
  Select,
  Space,
  Switch,
  Typography,
} from "antdv-next";
import { computed, onUnmounted, ref, watch } from "vue";

const { Text } = Typography;
const { TextArea } = Input;

const DEFAULT_SOURCE = `# XMarkdown Playground

Type Markdown in the editor and see real-time rendering.

## Features

- CommonMark and GFM
- Streaming-friendly rendering
- Safe HTML handling with configurable escaping

## Code Block

\`\`\`tsx
const message = 'Hello, XMarkdown';
console.log(message);
\`\`\`

## Table

| Step | Status |
| --- | --- |
| Parse | Done |
| Render | Running |

## Link

[Link example](https://github.com/antdv-next/antdv-next-x)
`;

const source = ref(DEFAULT_SOURCE);
const cursor = ref(source.value.length);
const isStreaming = ref(false);
const enableAnimation = ref(true);
const tailMode = ref<"off" | "caret" | "dot" | "custom">("off");
const enableDebugPanel = ref(true);
const escapeRawHtml = ref(true);
const openLinksInNewTab = ref(true);
const protectCustomTagNewlines = ref(true);
const themeMode = ref<"light" | "dark">("light");

let timerRef: number | null = null;

const clearTimer = () => {
  if (timerRef !== null) {
    window.clearTimeout(timerRef);
    timerRef = null;
  }
};

const markdownClassName = computed(() =>
  themeMode.value === "light" ? "x-markdown-light" : "x-markdown-dark",
);
const isDarkMode = computed(() => themeMode.value === "dark");
const viewportHeight = computed(() => "clamp(440px, 68vh, 760px)");

watch(source, () => {
  clearTimer();
  cursor.value = source.value.length;
});

watch(isStreaming, streaming => {
  if (!streaming) return;
  if (cursor.value >= source.value.length) {
    isStreaming.value = false;
    return;
  }
  timerRef = window.setTimeout(() => {
    cursor.value = Math.min(source.value.length, cursor.value + 6);
  }, 45);
});

const runStream = () => {
  clearTimer();
  cursor.value = 0;
  isStreaming.value = true;
};

onUnmounted(() => {
  clearTimer();
});

const previewContent = computed(() =>
  isStreaming.value ? source.value.slice(0, cursor.value) : source.value,
);
const hasNextChunk = computed(
  () => isStreaming.value && cursor.value < source.value.length,
);

const tailConfig = computed(() => {
  if (tailMode.value === "off") return false;
  if (tailMode.value === "caret") return { content: "▋" };
  if (tailMode.value === "dot") return { content: "●" };
  return { content: "..." };
});

const streamingConfig = computed(() => ({
  hasNextChunk: hasNextChunk.value,
  enableAnimation: enableAnimation.value,
  tail: tailConfig.value,
}));

const tailOptions = [
  { label: "Off", value: "off" },
  { label: "Caret", value: "caret" },
  { label: "Dot", value: "dot" },
  { label: "Custom", value: "custom" },
];

const themeOptions = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
];
</script>

<template>
  <div style="padding: 24px; max-width: 1400px; margin: 0 auto">
    <Flex vertical gap="middle">
      <Card size="small" title="Control Panel" :bodyStyle="{ padding: 12 }">
        <Flex align="center" justify="space-between" wrap :gap="12">
          <Segmented
            size="small"
            v-model:value="themeMode"
            :options="themeOptions"
          />

          <Space size="small">
            <Popover trigger="click" placement="bottomRight">
              <template #content>
                <Flex gap="large" wrap>
                  <Flex vertical gap="small">
                    <Text strong style="font-size: 12px; margin-bottom: 4px">
                      Streaming
                    </Text>
                    <Flex
                      align="center"
                      justify="space-between"
                      :gap="16"
                      style="min-width: 140px"
                    >
                      <Text
                        style="font-size: 12px; margin: 0; white-space: nowrap"
                        >Animation</Text
                      >
                      <Switch size="small" v-model:checked="enableAnimation" />
                    </Flex>
                    <Flex
                      align="center"
                      justify="space-between"
                      :gap="16"
                      style="min-width: 140px"
                    >
                      <Text
                        style="font-size: 12px; margin: 0; white-space: nowrap"
                        >Tail</Text
                      >
                      <Select
                        size="small"
                        style="width: 80px"
                        v-model:value="tailMode"
                        :options="tailOptions"
                      />
                    </Flex>
                    <Flex
                      align="center"
                      justify="space-between"
                      :gap="16"
                      style="min-width: 140px"
                    >
                      <Text
                        style="font-size: 12px; margin: 0; white-space: nowrap"
                        >Debug Panel</Text
                      >
                      <Switch size="small" v-model:checked="enableDebugPanel" />
                    </Flex>
                  </Flex>

                  <Flex vertical gap="small">
                    <Text strong style="font-size: 12px; margin-bottom: 4px">
                      Parsing & Safety
                    </Text>
                    <Flex
                      align="center"
                      justify="space-between"
                      :gap="16"
                      style="min-width: 180px"
                    >
                      <Text
                        style="font-size: 12px; margin: 0; white-space: nowrap"
                        >Escape Raw HTML</Text
                      >
                      <Switch size="small" v-model:checked="escapeRawHtml" />
                    </Flex>
                    <Flex
                      align="center"
                      justify="space-between"
                      :gap="16"
                      style="min-width: 180px"
                    >
                      <Text
                        style="font-size: 12px; margin: 0; white-space: nowrap"
                        >Open Links In New Tab</Text
                      >
                      <Switch
                        size="small"
                        v-model:checked="openLinksInNewTab"
                      />
                    </Flex>
                    <Flex
                      align="center"
                      justify="space-between"
                      :gap="16"
                      style="min-width: 180px"
                    >
                      <Text
                        style="font-size: 12px; margin: 0; white-space: nowrap"
                        >Protect Custom Tag Newlines</Text
                      >
                      <Switch
                        size="small"
                        v-model:checked="protectCustomTagNewlines"
                      />
                    </Flex>
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
              @click="runStream"
              :disabled="source.length === 0"
            >
              Run Stream
            </Button>
          </Space>
        </Flex>
      </Card>

      <Flex gap="middle" wrap>
        <Card
          title="Markdown Input"
          :style="{ flex: '1 1 420px', minWidth: '320px' }"
        >
          <TextArea
            v-model:value="source"
            :bordered="false"
            :spell-check="false"
            :style="{
              padding: '12px',
              height: viewportHeight,
              resize: 'none',
              overflowY: 'auto',
              fontFamily: 'Menlo, Monaco, Consolas, monospace',
            }"
          />
        </Card>

        <Card
          title="Preview"
          :style="{ flex: '1 1 420px', minWidth: '320px' }"
          :bodyStyle="{ padding: 0 }"
        >
          <div
            :style="{
              background: isDarkMode ? '#141414' : '#fff',
              height: viewportHeight,
              display: 'flex',
              flexDirection: 'column',
            }"
          >
            <div
              :class="markdownClassName"
              :style="{ padding: '12px', flex: '1', overflowY: 'auto' }"
            >
              <XMarkdown
                :content="previewContent"
                :debug="enableDebugPanel"
                :escape-raw-html="escapeRawHtml"
                :open-links-in-new-tab="openLinksInNewTab"
                :protect-custom-tag-newlines="protectCustomTagNewlines"
                :streaming="streamingConfig"
              />
            </div>
          </div>
        </Card>
      </Flex>
    </Flex>
  </div>
</template>

<docs lang="zh-CN">
XMarkdown 在线体验，可实时预览 Markdown 渲染效果，支持流式渲染配置。
</docs>

<docs lang="en-US">
XMarkdown Playground, preview Markdown rendering in real-time with streaming support.
</docs>
