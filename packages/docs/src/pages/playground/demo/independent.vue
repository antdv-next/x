<script setup lang="ts">
import type {
  ActionsFeedbackProps,
  AttachmentsProps,
  BubbleListProps,
  BubbleListRef,
  ConversationItemType,
  ConversationsProps,
  PromptsProps,
  SenderRef,
  ThoughtChainItemProps,
  XProviderProps,
} from "@antdv-next/x";
import type { ComponentProps } from "@antdv-next/x-markdown";
import type {
  DefaultMessageInfo,
  MessageInfo,
  SSEFields,
  XModelMessage,
  XModelParams,
  XModelResponse,
} from "@antdv-next/x-sdk";

import {
  AppstoreAddOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  HeartOutlined,
  LinkOutlined,
  PaperClipOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  SmileOutlined,
  SyncOutlined,
} from "@antdv-next/icons";
import {
  Actions,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  Attachments,
  BubbleList,
  Conversations,
  Prompts,
  Sender,
  Think,
  ThoughtChain,
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
  Avatar,
  Badge,
  Button,
  Flex,
  Pagination,
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
  isVNode,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from "vue";
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/dark.css";
import "@antdv-next/x-markdown/themes/light.css";
import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

interface ChatMessage extends XModelMessage {
  extraInfo?: {
    feedback?: ActionsFeedbackProps["value"];
  };
}

type AttachmentItem = {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  url?: string;
  percent?: number;
  originFileObj?: File & {
    uid?: string;
    lastModifiedDate?: Date;
  };
};

const BASE_URL = "https://api.x.ant.design/api/big_model_glm-4.5-flash";
const MODEL = "glm-4.5-flash";

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    width: 100%;
    height: 760px;
    display: flex;
    background: ${token.colorBgContainer};
    font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
  `,
  sider: css`
    background: ${token.colorBgLayout}80;
    width: 280px;
    display: flex;
    flex-direction: column;
    padding: 0 12px;
    box-sizing: border-box;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
  `,
  logo: css`
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 0 24px;
    box-sizing: border-box;
    gap: 8px;
    margin: 24px 0;

    span {
      font-weight: bold;
      color: ${token.colorText};
      font-size: 16px;
    }
  `,
  conversations: css`
    overflow-y: auto;
    margin-top: 12px;
    padding: 0;
    flex: 1;

    .ant-conversations-list {
      padding-inline-start: 0;
    }
  `,
  sideFooter: css`
    border-top: 1px solid ${token.colorBorderSecondary};
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  chat: css`
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-block: ${token.paddingLG}px;

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
  `,
  chatPrompt: css`
    .ant-prompts-label {
      color: #000000e0 !important;
    }

    .ant-prompts-desc,
    .ant-prompts-icon {
      color: #000000a6 !important;
    }

    .ant-prompts-desc {
      width: 100%;
    }
  `,
  chatList: css`
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    min-height: 0;
  `,
  placeholder: css`
    width: 100%;
    padding: ${token.paddingLG}px;
    box-sizing: border-box;
  `,
  sender: css`
    width: 100%;
    max-width: 840px;
    margin: 0 auto;
  `,
  senderPrompt: css`
    width: 100%;
    max-width: 840px;
    margin: 0 auto;
    color: ${token.colorText};
  `,
}));

