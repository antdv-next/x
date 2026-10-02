<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Flex, Segmented, Space, Tag, theme } from "antdv-next";
import { computed, nextTick, ref, watch } from "vue";

import { useChunkedStream } from "./use-chunked-stream";

// A long answer: headings, inline markup, fenced code and tables — the mix
// that made every chunk re-render the whole document before `incremental`.
const section = (i: number) =>
  [
    `## ${i + 1}. Section ${i + 1}`,
    "",
    `This paragraph has **bold text that takes a moment to finish**, *emphasis*, \`inline code\` ` +
      "and a [link to the docs](https://x.ant.design). It keeps going for a while so the typewriter has something to pace.",
    "",
    "```ts",
    `export function step${i}(a: number, b: number): number {`,
    `  // section ${i + 1}`,
    "  return a * b + 1;",
    "}",
    "```",
    "",
    "| key | value |",
    "| --- | --- |",
    `| step | ${i + 1} |`,
    `| total | ${(i + 1) * 3} |`,
    "",
  ].join("\n");

const text = `# Streaming preset\n\n${Array.from({ length: 8 }, (_, i) => section(i)).join("")}`;

// Models deliver text in bursts. A longer interval makes the difference
// between the two panes obvious: the left one jumps, the right one types.
const PACES = { fast: 60, normal: 250, slow: 600 } as const;
type Pace = keyof typeof PACES;
const CHUNK = 30;

const { theme: currentTheme } = theme.useToken();
const markdownClass = computed(() =>
  currentTheme.value.id === 1 ? "x-markdown-dark" : "x-markdown-light",
);

const pace = ref<Pace>("normal");
const paceMs = computed(() => PACES[pace.value]);
const {
  content,
  index,
  isStreaming,
  restart: runStream,
} = useChunkedStream(text, CHUNK, paceMs);
const chunksReceived = computed(() => Math.ceil(index.value / CHUNK));

const leftPaneRef = ref<HTMLElement | null>(null);
const rightPaneRef = ref<HTMLElement | null>(null);

watch(content, async () => {
  await nextTick();
  for (const el of [leftPaneRef.value, rightPaneRef.value]) {
    if (el && el.scrollHeight > el.clientHeight) {
      el.scrollTop = el.scrollHeight;
    }
  }
});
</script>

<template>
  <Flex vertical :gap="16" style="max-width: 1200px; margin: 0 auto">
    <Flex align="center" justify="space-between" wrap="wrap" :gap="8">
      <Space :size="8">
        <Tag :color="isStreaming ? 'processing' : 'default'">
          {{ isStreaming ? `streaming · ${chunksReceived} chunks` : "done" }}
        </Tag>
        <span
          >left: no streaming · right:
          <code>:streaming="isStreaming"</code></span
        >
      </Space>
      <Space>
        <Segmented
          v-model:value="pace"
          size="small"
          :options="[
            { label: 'fast 60ms', value: 'fast' },
            { label: 'normal 250ms', value: 'normal' },
            { label: 'slow 600ms', value: 'slow' },
          ]"
        />
        <Button type="primary" size="small" @click="runStream">
          Run Stream
        </Button>
      </Space>
    </Flex>

    <Flex :gap="16" class="preset-panes">
      <div
        ref="leftPaneRef"
        :class="markdownClass"
        style="
          flex: 1;
          min-width: 0;
          height: 400px;
          overflow: auto;
          padding: 0 8px 32px;
          border: 1px solid rgba(128, 128, 128, 0.25);
          border-radius: 8px;
        "
      >
        <XMarkdown :content="content" />
      </div>
      <div
        ref="rightPaneRef"
        :class="markdownClass"
        style="
          flex: 1;
          min-width: 0;
          height: 400px;
          overflow: auto;
          padding: 0 8px 32px;
          border: 1px solid rgba(128, 128, 128, 0.25);
          border-radius: 8px;
        "
      >
        <XMarkdown :content="content" :streaming="isStreaming" />
      </div>
    </Flex>
  </Flex>
</template>

<style scoped>
@media (max-width: 768px) {
  .preset-panes {
    flex-direction: column;
  }
}
</style>
