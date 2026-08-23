<script setup lang="ts">
import type { SenderPasteInfo, SenderProps } from "@antdv-next/x";

import { ref } from "vue";

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

const lastOperation = ref("");

const onCopy: SenderProps["onCopy"] = (_event, info) => {
  lastOperation.value = `copy: ${info.text} | slots: ${info.slotConfig.length}`;
};

const onCut: SenderProps["onCut"] = (_event, info) => {
  lastOperation.value = `cut: ${info.text} | slots: ${info.slotConfig.length}`;
};

const onPaste = (_event: ClipboardEvent, info: SenderPasteInfo) => {
  lastOperation.value = `paste: ${info.text}`;
};

const onSubmit: SenderProps["onSubmit"] = (value, slots, sk) => {
  message.success(
    `提交: ${value} | slots=${slots?.length ?? 0} | skill=${sk?.value ?? "-"}`,
  );
};
</script>

<template>
  <a-flex vertical :gap="12">
    <ax-sender
      :slot-config="slotConfig"
      :skill="skill"
      placeholder="Ctrl+A 复制/剪切，粘贴验证"
      :on-copy="onCopy"
      :on-cut="onCut"
      :on-paste="onPaste"
      :on-submit="onSubmit"
    />
    <a-typography-text type="secondary">
      最近操作：{{ lastOperation || "-" }}
    </a-typography-text>
    <a-typography-text type="secondary">
      回调用于业务接管复杂边界。需要覆盖默认行为时，请调用
      event.preventDefault()，并由业务更新受控状态或写入剪贴板；框架忽略回调返回值。
    </a-typography-text>
  </a-flex>
</template>

<docs lang="zh-CN">
默认仅处理纯文本。`onCopy/onCut/onPaste` 是业务处理复杂剪贴板场景的原生事件逃生口，框架不解释回调返回值。
</docs>

<docs lang="en-US">
The default behavior is plain text only. `onCopy/onCut/onPaste` expose native events for application-owned clipboard edge cases, and the framework ignores callback return values.
</docs>
