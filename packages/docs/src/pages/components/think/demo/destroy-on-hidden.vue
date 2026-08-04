<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";

const destroyOnHidden = ref(false);
const seconds = ref(0);

const timer = setInterval(() => {
  seconds.value += 1;
}, 1000);

onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div>
    <a-switch
      v-model:checked="destroyOnHidden"
      checked-children="destroyOnHidden: true"
      un-checked-children="destroyOnHidden: false"
    />
    <br />
    <br />
    <ax-think :destroy-on-hidden="destroyOnHidden" title="deep thinking">
      <p>Streaming for {{ seconds }}s.</p>
      <input placeholder="Type something, then collapse" />
    </ax-think>
  </div>
</template>

<docs lang="zh-CN">
`destroyOnHidden` 默认为 `true`，折叠时销毁内容节点。设为 `false` 时内容节点保留在 DOM 中，仅隐藏，可以保留流式输出与内部组件状态（例如上面输入框中已输入的内容）。
</docs>

<docs lang="en-US">
`destroyOnHidden` defaults to `true`, which destroys the content node on collapse. Set it to `false` to keep the node mounted and merely hidden, preserving streaming output and inner component state (such as the text typed into the input above).
</docs>
