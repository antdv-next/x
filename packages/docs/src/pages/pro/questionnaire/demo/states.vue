<docs lang="zh-CN">
服务端已提交、过期及取消状态直接重放为只读回执，保留未回答题目的可见状态。
</docs>
<docs lang="en-US">
Replay submitted, expired and cancelled questionnaires as read-only receipts, including unanswered questions.
</docs>
<script setup lang="ts">
import type {
  QuestionnairePayload,
  QuestionnaireStatus,
} from "@antdv-next/x-pro";

import { Questionnaire } from "@antdv-next/x-pro";

const statuses: QuestionnaireStatus[] = ["submitted", "expired", "cancelled"];
const payload: QuestionnairePayload = {
  id: "history",
  revision: 1,
  title: "Release preferences",
  questions: [
    {
      id: "channel",
      title: "Release channel",
      type: "single",
      options: [
        { value: "stable", label: "Stable" },
        { value: "beta", label: "Beta" },
      ],
    },
    { id: "notes", title: "Release notes", type: "single", allowCustom: true },
  ],
};
</script>
<template>
  <div style="display: grid; gap: 16px; max-width: 560px">
    <Questionnaire
      v-for="status in statuses"
      :key="status"
      :payload="payload"
      :status="status"
      :answers="{ channel: { selected: ['stable'] } }"
    />
  </div>
</template>
