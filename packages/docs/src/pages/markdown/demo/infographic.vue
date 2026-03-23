<script setup lang="ts">
import { XMarkdown } from "@antdv-next/x-markdown";
import { defineComponent, h } from "vue";

const content = `<infographic title="Monthly Active Users" value="128,340" trend="+12.5%" />`;

const InfographicBlock = defineComponent({
  name: "InfographicBlock",
  props: {
    title: {
      type: String,
      default: "",
    },
    value: {
      type: String,
      default: "",
    },
    trend: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    return () =>
      h("div", { class: "info-card" }, [
        h("div", { class: "info-title" }, props.title),
        h("div", { class: "info-value" }, props.value),
        h("div", { class: "info-trend" }, props.trend),
      ]);
  },
});

const components = {
  infographic: InfographicBlock,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>

<style scoped>
.info-card {
  border: 1px solid var(--ant-color-border-secondary, #e5e7eb);
  border-radius: 10px;
  padding: 12px;
  width: 260px;
}

.info-title {
  color: var(--ant-color-text-secondary, #6b7280);
  font-size: 12px;
}

.info-value {
  font-size: 24px;
  font-weight: 700;
  margin: 4px 0;
}

.info-trend {
  color: var(--ant-color-success, #16a34a);
  font-weight: 600;
}
</style>

<docs lang="zh-CN">
信息图示例：将结构化指标映射为数据卡片。
</docs>

<docs lang="en-US">
Infographic demo: map structured metrics into a data card.
</docs>
