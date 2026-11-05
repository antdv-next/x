<docs lang="zh-CN">
多选题的自定义答案与选项共存，并计为一项。可跳过的纯输入题用 `required: false` 表达。配置 `draftKey` 可在刷新后恢复草稿。
</docs>
<docs lang="en-US">
Custom text coexists with multiple selections and counts as one choice. Use `required: false` for optional text-only questions. A `draftKey` restores answers after refresh.
</docs>
<script setup lang="ts">
import type {
  QuestionnaireAnswers,
  QuestionnairePayload,
  QuestionnaireStatus,
} from "@antdv-next/x-pro";

import { Questionnaire } from "@antdv-next/x-pro";
import { ref } from "vue";

const answers = ref<QuestionnaireAnswers>({});
const step = ref(0);
const status = ref<QuestionnaireStatus>("pending");
const payload: QuestionnairePayload = {
  id: "deliverables",
  revision: 1,
  title: "Choose your deliverables",
  allowSkip: true,
  questions: [
    {
      id: "deliverables",
      title: "What do you need?",
      type: "multiple",
      minSelections: 1,
      maxSelections: 3,
      allowCustom: true,
      options: [
        { value: "code", label: "Implementation" },
        { value: "tests", label: "Tests" },
        { value: "docs", label: "Documentation" },
        { value: "demo", label: "Live demo" },
      ],
    },
    {
      id: "notes",
      title: "Any constraints?",
      type: "single",
      allowCustom: true,
      required: false,
      customLabel: "Additional context",
      customMaxLength: 200,
    },
  ],
};
</script>
<template>
  <Questionnaire
    v-model:answers="answers"
    v-model:step="step"
    :payload="payload"
    :status="status"
    draft-key="x-pro-questionnaire-deliverables"
    @submit="status = 'submitted'"
    @skip="status = 'cancelled'"
    style="max-width: 560px"
  />
</template>
