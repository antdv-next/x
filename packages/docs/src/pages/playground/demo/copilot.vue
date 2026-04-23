<script setup lang="ts">
import type {
  AttachmentsProps,
  BubbleListProps,
  BubbleListRef,
  ConversationItemType,
  SuggestionItem,
  XProviderProps,
  SenderRef,
} from "@antdv-next/x";
import type { ComponentProps } from "@antdv-next/x-markdown";
import type {
  DefaultMessageInfo,
  SSEFields,
  XModelMessage,
  XModelParams,
  XModelResponse,
} from "@antdv-next/x-sdk";

import {
  AppstoreAddOutlined,
  CloseOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  CopyOutlined,
  LikeOutlined,
  OpenAIOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  ReloadOutlined,
  ScheduleOutlined,
} from "@antdv-next/icons";
import {
  ActionsCopy,
  Attachments,
  BubbleList,
  Conversations,
  Prompts,
  Sender,
  Suggestion,
  Think,
  Welcome,
  XProvider,
} from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import {
  DeepSeekChatProvider,
  useXChat,
  useXConversations,
  XRequest,
} from "@antdv-next/x-sdk";
import {
  Badge,
  Button,
  Flex,
  Image,
  Popover,
  Space,
  message,
} from "antdv-next";
import enUS from "antdv-next/dist/locale/en_US";
import zhCN from "antdv-next/dist/locale/zh_CN";
import { createStyles } from "antdv-style";
import dayjs from "dayjs";
import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from "vue";
import "@antdv-next/x-markdown/themes/dark.css";
import "@antdv-next/x-markdown/themes/light.css";
import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

type AttachmentItem = {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  url?: string;
  percent?: number;
  originFileObj?: File;
};

const BASE_URL = "https://api.x.ant.design/api/big_model_glm-4.5-flash";
const MODEL = "glm-4.5-flash";