const { locale: docsLocale } = useLocale();
const { isDark } = useDarkMode();
const { styles } = useStyles();

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const locale = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    title: "Antdv Next X",
    whatIsAntdvNextX: isCN ? "什么是 Antdv Next X？" : "What is Antdv Next X?",
    howToQuicklyInstallAndImportComponents: isCN
      ? "如何快速安装和导入组件？"
      : "How to quickly install and import components?",
    newAgiHybridInterface: isCN
      ? "新的 AGI 混合界面"
      : "New AGI Hybrid Interface",
    today: isCN ? "今天" : "Today",
    yesterday: isCN ? "昨天" : "Yesterday",
    hotTopics: isCN ? "热门话题" : "Hot Topics",
    designGuide: isCN ? "设计指南" : "Design Guide",
    intention: isCN ? "意图" : "Intention",
    role: isCN ? "角色" : "Role",
    chat: isCN ? "对话" : "Chat",
    interface: isCN ? "界面" : "Interface",
    upgrades: isCN ? "升级" : "Upgrades",
    components: isCN ? "组件" : "Components",
    richGuide: isCN ? "RICH 指南" : "RICH Guide",
    installationIntroduction: isCN ? "安装介绍" : "Installation Introduction",
    whatHasAntdvNextXUpgraded: isCN
      ? "Antdv Next X 有哪些升级？"
      : "What has Antdv Next X upgraded?",
    whatComponentsAreInAntdvNextX: isCN
      ? "Antdv Next X 中有哪些组件？"
      : "What components are in Antdv Next X?",
    comeAndDiscoverNewDesignParadigm: isCN
      ? "快来发现 AI 时代的新设计范式。"
      : "Come and discover the new design paradigm of the AI era.",
    rename: isCN ? "重命名" : "Rename",
    delete: isCN ? "删除" : "Delete",
    uploadFile: isCN ? "上传文件" : "Upload File",
    dropFileHere: isCN ? "将文件拖到此处" : "Drop file here",
    uploadFiles: isCN ? "上传文件" : "Upload files",
    clickOrDragFilesToUpload: isCN
      ? "点击或将文件拖到此处上传"
      : "Click or drag files to this area to upload",
    askOrInputUseSkills: isCN
      ? "提问或输入 / 使用技能"
      : "Ask or input / use skills",
    aiUnderstandsUserNeedsAndProvidesSolutions: isCN
      ? "AI 理解用户需求并提供解决方案"
      : "AI understands user needs and provides solutions",
    aiPublicPersonAndImage: isCN
      ? "AI 的公众形象"
      : "AI public persona and image",
    howAICanExpressItselfWayUsersUnderstand: isCN
      ? "AI 如何以用户理解的方式表达自己"
      : "How AI Can Express Itself in a Way Users Understand",
    aiBalances: isCN
      ? 'AI 平衡 "聊天" 和 "执行" 行为'
      : 'AI balances "chat" and "do" behaviors',
    deepThinking: isCN ? "深度思考中" : "Deep Thinking",
    completeThinking: isCN ? "深度思考完成" : "Complete Thinking",
    modelIsRunning: isCN ? "正在调用模型" : "Model is running",
    modelExecutionCompleted: isCN
      ? "大模型执行完成"
      : "Model execution completed",
    executionFailed: isCN ? "执行失败" : "Execution failed",
    aborted: isCN ? "已经终止" : "Aborted",
    noData: isCN ? "暂无数据" : "No Data",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    requestFailed: isCN
      ? "请求失败，请重试！"
      : "Request failed, please try again!",
    newConversation: isCN ? "新对话" : "New Conversation",
    curConversation: isCN ? "当前对话" : "Current Conversation",
    itIsNowANewConversation: isCN
      ? "当前已经是新会话"
      : "It is now a new conversation.",
    isMock: isCN ? "当前为模拟功能" : "It is mock",
    retry: isCN ? "重新生成" : "Retry",
    welcome: isCN ? "你好，我是 Antdv Next X" : "Hello, I'm Antdv Next X",
    welcomeDescription: isCN
      ? "基于 Antdv Next 的 AGI 产品界面解决方案，打造更好的智能交互体验。"
      : "AGI product interface solution based on Antdv Next, creating a better intelligent interaction experience.",
  };
});

const xProviderLocale = computed<XProviderProps["locale"]>(() =>
  docsLocale.value === "zh-CN" ? zhCN : enUS,
);

const HISTORY_MESSAGES = computed<
  Record<string, DefaultMessageInfo<ChatMessage>[]>
