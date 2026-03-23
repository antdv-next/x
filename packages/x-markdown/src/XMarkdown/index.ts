export { default as XMarkdown } from "./index.vue";

export type { XMarkdownProps } from "./interface";
export type { StreamingOption } from "./interface";
export type { MarkedConfig } from "./interface";
export type { ComponentProps } from "./interface";

export { Parser } from "./core/Parser";
export { VueRenderer } from "./core/VueRenderer";
export { detectUnclosedComponentTags } from "./core/detectUnclosedComponentTags";

export { useStreaming } from "./composables/useStreaming";
export { useParser } from "./composables/useParser";
export { useRenderer } from "./composables/useRenderer";
export { useTail } from "./composables/useTail";

export { AnimationText, DebugPanel, TailIndicator } from "./components";

export { resolveTailContent } from "./utils/tail";
