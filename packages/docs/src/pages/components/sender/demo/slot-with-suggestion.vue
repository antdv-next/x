<script setup lang="ts">
import type { SenderProps, SuggestionItem } from "@antdv-next/x";
import type { MenuProps } from "antdv-next";

import {
  AntDesignOutlined,
  ApiOutlined,
  CodeOutlined,
  EditOutlined,
  FileImageOutlined,
  OpenAIFilled,
  OpenAIOutlined,
  PaperClipOutlined,
  ProfileOutlined,
  SearchOutlined,
} from "@antdv-next/icons";
import { Sender, Suggestion } from "@antdv-next/x";
import { Button, Divider, Dropdown, Flex, message } from "antdv-next";
import { h, nextTick, onBeforeUnmount, ref } from "vue";

const SenderSwitch = Sender.Switch;

const agentMap: Record<string, { icon: any; label: string }> = {
  deep_search: { icon: SearchOutlined, label: "Deep Search" },
  ai_code: { icon: CodeOutlined, label: "AI Code" },
  ai_writing: { icon: EditOutlined, label: "Writing" },
};

const fileMap: Record<string, { icon: any; label: string }> = {
  file_image: { icon: FileImageOutlined, label: "x-image" },
};

const suggestions: SuggestionItem[] = [
  { label: "Write a report", value: "report" },
  { label: "Draw a picture", value: "draw" },
  {
    label: "Check some knowledge",
    value: "knowledge",
    icon: h(OpenAIFilled),
    children: [
      { label: "About React", value: "react" },
      { label: "About Ant Design", value: "antd" },
    ],
  },
];

const loading = ref(false);
const deepThink = ref(true);
const activeAgentKey = ref("deep_search");
const value = ref("");

const senderRef = useTemplateRef("senderRef");

const agentItems = Object.entries(agentMap).map(([key, { icon, label }]) => ({
  key,
  icon: h(icon),
  label,
}));

const fileItems = Object.entries(fileMap).map(([key, { icon, label }]) => ({
  key,
  icon: h(icon),
  label,
}));

const agentItemClick: MenuProps["onClick"] = item => {
  activeAgentKey.value = item.key as string;
};

const fileItemClick: MenuProps["onClick"] = item => {
  const file = fileMap[item.key as string];
  if (!file) return;
  senderRef.value?.insert(` [${file.label}] `, "cursor");
};

const switchTextStyle = {
  display: "inline-flex",
  width: "28px",
  justifyContent: "center",
  alignItems: "center",
};

const iconStyle = { fontSize: "16px" };

let timer: ReturnType<typeof setTimeout> | undefined;

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

const onSelectSuggestion = () => {
  if (value.value.endsWith("@")) {
    value.value = value.value.slice(0, -1);
  }

  nextTick(() => {
    senderRef.value?.insert("[Enter a name] ", "cursor");
  });
};

const onSenderChange = (nextValue: string) => {
  value.value = nextValue;
};

const onSenderKeyDown = (
  event: KeyboardEvent,
  onTrigger: (info?: string | false) => void,
  onSuggestionKeyDown: (event: KeyboardEvent) => void | false,
) => {
  if (event.key === "@") {
    onTrigger();
  }

  return onSuggestionKeyDown(event);
};

const onSubmit = (content: string) => {
  loading.value = true;
  message.info(`Send message: ${content}`);
  senderRef.value?.clear();
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    loading.value = false;
    message.success("Send message successfully!");
  }, 3000);
};

const onCancel = () => {
  if (timer) clearTimeout(timer);
  loading.value = false;
  message.error("Cancel sending!");
};

const footerRender: SenderProps["footer"] = actionNode => {
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
                { style: iconStyle, type: "text" },
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
                  h("span", { style: switchTextStyle }, "on"),
                ]),
                unCheckedChildren: h("div", null, [
                  "Deep Think:",
                  h("span", { style: switchTextStyle }, "off"),
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
                        icon: h(AntDesignOutlined),
                      },
                      { default: () => "Agent" },
                    ),
                },
              ),
              fileItems.length
                ? h(
                    Dropdown,
                    {
                      menu: {
                        onClick: fileItemClick,
                        items: fileItems,
                      },
                    },
                    {
                      default: () =>
                        h(
                          SenderSwitch,
                          {
                            value: false,
                            icon: h(ProfileOutlined),
                          },
                          { default: () => "Files" },
                        ),
                    },
                  )
                : null,
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
                { type: "text", style: iconStyle },
                { icon: () => h(ApiOutlined) },
              ),
              h(Divider, { type: "vertical" }),
              actionNode,
            ],
          },
        ),
      ],
    },
  );
};
</script>

<template>
  <Flex vertical gap="middle">
    <Suggestion :items="suggestions" :on-select="onSelectSuggestion">
      <template #default="{ onTrigger, onKeyDown }">
        <Sender
          ref="senderRef"
          :loading="loading"
          :value="value"
          placeholder="Press Enter to send message"
          :footer="footerRender"
          :suffix="false"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          :on-change="onSenderChange"
          :on-key-down="event => onSenderKeyDown(event, onTrigger, onKeyDown)"
          :on-submit="onSubmit"
          :on-cancel="onCancel"
        />
      </template>
    </Suggestion>
  </Flex>
</template>

<docs lang="zh-CN">
带有快捷指令的智能体输入框，输入`@` 可以唤起快捷指令。
</docs>

<docs lang="en-US">
Agent input box with quick commands and suggestions, type `@` to trigger quick commands.
</docs>