>(() => ({
  "default-1": [
    {
      message: {
        role: "user",
        content: locale.value.howToQuicklyInstallAndImportComponents,
      },
      status: "success",
    },
    {
      message: {
        role: "assistant",
        content:
          docsLocale.value === "zh-CN"
            ? `# 快速安装和导入组件 \n\n
\`vp add @antdv-next/x @antdv-next/x-sdk\`

[查看文档](/components/introduce-cn/)

## 导入方式

\`\`\`ts \n
import { Bubble, Conversations, Sender } from "@antdv-next/x"; \n
import { useXChat } from "@antdv-next/x-sdk";
\`\`\`

## 适用场景

- 用 \`Bubble\` 渲染消息内容
- 用 \`Sender\` 搭建输入区
- 用 \`Conversations\` 管理多会话
- 用 \`useXChat\` 串起请求和消息状态`
            : `# Quickly Install And Import Components\n\n

\`vp add @antdv-next/x @antdv-next/x-sdk\`

[View docs](/components/introduce)

## Import

\`\`\`ts\n
import { Bubble, Conversations, Sender } from "@antdv-next/x";\n
import { useXChat } from "@antdv-next/x-sdk";
\`\`\`

## Typical usage

- Use \`Bubble\` to render messages
- Use \`Sender\` to build the input area
- Use \`Conversations\` for multi-session management
- Use \`useXChat\` to connect requests and message state`,
      },
      status: "success",
    },
  ],
  "default-2": [
    {
      message: {
        role: "user",
        content: locale.value.newAgiHybridInterface,
      },
      status: "success",
    },
    {
      message: {
        role: "assistant",
        content:
          docsLocale.value === "zh-CN"
            ? `# 新的 AGI 混合界面\n\n
Antdv Next X 将对话、工具调用、附件交互和会话管理组合成统一的 Playground 体验。

## 核心能力

- 会话侧边栏：支持新建、切换、删除会话
- 消息区域：支持 Markdown、思考链、流式更新
- 输入区域：支持提示词、附件面板、语音入口
- SDK 层：通过 \`useXChat\`、\`useXConversations\` 和 Provider 统一管理状态

## 设计价值

这种混合界面既保留了聊天的自然交互方式，又给执行型 AI 提供了更清晰的操作反馈和上下文组织能力。`
            : `# New AGI Hybrid Interface

Antdv Next X combines conversation, tool interaction, attachments, and session management into one unified playground experience.

## Core capabilities

- Conversation sidebar for creating, switching, and deleting sessions
- Message area with Markdown, thought chain, and streaming updates
- Input area with prompt shortcuts, attachments panel, and speech entry
- SDK layer powered by \`useXChat\`, \`useXConversations\`, and providers

## Design value

This hybrid interface keeps the natural flow of chat while giving execution-oriented AI clearer feedback loops and stronger context organization.`,
      },
      status: "success",
    },
  ],
}));

const DEFAULT_CONVERSATIONS = computed<ConversationItemType[]>(() => [
  {
    key: "default-0",
    label: locale.value.whatIsAntdvNextX,
    group: locale.value.today,
  },
  {
    key: "default-1",
    label: locale.value.howToQuicklyInstallAndImportComponents,
    group: locale.value.today,
  },
  {
    key: "default-2",
    label: locale.value.newAgiHybridInterface,
    group: locale.value.yesterday,
  },
]);

const HOT_TOPICS = computed<PromptsProps["items"]>(() => [
  {
    key: "1",
    label: locale.value.hotTopics,
    children: [
      {
        key: "1-1",
        description: locale.value.whatComponentsAreInAntdvNextX,
        icon: h("span", { style: { color: "#f93a4a", fontWeight: 700 } }, "1"),
      },
      {
        key: "1-2",
        description: locale.value.newAgiHybridInterface,
        icon: h("span", { style: { color: "#ff6565", fontWeight: 700 } }, "2"),
      },
      {
        key: "1-3",
        description: locale.value.whatComponentsAreInAntdvNextX,
        icon: h("span", { style: { color: "#ff8f1f", fontWeight: 700 } }, "3"),
      },
      {
        key: "1-4",
        description: locale.value.comeAndDiscoverNewDesignParadigm,
        icon: h(
          "span",
          { style: { color: "#00000040", fontWeight: 700 } },
          "4",
        ),
      },
      {
        key: "1-5",
        description: locale.value.howToQuicklyInstallAndImportComponents,
        icon: h(
          "span",
          { style: { color: "#00000040", fontWeight: 700 } },
          "5",
        ),
      },
    ],
  },
]);

const DESIGN_GUIDE = computed<PromptsProps["items"]>(() => [
  {
    key: "2",
    label: locale.value.designGuide,
    children: [
      {
        key: "2-1",
        icon: h(HeartOutlined),
        label: locale.value.intention,
        description: locale.value.aiUnderstandsUserNeedsAndProvidesSolutions,
      },
      {
        key: "2-2",
        icon: h(SmileOutlined),
        label: locale.value.role,
        description: locale.value.aiPublicPersonAndImage,
      },
      {
        key: "2-3",
        icon: h(CommentOutlined),
        label: locale.value.chat,
        description: locale.value.howAICanExpressItselfWayUsersUnderstand,
      },
      {
        key: "2-4",
        icon: h(PaperClipOutlined),
        label: locale.value.interface,
        description: locale.value.aiBalances,
      },
    ],
  },
]);

