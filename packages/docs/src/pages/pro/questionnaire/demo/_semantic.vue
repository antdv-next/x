<script setup lang="ts">
import type {
  QuestionnairePayload,
  QuestionnaireSemanticName,
} from "@antdv-next/x-pro";

import { Questionnaire, XProProvider, enUS, zhCN } from "@antdv-next/x-pro";
import { computed } from "vue";

import { SemanticPreview } from "@/components/semantic";
import { useLocale } from "@/composables/use-locale";

const locales = {
  "zh-CN": {
    root: "组件根元素，承载主题样式、方向与生命周期状态。",
    header: "问卷头部，包含图标、标题、进度和可选的关闭按钮。",
    title: "问卷标题，优先使用 payload.title。",
    progress: "题号、进度圆点与读屏播报，仅在作答时显示。",
    content: "可折叠的交互区，包含当前题目、错误信息和底部操作。",
    question: "当前题目，包含标题、必答标记、选项和自定义输入。",
    description: "问卷或题目的补充说明，以及多选数量约束。",
    options: "选项列表，单选为 radiogroup，多选为 group。",
    option: "单个选项行，包含原生选择控件、文案与可选说明。",
    custom: "自定义答案区域，包含标签、输入框与字数提示。",
    error: "提交失败或校验错误，使用 role=alert 播报。",
    footer: "上一题、下一题、跳过、提交和重试等操作。",
    receipt: "提交、过期或取消后的只读回执，使用 role=status。",
    chip: "回执中的已选答案或自定义文本标签。",
    titleText: "发布前确认",
    questionText: "这次发布需要哪些交付物？",
    questionDescription: "选择需要 Agent 准备的内容，也可以补充其他要求。",
    optionCode: "功能实现",
    optionCodeDescription: "完成核心功能并通过代码检查。",
    optionDocs: "使用文档",
    failure: "提交失败，答案已保留，请重试。",
    receiptTitle: "已确认的交付物",
  },
  "en-US": {
    root: "Root element carrying themed styles, direction and lifecycle state.",
    header:
      "Questionnaire header with icon, title, progress and optional dismiss action.",
    title: "Questionnaire title, taking precedence from payload.title.",
    progress:
      "Step counter, progress dots and screen-reader announcement while answering.",
    content:
      "Collapsible interaction area containing the current question, errors and actions.",
    question:
      "Current question with title, required marker, options and custom input.",
    description:
      "Questionnaire or question description, including selection limits.",
    options:
      "Options container: radiogroup for single choice and group for multiple choice.",
    option:
      "Option row containing a native control, label and optional description.",
    custom: "Custom answer area with label, input and character count.",
    error: "Submission or validation error announced with role=alert.",
    footer: "Previous, next, skip, submit and retry actions.",
    receipt:
      "Read-only submitted, expired or cancelled receipt with role=status.",
    chip: "Selected answer or custom text chip inside the receipt.",
    titleText: "Before the release",
    questionText: "Which deliverables do you need?",
    questionDescription:
      "Choose what the agent should prepare, or add your own requirements.",
    optionCode: "Implementation",
    optionCodeDescription: "Complete the core feature and pass code checks.",
    optionDocs: "Documentation",
    failure: "Submission failed. Your answers are preserved; please retry.",
    receiptTitle: "Confirmed deliverables",
  },
};

const { locale } = useLocale();
const texts = computed(
  () => locales[locale.value === "zh-CN" ? "zh-CN" : "en-US"],
);
const semanticNames: QuestionnaireSemanticName[] = [
  "root",
  "header",
  "title",
  "progress",
  "content",
  "question",
  "description",
  "options",
  "option",
  "custom",
  "error",
  "footer",
  "receipt",
  "chip",
];
const semantics = computed(() =>
  semanticNames.map(name => ({
    name,
    desc: texts.value[name],
    version: "0.1.0",
  })),
);
const componentLocale = computed(() =>
  locale.value === "zh-CN" ? zhCN : enUS,
);
const payload = computed<QuestionnairePayload>(() => ({
  id: "semantic-questionnaire",
  revision: 1,
  title: texts.value.titleText,
  questions: [
    {
      id: "deliverables",
      title: texts.value.questionText,
      description: texts.value.questionDescription,
      type: "multiple",
      maxSelections: 3,
      allowCustom: true,
      options: [
        {
          value: "code",
          label: texts.value.optionCode,
          description: texts.value.optionCodeDescription,
        },
        { value: "docs", label: texts.value.optionDocs },
      ],
    },
  ],
}));
const answers = { deliverables: { selected: ["code", "docs"] } };
</script>

<template>
  <SemanticPreview component-name="Questionnaire" :semantics="semantics">
    <template #default="{ classes }">
      <XProProvider :locale="componentLocale">
        <div class="questionnaire-semantic-states">
          <Questionnaire
            :payload="payload"
            :answers="answers"
            status="error"
            :error="texts.failure"
            :classes="classes"
          />
          <Questionnaire
            :payload="{
              ...payload,
              id: 'semantic-receipt',
              title: texts.receiptTitle,
            }"
            :answers="answers"
            status="submitted"
            :classes="classes"
          />
        </div>
      </XProProvider>
    </template>
  </SemanticPreview>
</template>

<style scoped>
.questionnaire-semantic-states {
  display: grid;
  gap: 24px;
  width: 100%;
  max-width: 460px;
}
</style>
