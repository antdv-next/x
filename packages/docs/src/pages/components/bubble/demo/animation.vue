<script setup lang="ts">
import type { XProviderProps } from "@antdv-next/x";

import { CopyOutlined, RedoOutlined, UserOutlined } from "@antdv-next/icons";
import { Actions, Bubble, XProvider } from "@antdv-next/x";
import { Avatar, Button, Divider, Space, Switch } from "antdv-next";
import { computed, h, ref } from "vue";

const textA =
  "Ant Design X - Better UI toolkit for your AI Chat WebApp. ".repeat(5);
const textB =
  "Ant Design X - Build your AI Chat WebApp with an easier way. ".repeat(5);

const loading = ref(true);
const content = ref("");
const effect = ref<"fade-in" | "typing" | "custom-typing">("fade-in");
const keepPrefix = ref(false);

const actionItems = [
  {
    key: "retry",
    icon: h(RedoOutlined),
    label: "Retry",
  },
  {
    key: "copy",
    icon: h(CopyOutlined),
    label: "Copy",
  },
];

function footer() {
  return h(Actions, {
    items: actionItems,
    onClick: () => {
      console.log(content.value);
    },
  });
}

const typingConfig = computed(() => ({
  effect: (effect.value === "fade-in" ? "fade-in" : "typing") as
    | "fade-in"
    | "typing",
  interval: 50,
  step: 3,
  keepPrefix: keepPrefix.value,
}));

const theme = computed<XProviderProps["theme"]>(() => ({
  components: {
    Bubble:
      effect.value === "custom-typing"
        ? {
            typingContent: '"💖"',
          }
        : {},
  },
}));

function loadA() {
  loading.value = false;
  content.value = textA;
}

function loadB() {
  loading.value = false;
  content.value = textB;
}
</script>

<template>
  <Space direction="vertical" style="display: flex; width: 100%" :size="10">
    <Space align="center" wrap>
      <span>非流式数据 / Non-streaming data:</span>
      <Button type="primary" @click="loadA">
        <RedoOutlined />
        load data-1
      </Button>
      <Button @click="loadB">
        <RedoOutlined />
        load data-2
      </Button>
    </Space>

    <Space align="center" wrap>
      <span>动画效果 / Animation effects:</span>
      <a-radio-group v-model:value="effect">
        <a-radio value="fade-in"> fade-in </a-radio>
        <a-radio value="typing"> typing </a-radio>
        <a-radio value="custom-typing"> typing with 💖 </a-radio>
      </a-radio-group>
    </Space>

    <Space align="center">
      <span>保留公共前缀 / Preserve common prefix:</span>
      <Switch v-model:checked="keepPrefix" />
    </Space>

    <Divider style="margin: 4px 0" />

    <XProvider :theme="theme">
      <Bubble
        :loading="loading"
        :content="content"
        :typing="typingConfig"
        :header="h('h5', null, 'ADX')"
        :footer="footer"
        :avatar="h(Avatar, { icon: h(UserOutlined) })"
        :on-typing="() => console.log('typing')"
        :on-typing-complete="() => console.log('typing complete')"
      />
    </XProvider>
  </Space>
</template>

<docs lang="zh-CN">
动画效果，仅支持 `content` 是字符串或 `contentRender` 渲染字符串的情况下生效。非字符串场景需要自定义渲染动画。生效时，如果 `content` 不变，而其他配置发生变化，动画不会重新执行。
</docs>

<docs lang="en-US">
Animation effect. It only works if `content` is a string or `contentRender` renders a string. Non-string scenes require custom rendering animations. When it takes effect, if `content` remains unchanged and other configurations change, the animation does not re-execute.
</docs>
