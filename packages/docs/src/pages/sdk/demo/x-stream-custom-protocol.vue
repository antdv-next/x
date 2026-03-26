<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import { TagsOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { XStream } from "@antdv-next/x-sdk";
import { Button, Splitter } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const sipHeaders = [
  "INVITE sip:[email protected] SIP/2.0\n",
  "Via: SIP/2.0/UDP [host];branch=123456\n",
  "Content-Type: application/sdp\n\n",
];

const sdp = [
  "v=0\n",
  "o=alice 2890844526 2890844526 IN IP4 [host]\n",
  "s=\n",
  "c=IN IP4 [host]\n",
  "t=0 0\n",
  "m=audio 49170 RTP/AVP 0\n",
  "a=rtpmap:0 PCMU/8000\n",
  "m=video 51372 RTP/AVP 31\n",
  "a=rtpmap:31 H261/90000\n",
  "m=video 53000 RTP/AVP 32\n",
  "a=rtpmap:32 MPV/90000\n\n",
];

function mockReadableStream() {
  return new ReadableStream({
    async start(controller) {
      for (const chunk of sipHeaders.concat(sdp)) {
        await new Promise(resolve => setTimeout(resolve, 100));
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
}

const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    mockCustomProtocolSIP: isCN
      ? "模拟自定义协议 - SIP"
      : "Mock Custom Protocol - SIP",
    mockCustomProtocolLog: isCN
      ? "模拟自定义协议 - 日志"
      : "Mock Custom Protocol - Log",
  };
});

const lines = ref<string[]>([]);

async function readStream() {
  for await (const chunk of XStream({
    readableStream: mockReadableStream(),
    transformStream: new TransformStream<string, string>({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    }),
  })) {
    lines.value = [...lines.value, chunk];
  }
}

const thoughtChainItems = computed<ThoughtChainItemType[]>(() =>
  lines.value.length
    ? [
        {
          title: locale.value.mockCustomProtocolLog,
          status: "success",
          icon: h(TagsOutlined),
          content: h("pre", { style: { overflow: "scroll" } }, [
            h("code", lines.value.join("")),
          ]),
        },
      ]
    : [],
);
</script>

<template>
  <Splitter>
    <Splitter.Panel>
      <Button
        type="primary"
        :style="{ marginBottom: '16px' }"
        @click="readStream"
      >
        {{ locale.mockCustomProtocolSIP }}
      </Button>
    </Splitter.Panel>
    <!-- Log -->
    <Splitter.Panel :style="{ marginLeft: '16px' }">
      <ThoughtChain :items="thoughtChainItems" />
    </Splitter.Panel>
  </Splitter>
</template>

<docs lang="zh-CN">
> 在本示例中，我们将演示如何解析 SIP 协议, 该协议常用于 P2P 音视频会话协商。

传入 `transformStream` 流转换器，该参数需接收一个 `new TransformStream(...)` 实例。
</docs>

<docs lang="en-US">
> In this example, we will demonstrate parsing the SIP protocol, which is commonly used for P2P audio and video session initiation.

Pass in a `transformStream` stream transformer; this parameter accepts a `new TransformStream(...)` instance.
</docs>
