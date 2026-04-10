<script setup lang="ts">
import type { SuggestionItem } from "@antdv-next/x";
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
import { nextTick, onBeforeUnmount, ref } from "vue";
const { message } = App.useApp();

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
  label,
  icon,
}));

const fileItems = Object.entries(fileMap).map(([key, { icon, label }]) => ({
  key,
  label,
  icon,
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
</script>

<template>
  <a-flex vertical gap="middle">
    <ax-suggestion :items="suggestions" @select="onSelectSuggestion">
      <template #default="{ onTrigger, onKeyDown }">
        <ax-sender
          ref="senderRef"
          :loading="loading"
          :value="value"
          placeholder="Press Enter to send message"
          :suffix="false"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          :on-change="onSenderChange"
          :on-key-down="
            (event: KeyboardEvent) =>
              onSenderKeyDown(event, onTrigger, onKeyDown)
          "
          :on-submit="onSubmit"
          :on-cancel="onCancel"
        >
          <template #footer="{ components }">
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
                      Deep Think:
                      <span :style="switchTextStyle">on</span>
                    </div>
                  </template>
                  <template #unCheckedChildren>
                    <div>
                      Deep Think:
                      <span :style="switchTextStyle">off</span>
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
                  <template #iconRender="{ key }">
                    <SearchOutlined v-if="key === 'deep_search'" />
                    <CodeOutlined v-else-if="key === 'ai_code'" />
                    <EditOutlined v-else-if="key === 'ai_writing'" />
                  </template>
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
                  <template #iconRender="{ key }">
                    <FileImageOutlined v-if="key === 'file_image'" />
                  </template>
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
                <component :is="components.SpeechButton" />
                <a-divider type="vertical" />
                <component
                  :is="
                    loading ? components.LoadingButton : components.SendButton
                  "
                />
              </a-flex>
            </a-flex>
          </template>
        </ax-sender>
      </template>

      <template #iconRender="{ item }">
        <OpenAIFilled v-if="item.value === 'knowledge'" />
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
