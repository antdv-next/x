<script setup lang="ts">
import type { SenderProps } from "@antdv-next/x";
import type { MenuProps } from "antdv-next";

import {
  ApiOutlined,
  CodeOutlined,
  EditOutlined,
  OpenAIOutlined,
  PaperClipOutlined,
  SearchOutlined,
} from "@antdv-next/icons";
import { Sender } from "@antdv-next/x";
import { Button, Divider, Dropdown, Flex, message } from "antdv-next";
import { h, ref, watch } from "vue";

const SenderSwitch = Sender.Switch;

interface AgentItem {
  icon: any;
  label: string;
}

const agentMap: Record<string, AgentItem> = {
  deep_search: { icon: SearchOutlined, label: "深度搜索" },
  ai_code: { icon: CodeOutlined, label: "写代码" },
  ai_writing: { icon: EditOutlined, label: "帮我写作" },
};

const loading = ref(false);
const deepThink = ref(true);
const activeAgentKey = ref("ai_writing");

const agentItems = Object.entries(agentMap).map(([key, { icon, label }]) => ({
  key,
  icon: h(icon),
  label,
}));

const agentItemClick: MenuProps["onClick"] = item => {
  activeAgentKey.value = item.key as string;
};

const SwitchTextStyle = {
  display: "inline-flex",
  width: "28px",
  justifyContent: "center",
  alignItems: "center",
};

const IconStyle = { fontSize: "16px" };

watch(loading, val => {
  if (val) {
    const timer = setTimeout(() => {
      loading.value = false;
      message.success("发送成功！");
      clearTimeout(timer);
    }, 3000);
  }
});

const onSubmit = (v: string) => {
  loading.value = true;
  message.info(`发送消息: ${activeAgentKey.value} | ${v}`);
};

const onCancel = () => {
  loading.value = false;
  message.error("取消发送！");
};

const footerRender: SenderProps["footer"] = (actionNode, { components }) => {
  const { SendButton, LoadingButton } = components;
  return h(
    Flex,
    { justify: "space-between", align: "center" },
    {
      default: () => [
        h(
          Flex,
          { gap: "small", align: "center" },
          {
            default: () => [
              h(
                Button,
                { style: IconStyle, type: "text" },
                { icon: () => h(PaperClipOutlined) },
              ),
              h(SenderSwitch, {
                value: deepThink.value,
                onChange: (checked: boolean) => {
                  deepThink.value = checked;
                },
                icon: h(OpenAIOutlined),
                checkedChildren: h("div", null, [
                  "深度搜索：",
                  h("span", { style: SwitchTextStyle }, "开启"),
                ]),
                unCheckedChildren: h("div", null, [
                  "深度搜索：",
                  h("span", { style: SwitchTextStyle }, "关闭"),
                ]),
              }),
              h(
                Dropdown,
                {
                  menu: {
                    selectedKeys: [activeAgentKey.value],
                    onClick: agentItemClick,
                    items: agentItems,
                  },
                },
                {
                  default: () =>
                    h(
                      SenderSwitch,
                      {
                        value: false,
                        icon: h(SearchOutlined),
                      },
                      { default: () => "功能应用" },
                    ),
                },
              ),
            ],
          },
        ),
        h(
          Flex,
          { align: "center" },
          {
            default: () => [
              h(
                Button,
                { type: "text", style: IconStyle },
                { icon: () => h(ApiOutlined) },
              ),
              h(Divider, { type: "vertical" }),
              loading.value ? h(LoadingButton) : h(SendButton),
            ],
          },
        ),
      ],
    },
  );
};
</script>

<template>
  <Sender
    :loading="loading"
    placeholder="按 Enter 发送消息"
    :footer="footerRender"
    :suffix="false"
    :auto-size="{ minRows: 3, maxRows: 6 }"
    :on-submit="onSubmit"
    :on-cancel="onCancel"
  />
</template>

<docs lang="zh-CN">
智能体输入框。
</docs>

<docs lang="en-US">
Agent input box.
</docs>
