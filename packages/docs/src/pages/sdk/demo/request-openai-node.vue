<script setup lang="ts">
import type { BubbleListProps } from "@antdv-next/x";
import type {
  XModelMessage,
  XModelParams,
  XRequestOptions,
} from "@antdv-next/x-sdk";
import type { SSEFields } from "@antdv-next/x-sdk";

import { BubbleList, Sender } from "@antdv-next/x";
import {
  AbstractXRequestClass,
  OpenAIChatProvider,
  useXChat,
} from "@antdv-next/x-sdk";
import { Alert, Flex } from "antdv-next";
import { computed, ref } from "vue";

type OutputType = Partial<Record<SSEFields, any>>;
type InputType = XModelParams;

class OpenAiRequest<
  Input extends InputType = InputType,
  Output extends OutputType = OutputType,
> extends AbstractXRequestClass<Input, Output> {
  client: any = null;
  stream: unknown;

  _isTimeout = false;
  _isStreamTimeout = false;
  _isRequesting = false;

  constructor(baseURL: string, options: XRequestOptions<Input, Output>) {
    super(baseURL, options);
  }

  get asyncHandler(): Promise<any> {
    return Promise.resolve();
  }

  get isTimeout(): boolean {
    return this._isTimeout;
  }

  get isStreamTimeout(): boolean {
    return this._isStreamTimeout;
  }

  get isRequesting(): boolean {
    return this._isRequesting;
  }

  get manual(): boolean {
    return true;
  }

  async run(_input: Input): Promise<void> {
    const { callbacks } = this.options;

    try {
      throw new Error(
        "Please replace this skeleton with your openai-node or compatible SDK request implementation.",
      );
    } catch (error: any) {
      callbacks?.onError?.(error);
    }
  }

  abort(): void {}
}

const provider = new OpenAIChatProvider<XModelMessage, InputType, OutputType>({
  request: new OpenAiRequest("OPENAI", {}),
});

const content = ref("");

const { onRequest, messages, isRequesting, abort } = useXChat({
  provider,
  requestPlaceholder: () => ({
    content: "loading...",
    role: "assistant",
  }),
  requestFallback: (_, { error }) => ({
    content: error.name === "AbortError" ? "Request is aborted" : String(error),
    role: "assistant",
  }),
});

const bubbleItems = computed(() =>
  messages.value.map(({ message, id }) => ({
    key: id,
    ...message,
  })),
);

const roleConfig: BubbleListProps["role"] = {
  assistant: {
    placement: "start",
  },
  user: {
    placement: "end",
  },
};

function handleSubmit(value: string) {
  onRequest({
    messages: [{ role: "user", content: value }],
  });
  content.value = "";
}
</script>

<template>
  <Flex vertical gap="middle" :style="{ padding: '16px' }">
    <Alert
      type="info"
      show-icon
      message="This demo is a request skeleton. Replace the custom request with your openai-node or compatible SDK implementation before debugging."
    />

    <BubbleList
      :style="{ height: '500px' }"
      :role="roleConfig"
      :items="bubbleItems"
    />

    <Sender
      :value="content"
      :loading="isRequesting"
      :on-cancel="abort"
      :on-change="(value: string) => (content = value)"
      :on-submit="handleSubmit"
    />
  </Flex>
</template>

<docs lang="”zh-CN”">
当使用一些 SDKs（例如：openai-node，@openrouter/ai-sdk-provider）请求模型或者智能体时需要使用内置的Provider处理数据，需要自定义Request，可参考此示例。 **注意**：此示例仅展示使用X SDK接入 openai 的逻辑参考，并未对模型数据进行处理，需填写正确的apiKey再进行数据调试。
</docs>

<docs lang="”en-US”">
When using SDKs (such as openai-node, @openrouter/ai-sdk-provider) to request models or agents, you need to use the built-in Provider to handle data and customize the Request. Please refer to this example. **Note**: This example only demonstrates the logic for integrating openai using X SDK as a reference, and does not process model data. You need to fill in the correct apiKey for data debugging.
</docs>