const SENDER_PROMPTS = computed<PromptsProps["items"]>(() => [
  {
    key: "1",
    description: locale.value.upgrades,
    icon: h(ScheduleOutlined),
  },
  {
    key: "2",
    description: locale.value.components,
    icon: h(ProductOutlined),
  },
  {
    key: "3",
    description: locale.value.richGuide,
    icon: h(FileSearchOutlined),
  },
  {
    key: "4",
    description: locale.value.installationIntroduction,
    icon: h(AppstoreAddOutlined),
  },
]);

const THOUGHT_CHAIN_CONFIG = computed<
  Record<string, { title: string; status: ThoughtChainItemProps["status"] }>
>(() => ({
  loading: {
    title: locale.value.modelIsRunning,
    status: "loading",
  },
  updating: {
    title: locale.value.modelIsRunning,
    status: "loading",
  },
  success: {
    title: locale.value.modelExecutionCompleted,
    status: "success",
  },
  error: {
    title: locale.value.executionFailed,
    status: "error",
  },
  abort: {
    title: locale.value.aborted,
    status: "abort",
  },
}));

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

function historyMessageFactory(
  conversationKey?: string,
): DefaultMessageInfo<ChatMessage>[] {
  if (!conversationKey) {
    return [];
  }

  return HISTORY_MESSAGES.value[conversationKey] || [];
}

const senderRef = ref<SenderRef>();
const listRef = ref<BubbleListRef>();
const inputValue = ref("");
const attachmentsOpen = ref(false);
const attachedFiles = ref<AttachmentItem[]>([]);
const activeProvider = shallowRef(providerFactory("default-0"));

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
  setConversations,
} = useXConversations({
  defaultConversations: DEFAULT_CONVERSATIONS,
  defaultActiveConversationKey: "default-0",
});

watch(
  activeConversationKey,
  value => {
    activeProvider.value = providerFactory(String(value));
  },
  { immediate: true },
);

const { onRequest, messages, isRequesting, abort, onReload, setMessage } =
  useXChat<
    ChatMessage,
    ChatMessage,
    XModelParams,
    Partial<Record<SSEFields, XModelResponse>>
  >({
    provider: activeProvider,
    conversationKey: activeConversationKey,
    defaultMessages: (info?: { conversationKey?: string }) =>
      historyMessageFactory(info?.conversationKey),
    requestPlaceholder: () => ({
      content: locale.value.noData,
      role: "assistant",
    }),
    requestFallback: (_, { error, errorInfo, messageInfo }) => {
      if (error.name === "AbortError") {
        return {
          content:
            typeof messageInfo?.message?.content === "string"
              ? messageInfo.message.content
              : locale.value.requestAborted,
          role: "assistant",
        };
      }

      return {
        content: errorInfo?.error?.message || locale.value.requestFailed,
        role: "assistant",
      };
    },
  });

watch(activeConversationKey, () => {
  senderRef.value?.clear();
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

function handleSubmit(value: string) {
  if (!value) {
    return;
  }

  onRequest({
    messages: [{ role: "user", content: value }],
  });

  nextTick(() => {
    listRef.value?.scrollTo({ top: "bottom" });
  });
}

function handleCreateConversation() {
  if (messages.value.length === 0) {
    message.error(locale.value.itIsNowANewConversation);
    return;
  }

  const now = dayjs().valueOf().toString();

  addConversation({
    key: now,
    label: `${locale.value.newConversation} ${conversations.value.length + 1}`,
    group: locale.value.today,
  });
  setActiveConversationKey(now);
}

function extractText(node: unknown): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node
      .map(item => extractText(item))
      .join("")
      .trim();
  }

  if (isVNode(node)) {
    return extractText(node.children);
  }

  return "";
}

