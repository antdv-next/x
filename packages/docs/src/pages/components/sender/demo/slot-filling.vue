<script setup lang="ts">
import type { SenderProps, SenderRef } from "@antdv-next/x";

import { App } from "antdv-next";
import { h, ref } from "vue";

type SlotConfig = SenderProps["slotConfig"];

const otherSlotConfig: SlotConfig = [
  { type: "text", value: "I want to travel to " },
  {
    type: "content",
    key: "location",
    props: {
      defaultValue: "Beijing",
      placeholder: "[Please enter the location]",
    },
  },
  { type: "text", value: "by" },
  {
    type: "select",
    key: "transportation",
    props: {
      defaultValue: "airplane",
      options: ["airplane", "high-speed rail", "cruise ship"],
      placeholder: "Please choose a mode of transportation",
    },
  },
  {
    type: "text",
    value: "with a group of 3 people, and each person has a budget of",
  },
  {
    type: "custom",
    key: "priceRange",
    props: {
      defaultValue: [3000, 6000],
    },
    customRender: (value: any, onChange: (value: any) => void, props) => {
      return h(
        "div",
        {
          style: {
            width: "200px",
            paddingInline: "20px",
            display: "inline-block",
            alignItems: "center",
          },
        },
        [
          h("a-slider", {
            ...props,
            max: 8000,
            min: 1000,
            style: { margin: 0 },
            range: true,
            value,
            onChange,
          }),
        ],
      );
    },
    formatResult: (value: any) => {
      return `between ${value[0]} and ${value[1]} RMB.`;
    },
  },
  { type: "text", value: "Please" },
  {
    type: "tag",
    key: "tag",
    props: { label: "@Travel Planner ", value: "travelTool" },
  },
  { type: "text", value: "help me create a travel itinerary,Use account " },
  {
    type: "input",
    key: "account",
    props: {
      placeholder: "Please enter a account",
    },
  },
  { type: "text", value: "." },
];

const altSlotConfig: SlotConfig = [
  { type: "text", value: "My favorite city is " },
  {
    type: "select",
    key: "city",
    props: {
      defaultValue: "London",
      options: ["London", "Paris", "New York"],
      placeholder: "Select a city",
    },
  },
  { type: "text", value: ", and I want to travel with " },
  { type: "input", key: "partner", props: { placeholder: "Enter a name" } },
];

const slotConfig = {
  otherSlotConfig,
  altSlotConfig,
};

const skillConfig = {
  value: "travelId",
  title: "Travel Planner",
  toolTip: {
    title: "Travel Skill",
  },
  closable: {
    onClose: () => {
      console.log("close");
    },
  },
};

const { message } = App.useApp();

const slotConfigKey = ref<keyof typeof slotConfig | false>("otherSlotConfig");
const senderRef = ref<SenderRef>();
const value = ref("");
const skill = ref<SenderProps["skill"]>(skillConfig);
const skillValue = ref("");
const slotValue = ref("");

const onSubmit: SenderProps["onSubmit"] = nextValue => {
  value.value = nextValue;
  slotConfigKey.value = false;
  message.open({
    type: "success",
    content: `Send message success: ${nextValue}`,
  });
  senderRef.value?.clear?.();
};

const onChange: SenderProps["onChange"] = (
  nextValue,
  event,
  nextSlotConfig,
  nextSkill,
) => {
  console.log(nextValue, event, nextSlotConfig, nextSkill);
  if (!nextSkill) {
    skill.value = undefined;
  }
};

const onGetValue = () => {
  const val = senderRef.value?.getValue?.();
  if (val?.skill) {
    skillValue.value = val?.skill?.value;
  }
  value.value = val?.value ? val.value : "No value";
  slotValue.value = val?.slotConfig
    ? JSON.stringify(val.slotConfig)
    : "No value";
};

const toggleSlotConfig = () => {
  slotConfigKey.value =
    slotConfigKey.value === "otherSlotConfig"
      ? "altSlotConfig"
      : "otherSlotConfig";
};

