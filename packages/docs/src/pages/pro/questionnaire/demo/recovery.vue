<docs lang="zh-CN">
首次提交模拟失败，重试复用同一 `submissionId`。`retry` 供埋点使用，实际请求始终放在 `submit`，避免发送两次。
</docs>
<docs lang="en-US">
The first submission fails; retry reuses the same `submissionId`. Use `retry` for telemetry and send requests only from `submit` to avoid duplicate requests.
</docs>
<script setup lang="ts">
import type {
  QuestionnairePayload,
  QuestionnaireStatus,
  QuestionnaireSubmission,
} from "@antdv-next/x-pro";

import { Questionnaire } from "@antdv-next/x-pro";
import { ref } from "vue";

const status = ref<QuestionnaireStatus>("pending");
const attempts = ref(0);
const submissionId = ref("");
const payload: QuestionnairePayload = {
  id: "recovery",
  revision: 1,
  title: "Confirm the environment",
  questions: [
    {
      id: "environment",
      title: "Where should we deploy?",
      type: "single",
      options: [
        { value: "staging", label: "Staging" },
        { value: "production", label: "Production" },
      ],
    },
  ],
};
function submit(value: QuestionnaireSubmission) {
  submissionId.value = value.submissionId;
  attempts.value++;
  status.value = attempts.value === 1 ? "error" : "submitted";
}
</script>
<template>
  <Questionnaire
    :payload="payload"
    :status="status"
    error="Connection interrupted. Your answer is safe; try again."
    @submit="submit"
    style="max-width: 560px"
  />
  <p v-if="submissionId" style="overflow-wrap: anywhere">{{ submissionId }}</p>
</template>
