<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";
import type {
  SSEFields,
  XModelMessage,
  XModelParams,
  XRequestOptions,
} from "@antdv-next/x-sdk";

import { BubbleList, Sender } from "@antdv-next/x";
import {
  AbstractXRequestClass,
  OpenAIChatProvider,
  useXChat,
} from "@antdv-next/x-sdk";
import { Flex } from "antdv-next";
import { computed, ref } from "vue";

import { useLocale } from "@/composables/use-locale";

type DemoLocale = {
  mockNodeLoading: string;
  requestAborted: string;
};

type OutputType = Partial<Record<SSEFields, unknown>>;

const locales: Record<"zh-CN" | "en-US", DemoLocale> = {
  "zh-CN": {
    mockNodeLoading: "正在调用自定义 request...",
    requestAborted: "请求已中止",
  },
  "en-US": {
    mockNodeLoading: "Calling custom request...",
    requestAborted: "Request is aborted",
  },
};

// 使用文档站的 locale hook，让 demo 文案随站点语言切换实时更新。
const { locale } = useLocale();
const demoLocale = computed<DemoLocale>(() =>
  locale.value === "zh-CN" ? locales["zh-CN"] : locales["en-US"],
);

class MockOpenAIRequest extends AbstractXRequestClass<
  XModelParams,
  OutputType,
  XModelMessage
> {
  private _isTimeout = false;
  private _isStreamTimeout = false;
  private _isRequesting = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private asyncTask = Promise.resolve();

  get asyncHandler() {
    return this.asyncTask;
  }

  get isTimeout() {
    return this._isTimeout;
  }

  get isStreamTimeout() {
    return this._isStreamTimeout;
  }

  get isRequesting() {
    return this._isRequesting;
  }

  get manual() {
    return true;
  }

  run(params?: XModelParams) {
    this.abort();
    this._isRequesting = true;
    const headers = new Headers({
      "content-type": "text/event-stream",
    });
    const lastUserMessage = [...(params?.messages || [])]
      .reverse()
      .find(message => message.role === "user");
    const text =
      typeof lastUserMessage?.content === "string"
        ? lastUserMessage.content
        : "";
    const pieces = text.match(/.{1,18}/g) || [text];
    const chunks: OutputType[] = [];

    const emit = (index: number) => {
      if (!this._isRequesting) {
        return;
      }

      if (index >= pieces.length) {
        this._isRequesting = false;
        this.options.callbacks?.onSuccess(chunks, headers);
        return;
      }

      const chunk: OutputType = {
        data: JSON.stringify({
          choices: [
            {
              delta: {
                role: "assistant",
                content: pieces[index],
              },
            },
          ],
        }),
      };
      chunks.push(chunk);
      this.options.callbacks?.onUpdate?.(chunk, headers);
      this.timer = setTimeout(() => emit(index + 1), 120);
    };

    this.asyncTask = Promise.resolve().then(() => emit(0));
  }

  abort() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this._isRequesting) {
      this._isRequesting = false;
      this.options.callbacks?.onError(
        new DOMException("Aborted", "AbortError"),
        undefined,
        new Headers({
          "content-type": "text/event-stream",
        }),
      );
    }
  }
}

const content = ref("");
const provider = new OpenAIChatProvider<
  XModelMessage,
  XModelParams,
  OutputType
>({
  request: new MockOpenAIRequest(
    "mock://node-openai",
    {} as XRequestOptions<XModelParams, OutputType, XModelMessage>,
  ),
});

const { onRequest, messages, isRequesting, abort } = useXChat({
  provider,
  requestPlaceholder: () => ({
    content: demoLocale.value.mockNodeLoading,
    role: "assistant",
  }),
  requestFallback: async (_, { error }) => ({
    content:
      error.name === "AbortError"
        ? demoLocale.value.requestAborted
        : error.toString(),
    role: "assistant",
  }),
});

const role = {
  assistant: {
    placement: "start",
  },
  user: {
    placement: "end",
  },
} satisfies BubbleListProps["role"];

const items = computed(() =>
  messages.value.map(({ id, message, status }) => ({
    key: id,
    role: message.role,
    content: message.content,
    status,
    loading: status === "loading",
  })),
);

function onContentChange(value: string) {
  content.value = value;
}

function onSubmit(value: string) {
  if (!value) return;

  onRequest({
    messages: [
      {
        role: "user",
        content: value,
      },
    ],
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle" style="padding: 16px">
    <BubbleList style="height: 500px" :role="role" :items="items" />

    <Sender
      :value="content"
      :loading="isRequesting"
      :on-cancel="abort"
      :on-change="onContentChange"
      :on-submit="onSubmit"
    />
  </Flex>
</template>

<docs lang="zh-CN">
对齐 antdx `request-openai-node.tsx`：用继承 `AbstractXRequestClass` 的自定义 request 驱动 `OpenAIChatProvider`。
</docs>

<docs lang="en-US">
Aligned with antdx `request-openai-node.tsx`: drive `OpenAIChatProvider` with a custom request class that extends `AbstractXRequestClass`.
</docs>
