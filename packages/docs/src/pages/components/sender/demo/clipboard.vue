<script setup lang="ts">
import type { SenderPasteInfo, SenderProps } from "@antdv-next/x";

import { App } from "antdv-next";
import { ref } from "vue";

const { message } = App.useApp();

const slotConfig: SenderProps["slotConfig"] = [
  { type: "text", value: "请帮我规划去 " },
  {
    type: "select",
    key: "city",
    props: {
      defaultValue: "北京",
      options: ["北京", "上海", "成都"],
      placeholder: "请选择城市",
    },
  },
  { type: "text", value: " 的行程，预算 " },
  { type: "input", key: "budget", props: { placeholder: "输入预算" } },
  { type: "text", value: " 元。" },
  { type: "tag", key: "tag", props: { label: "@行程助手", value: "planner" } },
];

const skill: SenderProps["skill"] = {
  value: "planner",
  title: "行程助手",
};

const withStructured = ref(false);
const lastPaste = ref("");

const onCopy: SenderProps["onCopy"] = (_e, info) => {
  if (!withStructured.value) return;
  // 按需返回结构化：框架才会写入自定义 MIME，粘贴时才能还原 slots/skill
  return { slotConfig: info.slotConfig, skill: info.skill };
};

const onCut = onCopy;

const onPaste = (_e: ClipboardEvent, info: SenderPasteInfo) => {
  lastPaste.value = `text: ${info.text} | slots: ${info.slotConfig.length} | skill: ${info.skill?.value ?? "-"}`;
  if (!withStructured.value) return;
  // 按需还原：返回结构才会以 slots 形式插入，否则仅插 text
  if (info.slotConfig.length || info.skill) {
    message.info(`结构化粘贴: ${info.text}`);
    return { slotConfig: info.slotConfig, skill: info.skill };
  }
};

const onSubmit: SenderProps["onSubmit"] = (value, slots, sk) => {
  message.success(
    `提交: ${value} | slots=${slots?.length ?? 0} | skill=${sk?.value ?? "-"}`,
  );
};
</script>

<template>
  <a-flex vertical :gap="12">
    <a-flex :gap="8" align="center">
      <a-switch v-model:checked="withStructured" />
      <span>按需结构化复制/粘贴（关闭时仅拼 value 字符串）</span>
    </a-flex>
    <ax-sender
      :slot-config="slotConfig"
      :skill="skill"
      placeholder="Ctrl+A 复制/剪切，粘贴验证"
      :on-copy="onCopy"
      :on-cut="onCut"
      :on-paste="onPaste"
      :on-submit="onSubmit"
    />
    <a-typography-text type="secondary"
      >最近粘贴：{{ lastPaste || "-" }}</a-typography-text
    >
    <a-typography-text type="secondary">
      默认行为：复制/粘贴仅处理 text/value 字符串；需保留 tag/select/skill
      时，在 onCopy/onCut 返回
      {{ "{ slotConfig, skill }" }}，在 onPaste 返回同结构即可还原。
    </a-typography-text>
  </a-flex>
</template>

<docs lang="zh-CN">
默认仅拼 `value` 字符串，结构化复制/粘贴按需通过 `onCopy/onCut/onPaste` 返回 `{ slotConfig, skill }` 实现。
</docs>

<docs lang="en-US">
Default copies/pastes plain `value` string; opt into structured slots/skill via `onCopy/onCut/onPaste` returning `{ slotConfig, skill }`.
</docs>
