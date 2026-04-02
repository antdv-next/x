<script setup lang="ts">
import type { SenderProps } from "@antdv-next/x";

import { Sender } from "@antdv-next/x";
import { Button, Flex, message } from "antdv-next";
import { ref } from "vue";

const senderRef = ref<InstanceType<typeof Sender>>();
const value = ref("");
const slotValue = ref("");
const skillValue = ref("");

const slotConfigMap = {
  travel: [
    { type: "text", value: "I want to travel to " },
    {
      type: "content",
      key: "location",
      props: {
        defaultValue: "Beijing",
        placeholder: "[Please enter location]",
      },
    },
    { type: "text", value: " by " },
    {
      type: "select",
      key: "transportation",
      props: {
        defaultValue: "airplane",
        options: ["airplane", "high-speed rail", "ship"],
        placeholder: "Please choose a mode of transportation",
      },
    },
    { type: "text", value: " and budget is " },
    {
      type: "input",
      key: "budget",
      props: { placeholder: "Please enter budget" },
    },
    { type: "text", value: ". " },
    {
      type: "tag",
      key: "assistant",
      props: { label: "@Travel Planner", value: "travel" },
    },
  ] as NonNullable<SenderProps["slotConfig"]>,
  meeting: [
    { type: "text", value: "Please schedule a meeting with " },
    {
      type: "input",
      key: "person",
      props: { placeholder: "name" },
    },
    { type: "text", value: " at " },
    {
      type: "content",
      key: "time",
      props: { defaultValue: "10:00", placeholder: "time" },
    },
    { type: "text", value: "." },
  ] as NonNullable<SenderProps["slotConfig"]>,
};

const slotConfigKey = ref<keyof typeof slotConfigMap>("travel");
const skill = ref<SenderProps["skill"]>({
  value: "travel_skill",
  title: "Travel Planner",
  toolTip: { title: "Travel Skill" },
  closable: true,
});

const onSubmit: SenderProps["onSubmit"] = (
  nextValue,
  nextSlotConfig,
  nextSkill,
) => {
  value.value = nextValue;
  slotValue.value = JSON.stringify(nextSlotConfig ?? []);
  skillValue.value = nextSkill?.value ?? "";
  message.success(`Send message success: ${nextValue}`);
  senderRef.value?.clear();
};

const onGetValue = () => {
  const val = senderRef.value?.getValue();
  value.value = val?.value ?? "";
  slotValue.value = JSON.stringify(val?.slotConfig ?? []);
  skillValue.value = val?.skill?.value ?? "";
};

const toggleSlotConfig = () => {
  slotConfigKey.value = slotConfigKey.value === "travel" ? "meeting" : "travel";
};

const toggleSkill = () => {
  skill.value =
    skill.value?.value === "travel_skill"
      ? {
          value: "meeting_skill",
          title: "Meeting Planner",
          toolTip: { title: "Meeting Skill" },
          closable: true,
        }
      : {
          value: "travel_skill",
          title: "Travel Planner",
          toolTip: { title: "Travel Skill" },
          closable: true,
        };
};
</script>

<template>
  <Flex vertical :gap="16">
    <Flex wrap :gap="8">
      <Button @click="senderRef?.clear()"> Clear </Button>
      <Button @click="onGetValue"> Get Value </Button>
      <Button @click="senderRef?.insert(' some text ', 'cursor')">
        Insert Text
      </Button>
      <Button
        @click="
          senderRef?.insert([
            {
              type: 'input',
              key: `name_${Date.now()}`,
              props: { placeholder: 'Enter a name' },
            },
          ])
        "
      >
        Insert Slot
      </Button>
      <Button @click="toggleSlotConfig"> Change SlotConfig </Button>
      <Button @click="senderRef?.focus()"> Focus </Button>
      <Button @click="senderRef?.focus({ cursor: 'start' })">
        Focus Start
      </Button>
      <Button @click="senderRef?.focus({ cursor: 'end' })"> Focus End </Button>
      <Button @click="senderRef?.focus({ cursor: 'slot' })">
        Focus Slot
      </Button>
      <Button @click="senderRef?.focus({ cursor: 'slot', key: 'budget' })">
        Focus Slot By Key
      </Button>
      <Button @click="toggleSkill"> Change Skill </Button>
    </Flex>

    <Sender
      ref="senderRef"
      :slot-config="slotConfigMap[slotConfigKey]"
      :skill="skill"
      :auto-size="{ minRows: 3, maxRows: 4 }"
      placeholder="Enter to send message"
      :on-submit="onSubmit"
    />

    <Flex vertical gap="small">
      <div v-if="value">value: {{ value }}</div>
      <div v-if="slotValue">slotConfig: {{ slotValue }}</div>
      <div v-if="skillValue">skill: {{ skillValue }}</div>
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
在输入中提供词槽及下拉选择，提升用户输入效率及准确性。
</docs>

<docs lang="en-US">
Provide slots and dropdown selections in the input to improve user input efficiency and accuracy.
</docs>
