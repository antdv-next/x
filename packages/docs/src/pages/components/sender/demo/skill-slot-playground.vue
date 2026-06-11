<script setup lang="ts">
import type { SenderProps, SlotConfigType } from "@antdv-next/x";
import type { MenuProps } from "antdv-next";

import { CodeOutlined, EditOutlined, SearchOutlined } from "@antdv-next/icons";
import { App, Flex } from "antdv-next";
import { nextTick, ref } from "vue";

const { message } = App.useApp();

// Skill definitions
const skillMap: Record<
  string,
  { icon: any; label: string; slotConfig: SlotConfigType[] }
> = {
  deep_search: {
    icon: SearchOutlined,
    label: "Deep Search",
    slotConfig: [
      { type: "text", value: "Search for " },
      {
        type: "content",
        key: "query",
        props: {
          defaultValue: "",
          placeholder: "[Enter search query]",
        },
      },
      { type: "text", value: " using " },
      {
        type: "select",
        key: "engine",
        props: {
          defaultValue: "google",
          options: ["google", "bing", "duckduckgo"],
          placeholder: "Choose search engine",
        },
      },
    ],
  },
  ai_code: {
    icon: CodeOutlined,
    label: "AI Code",
    slotConfig: [
      { type: "text", value: "Generate code for " },
      {
        type: "content",
        key: "description",
        props: {
          defaultValue: "",
          placeholder: "[Describe what code to generate]",
        },
      },
      { type: "text", value: " in " },
      {
        type: "select",
        key: "language",
        props: {
          defaultValue: "typescript",
          options: ["typescript", "javascript", "python", "rust"],
          placeholder: "Choose language",
        },
      },
    ],
  },
  ai_writing: {
    icon: EditOutlined,
    label: "AI Writing",
    slotConfig: [
      { type: "text", value: "Write a " },
      {
        type: "select",
        key: "type",
        props: {
          defaultValue: "report",
          options: ["report", "email", "article", "summary"],
          placeholder: "Choose content type",
        },
      },
      { type: "text", value: " about " },
      {
        type: "content",
        key: "topic",
        props: {
          defaultValue: "",
          placeholder: "[Enter topic]",
        },
      },
    ],
  },
};

// State
const senderRef = ref();
const value = ref("");
const slotConfig = ref<SlotConfigType[] | undefined>(undefined);
const skill = ref<SenderProps["skill"]>(undefined);
const suggestions = Object.entries(skillMap).map(([key, { label }]) => ({
  label,
  value: key,
}));

// Show suggestion dropdown control
const showSuggestion = ref(false);
const suggestionFilter = ref("");

// Filtered suggestions
const filteredSuggestions = computed(() => {
  if (!suggestionFilter.value) return suggestions;
  return suggestions.filter(s =>
    s.label.toLowerCase().includes(suggestionFilter.value.toLowerCase()),
  );
});

// Handle @ trigger
const onSenderKeyDown = (event: KeyboardEvent) => {
  if (event.key === "@") {
    showSuggestion.value = true;
    suggestionFilter.value = "";
    return;
  }

  // Close suggestion on Escape
  if (event.key === "Escape" && showSuggestion.value) {
    showSuggestion.value = false;
    return;
  }

  // Handle suggestion navigation
  if (showSuggestion.value) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      // TODO: implement keyboard navigation
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (filteredSuggestions.value.length > 0) {
        selectSkill(filteredSuggestions.value[0].value);
      }
      return;
    }
  }
};

// Select a skill from suggestions
const selectSkill = (skillKey: string) => {
  const skillDef = skillMap[skillKey];
  if (!skillDef) return;

  // Set skill and slot config
  skill.value = {
    value: skillKey,
    title: skillDef.label,
    toolTip: { title: `${skillDef.label} Skill` },
    closable: true,
  };
  slotConfig.value = skillDef.slotConfig;

  // Close suggestion
  showSuggestion.value = false;
  suggestionFilter.value = "";

  // Clear the "@" character and insert slot config
  // Uses replaceCharacters parameter to automatically remove "@" at cursor position
  nextTick(() => {
    senderRef.value?.insert(skillDef.slotConfig, "cursor", "@");
  });

  message.info(`Selected skill: ${skillDef.label}`);
};

// Handle value change
const onChange: SenderProps["onChange"] = (
  nextValue,
  _event,
  nextSlotConfig,
  nextSkill,
) => {
  value.value = nextValue;

  // Check if user typed "@" to trigger suggestion
  if (nextValue.endsWith("@") && !showSuggestion.value) {
    showSuggestion.value = true;
    suggestionFilter.value = "";
  }
};

// Handle submit
const onSubmit: SenderProps["onSubmit"] = (
  nextValue,
  nextSlotConfig,
  nextSkill,
) => {
  message.success(`Submitted: ${nextValue}`);
  console.log("Value:", nextValue);
  console.log("SlotConfig:", nextSlotConfig);
  console.log("Skill:", nextSkill);

  // Clear after submit
  senderRef.value?.clear();
  value.value = "";
  slotConfig.value = undefined;
  skill.value = undefined;
};

