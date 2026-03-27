<script setup lang="ts">
import { Suggestion } from "@antdv-next/x";
import { Select } from "antdv-next";
import { ref } from "vue";

const tags = ref<string[]>([]);
const value = ref("");

const onSelect = () => {
  tags.value = [...tags.value, `Cell_${value.value.replace(/\//g, "")}`];
  value.value = "";
};

const onSearch = (nextValue: string) => {
  value.value = nextValue;
};

const onTagsChange = (nextTags: string[]) => {
  tags.value = nextTags;
};

const handleKeyDown = (
  event: KeyboardEvent,
  onTrigger: (info?: string | false) => void,
  onSuggestionKeyDown: (event: KeyboardEvent) => void | false,
) => {
  if (event.key === "/" || event.key === "#") {
    onTrigger(event.key);
  }

  return onSuggestionKeyDown(event);
};
</script>

<template>
  <Suggestion
    :items="
      (info?: string) => [
        {
          label: `Trigger by '${info}'`,
          value: String(info),
        },
      ]
    "
    :on-select="onSelect"
  >
    <template #default="{ onTrigger, onKeyDown: onSuggestionKeyDown }">
      <Select
        :value="tags"
        mode="tags"
        style="width: 100%"
        :open="false"
        :show-search="{ searchValue: value, onSearch }"
        :on-change="onTagsChange"
        placeholder="可任意输入 / 与 # 多次获取建议"
        @keydown="
          (event: KeyboardEvent) =>
            handleKeyDown(event, onTrigger, onSuggestionKeyDown)
        "
      />
    </template>
  </Suggestion>
</template>

<docs lang="zh-CN">
支持通过不同触发符（如 `/`、`#`）动态生成建议项。
</docs>

<docs lang="en-US">
Support custom trigger symbols such as `/` and `#` to generate dynamic suggestions.
</docs>