const useStyles = createStyles(({ token, css }) => ({
  wrapper: css`
    width: 100%;
    height: 760px;
    display: flex;
    overflow: hidden;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  workarea: css`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: ${token.colorBgLayout};
  `,
  workareaHeader: css`
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px 0 24px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
  `,
  workareaTitle: css`
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  openCopilotButton: css`
    height: 30px;
    padding-inline: 14px;
    border-radius: 999px;
    background: linear-gradient(90deg, #ff7a45 0%, #3f87ff 100%);
    color: #fff;
    border: 0;

    &:hover,
    &:focus {
      color: #fff !important;
      opacity: 0.92;
    }
  `,
  workareaBody: css`
    flex: 1;
    min-height: 0;
    padding: 18px;
  `,
  articleCard: css`
    height: 100%;
    overflow: auto;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    padding: 24px;
    box-sizing: border-box;
  `,
  articleText: css`
    color: ${token.colorText};
    line-height: 1.75;

    h3 {
      margin: 18px 0 10px;
      font-size: 18px;
    }

    p {
      margin: 0 0 14px;
    }

    ul {
      margin: 0;
      padding-inline-start: 20px;
    }
  `,
  copilot: css`
    width: 420px;
    min-width: 420px;
    display: flex;
    flex-direction: column;
    background: ${token.colorBgContainer};
    border-inline-start: 1px solid ${token.colorBorderSecondary};
    transition:
      width 0.2s ease,
      min-width 0.2s ease;

    .ant-bubble-content-updating {
      background-image: linear-gradient(
        90deg,
        #ff6b23 0%,
        #af3cb8 31%,
        #53b6ff 89%
      );
      background-size: 100% 2px;
      background-repeat: no-repeat;
      background-position: bottom;
    }

    @media (max-width: 1100px) {
      width: 360px;
      min-width: 360px;
    }
  `,
  copilotCollapsed: css`
    width: 0;
    min-width: 0;
    border-inline-start: 0;
    overflow: hidden;
  `,
  copilotHeader: css`
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 10px 0 16px;
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  copilotTitle: css`
    font-size: 15px;
    font-weight: 600;
    color: ${token.colorText};
  `,
  headerIconButton: css`
    font-size: 18px;
    color: ${token.colorTextSecondary};
  `,
  conversationList: css`
    width: 280px;
    max-height: 420px;
    overflow: auto;

    .ant-conversations-list {
      padding-inline-start: 0;
    }
  `,
  messageArea: css`
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 16px;
  `,
  welcomeCard: css`
    margin-bottom: 16px;
    padding: 12px 16px;
    border-radius: 16px;
    background: ${token.colorBgTextHover};
  `,
  prompts: css`
    .ant-prompts-title {
      font-size: 14px;
    }
  `,
  senderArea: css`
    padding: 12px 16px 16px;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
  quickActions: css`
    margin-bottom: 12px;
  `,
  footerActions: css`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
}));

const { locale: docsLocale } = useLocale();
const { isDark } = useDarkMode();
const { styles, cx } = useStyles();

const xProviderLocale = computed<XProviderProps["locale"]>(() =>
  docsLocale.value === "zh-CN" ? zhCN : enUS,
);

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const t = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    title: "Antdv Next X",
    copilot: isCN ? "AI 助手" : "AI Copilot",
    newSession: isCN ? "新会话" : "New session",
    today: isCN ? "今天" : "Today",
    yesterday: isCN ? "昨天" : "Yesterday",
    current: isCN ? "当前" : "Current",
    noData: isCN ? "暂无数据" : "No data",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    requestFailed: isCN
      ? "请求失败，请稍后重试"
      : "Request failed, please try again",
    alreadyNewConversation: isCN
      ? "当前已经是新会话"
      : "It is already a new conversation",
    hello: isCN ? "你好，我是 Antdv Next X" : "Hello, I'm Antdv Next X",
    welcomeDescription: isCN
      ? "这是一个贴边工作区的助手式样板间，适合边阅读、边生成、边追问。"
      : "This is an assistant-style workspace for reading, generating, and iterating side by side.",
    iCanHelp: isCN
      ? "我可以帮你处理这些问题"
      : "I can help with these questions",
    askOrInputSkills: isCN
      ? "提问或输入 / 使用技能"
      : "Ask a question or type / for skills",
    uploadFile: isCN ? "上传文件" : "Upload File",
    uploadFiles: isCN ? "上传文件" : "Upload files",
    dropFileHere: isCN ? "将文件拖到此处" : "Drop file here",
    clickOrDrag: isCN
      ? "点击或拖拽文件到这里上传"
      : "Click or drag files to this area to upload",
    upgraded: isCN
      ? "Antdv Next X 有哪些升级？"
      : "What has Antdv Next X upgraded?",
    components: isCN
      ? "Antdv Next X 中有哪些组件？"
      : "What components are in Antdv Next X?",
    install: isCN
      ? "如何快速安装和导入组件？"
      : "How do I quickly install and import components?",
    rich: isCN ? "什么是 RICH 设计范式？" : "What is the RICH design paradigm?",
    report: isCN ? "写一份总结" : "Write a summary",
    draw: isCN ? "帮我画一张图" : "Draw an illustration",
    knowledge: isCN ? "查一点知识" : "Check some knowledge",
    aboutVue: isCN ? "关于 Vue" : "About Vue",
    aboutAntdv: isCN ? "关于 Antdv Next X" : "About Antdv Next X",
    upgradesShort: isCN ? "升级" : "Upgrades",
    componentsShort: isCN ? "组件" : "Components",
    more: isCN ? "更多" : "More",
    thinking: isCN ? "深度思考中" : "Deep thinking",
    thinkingDone: isCN ? "思考完成" : "Thinking complete",
    articleTitle: isCN ? "RICH 设计范式" : "RICH Design Paradigm",
    articleLead: isCN
      ? "RICH 是 Ant Design 团队提出的一套 AI 界面设计范式，关注界面如何同时支持自然对话、执行反馈、上下文组织和面向结果的协作。"
      : "RICH is an AI interface design paradigm proposed by the Ant Design team, focused on natural dialogue, execution feedback, context organization, and outcome-oriented collaboration.",
    articleP1: isCN
      ? "它不是单个组件，而是一种用于组织 AI 产品交互方式的方法论。对于带助手侧栏的工作区来说，RICH 可以帮助我们把信息阅读、问题追问和结果产出放在同一个连续上下文里。"
      : "It is not a single component but a way to organize AI product interactions. In a workspace with a side copilot, RICH keeps reading, follow-up questions, and output generation in one continuous context.",
    articleP2: isCN
      ? "当用户浏览内容时，助手应该始终在旁边待命，能够理解当前任务、读取最近输入，并快速提供结构化回复。"
      : "While the user browses content, the assistant should stay nearby, understand the current task, read recent inputs, and respond in a structured way.",
    articleList1: isCN
      ? "对话入口始终可见，降低切换成本"
      : "Keep the dialogue entry visible to reduce context switching",
    articleList2: isCN
      ? "把消息、附件和提示词放进同一发送区"
      : "Combine messages, attachments, and prompt shortcuts in one composer",
    articleList3: isCN
      ? "通过会话历史保留不同任务的上下文"
      : "Preserve task context through conversation history",
  };
});

const defaultConversations = computed<ConversationItemType[]>(() => [
  {
    key: "session-0",
    label: t.value.newSession,
    group: t.value.today,
  },
  {
    key: "session-1",
    label: t.value.upgraded,
    group: t.value.today,
  },
  {
    key: "session-2",
    label: t.value.install,
    group: t.value.yesterday,
  },
]);

const historyMessages = computed<
  Record<string, DefaultMessageInfo<XModelMessage>[]>
>(() => ({
  "session-1": [
    {
      message: { role: "user", content: t.value.upgraded },
      status: "success",
    },
    {
      message: {
        role: "assistant",
        content:
          docsLocale.value === "zh-CN"
            ? `# Antdv Next X 的升级\n\n- 提供更完整的对话、附件、会话管理与 Markdown 渲染能力\n- 通过 \`useXChat\` 和 \`useXConversations\` 统一状态\n- 可以更容易地构建助手式、工作台式和多会话 AI 界面`
            : `# What's new in Antdv Next X\n\n- More complete building blocks for chat, attachments, conversations, and Markdown rendering\n- Unified state orchestration through \`useXChat\` and \`useXConversations\`\n- Easier construction of copilot, workspace, and multi-session AI interfaces`,
      },
      status: "success",
    },
  ],
  "session-2": [
    {
      message: { role: "user", content: t.value.install },
      status: "success",
    },
    {
      message: {
        role: "assistant",
        content:
          docsLocale.value === "zh-CN"
            ? "先执行 `vp add @antdv-next/x @antdv-next/x-sdk`，然后按需引入 `Sender`、`BubbleList`、`Conversations` 等组件即可开始搭建。"
            : "Run `vp add @antdv-next/x @antdv-next/x-sdk` first, then import components like `Sender`, `BubbleList`, and `Conversations` as needed.",
      },
      status: "success",
    },
  ],
}));

