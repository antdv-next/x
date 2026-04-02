<script setup lang="ts">
import type {
  BubbleListProps,
  BubbleListRef,
  ConversationItemType,
  PromptsProps,
  ThoughtChainItemProps,
  XProviderProps,
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
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileSearchOutlined,
  GlobalOutlined,
  HeartOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  SmileOutlined,
  SyncOutlined,
} from "@antdv-next/icons";
import {
  Actions,
  ActionsCopy,
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
import { Avatar, Button, Flex, Pagination, Space, message } from "antdv-next";
import enUS from "antdv-next/dist/locale/en_US";
import zhCN from "antdv-next/dist/locale/zh_CN";
import { createStyles } from "antdv-style";
import dayjs from "dayjs";
import {
  computed,
  defineComponent,
  h,
  nextTick,
  ref,
  shallowRef,
  watch,
} from "vue";
import "@antdv-next/x-markdown/themes/dark.css";
import "@antdv-next/x-markdown/themes/light.css";
import { useDarkMode } from "@/composables/use-dark-mode";
import { useLocale } from "@/composables/use-locale";

const BASE_URL = "https://api.x.ant.design/api/big_model_glm-4.5-flash";
const MODEL = "glm-4.5-flash";

const useStyles = createStyles(({ token, css }) => ({
  layout: css`
    width: 100%;
    height: 760px;
    display: flex;
    overflow: hidden;
    border-radius: ${token.borderRadiusLG}px;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorderSecondary};
  `,
  sider: css`
    width: 280px;
    display: flex;
    flex-direction: column;
    padding: 0 12px;
    background: ${token.colorBgLayout}cc;
    border-inline-end: 1px solid ${token.colorBorderSecondary};
  `,
  senderWrapper: css`
    margin: 0 24px;
  `,
  logo: css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 24px;
    margin: 24px 0;

    span {
      font-size: 16px;
      font-weight: 600;
      color: ${token.colorText};
    }
  `,
  conversations: css`
    flex: 1;
    overflow-y: auto;
    margin-top: 12px;

    .ant-conversations-list {
      padding-inline-start: 0;
    }
  `,
  sideFooter: css`
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid ${token.colorBorderSecondary};
  `,
  chat: css`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
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
  chatList: css`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  `,
  placeholder: css`
    width: 100%;
    max-width: 880px;
    padding: 24px;
    box-sizing: border-box;
  `,
  promptGroup: css`
    flex: 1 1 0;
    min-width: 0;

    .ant-prompts-label {
      color: #000000e0 !important;
    }

    .ant-prompts-desc,
    .ant-prompts-icon {
      color: #000000a6 !important;
    }
  `,
  senderWrap: css`
    width: 100%;
    max-width: 840px;
    margin: 0 auto;
  `,
  senderPrompts: css`
    width: 100%;
    max-width: 840px;
    margin: 0 auto 12px;
  `,
  footerActions: css`
    display: flex;
  `,
}));

const { locale: docsLocale } = useLocale();
const { isDark } = useDarkMode();
const [messageApi, contextHolder] = message.useMessage();
const { styles } = useStyles();

const markdownClass = computed(() =>
  isDark.value ? "x-markdown-dark" : "x-markdown-light",
);

const xProviderLocale = computed<XProviderProps["locale"]>(() =>
  docsLocale.value === "zh-CN" ? zhCN : enUS,
);

const t = computed(() => {
  const isCN = docsLocale.value === "zh-CN";

  return {
    title: "Antdv Next X",
    whatIsTbox: isCN ? "什么是百宝箱 Tbox.cn?" : "What is Tbox.cn?",
    whatCanTboxDo: isCN ? "百宝箱可以做什么?" : "What can Tbox.cn do?",
    today: isCN ? "今天" : "Today",
    yesterday: isCN ? "昨天" : "Yesterday",
    hotTopics: isCN ? "最热话题" : "Hot Topics",
    designGuide: isCN ? "设计指南" : "Design Guide",
    intent: isCN ? "意图" : "Intent",
    role: isCN ? "角色" : "Role",
    dynamic: isCN ? "动态" : "Dynamic",
    component: isCN ? "组件" : "Component",
    guide: isCN ? "指南" : "Guide",
    tutorial: isCN ? "教程" : "Tutorial",
    rename: isCN ? "重命名" : "Rename",
    delete: isCN ? "删除" : "Delete",
    requestInProgress: isCN
      ? "请求正在进行中，请等待请求完成。"
      : "Request is in progress, please wait for completion.",
    demoButtonNoFunction: isCN
      ? "演示按钮，无实际功能"
      : "Demo button, no actual function",
    hello: isCN
      ? "你好，我是 Antdv Next X & 百宝箱智能体"
      : "Hello, I am the Antdv Next X & Tbox Agent",
    welcomeDescription: isCN
      ? "基于 Antdv Next 的 AGI 产品界面解决方案，结合百宝箱工具能力，帮助你完成资料检索、组件理解与方案整理。"
      : "An AGI interface experience built on Antdv Next, combined with toolbox-style agent capabilities for discovery, component understanding, and solution drafting.",
    askMeAnything: isCN ? "向我提问吧" : "Ask me anything...",
    thinking: isCN ? "深度思考中" : "Deep thinking",
    thinkingDone: isCN ? "深度思考完成" : "Deep thinking completed",
    abortedThinking: isCN ? "思考已中止" : "Thinking aborted",
    errorThinking: isCN ? "思考出错" : "Thinking error",
    noData: isCN ? "暂无数据" : "No data",
    modelRunning: isCN ? "正在调用模型" : "Model is running",
    modelDone: isCN ? "大模型执行完成" : "Model execution completed",
    modelFailed: isCN ? "执行失败" : "Execution failed",
    aborted: isCN ? "已经终止" : "Aborted",
    currentConversation: isCN ? "当前对话" : "Current Conversation",
    newConversation: isCN ? "新会话" : "New Conversation",
    alreadyNewConversation: isCN
      ? "当前已经是新会话"
      : "It is now a new conversation.",
    retry: isCN ? "重新生成" : "Retry",
    isMock: isCN ? "当前为模拟功能" : "This action is mocked",
    requestAborted: isCN ? "请求已中止" : "Request aborted",
    requestFailed: isCN
      ? "请求失败，请稍后重试"
      : "Request failed, please try again",
    aiUnderstandsUserNeeds: isCN
      ? "AI 理解用户需求并提供解决方案"
      : "AI understands user needs and provides solutions",
    aiPublicImage: isCN ? "AI 的公众形象" : "AI's public image",
  };
});

const defaultConversations = computed<ConversationItemType[]>(() => [
  {
    key: "default-0",
    label: t.value.whatIsTbox,
    group: t.value.today,
  },
  {
    key: "default-1",
    label: t.value.whatCanTboxDo,
    group: t.value.yesterday,
  },
]);

const historyMessages = computed<
  Record<string, DefaultMessageInfo<XModelMessage>[]>
>(() => ({
  "default-0": [
    {
      message: { role: "user", content: t.value.whatIsTbox },
      status: "success",
    },
    {
      message: {
        role: "assistant",
        content:
          docsLocale.value === "zh-CN"
            ? `# 百宝箱 Tbox.cn\n\n百宝箱可以理解为面向任务的智能体工具箱，适合把资料检索、内容整理、页面理解和工作流串联在一起。\n\n- 用会话保存不同任务上下文\n- 用工具型提示词缩短提问路径\n- 用结构化回复承接执行结果`
            : `# Tbox.cn\n\nTbox can be understood as a task-oriented agent toolbox for search, synthesis, page understanding, and workflow-style collaboration.\n\n- Preserve context with conversations\n- Shorten the path to action with tool-like prompts\n- Use structured responses to carry execution results`,
      },
      status: "success",
    },
  ],
  "default-1": [
    {
      message: { role: "user", content: t.value.whatCanTboxDo },
      status: "success",
    },
    {
      message: {
        role: "assistant",
        content:
          docsLocale.value === "zh-CN"
            ? `# 百宝箱可以做什么\n\n它更像一个围绕任务组织的智能工作台：\n\n- 帮你理解组件、文档和接口\n- 结合上下文连续追问\n- 在不同会话里保存不同主题的分析过程`
            : `# What can Tbox do\n\nIt behaves like a task-organized agent workspace:\n\n- Explain components, docs, and APIs\n- Support follow-up questions within context\n- Preserve analysis threads across separate conversations`,
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

const hotTopics = computed<PromptsProps["items"]>(() => [
  {
    key: "hot",
    label: t.value.hotTopics,
    children: [
      {
        key: "hot-1",
        description: t.value.whatIsTbox,
        icon: h("span", { style: { color: "#f93a4a", fontWeight: 700 } }, "1"),
      },
      {
        key: "hot-2",
        description: t.value.whatCanTboxDo,
        icon: h("span", { style: { color: "#ff6565", fontWeight: 700 } }, "2"),
      },
    ],
  },
]);

const designGuide = computed<PromptsProps["items"]>(() => [
  {
    key: "guide",
    label: t.value.designGuide,
    children: [
      {
        key: "guide-1",
        icon: h(HeartOutlined),
        label: t.value.intent,
        description: t.value.aiUnderstandsUserNeeds,
      },
      {
        key: "guide-2",
        icon: h(SmileOutlined),
        label: t.value.role,
        description: t.value.aiPublicImage,
      },
    ],
  },
]);

const senderPrompts = computed<PromptsProps["items"]>(() => [
  {
    key: "1",
    description: t.value.dynamic,
    icon: h(ScheduleOutlined),
  },
  {
    key: "2",
    description: t.value.component,
    icon: h(ProductOutlined),
  },
  {
    key: "3",
    description: t.value.guide,
    icon: h(FileSearchOutlined),
  },
  {
    key: "4",
    description: t.value.tutorial,
    icon: h(AppstoreAddOutlined),
  },
]);

const thoughtChainConfig = computed<
  Record<string, { title: string; status: ThoughtChainItemProps["status"] }>
>(() => ({
  loading: {
    title: t.value.modelRunning,
    status: "loading",
  },
  updating: {
    title: t.value.modelRunning,
    status: "loading",
  },
  success: {
    title: t.value.modelDone,
    status: "success",
  },
  error: {
    title: t.value.modelFailed,
    status: "error",
  },
  abort: {
    title: t.value.aborted,
    status: "abort",
  },
}));

const providerCaches = new Map<string, DeepSeekChatProvider>();

function providerFactory(conversationKey: string) {
  const cached = providerCaches.get(conversationKey);
  if (cached) return cached;

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

const inputValue = ref("");
const listRef = ref<BubbleListRef>();
const activeProvider = shallowRef(providerFactory("default-0"));

const {
  conversations,
  activeConversationKey,
  setActiveConversationKey,
  addConversation,
  setConversations,
} = useXConversations({
  defaultConversations,
  defaultActiveConversationKey: "default-0",
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

function handleSubmit(value: string) {
  const content = value.trim();
  if (!content) return;

  onRequest({
    messages: [{ role: "user", content }],
  });

  inputValue.value = "";
  nextTick(() => {
    listRef.value?.scrollTo({ top: "bottom" });
  });
}

function handleCreateConversation() {
  if (messages.value.length !== 0 || inputValue.value.trim()) {
    const now = dayjs().valueOf().toString();
    addConversation({
      key: now,
      label: `${t.value.newConversation} ${conversations.value.length + 1}`,
      group: t.value.today,
    });
    setActiveConversationKey(now);
    inputValue.value = "";
    return;
  }

  messageApi.error(t.value.alreadyNewConversation);
}

const thinkComponent = defineComponent({
  name: "TboxThinkComponent",
  props: {
    streamStatus: {
      type: String as () => ComponentProps["streamStatus"],
      default: undefined,
    },
    chatStatus: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const title = computed(() => {
      if (props.streamStatus === "done") return t.value.thinkingDone;
      if (props.chatStatus === "abort") return t.value.abortedThinking;
      if (props.chatStatus === "error") return t.value.errorThinking;
      return `${t.value.thinking}...`;
    });

    const loading = computed(
      () =>
        props.streamStatus !== "done" &&
        props.chatStatus !== "abort" &&
        props.chatStatus !== "error",
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
    header: (_: unknown, info) => {
      const config = thoughtChainConfig.value[info.status || ""];
      if (!config) return null;

      return h(ThoughtChain.Item, {
        style: { marginBottom: "8px" },
        status: config.status,
        variant: "solid",
        icon: h(GlobalOutlined),
        title: config.title,
      });
    },
    footer: (content: string, info) => {
      if (info.status === "loading" || info.status === "updating") return null;

      return h("div", { class: styles.footerActions }, [
        h(Actions, {
          items: [
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
              label: t.value.retry,
              icon: h(SyncOutlined),
              onItemClick: () => {
                if (info.key) {
                  onReload(info.key, { userAction: "retry" });
                }
              },
            },
            {
              key: "copy",
              actionRender: () => h(ActionsCopy, { text: content }),
            },
            {
              key: "more",
              label: "",
              icon: h(EllipsisOutlined),
              onItemClick: () => {
                messageApi.info(t.value.isMock);
              },
            },
          ],
        }),
      ]);
    },
    contentRender: (content: string, info) =>
      h(XMarkdown, {
        content,
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
          hasNextChunk: info.status === "updating" || info.status === "loading",
          enableAnimation: true,
        },
      }),
  },
  user: {
    placement: "end",
  },
}));

const conversationItems = computed(() =>
  conversations.value.map(({ key, label, ...rest }) => ({
    key,
    label:
      key === activeConversationKey.value
        ? `[${t.value.currentConversation}]${label}`
        : label,
    ...rest,
  })),
);

const menuConfig = computed(() => (conversation: ConversationItemType) => ({
  items: [
    {
      label: t.value.rename,
      key: "rename",
      icon: h(EditOutlined),
      onItemClick: () => {
        messageApi.info(t.value.demoButtonNoFunction);
      },
    },
    {
      label: t.value.delete,
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
}));
</script>

<template>
  <XProvider :locale="xProviderLocale">
    <div :class="styles.layout">
      <div :class="styles.sider">
        <div :class="styles.logo">
          <img
            src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
            alt="Antdv Next X"
            width="24"
            height="24"
          />
          <span>{{ t.title }}</span>
        </div>

        <Conversations
          :creation="{ onClick: handleCreateConversation }"
          :items="conversationItems"
          :class="styles.conversations"
          :active-key="activeConversationKey"
          groupable
          :on-active-change="setActiveConversationKey"
          :menu="menuConfig"
        />

        <div :class="styles.sideFooter">
          <Avatar :size="24" />
          <Button
            type="text"
            :icon="h(QuestionCircleOutlined)"
            @click="messageApi.info(t.demoButtonNoFunction)"
          />
        </div>
      </div>

      <div :class="styles.chat">
        <div :class="styles.chatList">
          <template v-if="messages.length">
            <BubbleList
              ref="listRef"
              :items="bubbleItems"
              :role="roleConfig"
              :styles="{ root: { maxWidth: '940px' } }"
            />
          </template>
          <template v-else>
            <Flex
              vertical
              gap="middle"
              align="center"
              :class="styles.placeholder"
            >
              <Welcome
                variant="borderless"
                icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                :title="t.hello"
                :description="t.welcomeDescription"
                :extra="
                  h(Space, null, {
                    default: () => [
                      h(Button, { icon: h(ShareAltOutlined) }),
                      h(Button, { icon: h(EllipsisOutlined) }),
                    ],
                  })
                "
              />

              <Flex
                gap="middle"
                :wrap="false"
                style="width: 100%; max-width: 840px"
              >
                <Prompts
                  :items="hotTopics"
                  :class="styles.promptGroup"
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
                  :on-item-click="
                    info => handleSubmit(String(info.data.description || ''))
                  "
                />

                <Prompts
                  :items="designGuide"
                  :class="styles.promptGroup"
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
                  :on-item-click="
                    info => handleSubmit(String(info.data.description || ''))
                  "
                />
              </Flex>
            </Flex>
          </template>
        </div>

        <div :class="styles.senderWrapper">
          <Prompts
            :items="senderPrompts"
            :class="styles.senderPrompts"
            :styles="{ item: { padding: '6px 12px' } }"
            :on-item-click="
              info => handleSubmit(String(info.data.description || ''))
            "
          />

          <div :class="styles.senderWrap">
            <Sender
              :value="inputValue"
              :on-change="value => (inputValue = value)"
              :on-submit="handleSubmit"
              :on-cancel="abort"
              :loading="isRequesting"
              :placeholder="t.askMeAnything"
            />
          </div>
        </div>
      </div>
    </div>
  </XProvider>

  <component :is="contextHolder" />
</template>

<docs lang="zh-CN">
百宝箱智能体样板间，适合展示左侧多会话、欢迎引导和工具型提示词的组合方式。
</docs>

<docs lang="en-US">
Toolbox agent playground with multi-session sidebar, guided welcome state, and tool-oriented prompts.
</docs>