function handlePromptClick(item?: { description?: unknown }) {
  const text = extractText(item?.description);

  if (!text) {
    return;
  }

  handleSubmit(text);
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

const attachmentPlaceholder = (type: "inline" | "drop") =>
  type === "drop"
    ? {
        title: locale.value.dropFileHere,
      }
    : {
        icon: h(CloudUploadOutlined),
        title: locale.value.uploadFiles,
        description: locale.value.clickOrDragFilesToUpload,
      };

const thinkComponent = defineComponent({
  name: "IndependentThinkComponent",
  props: {
    streamStatus: {
      type: String as () => ComponentProps["streamStatus"],
      default: undefined,
    },
    chatStatus: {
      type: String as () => MessageInfo<ChatMessage>["status"] | undefined,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const title = ref(`${locale.value.deepThinking}...`);
    const loading = ref(true);

    watch(
      () => [props.streamStatus, props.chatStatus, docsLocale.value],
      () => {
        if (props.streamStatus === "done") {
          title.value = locale.value.completeThinking;
          loading.value = false;
          return;
        }

        if (props.chatStatus === "abort") {
          title.value = locale.value.aborted;
          loading.value = false;
          return;
        }

        if (props.chatStatus === "error") {
          title.value = locale.value.executionFailed;
          loading.value = false;
          return;
        }

        title.value = `${locale.value.deepThinking}...`;
        loading.value = true;
      },
      { immediate: true },
    );

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

function footerItems(
  id?: string | number,
  content = "",
  status?: MessageInfo<ChatMessage>["status"],
  extraInfo?: ChatMessage["extraInfo"],
) {
  if (!id || status === "loading" || status === "updating") {
    return [];
  }

  return [
    {
      key: "pagination",
      actionRender: () =>
        h(Pagination, {
          simple: true,
          total: 1,
          pageSize: 1,
        }),
    },
    {
      key: "retry",
      label: locale.value.retry,
      icon: h(SyncOutlined),
      onItemClick: () => {
        onReload(id, {
          userAction: "retry",
        });
      },
    },
    {
      key: "copy",
      actionRender: () => h(ActionsCopy, { text: content }),
    },
    {
      key: "audio",
      actionRender: () =>
        h(ActionsAudio, {
          onClick: () => {
            message.info(locale.value.isMock);
          },
        }),
    },
    {
      key: "feedback",
      actionRender: () =>
        h(ActionsFeedback, {
          value: extraInfo?.feedback || "default",
          styles: {
            liked: {
              color: "#f759ab",
            },
          },
          onChange: (value: ActionsFeedbackProps["value"]) => {
            setMessage(id, {
              extraInfo: {
                feedback: value,
              },
            });
            message.success(`${id}: ${value}`);
          },
        }),
    },
  ];
}

const bubbleItems = computed<BubbleListProps["items"]>(() =>
  messages.value.map(info => ({
    ...info.message,
    key: info.id,
    status: info.status,
    loading: info.status === "loading",
    extraInfo: info.extraInfo,
  })),
);

const displayConversations = computed<ConversationsProps["items"]>(() =>
  conversations.value.map(({ key, label, ...rest }) => ({
    key,
    label:
      key === activeConversationKey.value
        ? `[${locale.value.curConversation}]${label}`
        : label,
    ...rest,
  })),
);

const roleConfig = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    placement: "start",
    header: (_: unknown, info: any) => {
      const config = THOUGHT_CHAIN_CONFIG.value[info.status];

      if (!config) {
        return null;
      }

      return h(ThoughtChain.Item, {
        style: {
          marginBottom: "8px",
        },
        status: config.status,
        variant: "solid",
        icon: h(GlobalOutlined),
        title: config.title,
      });
    },
    footer: (content: string, info: any) => {
      const items = footerItems(info.key, content, info.status, info.extraInfo);

      if (!items.length) {
        return null;
      }

      return h("div", { style: { display: "flex" } }, [h(Actions, { items })]);
    },
    contentRender: (content: string, info: any) =>
      h(XMarkdown, {
        content: content.replace(/\n\n/g, "<br/><br/>"),
        className: markdownClass.value,
        paragraphTag: "div",
        components: {
          think: (props: ComponentProps) =>
            h(thinkComponent, {
              ...props,
              chatStatus: info.status,
            }),
        },
        streaming: {
          hasNextChunk: info.status === "updating",
          enableAnimation: true,
        },
      }),
  },
  user: {
    placement: "end",
  },
}));

const menuConfig: ConversationsProps["menu"] = conversation => ({
  items: [
    {
      label: locale.value.rename,
      key: "rename",
      icon: h(EditOutlined),
    },
    {
      label: locale.value.delete,
      key: "delete",
      icon: h(DeleteOutlined),
      danger: true,
      onItemClick: () => {
        const nextList = conversations.value.filter(
          item => item.key !== conversation.key,
        );
        const nextKey = nextList[0]?.key;

        setConversations(nextList);

        if (conversation.key === activeConversationKey.value && nextKey) {
          setActiveConversationKey(nextKey);
        }
      },
    },
  ],
});

const senderHeader = () =>
  h(
    Sender.Header,
    {
      title: locale.value.uploadFile,
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
          icon: h(LinkOutlined),
          onClick: () => {
            attachmentsOpen.value = !attachmentsOpen.value;
          },
        }),
    },
  );
