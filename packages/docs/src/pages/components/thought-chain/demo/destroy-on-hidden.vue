<script setup lang="ts">
import type { ThoughtChainProps } from "@antdv-next/x";

import { computed, onBeforeUnmount, ref } from "vue";

const destroyOnHidden = ref(false);
const seconds = ref(0);

const timer = setInterval(() => {
  seconds.value += 1;
}, 1000);

onBeforeUnmount(() => clearInterval(timer));

const items = computed<ThoughtChainProps["items"]>(() => [
  {
    key: "keep_alive",
    title: "Streaming Node",
    description: "Collapse and expand to compare the two behaviors",
    collapsible: true,
    status: "loading",
    destroyOnHidden: destroyOnHidden.value,
  },
]);
</script>

<template>
  <a-card :style="{ width: '500px' }">
    <a-switch
      v-model:checked="destroyOnHidden"
      checked-children="destroyOnHidden: true"
      un-checked-children="destroyOnHidden: false"
    />
    <br />
    <br />
    <ax-thought-chain :default-expanded-keys="['keep_alive']" :items="items">
      <template #content>
        <a-flex gap="small" vertical>
          <a-typography-text type="secondary">
            Streaming for {{ seconds }}s.
          </a-typography-text>
          <a-input placeholder="Type something, then collapse" />
        </a-flex>
      </template>
    </ax-thought-chain>
  </a-card>
</template>

<docs lang="zh-CN">
节点的 `destroyOnHidden` 默认为 `true`，折叠时销毁内容节点。设为 `false` 时内容节点保留在 DOM 中，仅隐藏，可以保留流式输出与内部组件状态（例如上面输入框中已输入的内容）。
</docs>

<docs lang="en-US">
The node level `destroyOnHidden` defaults to `true`, which destroys the content node on collapse. Set it to `false` to keep the node mounted and merely hidden, preserving streaming output and inner component state (such as the text typed into the input above).
</docs>
