export { default as XMarkdown } from "./index.vue";

export type { XMarkdownProps } from "./interface";
export type { StreamingOption, TypewriterOption } from "./interface";
export type { AnimationConfig, TypewriterConfig } from "./interface";
export type { StreamCacheTokenType } from "./interface";
export type { MarkedConfig } from "./interface";
export type { ComponentProps } from "./interface";

export { Parser } from "./core/Parser";
export { VueRenderer } from "./core/VueRenderer";
export { detectUnclosedComponentTags } from "./core/detectUnclosedComponentTags";

export { useStreaming, useStreamingCore } from "./composables/useStreaming";
export { useTypewriter } from "./composables/useTypewriter";
export { useParser } from "./composables/useParser";
export { useRenderer } from "./composables/useRenderer";
export { useTail } from "./composables/useTail";

export { AnimationText, DebugPanel, TailIndicator } from "./components";

export { resolveStreaming } from "./utils/streaming";
export { resolveTailContent } from "./utils/tail";
