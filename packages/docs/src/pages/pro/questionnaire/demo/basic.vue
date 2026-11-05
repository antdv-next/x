<docs lang="zh-CN">
单题聚焦的单选问卷。选择后延迟 240ms 前进，最后一题显式提交；宿主确认后原地显示回执。
</docs>
<docs lang="en-US">
A focused single-choice questionnaire. Selection advances after 240ms; the last question requires explicit submission. The host acknowledges the submission to show a receipt.
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
const result = ref("");
const payload: QuestionnairePayload = {
  id: "project-scope",
  revision: 1,
  title: "Before we get started",
  description: "Help the agent choose the right approach.",
  questions: [
    {
      id: "goal",
      title: "What should we focus on?",
      type: "single",
      options: [
        {
          value: "prototype",
          label: "Explore an idea",
          description: "A working prototype to validate the direction.",
        },
        {
          value: "production",
          label: "Build for production",
          description:
            "A complete implementation with tests and documentation.",
        },
      ],
      allowCustom: true,
    },
    {
      id: "pace",
      title: "How should we proceed?",
      type: "single",
      options: [
        { value: "autonomous", label: "Work independently" },
        { value: "checkpoints", label: "Check in at milestones" },
      ],
    },
  ],
};
function submit(value: QuestionnaireSubmission) {
  // Replace this acknowledgement with your application request.
  status.value = "submitted";
  result.value = `Received ${Object.keys(value.answers).length} answers`;
}
</script>
<template>
  <Questionnaire
    :payload="payload"
    :status="status"
    :result="result"
    allow-revision
    @submit="submit"
    style="max-width: 560px"
  />
</template>
