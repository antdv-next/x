<script setup lang="ts">
import type { Component } from "vue";

import { computed, defineComponent, h, shallowRef, watch } from "vue";

import type { XMarkdownProps } from "./interface";

import DebugPanel from "./components/DebugPanel.vue";
import TailIndicator from "./components/TailIndicator.vue";
import { useStreaming } from "./composables/useStreaming";
import { useTail } from "./composables/useTail";
import { Parser } from "./core/Parser";
import { VueRenderer } from "./core/VueRenderer";

const props = withDefaults(defineProps<XMarkdownProps>(), {
  content: "",
  components: () => ({}),
  streaming: undefined,
  config: () => ({ gfm: true }),
  debug: false,
  protectCustomTagNewlines: true,
  escapeRawHtml: false,
  openLinksInNewTab: true,
  paragraphTag: "p",
});

const contentRef = computed(() => props.content || "");
const streamingRef = computed(() => props.streaming);
const componentsRef = computed(() => props.components);

const { processedContent } = useStreaming(
  contentRef,
  streamingRef,
  componentsRef,
);
const { tailContent, tailComponent, showTail } = useTail(streamingRef);

const mergedComponents = computed<Record<string, Component>>(() => {
  const baseComponents = { ...props.components };

  if (!showTail.value || !tailContent.value) {
    return baseComponents;
  }

  const resolvedTailComponent = tailComponent.value || TailIndicator;
  const content = tailContent.value;
  const TailBridge = defineComponent({
    name: "XmdTailBridge",
    setup() {
      return () => h(resolvedTailComponent, { content });
    },
  });

  return {
    ...baseComponents,
    "xmd-tail": TailBridge,
  };
});

const parser = shallowRef(
  new Parser({
    openLinksInNewTab: props.openLinksInNewTab,
    paragraphTag: props.paragraphTag,
    protectCustomTags: props.protectCustomTagNewlines,
    escapeRawHtml: props.escapeRawHtml,
    config: props.config,
    components: props.components,
  }),
);

const renderer = shallowRef(
  new VueRenderer({
    components: mergedComponents.value,
    enableAnimation: props.streaming?.enableAnimation ?? true,
    animationConfig: props.streaming?.animationConfig,
  }),
);

const htmlOutput = computed(() => {
  return parser.value.parse(processedContent.value, {
    injectTail: showTail.value,
  });
});

const vNode = computed(() => {
  return renderer.value.render(htmlOutput.value);
});

watch(
  () => [
    props.openLinksInNewTab,
    props.paragraphTag,
    props.protectCustomTagNewlines,
    props.escapeRawHtml,
  ],
  () => {
    parser.value.setOptions({
      openLinksInNewTab: props.openLinksInNewTab,
      paragraphTag: props.paragraphTag,
      protectCustomTags: props.protectCustomTagNewlines,
      escapeRawHtml: props.escapeRawHtml,
    });
  },
);

watch(
  () => props.config,
  newConfig => {
    parser.value.setOptions({
      config: newConfig,
    });
  },
  { deep: true },
);

watch(
  () => props.components,
  newComponents => {
    parser.value.setOptions({
      components: newComponents,
    });
  },
  { deep: true },
);

watch(
  mergedComponents,
  newComponents => {
    renderer.value.setOptions({
      components: newComponents,
    });
  },
  { deep: true },
);

watch(
  () => props.streaming,
  newStreaming => {
    renderer.value.setOptions({
      enableAnimation: newStreaming?.enableAnimation ?? true,
      animationConfig: newStreaming?.animationConfig,
    });
  },
  { deep: true },
);
</script>

<template>
  <div :class="['x-markdown', className]" :style="style">
    <component :is="vNode" />
    <DebugPanel v-if="debug" />
  </div>
</template>

<style scoped>
.x-markdown {
  line-height: 1.6;
  word-wrap: break-word;
}

.x-markdown :deep(a) {
  color: #1890ff;
  text-decoration: none;
}

.x-markdown :deep(a:hover) {
  text-decoration: underline;
}

.x-markdown :deep(code) {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.x-markdown :deep(pre) {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.x-markdown :deep(pre code) {
  background: none;
  padding: 0;
}

.x-markdown :deep(blockquote) {
  border-left: 4px solid #d9d9d9;
  padding-left: 16px;
  margin-left: 0;
  color: #666;
}

.x-markdown :deep(ul),
.x-markdown :deep(ol) {
  padding-left: 24px;
}

.x-markdown :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.x-markdown :deep(th),
.x-markdown :deep(td) {
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  text-align: left;
}

.x-markdown :deep(th) {
  background: #fafafa;
}
</style>
