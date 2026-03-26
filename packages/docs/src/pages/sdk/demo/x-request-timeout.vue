<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import { LoadingOutlined, TagsOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { XRequest } from "@antdv-next/x-sdk";
import { Button, Descriptions, DescriptionsItem, Splitter } from "antdv-next";
import { computed, h, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

const BASE_URL = "https://api.example.com";
const PATH = "/chat";

async function mockFetch() {
  return new Promise<Response>(resolve => {
    setTimeout(() => {
      console.log("Response arrived");
      resolve(
        new Response('{ "data": "Hi" }', {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }, 3000);
  });
}

const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    request: isCN ? "请求" : "Request",
    requestLog: isCN ? "请求日志" : "Request Log",
    status: isCN ? "状态" : "Status",
    requestStatus: (status: string) => `request ${status}`,
  };
});

const status = ref<string>("");
const thoughtChainStatus = ref<ThoughtChainItemType["status"]>();

function request() {
  status.value = "pending";
  XRequest(BASE_URL + PATH, {
    timeout: 2000,
    callbacks: {
      onSuccess: () => {
        status.value = "success";
        thoughtChainStatus.value = "success";
      },
      onError: error => {
        if (error.message === "TimeoutError") {
          status.value = "TimeoutError";
        }
        thoughtChainStatus.value = "error";
      },
    },
    fetch: mockFetch,
  });
}

const thoughtChainItems = computed<ThoughtChainItemType[]>(() => [
  {
    title: locale.value.requestLog,
    status: thoughtChainStatus.value,
    icon: status.value === "pending" ? h(LoadingOutlined) : h(TagsOutlined),
    description: locale.value.requestStatus(status.value),
    content: h(
      Descriptions,
      { column: 1 },
      {
        default: () => [
          h(
            DescriptionsItem,
            { label: locale.value.status },
            () => status.value || "-",
          ),
        ],
      },
    ),
  },
]);
</script>

<template>
  <Splitter>
    <Splitter.Panel>
      <Button type="primary" :disabled="status === 'loading'" @click="request">
        {{ locale.request }} - {{ BASE_URL }}{{ PATH }}
      </Button>
    </Splitter.Panel>
    <Splitter.Panel :style="{ marginLeft: '16px' }">
      <ThoughtChain :items="thoughtChainItems" />
    </Splitter.Panel>
  </Splitter>
</template>

<docs lang="zh-CN">
为 `XRequest` 配置 `timeout`，设置请求超时时间。
</docs>

<docs lang="en-US">
Configure `timeout` for `XRequest` to set the request timeout.
</docs>
