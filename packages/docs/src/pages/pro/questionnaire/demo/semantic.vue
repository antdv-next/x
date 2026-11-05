<docs lang="zh-CN">
通过 `classes` 和 `styles` 自定义题目、选项、进度和回执。`classes` 支持对象与函数，函数可读取当前实例的 props。
</docs>

<docs lang="en-US">
Customize questions, options, progress and receipts with `classes` and `styles`. Classes accept an object or a function that reads the instance props.
</docs>

<script setup lang="ts">
import type {
  QuestionnairePayload,
  QuestionnaireProps,
} from "@antdv-next/x-pro";

import { Questionnaire } from "@antdv-next/x-pro";

const payload: QuestionnairePayload = {
  id: "semantic-styling",
  revision: 1,
  title: "Plan the handoff",
  questions: [
    {
      id: "deliverables",
      title: "What should we deliver?",
      type: "multiple",
      options: [
        {
          value: "implementation",
          label: "Implementation",
          description: "Working code with the agreed scope.",
        },
        {
          value: "guide",
          label: "Integration guide",
          description: "Examples to help your team get started.",
        },
      ],
    },
  ],
};
const answers = { deliverables: { selected: ["implementation"] } };
const classes: QuestionnaireProps["classes"] = ({ props }) => ({
  root:
    props.status === "submitted"
      ? "demo-questionnaire-receipt"
      : "demo-questionnaire-panel",
  option: "demo-questionnaire-option",
});
const styles: QuestionnaireProps["styles"] = {
  root: { borderRadius: "16px" },
  header: {
    paddingBlockEnd: "8px",
    borderBlockEnd: "1px dashed var(--ant-color-border-secondary)",
  },
  progress: { color: "var(--ant-color-primary)" },
  option: { borderRadius: "12px" },
  chip: { borderRadius: "12px", paddingInline: "10px" },
};
</script>

<template>
  <div class="questionnaire-semantic-demo">
    <Questionnaire
      :payload="payload"
      :answers="answers"
      :classes="classes"
      :styles="styles"
    />
    <Questionnaire
      :payload="{ ...payload, id: 'semantic-styling-receipt' }"
      :answers="answers"
      status="submitted"
      :classes="classes"
      :styles="styles"
    />
  </div>
</template>

<style scoped>
.questionnaire-semantic-demo {
  display: grid;
  gap: 16px;
  max-width: 560px;
}

:deep(.demo-questionnaire-panel) {
  background: var(--ant-color-fill-quaternary);
}

:deep(.demo-questionnaire-receipt) {
  border-style: dashed;
}

:deep(.demo-questionnaire-option) {
  border-style: dashed;
}
</style>
