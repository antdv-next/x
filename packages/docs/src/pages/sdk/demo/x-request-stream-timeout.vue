<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import { TagsOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { XRequest } from "@antdv-next/x-sdk";
import { Button, Flex, Splitter } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const BASE_URL = "https://api.example.com";
const PATH = "/chat";
const ND_JSON_SEPARATOR = "\n\n";

async function mockFetch() {
  const sseData = `data: {"id":"0","choices":[{"index":0,"delta":{"content":"Hello","role":"assistant"}}],"created":1733129200,"model":"gpt-4o"}${ND_JSON_SEPARATOR}data: {"id":"1","choices":[{"index":1,"delta":{"content":"world!","role":"assistant"}}],"created":1733129300,"model":"gpt-4o"}${ND_JSON_SEPARATOR}data: {"id":"2","choices":[{"index":2,"delta":{"content":"I","role":"assistant"}}],"created":1733129400,"model":"gpt-4o"}${ND_JSON_SEPARATOR}data: {"id":"3","choices":[{"index":3,"delta":{"content":"am","role":"assistant"}}],"created":1733129500,"model":"gpt-4o"}${ND_JSON_SEPARATOR}data: {"id":"4","choices":[{"index":4,"delta":{"content":"Ant Design X!","role":"assistant"}}],"created":1733129600,"model":"gpt-4o"}`;
  const chunks = sseData.split(ND_JSON_SEPARATOR);
  const response = new Response(
    new ReadableStream({
      async start(controller) {
        for (const chunk of chunks) {
          if (chunk.trim()) {
            const time = 1000 * 10 * Math.random();
            await new Promise(resolve => setTimeout(resolve, time));
            const formattedChunk = chunk.startsWith("data:")
              ? chunk
              : `data: ${chunk}`;
            controller.enqueue(
              new TextEncoder().encode(formattedChunk + ND_JSON_SEPARATOR),
            );
          }
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/event-stream" } },
  );
  return response;
}

const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    request: isCN ? "请求" : "Request",
    mockCustomProtocolLog: isCN
      ? "模拟自定义协议 - 日志"
      : "Mock Custom Protocol - Log",
    sendRequest: isCN
      ? "发送请求：使用自定义转换器和模拟数据"
      : "Send request: use custom transformer and mock data",
    customStreamTransformer: isCN
      ? "自定义流转换器"
      : "Custom stream transformer",
  };
});

const status = ref<ThoughtChainItemType["status"]>();
const lines = ref<string[]>([]);
const errorInfo = ref<Error | null>(null);

function request() {
  status.value = "loading";
  lines.value = [];
  errorInfo.value = null;
  XRequest(BASE_URL + PATH, {
    params: {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "hello, who are u?" }],
      stream: true,
      agentId: 111,
    },
    streamTimeout: 5000,
    callbacks: {
      onSuccess: messages => {
        status.value = "success";
        console.log("onSuccess", messages);
      },
      onError: error => {
        status.value = "error";
        errorInfo.value = error;
        console.error("onError", error);
      },
      onUpdate: msg => {
        console.log("onUpdate", msg);
        lines.value = [...lines.value, JSON.stringify(msg)];
      },
    },
    fetch: mockFetch,
  });
}

function clearLogs() {
  lines.value = [];
}

const thoughtChainItems = computed<ThoughtChainItemType[]>(() => [
  {
    title: locale.value.mockCustomProtocolLog,
    description: errorInfo.value ? errorInfo.value.message : "",
    status: status.value,
    icon: h(TagsOutlined),
    content: h("pre", { style: { overflow: "scroll" } }, [
      h(
        "code",
        lines.value
          .map(l => (typeof l === "string" ? l.trim() : l))
          .join(ND_JSON_SEPARATOR),
      ),
    ]),
  },
]);
</script>

<template>
  <Splitter>
    <Splitter.Panel>
      <Flex gap="small">
        <Button
          type="primary"
          :disabled="status === 'loading'"
          @click="request"
        >
          {{ locale.request }} - {{ BASE_URL }}{{ PATH }}
        </Button>
        <Button :disabled="lines.length === 0" @click="clearLogs">
          清除日志
        </Button>
      </Flex>
    </Splitter.Panel>
    <Splitter.Panel :style="{ marginLeft: '16px' }">
      <ThoughtChain :items="thoughtChainItems" />
    </Splitter.Panel>
  </Splitter>
</template>

<docs lang="zh-CN">
为 `XRequest` 配置 `streamTimeout`，设置请求超时时间。
</docs>

<docs lang="en-US">
Configure `streamTimeout` for `XRequest` to set the request stream timeout.
</docs>
