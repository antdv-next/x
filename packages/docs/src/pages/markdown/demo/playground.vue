<script setup lang="ts">
import type { Component } from "vue";

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
  theme,
} from "antdv-next";
import { computed, defineComponent, h, onUnmounted, ref, watch } from "vue";
import "@antdv-next/x-markdown/themes/light.css";
import "@antdv-next/x-markdown/themes/dark.css";
import { useDarkMode } from "@/composables/use-dark-mode";

const { Text } = Typography;
const { TextArea } = Input;
const { token } = theme.useToken();
const { isDark } = useDarkMode();

const DEFAULT_SOURCE = `# XMarkdown Playground

Type Markdown in the editor and see real-time rendering.

## Features

- CommonMark and GFM
- Streaming-friendly rendering
- Safe HTML handling with configurable escaping

\`\`\`tsx
const message = 'Hello, XMarkdown';
console.log(message);
\`\`\`

## Streaming Preview

1. Click "Run Stream"
2. Observe incomplete syntax handling
3. Continue typing in the editor for instant full preview

| Step | Status |
| --- | --- |
| Parse | Done |
| Render | Running |

[Link example](https://x.ant.design/x-markdowns/introduce)

## HTML and Security
<div style="padding: 8px; border: 1px solid #aaa;">
  Inline raw HTML block
</div>

Try toggling \`escapeRawHtml\` to compare behavior.
`;

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const getDataRaw = (attrs: Record<string, unknown>): string => {
  const raw = attrs["data-raw"];
  return typeof raw === "string" ? safeDecodeURIComponent(raw) : "";
};

const LoadingLink = defineComponent({
  name: "LoadingLink",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () =>
      h(
        "span",
        {
          style: {
            opacity: "0.6",
            borderBottom: "1px dashed #999",
          },
        },
        getDataRaw(attrs) || "...",
      );
  },
});

const LoadingImage = defineComponent({
  name: "LoadingImage",
  setup() {
    return () =>
      h(
        "span",
        {
          style: {
            opacity: "0.6",
            display: "inline-block",
            width: "96px",
            height: "24px",
          },
        },
        "Loading image...",
      );
  },
});

const LoadingTable = defineComponent({
  name: "LoadingTable",
  setup() {
    return () =>
      h(
        "span",
        {
          style: {
            opacity: "0.6",
            display: "inline-block",
            width: "96px",
            height: "24px",
          },
        },
        "Loading table...",
      );
  },
});

const LoadingHtml = defineComponent({
  name: "LoadingHtml",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () =>
      h(
        "span",
        {
          style: {
            opacity: "0.6",
          },
        },
        getDataRaw(attrs) || "<html />",
      );
  },
});

const incompleteLoadingComponents: Record<string, Component> = {
  "loading-link": LoadingLink,
  "loading-image": LoadingImage,
  "loading-table": LoadingTable,
  "loading-html": LoadingHtml,
};

const CustomTail = defineComponent({
  name: "CustomTail",
  props: {
    content: {
      type: String,
      default: "...",
    },
  },
  setup(props) {
    return () =>
      h("span", { class: "xmd-playground-custom-tail" }, props.content);
  },
});

const source = ref(DEFAULT_SOURCE);
const cursor = ref(source.value.length);
const isStreaming = ref(false);
const enableAnimation = ref(true);
const tailMode = ref<"off" | "caret" | "dot" | "custom">("off");
const enableDebugPanel = ref(true);
const escapeRawHtml = ref(true);
const openLinksInNewTab = ref(true);
const protectCustomTagNewlines = ref(true);
const themeMode = ref<"light" | "dark">(isDark.value ? "dark" : "light");

let timerRef: number | null = null;

const clearTimer = () => {
  if (timerRef !== null) {
    window.clearTimeout(timerRef);
    timerRef = null;
  }
};

watch(isDark, value => {
  themeMode.value = value ? "dark" : "light";
});

const markdownClassName = computed(() =>
  themeMode.value === "light" ? "x-markdown-light" : "x-markdown-dark",
);
const isDarkMode = computed(() => themeMode.value === "dark");
const viewportHeight = "clamp(440px, 68vh, 760px)";

const containerStyle = computed(() => ({
  padding: `${token.value.padding}px`,
  maxWidth: "1400px",
  margin: "0 auto",
}));

const controlCardStyle = computed(() => ({
  borderRadius: `${token.value.borderRadiusLG}px`,
  borderColor: token.value.colorBorderSecondary,
}));

const previewShellStyle = computed(() => ({
  background: isDarkMode.value ? "#141414" : token.value.colorBgContainer,
  height: viewportHeight,
  display: "flex",
  flexDirection: "column",
}));

watch(source, () => {
  clearTimer();
  cursor.value = source.value.length;
});

watch(
  [isStreaming, cursor, () => source.value.length],
  ([streaming, currentCursor, sourceLength]) => {
    clearTimer();

    if (!streaming) {
      return;
    }

    if (currentCursor >= sourceLength) {
      isStreaming.value = false;
      return;
    }

    timerRef = window.setTimeout(() => {
      cursor.value = Math.min(sourceLength, currentCursor + 6);
    }, 45);
  },
);

