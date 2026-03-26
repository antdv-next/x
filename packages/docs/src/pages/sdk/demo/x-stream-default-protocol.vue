<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import { TagsOutlined } from "@antdv-next/icons";
import { Bubble, ThoughtChain } from "@antdv-next/x";
import { XStream } from "@antdv-next/x-sdk";
import { Button, Flex, Radio, Splitter } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const contentChunks = [
  "Hello",
  " ",
  "I",
  " ",
  "am",
  " ",
  "Ant",
  " ",
  "Design",
  " ",
  "X",
  "!",
];
function createRealisticStream(partSeparator: string, streamSeparator: string) {
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index >= contentChunks.length) {
        controller.close();
        return;
      }

      await new Promise(resolve =>
        setTimeout(resolve, Math.random() * 100 + 50),
      );

      const chunk = contentChunks[index];
      const sseData = `event:message${partSeparator}data:{"id":"${index}","content":"${chunk}"}${streamSeparator}`;

      controller.enqueue(new TextEncoder().encode(sseData));
      index++;
    },
  });
}

function mockReadableStream(partSeparator: string, streamSeparator: string) {
  return createRealisticStream(partSeparator, streamSeparator);
}

const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    mockDefaultProtocolSSE: isCN
      ? "模拟默认协议 - SSE"
      : "Mock Default Protocol - SSE",
    mockDefaultProtocolLog: isCN
      ? "模拟默认协议 - 日志"
      : "Mock Default Protocol - Log",
    noContent: isCN ? "暂无内容" : "no content",
  };
});

const lines = ref<Record<string, string>[]>([]);
const content = computed(() =>
  lines.value.map(line => JSON.parse(line?.data || "{}").content).join(""),
);
const partSeparator = ref("\n");
const streamSeparator = ref("\n\n");

async function readStream() {
  lines.value = [];
  for await (const chunk of XStream({
    readableStream: mockReadableStream(
      partSeparator.value,
      streamSeparator.value,
    ),
    partSeparator: partSeparator.value,
    streamSeparator: streamSeparator.value,
  })) {
    lines.value = [...lines.value, chunk];
  }
}

const thoughtChainItems = computed<ThoughtChainItemType[]>(() =>
  lines.value.length
    ? [
        {
          title: locale.value.mockDefaultProtocolLog,
          status: "success",
          icon: h(TagsOutlined),
          content: h(
            "pre",
            { style: { overflow: "scroll" } },
            lines.value.map(i => h("code", { key: i.data }, i.data)),
          ),
        },
      ]
    : [],
);
</script>

<template>
  <Splitter>
    <Splitter.Panel>
      <Flex vertical gap="small">
        <Flex gap="small">
          partSeparator:
          <Radio.Group
            :value="partSeparator"
            :options="[
              { value: '\n', label: '\\n (default)' },
              { value: '\r\n', label: '\\r\\n' },
            ]"
            @update:value="partSeparator = $event"
          />
        </Flex>
        <Flex gap="small">
          streamSeparator:
          <Radio.Group
            :value="streamSeparator"
            :options="[
              { value: '\n\n', label: '\\n\\n (default)' },
              { value: '\r\n', label: '\\r\\n' },
            ]"
            @update:value="streamSeparator = $event"
          />
        </Flex>

        <!-- Emit -->
        <Button
          type="primary"
          :style="{ marginBottom: '16px' }"
          @click="readStream"
        >
          {{ locale.mockDefaultProtocolSSE }}
        </Button>
      </Flex>
      lines: {{ JSON.stringify(lines) }}
      <!-- Content Concat -->
      <template v-if="content">
        <div>content: <Bubble :content="content" /></div>
      </template>
      <template v-else> content: {{ locale.noContent }} </template>
    </Splitter.Panel>
    <!-- Log -->
    <Splitter.Panel :style="{ marginLeft: '16px' }">
      <ThoughtChain :items="thoughtChainItems" />
    </Splitter.Panel>
  </Splitter>
</template>

<docs lang="zh-CN">
> SSE - https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

XStream 默认的 `transformStream` 是用于 SSE 协议的流转换器。`readableStream` 接收一个 `new ReadableStream(...)` 实例，常见的如 `await fetch(...).body`
</docs>

<docs lang="en-US">
> SSE - https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

The default `transformStream` in XStream is an SSE protocol stream transformer and is optional. The `readableStream` accepts a `new ReadableStream(...)` instance, such as `await fetch(...).body`
</docs>