function historyMessageFactory(conversationKey?: string) {
  if (!conversationKey) {
    return [];
  }

  return historyMessages.value[conversationKey] || [];
}

const promptItems = computed(() =>
  [t.value.rich, t.value.upgraded, t.value.components].map(item => ({
    key: item,
    description: item,
  })),
);

const suggestionItems = computed<SuggestionItem[]>(() => [
  { label: t.value.report, value: "report" },
  { label: t.value.draw, value: "draw" },
  {
    label: t.value.knowledge,
    value: "knowledge",
    icon: h(OpenAIOutlined),
    children: [
      { label: t.value.aboutVue, value: "vue" },
      { label: t.value.aboutAntdv, value: "antdv-next-x" },
    ],
  },
]);

const providerCaches = new Map<string, DeepSeekChatProvider>();

function providerFactory(conversationKey: string) {
  const cached = providerCaches.get(conversationKey);

  if (cached) {
    return cached;
  }

  const provider = new DeepSeekChatProvider({
    request: XRequest<XModelParams, Partial<Record<SSEFields, XModelResponse>>>(
      BASE_URL,
      {
        manual: true,
        params: {
          stream: true,
          thinking: {
            type: "disabled",
          },
          model: MODEL,
        },
      },
    ),
  });

  providerCaches.set(conversationKey, provider);
  return provider;
}