const runStream = () => {
  clearTimer();
  cursor.value = 0;
  isStreaming.value = true;
};

onUnmounted(clearTimer);

const previewContent = computed(() =>
  isStreaming.value ? source.value.slice(0, cursor.value) : source.value,
);
const hasNextChunk = computed(
  () => isStreaming.value && cursor.value < source.value.length,
);

const streamingConfig = computed(() => ({
  hasNextChunk: hasNextChunk.value,
  enableAnimation: enableAnimation.value,
  tail:
    tailMode.value === "off"
      ? false
      : tailMode.value === "caret"
        ? { content: "▋" }
        : tailMode.value === "dot"
          ? { content: "●" }
          : { content: "...", component: CustomTail },
  incompleteMarkdownComponentMap: {
    link: "loading-link",
    image: "loading-image",
    table: "loading-table",
    html: "loading-html",
  },
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
  <div :style="containerStyle">
    <Flex vertical :gap="14">
      <Card
        size="small"
        title="Control Panel"
        :style="controlCardStyle"
        :bodyStyle="{ padding: 12 }"
      >
        <Flex align="center" justify="space-between" wrap :gap="12">
          <Segmented
            size="small"
            v-model:value="themeMode"
            :options="themeOptions"
          />

          <Space size="small">
            <Popover trigger="click" placement="bottomRight">
              <template #content>
                <div style="padding: 8px">
                  <Flex :gap="24" wrap>
                    <Flex vertical :gap="10">
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
                          style="
                            font-size: 12px;
                            margin: 0;
                            white-space: nowrap;
                          "
                          >Animation</Text
                        >
                        <Switch
                          size="small"
                          v-model:checked="enableAnimation"
                        />
                      </Flex>
                      <Flex
                        align="center"
                        justify="space-between"
                        :gap="16"
                        style="min-width: 140px"
                      >
                        <Text
                          style="
                            font-size: 12px;
                            margin: 0;
                            white-space: nowrap;
                          "
                          >Tail</Text
                        >
                        <Select
                          size="small"
                          style="width: 96px"
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
                          style="
                            font-size: 12px;
                            margin: 0;
                            white-space: nowrap;
                          "
                          >Debug Panel</Text
                        >
                        <Switch
                          size="small"
                          v-model:checked="enableDebugPanel"
                        />
                      </Flex>
                    </Flex>

                    <Flex vertical :gap="10">
                      <Text strong style="font-size: 12px; margin-bottom: 4px">
                        Parsing & Safety
                      </Text>
                      <Flex
                        align="center"
                        justify="space-between"
                        :gap="16"
                        style="min-width: 140px"
                      >
                        <Text
                          style="
                            font-size: 12px;
                            margin: 0;
                            white-space: nowrap;
                          "
                          >Escape Raw HTML</Text
                        >
                        <Switch size="small" v-model:checked="escapeRawHtml" />
                      </Flex>
                      <Flex
                        align="center"
                        justify="space-between"
                        :gap="16"
                        style="min-width: 140px"
                      >
                        <Text
                          style="
                            font-size: 12px;
                            margin: 0;
                            white-space: nowrap;
                          "
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
                        style="min-width: 140px"
                      >
                        <Text
                          style="
                            font-size: 12px;
                            margin: 0;
                            white-space: nowrap;
                          "
                          >Protect Custom Tag Newlines</Text
                        >
                        <Switch
                          size="small"
                          v-model:checked="protectCustomTagNewlines"
                        />
                      </Flex>
                    </Flex>
                  </Flex>
                </div>
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

      <div class="xmd-playground-panels">
        <Flex :gap="12" :wrap="false" class="xmd-playground-panels-inner">
          <Card
            title="Markdown Input"
            :style="{ flex: '1 1 0', minWidth: '0' }"
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
            :style="{ flex: '1 1 0', minWidth: '0' }"
            :bodyStyle="{ padding: '1px' }"
          >
            <div :style="previewShellStyle">
              <div
                :class="markdownClassName"
                :style="{ padding: '12px', flex: '1', overflowY: 'auto' }"
              >
                <XMarkdown
                  :content="previewContent"
                  :debug="enableDebugPanel"
                  :class-name="markdownClassName"
                  :escape-raw-html="escapeRawHtml"
                  :open-links-in-new-tab="openLinksInNewTab"
                  :protect-custom-tag-newlines="protectCustomTagNewlines"
                  :streaming="streamingConfig"
                  :components="incompleteLoadingComponents"
                />
              </div>
            </div>
          </Card>
        </Flex>
      </div>
    </Flex>
  </div>
</template>

<style scoped>
.xmd-playground-panels {
  overflow-x: auto;
}

.xmd-playground-panels-inner {
  min-width: 900px;
}

.xmd-playground-custom-tail {
  animation: xmd-playground-pulse 1s ease-in-out infinite;
  color: #1890ff;
}

@keyframes xmd-playground-pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>

<docs lang="zh-CN">
XMarkdown 在线体验，可实时预览 Markdown 渲染效果，支持流式渲染配置。
</docs>

<docs lang="en-US">
XMarkdown Playground, preview Markdown rendering in real-time with streaming support.
</docs>
