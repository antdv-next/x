<script setup lang="ts">
import type { Component } from "vue";

import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Card, Segmented, Skeleton } from "antdv-next";
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const demos = [
  {
    title: "Mixed Syntax",
    content: `## Ant Design X

![Logo](https://mdn.alipayobjects.com/huamei_yz9z7c/afts/img/0lMhRYbo0-8AAAAAQDAAAAgADlJoAQFr/original)

UI components, streaming Markdown, and AI SDK in one toolkit.

- \`@antdv-next/x\` — components
- \`@antdv-next/x-markdown\` — rendering
- \`@antdv-next/x-sdk\` — tools & chat

### Get started

\`npm install @antdv-next/x\`. See [components](/components/introduce/) and [Markdown](/markdown) docs.

| Package | Description |
| --- | --- |
| @antdv-next/x | AI-oriented UI library |
| @antdv-next/x-markdown | Streaming Markdown |
| @antdv-next/x-sdk | Tools & APIs |

<welcome data-icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" title="Hello, I'm Ant Design X" data-description="AGI interface solution based on Ant Design"></welcome>
`,
  },
  {
    title: "Link Syntax",
    content: "Learn more: [Ant Design X](https://github.com/ant-design/x).",
  },
  {
    title: "Image Syntax",
    content:
      "![Ant Design X](https://mdn.alipayobjects.com/huamei_yz9z7c/afts/img/0lMhRYbo0-8AAAAAQDAAAAgADlJoAQFr/original)",
  },
  {
    title: "Html",
    content:
      '<welcome data-icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp" title="Hello, I\'m Ant Design X" data-description="AGI interface solution based on Ant Design"></welcome>',
  },
  {
    title: "Table",
    content: `| Package | Description |
| --- | --- |
| @antdv-next/x | AI-oriented UI library |
| @antdv-next/x-markdown | Streaming Markdown |
| @antdv-next/x-sdk | Tools & APIs |`,
  },
  {
    title: "Emphasis",
    content: "**Bold**, *italic*, and ***both***.",
  },
  {
    title: "InlineCode",
    content: "Run `npm install @antdv-next/x-markdown`.",
  },
];

const { isDark } = useDarkMode();

const currentDemo = ref(0);
const index = ref(0);
const hasNextChunk = ref(true);

const sourceRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);

let timerRef: ReturnType<typeof setTimeout> | null = null;

const currentContent = computed(() => demos[currentDemo.value]?.content ?? "");
const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const isLongContent = computed(() => currentContent.value.length > 500);
const previewMinHeight = computed(() => (isLongContent.value ? 320 : 160));
const previewMaxHeight = computed(() => (isLongContent.value ? 420 : 280));

const clearTimer = () => {
  if (timerRef !== null) {
    clearTimeout(timerRef);
    timerRef = null;
  }
};

const scrollToBottom = (el: HTMLElement | null) => {
  if (!el || index.value <= 0) {
    return;
  }

  const { scrollHeight, clientHeight } = el;
  if (scrollHeight > clientHeight) {
    el.scrollTo({ top: scrollHeight, behavior: "smooth" });
  }
};

watch(
  index,
  () => {
    clearTimer();

    if (index.value >= currentContent.value.length) {
      hasNextChunk.value = false;
      return;
    }

    timerRef = setTimeout(() => {
      index.value = Math.min(index.value + 1, currentContent.value.length);
    }, 30);
  },
  { immediate: true },
);

watch(index, () => {
  if (index.value > 0) {
    scrollToBottom(sourceRef.value);
    scrollToBottom(contentRef.value);
  }
});

watch(currentDemo, () => {
  clearTimer();
  index.value = 0;
  hasNextChunk.value = true;
  if (sourceRef.value) sourceRef.value.scrollTop = 0;
  if (contentRef.value) contentRef.value.scrollTop = 0;
});

onBeforeUnmount(clearTimer);

const rerender = () => {
  clearTimer();
  index.value = 0;
  hasNextChunk.value = true;
};

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const IncompleteImage = defineComponent({
  name: "IncompleteImage",
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

const IncompleteLink = defineComponent({
  name: "IncompleteLink",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => {
      const text = safeDecodeURIComponent(String(attrs["data-raw"] || ""));
      const linkTextMatch = text.match(/^\[([^\]]*)\]/);
      const displayText = linkTextMatch ? linkTextMatch[1] : text.slice(1);

      return h(
        "a",
        {
          href: "#",
          style: { pointerEvents: "none" },
        },
        displayText,
      );
    };
  },
});

const IncompleteTable = defineComponent({
  name: "IncompleteTable",
  setup() {
    return () =>
      h(Skeleton.Node, {
        active: true,
        style: {
          width: "160px",
        },
      });
  },
});

const IncompleteHtml = defineComponent({
  name: "IncompleteHtml",
  setup() {
    return () =>
      h(Skeleton.Node, {
        active: true,
        style: {
          width: "383px",
          height: "120px",
        },
      });
  },
});

const IncompleteEmphasis = defineComponent({
  name: "IncompleteEmphasis",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => {
      const text = safeDecodeURIComponent(String(attrs["data-raw"] || ""));
      const match = text.match(/^([*_]{1,3})([^*_]*)/);
      if (!match || !match[2]) return null;

      const [, symbols, content] = match;
      const level = symbols.length;

      if (level === 1) return h("em", content);
      if (level === 2) return h("strong", content);
      if (level === 3) return h("em", [h("strong", content)]);
      return null;
    };
  },
});

