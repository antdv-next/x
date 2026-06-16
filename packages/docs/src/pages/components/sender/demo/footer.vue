<script setup lang="ts">
import { ApiOutlined, LinkOutlined, SearchOutlined } from "@antdv-next/icons";
import { theme } from "antdv-next";
import { computed, onBeforeUnmount, ref, watch } from "vue";

const { token } = theme.useToken();

const loading = ref(false);
const value = ref("");

let timer: ReturnType<typeof setTimeout> | undefined;

watch(loading, val => {
  if (val) {
    timer = setTimeout(() => {
      loading.value = false;
      value.value = "";
      console.log("Send message successfully!");
    }, 2000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

const iconStyle = computed(() => ({
  fontSize: "18px",
  color: token.value.colorText,
}));
</script>

<template>
  <ax-sender
    :value="value"
    :auto-size="{ minRows: 2, maxRows: 6 }"
    placeholder="Press Enter to send message"
    :suffix="false"
    :on-change="(v: string) => (value = v)"
    :on-submit="() => (loading = true)"
    :on-cancel="() => (loading = false)"
  >
    <template #footer="{ components }">
      <a-flex justify="space-between" align="center">
        <a-flex gap="small" align="center">
          <a-button :style="iconStyle" type="text">
            <template #icon>
              <LinkOutlined />
            </template>
          </a-button>
          <a-divider type="vertical" />
          <span>Deep Thinking</span>
          <a-switch size="small" />
          <a-divider type="vertical" />
          <a-button>
            <template #icon>
              <SearchOutlined />
            </template>
            Global Search
          </a-button>
        </a-flex>
        <a-flex align="center">
          <a-button type="text" :style="iconStyle">
            <template #icon>
              <ApiOutlined />
            </template>
          </a-button>
          <a-divider type="vertical" />
          <component :is="components.SpeechButton" :style="iconStyle" />
          <a-divider type="vertical" />
          <component
            :is="loading ? components.LoadingButton : components.SendButton"
            :type="loading ? 'default' : 'primary'"
            :disabled="false"
          />
        </a-flex>
      </a-flex>
    </template>
  </ax-sender>
</template>

<docs lang="zh-CN">
使用 `footer` 自定义底部内容。
</docs>

<docs lang="en-US">
Use `footer` to customize the footer content.
</docs>
