<script setup lang="ts">
import { RedoOutlined } from "@antdv-next/icons";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  resolveComponent,
  watch,
  type PropType,
  type VNode,
} from "vue";

const text = `
**GPT-Vis**, Components for GPTs, generative AI, and LLM projects.

Here is a simple sales trend:

<custom-line data-axis-x-title="year" data-axis-y-title="sale">[{"time":2018,"value":91.9},{"time":2019,"value":99.1},{"time":2020,"value":101.6},{"time":2021,"value":114.4},{"time":2022,"value":121}]</custom-line>
`.trim();

const index = ref(0);
const contentRef = ref<HTMLElement | { $el?: HTMLElement } | null>(null);
let timer: ReturnType<typeof setTimeout> | null = null;

const content = computed(() => text.slice(0, index.value));
const hasNextChunk = computed(() => index.value < text.length);

function extractTextFromSlotNodes(nodes: VNode[]): string {
  let output = "";
  for (const node of nodes) {
    const children = node.children;
    if (typeof children === "string") {
      output += children;
      continue;
    }
    if (Array.isArray(children)) {
      output += extractTextFromSlotNodes(children as VNode[]);
    }
  }
  return output;
}

const CustomLine = defineComponent({
  name: "CustomLine",
  props: {
    streamStatus: {
      type: String as PropType<"loading" | "done">,
      default: "done",
    },
    dataAxisXTitle: {
      type: String,
      default: "",
    },
    dataAxisYTitle: {
      type: String,
      default: "",
    },
  },
  setup(props, { slots }) {
    const ASkeletonImage = resolveComponent("a-skeleton-image");

    const chartData = computed(() => {
      const slotNodes = slots.default?.() ?? [];
      const textContent = extractTextFromSlotNodes(slotNodes).trim();
      if (!textContent) return [];
      try {
        const parsed = JSON.parse(textContent);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    });

    const chartPoints = computed(() => {
      if (!chartData.value.length) return "";

      const minX = Math.min(
        ...chartData.value.map((item: any) => Number(item.time) || 0),
      );
      const maxX = Math.max(
        ...chartData.value.map((item: any) => Number(item.time) || 0),
      );
      const minY = Math.min(
        ...chartData.value.map((item: any) => Number(item.value) || 0),
      );
      const maxY = Math.max(
        ...chartData.value.map((item: any) => Number(item.value) || 0),
      );

      const width = 860;
      const height = 240;
      const padding = 20;

      return chartData.value
        .map((item: any) => {
          const xRatio =
            maxX === minX ? 0 : (Number(item.time) - minX) / (maxX - minX);
          const yRatio =
            maxY === minY ? 0 : (Number(item.value) - minY) / (maxY - minY);
          const x = padding + xRatio * (width - padding * 2);
          const y = height - padding - yRatio * (height - padding * 2);
          return `${x},${y}`;
        })
        .join(" ");
    });

    return () => {
      if (props.streamStatus === "loading") {
        return h(ASkeletonImage, {
          active: true,
          style:
            "width: 100%; min-width:240px; height: 120px; border-radius: 8px;",
        });
      }

      if (!chartData.value.length) {
        return null;
      }

      return h(
        "svg",
        {
          viewBox: "0 0 860 240",
          style:
            "width: 100%; max-width: 860px; border: 1px solid var(--ant-color-border-secondary); border-radius: 8px; padding: 8px;",
        },
        [
          h("polyline", {
            fill: "none",
            stroke: "var(--ant-color-primary)",
            "stroke-width": "3",
            points: chartPoints.value,
          }),
        ],
      );
    };
  },
});

const components = {
  "custom-line": CustomLine,
};

function clearTimer() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

watch(
  index,
  () => {
    clearTimer();
    if (index.value >= text.length) return;
    timer = setTimeout(() => {
      index.value = Math.min(index.value + 5, text.length);
    }, 20);
  },
  { immediate: true },
);

watch(index, () => {
  if (!contentRef.value || index.value <= 0 || index.value >= text.length) {
    return;
  }

  const el =
    contentRef.value instanceof HTMLElement
      ? contentRef.value
      : contentRef.value.$el;
  if (!el) {
    return;
  }

  const { scrollHeight, clientHeight } = el;
  if (scrollHeight > clientHeight) {
    el.scrollTo({
      top: scrollHeight,
      behavior: "smooth",
    });
  }
});

function rerender() {
  clearTimer();
  index.value = 0;
}

onBeforeUnmount(() => {
  clearTimer();
});
</script>

<template>
  <a-space
    ref="contentRef"
    direction="vertical"
    style="display: flex; width: 100%; height: 280px; overflow: auto"
    :size="10"
  >
    <a-space style="display: flex; justify-content: flex-end; width: 100%">
      <a-button @click="rerender">
        <RedoOutlined />
        Re-Render
      </a-button>
    </a-space>

    <ax-bubble :content="content" variant="outlined">
      <template #contentRender="{ content: value }">
        <XMarkdown
          style="white-space: normal"
          :content="value"
          :components="components"
          paragraph-tag="div"
          :streaming="{ hasNextChunk }"
        />
      </template>
    </ax-bubble>
  </a-space>
</template>

<docs lang="zh-CN">
配合 `@antv/GPT-Vis` 实现大模型输出的图表渲染，支持模型流式输出。使用 `x-markdown` 组件渲染 Markdown 内容，并支持自定义组件渲染。
</docs>

<docs lang="en-US">
Cooperate with `@antv/GPT-Vis` to achieve customized rendering chart of LLM stream output. Uses `x-markdown` component to render Markdown content with custom component support.
</docs>
