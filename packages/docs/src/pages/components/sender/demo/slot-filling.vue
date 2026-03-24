<script setup lang="ts">
// TODO: 待实现 SlotTextArea 组件后完善以下功能:
// - slotConfig 词槽填空 (text/select/content/custom/input/tag)
// - skill 技能标签
// - insert slot (插入词槽)
// - focus({ cursor: 'slot' }) (聚焦到词槽)
// - getValue() 返回 slotConfig 和 skill
import { Sender } from "@antdv-next/x";
import { Button, Flex, message } from "antdv-next";
import { ref } from "vue";

const senderRef = ref<InstanceType<typeof Sender>>();
const value = ref("");
const getValueResult = ref("");

// TODO: slotConfig 需要 SlotTextArea 组件
// const slotConfig = [
//   { type: 'text', value: 'I want to travel to ' },
//   { type: 'content', key: 'location', props: { defaultValue: 'Beijing', placeholder: '[Please enter the location]' } },
//   { type: 'text', value: 'by' },
//   { type: 'select', key: 'transportation', props: { defaultValue: 'airplane', options: ['airplane', 'high-speed rail', 'cruise ship'], placeholder: 'Please choose a mode of transportation' } },
//   { type: 'text', value: 'with a group of 3 people, and each person has a budget of' },
//   { type: 'input', key: 'budget', props: { placeholder: 'Please enter a budget' } },
//   { type: 'text', value: '.' },
// ];

const onSubmit = (v: string) => {
  value.value = v;
  message.success(`Send message success: ${v}`);
  senderRef.value?.clear();
};
</script>

<template>
  <Flex vertical :gap="16">
    <Flex wrap :gap="8">
      <Button @click="senderRef?.clear()"> Clear </Button>
      <Button
        @click="
          () => {
            const val = senderRef?.getValue();
            getValueResult = val?.value ?? 'No value';
          }
        "
      >
        Get Value
      </Button>
      <Button @click="senderRef?.insert('some text A ', 'cursor')">
        Insert Text
      </Button>
      <!-- TODO: 以下按钮需要 SlotTextArea 支持 -->
      <!-- <Button @click="senderRef?.insert([{type:'content', key:'p_1', props:{defaultValue:'11'}}])">Insert Slot</Button> -->
      <!-- <Button @click="senderRef?.insert([{type:'input', key:'p_2', props:{placeholder:'Enter a name'}}], 'start')">Insert Slot Start</Button> -->
      <!-- <Button @click="senderRef?.insert([{type:'input', key:'p_3', props:{placeholder:'Enter a name'}}], 'end')">Insert Slot End</Button> -->
      <!-- <Button @click="changeSlotConfig">Change SlotConfig</Button> -->
      <Button @click="senderRef?.focus()"> Focus </Button>
      <Button @click="senderRef?.focus({ cursor: 'start' })">
        Focus at first
      </Button>
      <Button @click="senderRef?.focus({ cursor: 'end' })">
        Focus at last
      </Button>
      <!-- TODO: 需要 SlotTextArea -->
      <!-- <Button @click="senderRef?.focus({ cursor: 'slot' })">Focus at slot</Button> -->
      <!-- <Button @click="senderRef?.focus({ cursor: 'slot', key: 'account' })">Focus at slot with key</Button> -->
      <Button @click="senderRef?.focus({ cursor: 'all' })">
        Focus to select all
      </Button>
      <Button @click="senderRef?.focus({ preventScroll: true })">
        Focus prevent scroll
      </Button>
      <Button @click="senderRef?.blur()"> Blur </Button>
      <!-- TODO: 需要 skill 支持 -->
      <!-- <Button @click="changeSkill">Change Skill</Button> -->
    </Flex>
    <!-- TODO: 添加 :slot-config="slotConfig" :skill="skill" -->
    <Sender
      ref="senderRef"
      allow-speech
      :auto-size="{ minRows: 3, maxRows: 4 }"
      placeholder="Enter to send message"
      :on-submit="onSubmit"
    />
    <Flex vertical gap="middle">
      <div v-if="getValueResult">value: {{ getValueResult }}</div>
      <div v-if="value">submitted: {{ value }}</div>
    </Flex>
  </Flex>
</template>
