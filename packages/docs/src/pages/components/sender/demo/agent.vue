<script setup lang="ts">
import type { SenderProps } from "@antdv-next/x";
import type { MenuProps } from "antdv-next";

import {
  AntDesignOutlined,
  ApiOutlined,
  CodeOutlined,
  EditOutlined,
  FileImageOutlined,
  OpenAIOutlined,
  PaperClipOutlined,
  ProfileOutlined,
  SearchOutlined,
} from "@antdv-next/icons";
import { App } from "antdv-next";
import { h, ref, useTemplateRef, watch } from "vue";
const { message } = App.useApp();

interface AgentInfoItem {
  icon: any;
  label: string;
  zh_label: string;
  skill: SenderProps["skill"];
  zh_skill: SenderProps["skill"];
  slotConfig: SenderProps["slotConfig"];
  zh_slotConfig: SenderProps["slotConfig"];
}

const AgentInfo: Record<string, AgentInfoItem> = {
  deep_search: {
    icon: SearchOutlined,
    label: "Deep Search",
    zh_label: "深度搜索",
    skill: {
      value: "deepSearch",
      title: "Deep Search",
      closable: true,
    },
    zh_skill: {
      value: "deepSearch",
      title: "深度搜索",
      closable: true,
    },
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
      { type: "text", key: "", value: "Please help me search for news about " },
    ],
    zh_slotConfig: [
      { type: "text", value: "请帮我搜索关于" },
      {
        type: "select",
        key: "search_type",
        props: {
          options: ["AI", "技术", "娱乐"],
          placeholder: "请选择一个类别",
        },
      },
      { type: "text", key: "", value: "的新闻。" },
    ],
  },
  ai_code: {
    icon: CodeOutlined,
    label: "AI Code",
    zh_label: "写代码",
    skill: {
      value: "aiCode",
      title: "Code Assistant",
      closable: true,
    },
    zh_skill: {
      value: "aiCode",
      title: "代码助手",
      closable: true,
    },
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
    zh_slotConfig: [
      { type: "text", value: "请使用" },
      {
        type: "select",
        key: "code_lang",
        props: {
          options: ["JS", "C++", "Java"],
          placeholder: "请选择一个编程语言",
        },
      },
      { type: "text", value: "写一个小游戏。" },
    ],
  },
  ai_writing: {
    icon: EditOutlined,
    label: "Writing",
    zh_label: "帮我写作",
    skill: {
      value: "writing",
      title: "Writing Assistant",
      closable: true,
    },
    zh_skill: {
      value: "writing",
      title: "写作助手",
      closable: true,
    },
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
        type: "content",
        key: "writing_num",
        props: {
          defaultValue: "800",
          placeholder: "[Please enter the number of words]",
        },
      },
      { type: "text", value: " words." },
    ],
    zh_slotConfig: [
      { type: "text", value: "请帮我写一篇关于" },
      {
        type: "select",
        key: "writing_type",
        props: {
          options: ["校园", "旅行", "阅读"],
          placeholder: "请输入主题",
        },
      },
      { type: "text", value: "的文章。要求是" },
      {
        type: "content",
        key: "writing_num",
        props: {
          defaultValue: "800",
          placeholder: "[请输入字数]",
        },
      },
      { type: "text", value: "字。" },
    ],
  },
};

const IconStyle = {
  fontSize: "16px",
};

const SwitchTextStyle = {
  display: "inline-flex",
  width: "28px",
  justifyContent: "center",
  alignItems: "center",
};

interface FileInfoItem {
  icon: any;
  label: string;
  zh_label: string;
}

const FileInfo: Record<string, FileInfoItem> = {
  file_image: {
    icon: FileImageOutlined,
    label: "x-image",
    zh_label: "x-图片",
  },
};

const loading = ref(false);
const deepThink = ref(true);
const activeAgentKey = ref("ai_writing");
const slotConfig = ref<AgentInfoItem>(AgentInfo[activeAgentKey.value]);

// ======================== sender en ========================
const senderRef = useTemplateRef("senderRef");

const agentItems = Object.keys(AgentInfo).map(agent => {
  const { icon, label } = AgentInfo[agent];
  return { key: agent, icon, label };
});

const zhAgentItems = Object.keys(AgentInfo).map(agent => {
  const { icon, zh_label } = AgentInfo[agent];
  return { key: agent, icon, label: zh_label };
});

const fileItems = Object.keys(FileInfo).map(file => {
  const { icon, label } = FileInfo[file];
  return { key: file, icon, label };
});