// Clear all
const onClear = () => {
  senderRef.value?.clear();
  value.value = "";
  slotConfig.value = undefined;
  skill.value = undefined;
};

// Insert text at cursor
const insertText = (text: string) => {
  senderRef.value?.insert(text, "cursor");
};

// Insert a custom slot
const insertSlot = () => {
  senderRef.value?.insert(
    [
      {
        type: "input",
        key: `custom_${Date.now()}`,
        props: { placeholder: "[Custom input]" },
      },
    ],
    "cursor",
  );
};
</script>

<template>
  <Flex vertical :gap="16">
    {/* Action buttons */}
    <Flex wrap :gap="8">
      <button class="ant-btn ant-btn-default" @click="onClear">
        Clear All
      </button>
      <button class="ant-btn ant-btn-default" @click="insertText(' Hello ')">
        Insert Text
      </button>
      <button class="ant-btn ant-btn-default" @click="insertSlot">
        Insert Slot
      </button>
      <button class="ant-btn ant-btn-default" @click="senderRef?.focus()">
        Focus
      </button>
      <button
        class="ant-btn ant-btn-default"
        @click="showSuggestion = !showSuggestion"
      >
        Toggle Suggestion
      </button>
    </Flex>

    {/* Suggestion dropdown */}
    <div
      v-if="showSuggestion"
      class="suggestion-dropdown"
      style="
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 8px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      "
    >
      <div
        style="
          padding: 4px 8px;
          color: #999;
          font-size: 12px;
          border-bottom: 1px solid #f0f0f0;
          margin-bottom: 4px;
        "
      >
        Select a skill (@ to trigger)
      </div>
      <div
        v-for="item in filteredSuggestions"
        :key="item.value"
        class="suggestion-item"
        style="
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        "
        @click="selectSkill(item.value)"
        @mouseenter="
          ($event.target as HTMLElement).style.background = '#f5f5f5'
        "
        @mouseleave="
          ($event.target as HTMLElement).style.background = 'transparent'
        "
      >
        <component :is="skillMap[item.value]?.icon" />
        <span>{{ item.label }}</span>
      </div>
      <div
        v-if="filteredSuggestions.length === 0"
        style="padding: 8px 12px; color: #999"
      >
        No matching skills
      </div>
    </div>

    {/* Sender component */}
    <ax-sender
      ref="senderRef"
      :value="value"
      :slot-config="slotConfig"
      :skill="skill"
      :auto-size="{ minRows: 3, maxRows: 6 }"
      placeholder="Type @ to trigger skill suggestion, or just type..."
      :on-change="onChange"
      :on-key-down="onSenderKeyDown"
      :on-submit="onSubmit"
    />

    {/* Debug info */}
    <Flex
      vertical
      gap="small"
      style="font-size: 12px; color: #666; font-family: monospace"
    >
      <div>Value: {{ value || "(empty)" }}</div>
      <div>
        SlotConfig:
        {{ slotConfig ? JSON.stringify(slotConfig, null, 2) : "(none)" }}
      </div>
      <div>Skill: {{ skill?.value || "(none)" }}</div>
      <div>Show Suggestion: {{ showSuggestion }}</div>
    </Flex>
  </Flex>
</template>

<docs lang="zh-CN">
Skill 词槽模式 Playground：输入 `@` 触发技能选择，选择后自动清除 `@` 并插入对应的词槽配置。

**功能演示：**
1. 输入 `@` 触发技能选择下拉框
2. 选择技能后自动清除 `@` 并设置对应的 slotConfig
3. 支持键盘导航（Enter 选择，Escape 关闭）
4. 可以手动插入文本和词槽
5. 提交时获取完整的值、slotConfig 和 skill 信息

**当前实现说明：**
- 使用 `value` 手动移除 `@` 作为临时方案
- 待 Sender 暴露 `replaceCharacters` 参数后可简化为：
  `senderRef.value?.insert(slotConfig, "cursor", "@")`
</docs>

<docs lang="en-US">
Skill Slot Mode Playground: Type `@` to trigger skill selection, which automatically clears `@` and inserts the corresponding slot configuration.

**Feature Demo:**
1. Type `@` to trigger skill selection dropdown
2. Select a skill to auto-clear `@` and set the corresponding slotConfig
3. Supports keyboard navigation (Enter to select, Escape to close)
4. Can manually insert text and slots
5. Get complete value, slotConfig and skill info on submit

**Current Implementation Notes:**
- Uses manual `value` manipulation to remove `@` as a workaround
- Once Sender exposes `replaceCharacters` parameter, can simplify to:
  `senderRef.value?.insert(slotConfig, "cursor", "@")`
</docs>
