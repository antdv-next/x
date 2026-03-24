<script setup lang="ts">
import type { Component } from "vue";

import { computed, defineComponent, h, ref, shallowRef, watch } from "vue";

import type { XMarkdownProps } from "./interface";

import DebugPanel from "./components/DebugPanel.vue";
import TailIndicator from "./components/TailIndicator.vue";
import { useStreaming } from "./composables/useStreaming";
import { useTail } from "./composables/useTail";
import { Parser } from "./core/Parser";
import { VueRenderer } from "./core/VueRenderer";
import "./index.css";

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

const optionsVersion = ref(0);

const bumpOptionsVersion = () => {
  optionsVersion.value += 1;
};

const htmlOutput = computed(() => {
  void optionsVersion.value;
  return parser.value.parse(processedContent.value, {
    injectTail: showTail.value,
  });
});

const vNode = computed(() => {
  void optionsVersion.value;
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
    bumpOptionsVersion();
  },
);

watch(
  () => props.config,
  newConfig => {
    parser.value.setOptions({
      config: newConfig,
    });
    bumpOptionsVersion();
  },
  { deep: true },
);

watch(
  () => props.components,
  newComponents => {
    parser.value.setOptions({
      components: newComponents,
    });
    bumpOptionsVersion();
  },
  { deep: true },
);

watch(
  mergedComponents,
  newComponents => {
    renderer.value.setOptions({
      components: newComponents,
    });
    bumpOptionsVersion();
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
    bumpOptionsVersion();
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