const IncompleteInlineCode = defineComponent({
  name: "IncompleteInlineCode",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => {
      const rawData = String(attrs["data-raw"] || "");
      if (!rawData) return null;

      const decodedText = safeDecodeURIComponent(rawData).slice(1);
      return h("code", { class: "format-inline-code" }, decodedText);
    };
  },
});

const WelcomeCard = defineComponent({
  name: "WelcomeCard",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () => {
      const icon =
        String(attrs["data-icon"] ?? attrs.icon ?? "") ||
        "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp";
      const title = String(attrs.title ?? "") || "Hello, I'm Ant Design X";
      const description =
        String(attrs["data-description"] ?? attrs.description ?? "") ||
        "AGI interface solution based on Ant Design";

      return h("div", { class: "format-welcome" }, [
        h("img", {
          src: icon,
          alt: "welcome icon",
          class: "format-welcome-icon",
        }),
        h("div", { class: "format-welcome-main" }, [
          h("div", { class: "format-welcome-title" }, title),
          h("div", { class: "format-welcome-description" }, description),
        ]),
      ]);
    };
  },
});

const components: Record<string, Component> = {
  "incomplete-image": IncompleteImage,
  "incomplete-link": IncompleteLink,
  "incomplete-table": IncompleteTable,
  "incomplete-html": IncompleteHtml,
  "incomplete-emphasis": IncompleteEmphasis,
  "incomplete-inline-code": IncompleteInlineCode,
  welcome: WelcomeCard,
};

const streamingConfig = computed(() => ({
  hasNextChunk: hasNextChunk.value,
  enableAnimation: false,
  incompleteMarkdownComponentMap: {
    link: "incomplete-link",
    image: "incomplete-image",
    table: "incomplete-table",
    html: "incomplete-html",
    emphasis: "incomplete-emphasis",
    "inline-code": "incomplete-inline-code",
  },
}));

const demoOptions = computed(() =>
  demos.map((demo, demoIndex) => ({
    label: demo.title,
    value: demoIndex,
  })),
);

const handleDemoChange = (value: string | number) => {
  currentDemo.value = Number(value);
};
</script>

<template>
  <div style="max-width: 960px; margin: 0 auto">
    <div style="margin-bottom: 16px">
      <Segmented
        :value="currentDemo"
        :options="demoOptions"
        block
        @change="handleDemoChange"
      />
    </div>

    <div
      style="
        display: flex;
        gap: 16px;
        width: 100%;
        transition: max-height 0.25s ease;
      "
      :style="{
        minHeight: `${previewMinHeight}px`,
        maxHeight: `${previewMaxHeight}px`,
      }"
    >
      <Card
        title="Markdown Source"
        size="small"
        style="flex: 1; display: flex; flex-direction: column; min-width: 0"
        :bodyStyle="{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <div
          ref="sourceRef"
          style="
            flex: 1;
            min-height: 0;
            background: var(--ant-color-fill-quaternary);
            padding: 12px;
            border-radius: 6px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow: auto;
            font-size: 12px;
            line-height: 1.5;
          "
        >
          {{ currentContent.slice(0, index) }}
        </div>
      </Card>

      <Card
        title="Rendered Output"
        size="small"
        style="flex: 1; display: flex; flex-direction: column; min-width: 0"
        :bodyStyle="{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }"
      >
        <template #extra>
          <Button size="small" @click="rerender">Re-Render</Button>
        </template>

        <div
          ref="contentRef"
          style="
            flex: 1;
            min-height: 0;
            overflow: auto;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid var(--ant-color-border-secondary);
            background: var(--ant-color-bg-container);
          "
          :class="markdownClass"
        >
          <XMarkdown
            :content="currentContent.slice(0, index)"
            :class-name="markdownClass"
            paragraph-tag="div"
            open-links-in-new-tab
            :components="components"
            :streaming="streamingConfig"
          />
        </div>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.format-image-skeleton,
.format-table-skeleton,
.format-html-skeleton {
  display: inline-flex;
  border-radius: 6px;
  background: linear-gradient(
    110deg,
    var(--ant-color-fill-tertiary, #f2f3f5) 8%,
    var(--ant-color-fill-secondary, #e5e7eb) 18%,
    var(--ant-color-fill-tertiary, #f2f3f5) 33%
  );
  background-size: 200% 100%;
  animation: format-loading 1.2s linear infinite;
}

.format-image-skeleton {
  width: 60px;
  height: 60px;
}

.format-table-skeleton {
  width: 160px;
  height: 16px;
}

.format-html-skeleton {
  width: 383px;
  height: 120px;
}

.format-inline-code {
  display: inline-flex;
  padding: 0 4px;
  border-radius: 4px;
  background: var(--ant-color-fill-quaternary, #f5f5f5);
}

.format-welcome {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--ant-color-border-secondary, #f0f0f0);
  background: var(--ant-color-fill-quaternary, #fafafa);
}

.format-welcome-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
}

.format-welcome-main {
  min-width: 0;
}

.format-welcome-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.format-welcome-description {
  margin-top: 2px;
  color: var(--ant-color-text-description, #8c8c8c);
  font-size: 12px;
  line-height: 1.4;
}

@keyframes format-loading {
  to {
    background-position-x: -200%;
  }
}
</style>

<docs lang="zh-CN">
语法处理示例：展示流式过程中不完整语法片段的恢复与占位。
</docs>

<docs lang="en-US">
Syntax-processing demo: recovery and placeholders for incomplete syntax while streaming.
</docs>
