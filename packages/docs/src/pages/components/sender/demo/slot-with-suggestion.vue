<script setup lang="ts">
import type { SenderProps } from "@antdv-next/x";
import type { MenuProps } from "antdv-next";

// TODO: 待实现 Suggestion 组件 + slotConfig 后完善
// 当前为占位 demo，展示 Agent 输入框 + 快捷指令的组合场景
// React 版: 输入 @ 可唤起 Suggestion 快捷指令面板
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

const agentMap: Record<string, { icon: any; label: string }> = {
  deep_search: { icon: SearchOutlined, label: "Deep Search" },
  ai_code: { icon: CodeOutlined, label: "AI Code" },
  ai_writing: { icon: EditOutlined, label: "Writing" },
};

const loading = ref(false);
const deepThink = ref(true);
const activeAgentKey = ref("deep_search");

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

const senderRef = ref<InstanceType<typeof Sender>>();

watch(loading, val => {
  if (val) {
    const timer = setTimeout(() => {
      loading.value = false;
      message.success("Send message successfully!");
      clearTimeout(timer);
    }, 3000);
  }
});

// TODO: 替换为 Suggestion 组件包裹 Sender
// const suggestions = [
//   { label: 'Write a report', value: 'report' },
//   { label: 'Draw a picture', value: 'draw' },
//   {
//     label: 'Check some knowledge', value: 'knowledge',
//     children: [
//       { label: 'About React', value: 'react' },
//       { label: 'About Ant Design', value: 'antd' },
//     ],
//   },
// ];

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "@") {
    // TODO: 触发 Suggestion onTrigger
    console.log("@ pressed - Suggestion 组件待实现");
  }
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
                  "Deep Think:",
                  h("span", { style: SwitchTextStyle }, "on"),
                ]),
                unCheckedChildren: h("div", null, [
                  "Deep Think:",
                  h("span", { style: SwitchTextStyle }, "off"),
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
                      { default: () => "Agent" },
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

const onSubmit = (v: string) => {
  loading.value = true;
  message.info(`Send message: ${v}`);
  senderRef.value?.clear();
};

const onCancel = () => {
  loading.value = false;
  message.error("Cancel sending!");
};
</script>

<template>
  <!-- TODO: 用 Suggestion 组件包裹 Sender -->
  <Flex vertical gap="middle">
    <Sender
      ref="senderRef"
      :loading="loading"
      placeholder="Press Enter to send message (type @ for suggestions - TODO)"
      :footer="footerRender"
      :suffix="false"
      :auto-size="{ minRows: 3, maxRows: 6 }"
      :on-submit="onSubmit"
      :on-cancel="onCancel"
      :on-key-down="onKeyDown"
    />
  </Flex>
</template>
