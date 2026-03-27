<script setup lang="ts">
import { Bubble } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex, Spin } from "antdv-next";
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type VNode,
} from "vue";

import { useDarkMode } from "@/composables/use-dark-mode";

const text = `
**[Infographic](https://github.com/antvis/Infographic)**, An Infographic Generation and Rendering Framework, bring words to life with AI!

The advantages of an enterprise are generally analyzed from dimensions such as brand influence, technological R&D capabilities, rapid market growth, service satisfaction, comprehensive data assets, and strong innovation capabilities, which are reflected in the final performance.

\`\`\` infographic
infographic sequence-pyramid-simple
data
  title 企业数字化转型层级
  desc 从基础设施到战略创新的五层进阶路径
  items
    - label 战略创新
      desc 数据驱动决策，引领行业变革
      icon ref:search:lightbulb-on
    - label 智能运营
      desc AI赋能业务，实现自动化管理
      icon ref:search:robot
    - label 数据整合
      desc 打通数据孤岛，建立统一平台
      icon ref:search:database-sync
    - label 流程优化
      desc 数字化核心业务流程和协作
      icon ref:search:workflow
    - label 基础设施
      desc 构建云计算和网络基础架构
      icon ref:search:server-network
themeConfig
  palette antv
\`\`\`
`;

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

type InfographicInstance = {
  render: (spec: string) => void;
  destroy: () => void;
};

const VueInfographic = defineComponent({
  name: "VueInfographic",
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const containerRef = ref<HTMLElement | null>(null);
    const loading = ref(true);
    const errorMessage = ref("");
    const instanceRef = ref<InfographicInstance | null>(null);

    async function ensureInstance() {
      if (instanceRef.value || !containerRef.value) {
        return;
      }

      const mod = await import("@antv/infographic");
      const ctor = mod.Infographic as new (options: {
        container: HTMLElement;
      }) => InfographicInstance;

      instanceRef.value = new ctor({
        container: containerRef.value,
      });
    }

    async function renderInfographic(spec: string) {
      if (!spec.trim()) {
        return;
      }

      try {
        errorMessage.value = "";
        await ensureInstance();
        instanceRef.value?.render(spec);
      } catch (error) {
        errorMessage.value = String(error);
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      void renderInfographic(props.content);
    });

    watch(
      () => props.content,
      content => {
        loading.value = true;
        void renderInfographic(content);
      },
    );

    onBeforeUnmount(() => {
      instanceRef.value?.destroy();
      instanceRef.value = null;
    });

    return () =>
      h(
        "div",
        {
          style: {
            position: "relative",
            maxHeight: "500px",
            overflow: "auto",
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            padding: "16px",
          },
        },
        [
          loading.value
            ? h(
                "div",
                {
                  style: {
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255, 255, 255, 0.8)",
                    zIndex: 1,
                  },
                },
                [h(Spin, { tip: "Rendering..." })],
              )
            : null,
          errorMessage.value
            ? h(
                "div",
                {
                  style: {
                    color: "#ff4d4f",
                    marginBottom: "12px",
                    wordBreak: "break-word",
                  },
                },
                errorMessage.value,
              )
            : null,
          h("div", { ref: containerRef }),
        ],
      );
  },
});

const CodeRenderer = defineComponent({
  name: "MarkdownInfographicCodeRenderer",
  setup(_, { attrs, slots }) {
    const lang = computed(() => {
      const className = typeof attrs.class === "string" ? attrs.class : "";
      return className.match(/language-(\w+)/)?.[1] || "";
    });

    return () => {
      const code = extractText(slots.default?.() ?? []);

      if (lang.value === "infographic") {
        return h(VueInfographic, {
          content: code,
        });
      }

      return h("code", code);
    };
  },
});

const components = {
  code: CodeRenderer,
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

function resolveScrollContainer(): HTMLElement | null {
  const node = contentRef.value as
    | HTMLElement
    | { $el?: Element | null }
    | null;

  if (!node) return null;
  if (node instanceof HTMLElement) return node;
  if (node.$el instanceof HTMLElement) return node.$el;
  return null;
}

watch(
  index,
  async () => {
    if (index.value <= 0 || index.value >= text.length) {
      return;
    }

    await nextTick();
    const container = resolveScrollContainer();
    if (!container) {
      return;
    }

    const { scrollHeight, clientHeight } = container;
    if (scrollHeight > clientHeight) {
      container.scrollTo({
        top: scrollHeight,
        behavior: "smooth",
      });
    }
  },
  { flush: "post" },
);

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
    style="height: 800px; overflow: auto"
    :class="markdownClass"
    ref="contentRef"
  >
    <Flex justify="flex-end">
      <Button type="primary" @click="rerender">Re-Render</Button>
    </Flex>

    <Bubble
      :content="text.slice(0, index)"
      :styles="{ content: { width: '700px' } }"
      :content-render="renderMarkdown"
      variant="outlined"
    />
  </Flex>
</template>

<docs lang="zh-CN">
Infographic 示例：严格对齐官方 demo，使用 `components.code` 按语言接管代码块并动态渲染 `@antv/infographic`。
</docs>

<docs lang="en-US">
Infographic demo aligned with the upstream example: override `components.code` by language and render `@antv/infographic` dynamically.
</docs>
