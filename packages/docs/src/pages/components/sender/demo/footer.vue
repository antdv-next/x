<script setup lang="ts">
import { ApiOutlined, LinkOutlined, SearchOutlined } from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Button, Divider, Flex, Switch } from "antdv-next";
import { h, onBeforeUnmount, ref, watch } from "vue";

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

const iconStyle = { fontSize: "18px" };

function footerRender(_: any, info: any) {
  const { SendButton, LoadingButton, SpeechButton } = info.components;
  return h(Flex, { justify: "space-between", align: "center" }, () => [
    h(Flex, { gap: "small", align: "center" }, () => [
      h(Button, { style: iconStyle, type: "text", icon: h(LinkOutlined) }),
      h(Divider, { type: "vertical" }),
      "Deep Thinking",
      h(Switch, { size: "small" }),
      h(Divider, { type: "vertical" }),
      h(Button, { icon: h(SearchOutlined) }, () => "Global Search"),
    ]),
    h(Flex, { align: "center" }, () => [
      h(Button, { type: "text", style: iconStyle, icon: h(ApiOutlined) }),
      h(Divider, { type: "vertical" }),
      h(SpeechButton, { style: iconStyle }),
      h(Divider, { type: "vertical" }),
      loading.value
        ? h(LoadingButton, { type: "default" })
        : h(SendButton, { type: "primary", disabled: false }),
    ]),
  ]);
}
</script>

<template>
  <Sender
    :value="value"
    :auto-size="{ minRows: 2, maxRows: 6 }"
    placeholder="Press Enter to send message"
    :footer="footerRender"
    :suffix="false"
    :on-change="(v: string) => (value = v)"
    :on-submit="() => (loading = true)"
    :on-cancel="() => (loading = false)"
  />
</template>

<docs lang="zh-CN">
通过 `footer` 自定义底部内容，将操作按钮移至底部并添加更多功能入口。设置 `suffix={false}` 隐藏默认后缀。
</docs>

<docs lang="en-US">
Customize footer content with `footer`. Move action buttons to the bottom and add more features. Set `suffix={false}` to hide default suffix.
</docs>
