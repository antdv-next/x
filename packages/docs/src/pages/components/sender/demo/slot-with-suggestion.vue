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
import { App } from "antdv-next";
import { h, onBeforeUnmount, ref, useTemplateRef, watch } from "vue";

const { message } = App.useApp();

interface AgentInfoItem {
  icon: any;
  label: string;
  slotConfig: SenderProps["slotConfig"];
}

const AgentInfo: Record<string, AgentInfoItem> = {
  deep_search: {
    icon: SearchOutlined,
    label: "Deep Search",
    slotConfig: [
      { type: "text", value: "Please help me search for news about " },
      {
        type: "select",
        key: "search_type",
        props: {
          options: ["AI", "Technology", "Entertainment"],
          placeholder: "Please select a category",
        },
      },
      { type: "text", value: " and summarize it into a list." },
    ],
  },
  ai_code: {
    icon: CodeOutlined,
    label: "AI Code",
    slotConfig: [
      { type: "text", value: "Please use " },
      {
        type: "select",
        key: "code_lang",
        props: {
          options: ["JS", "C++", "Java"],
          placeholder: "Please select a programming language",
        },
      },
      { type: "text", value: " to write a mini game." },
    ],
  },
  ai_writing: {
    icon: EditOutlined,
    label: "Writing",
    slotConfig: [
      { type: "text", value: "Please write an article about " },
      {
        type: "select",
        key: "writing_type",
        props: {
          options: ["Campus", "Travel", "Reading"],
          placeholder: "Please enter a topic",
        },
      },
      { type: "text", value: ". The requirement is " },
      {
        type: "input",
        key: "writing_num",
        props: {
          defaultValue: "800",
          placeholder: "Please enter the number of words.",
        },
      },
      { type: "text", value: " words." },
    ],
  },
};

const FileInfo: Record<string, { icon: any; label: string }> = {
  file_image: { icon: FileImageOutlined, label: "x-image" },
};

const iconStyle = { fontSize: "16px" };

const switchTextStyle = {
  display: "inline-flex",
  width: "28px",
  justifyContent: "center",
  alignItems: "center",
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

const senderRef = useTemplateRef("senderRef");

const agentItems = Object.keys(AgentInfo).map(agent => {
  const { icon, label } = AgentInfo[agent];
  return { key: agent, icon: h(icon), label };
});

const fileItems = Object.keys(FileInfo).map(file => {
  const { icon, label } = FileInfo[file];
  return { key: file, icon: h(icon), label };
});

const agentItemClick: MenuProps["onClick"] = item => {
  activeAgentKey.value = item.key as string;
};

const fileItemClick: MenuProps["onClick"] = item => {
  const { icon, label } = FileInfo[item.key as string];
  senderRef.value?.insert?.([
    {
      type: "tag",
      key: `${item.key}_${Date.now()}`,
      props: {
        label: h("div", { style: { display: "flex", gap: "8px" } }, [
          h(icon),
          label,
        ]),
        value: item.key as string,
      },
    },
  ]);
};

// Mock send message
let timer: ReturnType<typeof setTimeout> | undefined;
watch(loading, val => {
  if (val) {
    timer = setTimeout(() => {
      loading.value = false;
      message.success("Send message successfully!");
    }, 3000);
  }
});

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});

const onSelectSuggestion = () => {
  senderRef.value?.insert?.(
    [
      {
        type: "content",
        key: `partner_2_${Date.now()}`,
        props: { placeholder: "Enter a name" },
      },
    ],
    "cursor",
    "@",
  );
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
  senderRef.value?.clear?.();
};

const onCancel = () => {
  loading.value = false;
  message.error("Cancel sending!");
};
</script>

<template>
  <a-flex vertical gap="middle">
    <ax-suggestion :items="suggestions" @select="onSelectSuggestion">
      <template #default="{ onTrigger, onKeyDown }">
        <ax-sender
          ref="senderRef"
          :loading="loading"
          placeholder="Press Enter to send message"
          :suffix="false"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          :slot-config="AgentInfo[activeAgentKey].slotConfig"
          :on-key-down="
            (event: KeyboardEvent) =>
              onSenderKeyDown(event, onTrigger, onKeyDown)
          "
          :on-submit="onSubmit"
          :on-cancel="onCancel"
        >
          <template #footer="{ defaultNode }">
            <a-flex justify="space-between" align="center">
              <a-flex gap="small" align="center">
                <a-button :style="iconStyle" type="text">
                  <template #icon>
                    <PaperClipOutlined />
                  </template>
                </a-button>
                <ax-sender-switch
                  :value="deepThink"
                  :on-change="(checked: boolean) => (deepThink = checked)"
                >
                  <template #icon>
                    <OpenAIOutlined />
                  </template>
                  <template #checkedChildren>
                    <div>
                      Deep Think:<span :style="switchTextStyle">on</span>
                    </div>
                  </template>
                  <template #unCheckedChildren>
                    <div>
                      Deep Think:<span :style="switchTextStyle">off</span>
                    </div>
                  </template>
                </ax-sender-switch>
                <a-dropdown
                  :menu="{
                    selectedKeys: [activeAgentKey],
                    onClick: agentItemClick,
                    items: agentItems,
                  }"
                >
                  <ax-sender-switch :value="false">
                    <template #icon>
                      <AntDesignOutlined />
                    </template>
                    Agent
                  </ax-sender-switch>
                </a-dropdown>
                <a-dropdown
                  v-if="fileItems.length"
                  :menu="{
                    onClick: fileItemClick,
                    items: fileItems,
                  }"
                >
                  <ax-sender-switch :value="false">
                    <template #icon>
                      <ProfileOutlined />
                    </template>
                    Files
                  </ax-sender-switch>
                </a-dropdown>
              </a-flex>
              <a-flex align="center">
                <a-button type="text" :style="iconStyle">
                  <template #icon>
                    <ApiOutlined />
                  </template>
                </a-button>
                <a-divider type="vertical" />
                <component :is="defaultNode" />
              </a-flex>
            </a-flex>
          </template>
        </ax-sender>
      </template>
    </ax-suggestion>
  </a-flex>
</template>

<docs lang="zh-CN">
带有快捷指令的智能体输入框，输入`@` 可以唤起快捷指令。
</docs>

<docs lang="en-US">
Agent input box with quick commands and suggestions, type `@` to trigger quick commands.
</docs>