const copilotOpen = ref(true);
const inputValue = ref("");
const attachmentsOpen = ref(false);
const attachedFiles = ref<AttachmentItem[]>([]);
const senderRef = ref<SenderRef>();
const listRef = ref<BubbleListRef>();
const activeProvider = shallowRef(providerFactory("session-0"));

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
  getConversation,
  setConversation,
} = useXConversations({
  defaultConversations: defaultConversations,
  defaultActiveConversationKey: "session-0",
});

watch(
  activeConversationKey,
  value => {
    activeProvider.value = providerFactory(String(value));
  },
  { immediate: true },
);

const { onRequest, messages, isRequesting, abort, onReload } = useXChat<
  XModelMessage,
  XModelMessage,
  XModelParams,
  Partial<Record<SSEFields, XModelResponse>>
>({
  provider: activeProvider,
  conversationKey: activeConversationKey,
  defaultMessages: (info?: { conversationKey?: string }) =>
    historyMessageFactory(info?.conversationKey),
  requestPlaceholder: () => ({
    content: t.value.noData,
    role: "assistant",
  }),
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    if (error.name === "AbortError") {
      return {
        content:
          typeof messageInfo?.message?.content === "string"
            ? messageInfo.message.content
            : t.value.requestAborted,
        role: "assistant",
      };
    }

    return {
      content: errorInfo?.error?.message || t.value.requestFailed,
      role: "assistant",
    };
  },
});

watch(activeConversationKey, () => {
  inputValue.value = "";
  attachmentsOpen.value = false;
});

onBeforeUnmount(() => {
  attachedFiles.value.forEach(item => {
    if (item.url?.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
    }
  });
});

function handleSubmit(content: string) {
  const value = content.trim();

  if (!value) {
    return;
  }

  onRequest({
    messages: [{ role: "user", content: value }],
  });

  const conversation = getConversation(activeConversationKey.value);
  if (conversation?.label === t.value.newSession) {
    setConversation(activeConversationKey.value, {
      ...conversation,
      label: value.slice(0, 24),
    });
  }

  inputValue.value = "";

  nextTick(() => {
    listRef.value?.scrollTo({ top: "bottom" });
  });
}

function handleCreateConversation() {
  if (messages.value.length === 0) {
    message.error(t.value.alreadyNewConversation);
    return;
  }

  const key = dayjs().valueOf().toString();
  addConversation({
    key,
    label: t.value.newSession,
    group: t.value.today,
  });
  setActiveConversationKey(key);
}

function handleAttachmentChange({
  file,
  fileList,
}: {
  file: AttachmentItem;
  fileList: AttachmentItem[];
}) {
  attachedFiles.value = fileList.map(item => {
    if (
      item.uid === file.uid &&
      file.status !== "removed" &&
      item.originFileObj
    ) {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }

      return {
        ...item,
        url: URL.createObjectURL(item.originFileObj),
      };
    }

    return item;
  });
}

function onPasteFile(files: FileList) {
  const next = Array.from(files).map((file, index) => ({
    uid: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    status: "done" as const,
    percent: 100,
    originFileObj: file,
    url: URL.createObjectURL(file),
  }));

  attachedFiles.value = [...attachedFiles.value, ...next];
  attachmentsOpen.value = true;
}

