<script setup lang="ts">
import { XRequest } from "@antdv-next/x-sdk";
import { ref } from "vue";

const userInput = ref("How are you?");
const responseText = ref("");
const requesting = ref(false);

const request = XRequest<
  { message: string; scene: string },
  { success: boolean; text: string; headers: Record<string, string> }
>("/api/mock/json", {
  manual: true,
  headers: {
    Authorization: "Bearer demo-token",
    "X-Demo-Source": "docs",
  },
  params: {
    scene: "sdk-docs",
  },
  fetch: async (_baseURL, options) => {
    const params = (options.params ?? {}) as Record<string, string>;
    const headers = (options.headers ?? {}) as Record<string, string>;

    return new Response(
      JSON.stringify({
        success: true,
        text: `echo: ${params.message}`,
        headers: {
          authorization: headers.Authorization,
          source: headers["X-Demo-Source"],
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  },
  callbacks: {
    onUpdate(chunk) {
      responseText.value = `${chunk.text}
headers -> ${JSON.stringify(chunk.headers)}`;
    },
    onSuccess() {
      requesting.value = false;
    },
    onError(error) {
      requesting.value = false;
      responseText.value = `error: ${error.message}`;
    },
  },
});

function run() {
  requesting.value = true;
  request.run({
    message: userInput.value,
    scene: "sdk-docs",
  });
}
</script>

<template>
  <a-space direction="vertical" style="width: 100%" :size="12">
    <a-input
      v-model:value="userInput"
      :disabled="requesting"
      placeholder="Input message"
    />
    <a-button type="primary" :loading="requesting" @click="run">
      Send Request
    </a-button>
    <a-card size="small" title="Response">
      <pre style="margin: 0; white-space: pre-wrap">{{
        responseText || "-"
      }}</pre>
    </a-card>
  </a-space>
</template>

<docs lang="zh-CN">
展示 `params`、`headers` 以及 `application/json` 响应处理。
</docs>

<docs lang="en-US">
Demonstrates `params`, `headers`, and `application/json` response handling.
</docs>