</script>

<template>
  <XProvider :locale="xProviderLocale">
    <div :class="styles.layout">
      <div :class="styles.sider">
        <div :class="styles.logo">
          <img
            src="https://x.antdv-next.com/x.svg"
            draggable="false"
            :alt="locale.title"
            width="24"
            height="24"
          />
          <span>{{ locale.title }}</span>
        </div>

        <Conversations
          :creation="{ onClick: handleCreateConversation }"
          :items="displayConversations"
          :class="styles.conversations"
          :active-key="activeConversationKey"
          :on-active-change="setActiveConversationKey"
          :menu="menuConfig"
          groupable
          :styles="{ item: { padding: '0 8px' } }"
        />

        <div :class="styles.sideFooter">
          <Avatar :size="24" />
          <Button type="text" :icon="h(QuestionCircleOutlined)" />
        </div>
      </div>

      <div :class="styles.chat">
        <div :class="styles.chatList">
          <BubbleList
            v-if="bubbleItems.length"
            :key="String(activeConversationKey)"
            ref="listRef"
            :items="bubbleItems"
            :role="roleConfig"
            :styles="{ root: { maxWidth: '940px' } }"
          />

          <Flex
            v-else
            vertical
            :gap="16"
            align="center"
            :class="styles.placeholder"
            :style="{ maxWidth: '840px' }"
          >
            <Welcome
              variant="borderless"
              icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
              :title="locale.welcome"
              :description="locale.welcomeDescription"
              :extra="
                h(Space, {}, () => [
                  h(Button, { icon: h(ShareAltOutlined) }),
                  h(Button, { icon: h(EllipsisOutlined) }),
                ])
              "
            />

            <Flex :gap="16" justify="center" :style="{ width: '100%' }">
              <Prompts
                :items="HOT_TOPICS"
                :styles="{
                  list: { height: '100%' },
                  item: {
                    flex: 1,
                    backgroundImage:
                      'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                    borderRadius: '12px',
                    border: 'none',
                  },
                  subItem: { padding: 0, background: 'transparent' },
                }"
                :class="styles.chatPrompt"
                @item-click="info => handlePromptClick(info.data)"
              />

              <Prompts
                :items="DESIGN_GUIDE"
                :styles="{
                  item: {
                    flex: 1,
                    backgroundImage:
                      'linear-gradient(123deg, #e5f4ff 0%, #efe7ff 100%)',
                    borderRadius: '12px',
                    border: 'none',
                  },
                  subItem: { background: '#ffffffa6' },
                }"
                :class="styles.chatPrompt"
                @item-click="info => handlePromptClick(info.data)"
              />
            </Flex>
          </Flex>
        </div>

        <Flex vertical :gap="12" align="center" :style="{ margin: '8px' }">
          <Prompts
            v-if="!attachmentsOpen"
            :items="SENDER_PROMPTS"
            :styles="{ item: { padding: '6px 12px' } }"
            :class="styles.senderPrompt"
            @item-click="info => handlePromptClick(info.data)"
          />

          <Sender
            ref="senderRef"
            :value="inputValue"
            :header="senderHeader"
            :prefix="senderPrefix"
            :loading="isRequesting"
            :class="styles.sender"
            :allow-speech="true"
            :placeholder="locale.askOrInputUseSkills"
            :on-change="(value: string) => (inputValue = value)"
            :on-submit="
              () => {
                handleSubmit(inputValue);
                inputValue = '';
              }
            "
            :on-cancel="abort"
          />
        </Flex>
      </div>
    </div>
  </XProvider>
</template>

<docs lang="zh-CN">
独立式多会话 playground，基于 `@antdv-next/x` 与 `@antdv-next/x-sdk` 的 Vue 实现。
</docs>

<docs lang="en-US">
Standalone multi-conversation playground built in Vue with `@antdv-next/x` and `@antdv-next/x-sdk`.
</docs>