function handleSuggestionSelect(value: string) {
  inputValue.value = `[${value}]: `;
}

function handleSenderChange(
  value: string,
  onTrigger: (info?: string | false) => void,
) {
  onTrigger(value === "/" ? value : false);
  inputValue.value = value;
}

const attachmentPlaceholder = (type: "inline" | "drop") =>
  type === "drop"
    ? {
        title: t.value.dropFileHere,
      }
    : {
        icon: h(CloudUploadOutlined),
        title: t.value.uploadFiles,
        description: t.value.clickOrDrag,
      };

const thinkComponent = defineComponent({
  name: "CopilotThinkComponent",
  props: {
    streamStatus: {
      type: String as () => ComponentProps["streamStatus"],
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const title = computed(() =>
      props.streamStatus === "done"
        ? t.value.thinkingDone
        : `${t.value.thinking}...`,
    );
    const loading = computed(() => props.streamStatus !== "done");

    return () =>
      h(
        Think,
        {
          title: title.value,
          loading: loading.value,
        },
        slots,
      );
  },
});

const bubbleItems = computed<BubbleListProps["items"]>(() =>
  messages.value.map(info => ({
    ...info.message,
    key: info.id,
    status: info.status,
    loading: info.status === "loading",
  })),
);

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start",
    footer: (content: string, info) =>
      h(Flex, { gap: 4, class: styles.footerActions }, () => [
        h(Button, {
          type: "text",
          size: "small",
          icon: h(ReloadOutlined),
          onClick: () => {
            if (info.key) {
              onReload(info.key, { userAction: "retry" });
            }
          },
        }),
        h(ActionsCopy, {
          text: content,
        }),
        h(Button, {
          type: "text",
          size: "small",
          icon: h(LikeOutlined),
          onClick: () => {
            message.success("Thanks for the feedback");
          },
        }),
      ]),
    contentRender: (content: string, info) =>
      h(XMarkdown, {
        content: content.replace(/\n\n/g, "<br/><br/>"),
        className: markdownClass.value,
        paragraphTag: "div",
        components: {
          think: (props: ComponentProps) => h(thinkComponent, props),
        },
        streaming: {
          hasNextChunk: info.status === "loading" || info.status === "updating",
          enableAnimation: true,
        },
      }),
  },
  user: {
    placement: "end",
  },
}));

const senderHeader = () =>
  h(
    Sender.Header,
    {
      title: t.value.uploadFile,
      open: attachmentsOpen.value,
      onOpenChange: (value: boolean) => {
        attachmentsOpen.value = value;
      },
      styles: {
        content: {
          padding: 0,
        },
      },
    },
    {
      default: () =>
        h(Attachments, {
          beforeUpload: () => false,
          items: attachedFiles.value as AttachmentsProps["items"],
          onChange: handleAttachmentChange,
          placeholder: attachmentPlaceholder,
          getDropContainer: () => senderRef.value?.nativeElement,
        }),
    },
  );

const senderPrefix = () =>
  h(
    Badge,
    {
      dot: attachedFiles.value.length > 0 && !attachmentsOpen.value,
    },
    {
      default: () =>
        h(Button, {
          type: "text",
          icon: h(PaperClipOutlined),
          onClick: () => {
            attachmentsOpen.value = !attachmentsOpen.value;
          },
        }),
    },
  );

const conversationItems = computed(() =>
  conversations.value.map(item => ({
    ...item,
    label:
      item.key === activeConversationKey.value
        ? `[${t.value.current}] ${item.label}`
        : item.label,
  })),
);
</script>

