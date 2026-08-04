<script setup lang="ts">
import { ref } from "vue";

const expanded = ref(true);
const destroyOnHidden = ref(true);
</script>

<template>
  <a-space direction="vertical" :size="16">
    <a-space>
      <a-button @click="expanded = !expanded">
        {{ expanded ? "Collapse" : "Expand" }}
      </a-button>
      <a-switch
        v-model:checked="destroyOnHidden"
        checked-children="destroyOnHidden"
        un-checked-children="keep"
      />
    </a-space>
    <ax-think
      title="Deep Thinking"
      :expanded="expanded"
      :destroy-on-hidden="destroyOnHidden"
      @expand="expanded = $event"
    >
      This content will be removed from DOM when collapsed and
      destroyOnHidden is true.
    </ax-think>
  </a-space>
</template>

<docs lang="zh-CN">
通过外部按钮控制展开状态，并切换 `destroyOnHidden` 对折叠内容的处理方式。
</docs>

<docs lang="en-US">
Control the expanded state externally and switch how collapsed content is handled with `destroyOnHidden`.
</docs>
