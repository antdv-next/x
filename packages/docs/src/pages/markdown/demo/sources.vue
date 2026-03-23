<script setup lang="ts">
import type { SourcesProps } from "@antdv-next/x";

import { Bubble, Sources } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex } from "antdv-next";
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
  type VNode,
} from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const text = `Ant Financial has a large number of enterprise-level products.<sup>1</sup> With complex scenarios, designers and developers often need to respond fast due to frequent changes in product demands and concurrent R & D workflow.<sup>2</sup> Many similar contents exist in the process. Through abstraction, we could obtain some stable and highly reusable components and pages.<sup>3</sup>`;

function extractText(nodes: VNode[]): string {
  return nodes
    .map(node => {
      const children = node.children;
      if (typeof children === "string") return children;
      if (Array.isArray(children)) return extractText(children as VNode[]);
      return "";
    })
    .join("");
}

const items: SourcesProps["items"] = [
  {
    title: "1. Data source",
    key: 1,
    url: "https://x.antdv-next.com/components/overview",
    description:
      "Artificial Intelligence, often abbreviated as AI, is a broad branch of computer science concerned with building smart machines capable of performing tasks that typically require human intelligence.",
  },
  {
    title: "2. Data source",
    key: 2,
    url: "https://x.antdv-next.com/components/overview",
  },
  {
    title: "3. Data source",
    key: 3,
    url: "https://x.antdv-next.com/components/overview",
  },
];

const SupComponent = defineComponent({
  name: "SourcesSup",
  setup(_, { slots }) {
    const activeKey = computed(() => {
      const value = Number(extractText(slots.default?.() ?? []));
      return Number.isFinite(value) ? value : 0;
    });

    const title = computed(() => String(activeKey.value || ""));

    return () =>
      h(Sources, {
        activeKey: activeKey.value,
        title: title.value,
        items,
        inline: true,
      });
  },
});

const components = {
  sup: SupComponent,
};

const { isDark } = useDarkMode();
const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const index = ref(0);
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

const renderMarkdown = (content: string) =>
  h(XMarkdown, {
    content,
    components,
    paragraphTag: "div",
  });

const rerender = () => {
  clearTimer();
  index.value = 0;
};
</script>

<template>
  <Flex
    vertical
    :gap="8"
    style="height: 260px; overflow: auto"
    :class="markdownClass"
    ref="contentRef"
  >
    <Flex justify="flex-end">
      <Button @click="rerender">Re-Render</Button>
    </Flex>

    <Bubble
      :content="text.slice(0, index)"
      :content-render="renderMarkdown"
      variant="outlined"
    />
  </Flex>
</template>

<docs lang="zh-CN">
Sources 示例：对齐 antdx，在 Markdown 内将脚注标记映射为 Sources 内联组件。
</docs>

<docs lang="en-US">
Sources demo aligned with antdx: map Markdown footnote markers to inline Sources components.
</docs>
