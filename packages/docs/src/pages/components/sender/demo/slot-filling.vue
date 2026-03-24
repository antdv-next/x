<script setup lang="ts">
// TODO: 待实现 SlotTextArea 组件后完善
// 当前为占位 demo，需要 slotConfig 支持词槽填空功能
// React 版支持: text, select, content, custom, input, tag 六种 slot 类型
import { Sender } from "@antdv-next/x";
import { Button, Flex, message } from "antdv-next";
import { ref } from "vue";

const senderRef = ref<InstanceType<typeof Sender>>();
const value = ref("");

// TODO: slotConfig 需要 SlotTextArea 组件
// const slotConfig = [
//   { type: 'text', value: '我想去' },
//   {
//     type: 'content',
//     key: 'location',
//     props: { defaultValue: '北京', placeholder: '[请输入地点]' },
//   },
//   { type: 'text', value: '旅行，乘坐' },
//   {
//     type: 'select',
//     key: 'transportation',
//     props: {
//       defaultValue: '飞机',
//       options: ['飞机', '高铁', '邮轮'],
//       placeholder: '请选择交通方式',
//     },
//   },
//   { type: 'text', value: '，共3人，每人预算' },
//   {
//     type: 'input',
//     key: 'budget',
//     props: { placeholder: '请输入预算' },
//   },
//   { type: 'text', value: '元。' },
// ];

const onSubmit = (v: string) => {
  value.value = v;
  message.success(`发送成功: ${v}`);
  senderRef.value?.clear();
};
</script>

<template>
  <Flex vertical :gap="16">
    <Flex wrap :gap="8">
      <Button @click="senderRef?.clear()">Clear</Button>
      <Button @click="senderRef?.focus()">Focus</Button>
      <Button @click="senderRef?.blur()">Blur</Button>
      <Button @click="senderRef?.insert('插入文本 ', 'cursor')">
        Insert Text
      </Button>
    </Flex>
    <!-- TODO: 添加 :slot-config="slotConfig" :skill="skill" -->
    <Sender
      ref="senderRef"
      allow-speech
      :auto-size="{ minRows: 3, maxRows: 4 }"
      placeholder="按 Enter 发送消息（词槽填空功能待 SlotTextArea 实现后启用）"
      :on-submit="onSubmit"
    />
    <div v-if="value">value: {{ value }}</div>
  </Flex>
</template>