const zhFileItems = Object.keys(FileInfo).map(file => {
  const { icon, zh_label } = FileInfo[file];
  return { key: file, icon, label: zh_label };
});

const agentItemClick: MenuProps["onClick"] = item => {
  activeAgentKey.value = item.key as string;
  try {
    // deep clone
    slotConfig.value = JSON.parse(
      JSON.stringify(AgentInfo[item.key as string]),
    );
  } catch (error) {
    console.error(error);
  }
};

// ======================== sender zh ========================
const senderZhRef = useTemplateRef("senderZhRef");

const fileItemClick = (item: { key: string }, type?: string) => {
  const { icon, label } = FileInfo[item.key];
  const sender = type !== "zh" ? senderRef.value : senderZhRef.value;
  sender?.insert?.([
    {
      type: "tag",
      key: `${item.key}_${Date.now()}`,
      props: {
        label: h("div", { style: { display: "flex", gap: "8px" } }, [
          h(icon),
          label,
        ]),
        value: item.key,
      },
    },
  ]);
};

// Mock send message
watch(loading, val => {
  if (val) {
    const timer = setTimeout(() => {
      loading.value = false;
      message.success("Send message successfully!");
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }
});

const onSubmit: SenderProps["onSubmit"] = (v, _, skill) => {
  loading.value = true;
  message.info(`Send message: ${skill?.value} | ${v}`);
  senderRef.value?.clear?.();
};

const onSubmitZh: SenderProps["onSubmit"] = (v, _, skill) => {
  loading.value = true;
  message.info(`Send message: ${skill?.value} | ${v}`);
  senderZhRef.value?.clear?.();
};

const onCancel = () => {
  loading.value = false;
  message.error("Cancel sending!");
};
</script>

<template>
  <a-flex vertical gap="middle">
    <ax-sender
      ref="senderRef"
      :loading="loading"
      :skill="slotConfig.skill"
      placeholder="Press Enter to send message"
      :suffix="false"
      :slot-config="slotConfig.slotConfig"
      :auto-size="{ minRows: 3, maxRows: 6 }"
      :on-submit="onSubmit"
      :on-cancel="onCancel"
    >
      <template #footer="{ defaultNode }">
        <a-flex justify="space-between" align="center">
          <a-flex gap="small" align="center">
            <a-button :style="IconStyle" type="text">
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
                  <span :style="SwitchTextStyle">on</span>
                </div>
              </template>
              <template #unCheckedChildren>
                <div>
                  Deep Think:
                  <span :style="SwitchTextStyle">off</span>
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
            <a-button type="text" :style="IconStyle">
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
    <ax-sender
      ref="senderZhRef"
      :loading="loading"
      :skill="slotConfig.zh_skill"
      placeholder=""
      :suffix="false"
      :slot-config="slotConfig.zh_slotConfig"
      :auto-size="{ minRows: 3, maxRows: 6 }"
      :on-submit="onSubmitZh"
      :on-cancel="onCancel"
    >
      <template #footer="{ defaultNode }">
        <a-flex justify="space-between" align="center">
          <a-flex gap="small" align="center">
            <a-button :style="IconStyle" type="text">
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
                  深度搜索：
                  <span :style="SwitchTextStyle">开启</span>
                </div>
              </template>
              <template #unCheckedChildren>
                <div>
                  深度搜索：
                  <span :style="SwitchTextStyle">关闭</span>
                </div>
              </template>
            </ax-sender-switch>
            <a-dropdown
              :menu="{
                selectedKeys: [activeAgentKey],
                onClick: agentItemClick,
                items: zhAgentItems,
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
                功能应用
              </ax-sender-switch>
            </a-dropdown>
            <a-dropdown
              v-if="fileItems.length"
              :menu="{
                onClick: (item: { key: string }) => fileItemClick(item, 'zh'),
                items: zhFileItems,
              }"
            >
              <template #iconRender="{ key }">
                <FileImageOutlined v-if="key === 'file_image'" />
              </template>
              <ax-sender-switch :value="false">
                <template #icon>
                  <ProfileOutlined />
                </template>
                文件引用
              </ax-sender-switch>
            </a-dropdown>
          </a-flex>
          <a-flex align="center">
            <a-button type="text" :style="IconStyle">
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
  </a-flex>
</template>

<docs lang="zh-CN">
智能体输入框。
</docs>

<docs lang="en-US">
Agent input box.
</docs>