const changeSkill = () => {
  skill.value = {
    value: "travelId_1",
    title: "Travel Planner2",
    toolTip: {
      title: "Travel Skill2",
    },
    closable: {
      onClose: () => {
        console.log("close");
      },
    },
  };
};

const xProviderTheme = {
  components: {
    Sender: {
      fontSize: 16,
    },
  },
};
</script>

<template>
  <a-flex vertical :gap="16">
    <!-- 操作按钮区 -->
    <a-flex wrap :gap="8">
      <a-button @click="senderRef?.clear?.()"> Clear </a-button>
      <a-button @click="onGetValue"> Get Value </a-button>
      <a-button
        @click="senderRef?.insert?.([{ type: 'text', value: ' some text A' }])"
      >
        Insert Text
      </a-button>
      <a-button
        @click="
          senderRef?.insert?.([
            { type: 'text', value: ' some text B' },
            {
              type: 'content',
              key: `partner_3_${Date.now()}`,
              props: { defaultValue: '11' },
            },
          ])
        "
      >
        Insert Slots
      </a-button>
      <a-button
        @click="
          senderRef?.insert?.([
            {
              type: 'content',
              key: `partner_1_${Date.now()}`,
              props: { defaultValue: 'NingNing', placeholder: 'Enter a name' },
            },
          ])
        "
      >
        Insert Slot
      </a-button>
      <a-button
        @click="
          senderRef?.insert?.(
            [
              {
                type: 'input',
                key: `partner_2_${Date.now()}`,
                props: { placeholder: 'Enter a name' },
              },
            ],
            'start',
          )
        "
      >
        Insert Slot Start
      </a-button>
      <a-button
        @click="
          senderRef?.insert?.(
            [
              {
                type: 'input',
                key: `partner_3_${Date.now()}`,
                props: { placeholder: 'Enter a name' },
              },
            ],
            'end',
          )
        "
      >
        Insert Slot End
      </a-button>
      <a-button @click="toggleSlotConfig"> Change SlotConfig </a-button>
      <a-button @click="senderRef?.focus()"> Focus </a-button>
      <a-button @click="senderRef?.focus({ cursor: 'start' })">
        Focus at first
      </a-button>
      <a-button @click="senderRef?.focus({ cursor: 'end' })">
        Focus at last
      </a-button>
      <a-button @click="senderRef?.focus({ cursor: 'slot' })">
        Focus at slot
      </a-button>
      <a-button @click="senderRef?.focus({ cursor: 'slot', key: 'account' })">
        Focus at slot with key
      </a-button>
      <a-button @click="senderRef?.focus({ cursor: 'all' })">
        Focus to select all
      </a-button>
      <a-button @click="senderRef?.focus({ preventScroll: true })">
        Focus prevent scroll
      </a-button>
      <a-button @click="senderRef?.blur()"> Blur </a-button>
      <a-button @click="changeSkill"> Change Skill </a-button>
    </a-flex>

    <!-- Sender 词槽填空示例 -->
    <ax-x-provider :theme="xProviderTheme">
      <ax-sender
        ref="senderRef"
        :skill="skill"
        allow-speech
        :auto-size="{ minRows: 3, maxRows: 4 }"
        placeholder="Enter to send message"
        :slot-config="slotConfigKey ? slotConfig?.[slotConfigKey] : []"
        :on-submit="onSubmit"
        :on-change="onChange"
      />
    </ax-x-provider>

    <a-flex vertical gap="middle">
      <div>{{ skillValue ? `skill:${skillValue}` : null }}</div>
      <div>{{ value ? `value:${value}` : null }}</div>
      <div>{{ slotValue ? `slotValue:${slotValue}` : null }}</div>
    </a-flex>
  </a-flex>
</template>

<docs lang="zh-CN">
在输入中提供词槽及下拉选择，提升用户输入效率及准确性。
</docs>

<docs lang="en-US">
Provide slots and dropdown selections in the input to improve user input efficiency and accuracy.
</docs>
