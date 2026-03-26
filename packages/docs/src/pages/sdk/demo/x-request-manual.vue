<script setup lang="ts">
import type { ThoughtChainItemType } from "@antdv-next/x";

import { LoadingOutlined, TagsOutlined } from "@antdv-next/icons";
import { ThoughtChain } from "@antdv-next/x";
import { AbstractXRequestClass, XRequest } from "@antdv-next/x-sdk";
import {
  Button,
  Descriptions,
  DescriptionsItem,
  Flex,
  Input,
  Splitter,
} from "antdv-next";
import { computed, h, onMounted, ref, shallowRef } from "vue";

import { useLocale } from "@/composables/use-locale";

interface ChatInput {
  query?: string;
  stream?: boolean;
}

const QUERY_URL = "https://api.x.ant.design/api/default_chat_provider_stream";

const { locale: docsLocale } = useLocale();

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    request: isCN ? "请求" : "Request",
    requestAbort: isCN ? "请求中止" : "Request Abort",
    requestLog: isCN ? "请求日志" : "Request Log",
    status: isCN ? "状态" : "Status",
    updateTimes: isCN ? "更新次数" : "Update Times",
    requestStatus: (status: string) => `request ${status}`,
  };
});

const status = ref<string>();
const thoughtChainStatus = ref<ThoughtChainItemType["status"]>();
const lines = ref<Record<string, string>[]>([]);
const questionText = ref<string>("hello, who are u?");

const requestHandlerRef =
  shallowRef<AbstractXRequestClass<ChatInput, Record<string, string>>>();

onMounted(() => {
  requestHandlerRef.value = XRequest<ChatInput, Record<string, string>>(
    QUERY_URL,
    {
      params: { stream: true },
      manual: true,
      callbacks: {
        onSuccess: () => {
          status.value = "success";
          thoughtChainStatus.value = "success";
        },
        onError: error => {
          if (error.name === "AbortError") {
            status.value = "abort";
          }
          thoughtChainStatus.value = "error";
        },
        onUpdate: msg => {
          lines.value = [...lines.value, msg];
        },
      },
    },
  );
});

function request() {
  status.value = "pending";
  lines.value = [];
  requestHandlerRef.value?.run({ query: questionText.value });
}

function abort() {
  requestHandlerRef.value?.abort?.();
}

const thoughtChainItems = computed<ThoughtChainItemType[]>(() => [
  {
    title: locale.value.requestLog,
    status: thoughtChainStatus.value,
    icon: status.value === "pending" ? h(LoadingOutlined) : h(TagsOutlined),
    description: locale.value.requestStatus(status.value || ""),
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
          h(
            DescriptionsItem,
            { label: locale.value.updateTimes },
            () => lines.value.length,
          ),
        ],
      },
    ),
  },
]);
</script>

<template>
  <Splitter>
    <Splitter.Panel :style="{ height: '300px' }">
      <Splitter orientation="vertical">
        <Splitter.Panel :style="{ margin: '0 16px' }">
          <Flex gap="large" vertical>
            <Input
              :value="questionText"
              @update:value="questionText = $event"
            />
            <Flex gap="small">
              <Button
                type="primary"
                :disabled="status === 'pending'"
                @click="request"
              >
                {{ locale.request }}
              </Button>
              <Button
                type="primary"
                :disabled="status !== 'pending'"
                @click="abort"
              >
                {{ locale.requestAbort }}
              </Button>
            </Flex>
          </Flex>
        </Splitter.Panel>
        <Splitter.Panel :style="{ margin: '16px' }">
          <p v-if="lines.length > 0">
            {{ JSON.stringify(lines) }}
          </p>
        </Splitter.Panel>
      </Splitter>
    </Splitter.Panel>
    <Splitter.Panel :style="{ marginLeft: '16px' }">
      <ThoughtChain :items="thoughtChainItems" />
    </Splitter.Panel>
  </Splitter>
</template>

<docs lang="zh-CN">
手动触发请求模式，支持流式响应和主动终止。
</docs>

<docs lang="en-US">
Manual trigger request mode with streaming response and abort support.
</docs>
