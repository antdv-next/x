<script setup lang="ts">
import {
  AbstractChatProvider,
  XRequest,
  type TransformMessage,
  type XRequestOptions,
} from "@antdv-next/x-sdk";
import { ref } from "vue";

type CustomInput = {
  query: string;
};

type Attachment = {
  name: string;
  url: string;
  type: string;
  size?: number;
};

type CustomOutput = {
  data: string;
};

type CustomMessage = {
  content: string;
  role: "user" | "assistant";
  attachments?: Attachment[];
};

class CustomProvider extends AbstractChatProvider<
  CustomMessage,
  CustomInput,
  CustomOutput
> {
  transformParams(
    requestParams: Partial<CustomInput>,
    options: XRequestOptions<CustomInput, CustomOutput, CustomMessage>,
  ): CustomInput {
    return {
      ...options?.params,
      ...requestParams,
    } as CustomInput;
  }

  transformLocalMessage(requestParams: Partial<CustomInput>): CustomMessage {
    return {
      content: requestParams.query || "",
      role: "user",
    };
  }

  transformMessage(
    info: TransformMessage<CustomMessage, CustomOutput>,
  ): CustomMessage {
    const { originMessage, chunk } = info;

    if (!chunk?.data || chunk.data.includes("[DONE]")) {
      return {
        content: originMessage?.content || "",
        role: "assistant",
        attachments: originMessage?.attachments || [],
      };
    }

    const parsed = JSON.parse(chunk.data) as {
      content?: string;
      attachments?: Attachment[];
    };

    const attachments = [
      ...(originMessage?.attachments || []),
      ...(parsed.attachments || []),
    ];

    return {
      content: `${originMessage?.content || ""}${parsed.content || ""}`,
      role: "assistant",
      attachments,
    };
  }
}

const provider = new CustomProvider({
  request: XRequest("/api/mock/chat-provider/custom", {
    manual: true,
  }),
});

const input = ref("");
const result = ref<CustomMessage | null>(null);

function run() {
  const query = input.value.trim() || "生成一份项目总结报告";

  const local = provider.transformLocalMessage({
    query,
  });

  const assistant = provider.transformMessage({
    originMessage: {
      role: "assistant",
      content: "",
      attachments: [],
    },
    chunk: {
      data: JSON.stringify({
        content: "报告已生成完成",
        attachments: [
          {
            name: "项目总结报告.pdf",
            url: "https://example.com/report.pdf",
            type: "pdf",
            size: 102400,
          },
        ],
      }),
    },
    chunks: [],
    status: "loading",
    responseHeaders: new Headers(),
  });

  result.value = {
    role: assistant.role,
    content: `${local.content} -> ${assistant.content}`,
    attachments: assistant.attachments,
  };
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-space compact style="width: 100%">
      <a-input
        v-model:value="input"
        placeholder="输入问题，例如：生成一份项目总结报告"
        @press-enter="run"
      />
      <a-button type="primary" @click="run">Run Custom Provider</a-button>
    </a-space>

    <a-card size="small" title="Result">
      <a-empty v-if="!result" description="No result yet" />
      <template v-else>
        <a-typography-paragraph style="margin-bottom: 8px">
          {{ result.content }}
        </a-typography-paragraph>
        <a-list :data-source="result.attachments || []" size="small" bordered>
          <template #renderItem="{ item }">
            <a-list-item>
              <a-space>
                <a-typography-text strong>{{ item.name }}</a-typography-text>
                <a-typography-text type="secondary">{{
                  item.type
                }}</a-typography-text>
                <a-typography-text type="secondary"
                  >{{ item.size }} bytes</a-typography-text
                >
              </a-space>
            </a-list-item>
          </template>
        </a-list>
      </template>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
`AbstractChatProvider` 自定义实现示例：把带附件的响应转换为统一消息格式。
</docs>

<docs lang="en-US">
Custom `AbstractChatProvider` demo converting attachment responses into a unified message format.
</docs>