<template>
  <XProvider :locale="xProviderLocale">
    <div :class="styles.wrapper">
      <div :class="styles.workarea">
        <div :class="styles.workareaHeader">
          <div :class="styles.workareaTitle">
            <img
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
              alt="Antdv Next X"
              width="20"
              height="20"
            />
            <span>{{ t.title }}</span>
          </div>

          <Button
            v-if="!copilotOpen"
            :class="styles.openCopilotButton"
            @click="copilotOpen = true"
          >
            {{ `✨ ${t.copilot}` }}
          </Button>
        </div>

        <div :class="styles.workareaBody">
          <div :class="styles.articleCard">
            <Image
              src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*48RLR41kwHIAAAAAAAAAAAAADgCCAQ/fmt.webp"
              :preview="false"
            />

            <div :class="styles.articleText">
              <h3>{{ t.articleTitle }}</h3>
              <p>{{ t.articleLead }}</p>
              <p>{{ t.articleP1 }}</p>
              <p>{{ t.articleP2 }}</p>
              <ul>
                <li>{{ t.articleList1 }}</li>
                <li>{{ t.articleList2 }}</li>
                <li>{{ t.articleList3 }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div :class="cx(styles.copilot, !copilotOpen && styles.copilotCollapsed)">
        <div :class="styles.copilotHeader">
          <div :class="styles.copilotTitle">{{ `✨ ${t.copilot}` }}</div>

          <Space size="small">
            <Button
              type="text"
              :class="styles.headerIconButton"
              :icon="h(PlusOutlined)"
              @click="handleCreateConversation"
            />
            <Popover placement="bottomRight" trigger="click">
              <template #content>
                <Conversations
                  :class="styles.conversationList"
                  :items="conversationItems"
                  :active-key="activeConversationKey"
                  groupable
                  :on-active-change="setActiveConversationKey"
                />
              </template>
              <Button
                type="text"
                :class="styles.headerIconButton"
                :icon="h(CommentOutlined)"
              />
            </Popover>
            <Button
              type="text"
              :class="styles.headerIconButton"
              :icon="h(CloseOutlined)"
              @click="copilotOpen = false"
            />
          </Space>
        </div>

        <div :class="styles.messageArea">
          <template v-if="messages.length">
            <BubbleList ref="listRef" :items="bubbleItems" :role="roleConfig" />
          </template>
          <template v-else>
            <Welcome
              variant="borderless"
              :title="`👋 ${t.hello}`"
              :description="t.welcomeDescription"
              :class="styles.welcomeCard"
            />
            <Prompts
              vertical
              :title="t.iCanHelp"
              :items="promptItems"
              :class="styles.prompts"
              @item-click="
                info => handleSubmit(String(info?.data?.description || ''))
              "
            />
          </template>
        </div>

        <div :class="styles.senderArea">
          <Flex :class="styles.quickActions" gap="small" wrap>
            <Button
              :icon="h(ScheduleOutlined)"
              @click="handleSubmit(t.upgraded)"
            >
              {{ t.upgradesShort }}
            </Button>
            <Button
              :icon="h(ProductOutlined)"
              @click="handleSubmit(t.components)"
            >
              {{ t.componentsShort }}
            </Button>
            <Button :icon="h(AppstoreAddOutlined)">
              {{ t.more }}
            </Button>
          </Flex>

          <Suggestion :items="suggestionItems" @select="handleSuggestionSelect">
            <template #default="{ onTrigger, onKeyDown }">
              <Sender
                ref="senderRef"
                :loading="isRequesting"
                :value="inputValue"
                :header="senderHeader"
                :prefix="senderPrefix"
                :allow-speech="true"
                :placeholder="t.askOrInputSkills"
                :on-change="value => handleSenderChange(value, onTrigger)"
                :on-key-down="onKeyDown"
                :on-submit="handleSubmit"
                :on-cancel="abort"
                :on-paste-file="onPasteFile"
              />
            </template>
          </Suggestion>
        </div>
      </div>
    </div>
  </XProvider>
</template>

<docs lang="zh-CN">
助手式样板间，采用贴边 Copilot 面板布局，适合边看内容边追问与生成。
</docs>

<docs lang="en-US">
Assistant-style playground with a docked copilot panel for reading, asking, and generating side by side.
</docs>
