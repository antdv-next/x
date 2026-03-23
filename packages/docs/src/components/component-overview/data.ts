export type OverviewLocale = "zh-CN" | "en-US";

export interface ComponentOverviewItem {
  slug: string;
  path: string;
  title: string;
  subtitle: Partial<Record<OverviewLocale, string>>;
  description: Record<OverviewLocale, string>;
  group: Record<OverviewLocale, string>;
  groupOrder: number;
  cover: string;
  coverDark: string;
}

export const componentOverviewItems: ComponentOverviewItem[] = [
  {
    slug: "bubble",
    path: "/components/bubble",
    title: "Bubble",
    subtitle: {
      "zh-CN": "对话气泡",
    },
    description: {
      "zh-CN": "用于聊天的气泡组件。",
      "en-US": "A bubble component for chat.",
    },
    group: {
      "zh-CN": "通用",
      "en-US": "Common",
    },
    groupOrder: 0,
    cover:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*rHIYQIL1X-QAAAAAAAAAAAAADgCCAQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*uaGhTY1-LL0AAAAAAAAAAAAADgCCAQ/original",
  },
  {
    slug: "code-highlighter",
    path: "/components/code-highlighter",
    title: "CodeHighlighter",
    subtitle: {
      "zh-CN": "代码高亮",
    },
    description: {
      "zh-CN": "用于展示代码块的语法高亮组件。",
      "en-US": "A component for displaying syntax-highlighted code blocks.",
    },
    group: {
      "zh-CN": "反馈",
      "en-US": "Feedback",
    },
    groupOrder: 4,
    cover:
      "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/_KKkTrXq7wcAAAAAKuAAAAgADtFMAQFr/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/c62-S4SH1tUAAAAANuAAAAgADtFMAQFr/original",
  },
  {
    slug: "conversations",
    path: "/components/conversations",
    title: "Conversations",
    subtitle: {
      "zh-CN": "管理对话",
    },
    description: {
      "zh-CN": "用于切换多个智能体，更新对话轮次，对话历史切换",
      "en-US":
        "Used to switch between multiple agents, update conversation turns, and manage conversation history",
    },
    group: {
      "zh-CN": "通用",
      "en-US": "Common",
    },
    groupOrder: 0,
    cover:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*Oj-bTbVXtpQAAAAAAAAAAAAADgCCAQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*qwdtSKWXeikAAAAAAAAAAAAADgCCAQ/original",
  },
  {
    slug: "actions",
    path: "/components/actions",
    title: "Actions",
    subtitle: {
      "zh-CN": "操作列表",
    },
    description: {
      "zh-CN": "用于快速配置一些 AI 场景下所需要的操作按钮/功能。",
      "en-US":
        "Used for quickly configuring required action buttons or features in some AI scenarios.",
    },
    group: {
      "zh-CN": "反馈",
      "en-US": "Feedback",
    },
    groupOrder: 4,
    cover:
      "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/DAQYQqFa5n0AAAAAQFAAAAgADtFMAQFr/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_lkxviz/afts/img/bcXhRphVOuIAAAAAQFAAAAgADtFMAQFr/original",
  },
  {
    slug: "attachments",
    path: "/components/attachments",
    title: "Attachments",
    subtitle: {
      "zh-CN": "输入附件",
    },
    description: {
      "zh-CN": "用于展示一组附件信息集合。",
      "en-US": "Display the collection of attachment information.",
    },
    group: {
      "zh-CN": "表达",
      "en-US": "Express",
    },
    groupOrder: 2,
    cover:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*5l2oSKBXatAAAAAAAAAAAAAADgCCAQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*N8QHQJhgfbEAAAAAAAAAAAAADgCCAQ/original",
  },
  {
    slug: "sources",
    path: "/components/sources",
    title: "Sources",
    subtitle: {
      "zh-CN": "来源引用",
    },
    description: {
      "zh-CN": "展示引用的数据来源地址。",
      "en-US": "Show the source address of the referenced data.",
    },
    group: {
      "zh-CN": "反馈",
      "en-US": "Feedback",
    },
    groupOrder: 4,
    cover:
      "https://mdn.alipayobjects.com/huamei_b00jk5/afts/img/A*3nEPRYJbNQgAAAAAQFAAAAgAegitAQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_b00jk5/afts/img/A*_7mMRrQVcXcAAAAAQEAAAAgAegitAQ/original",
  },
  {
    slug: "file-card",
    path: "/components/file-card",
    title: "FileCard",
    subtitle: {
      "zh-CN": "文件卡片",
    },
    description: {
      "zh-CN": "用卡片的形式展示文件。",
      "en-US": "Display files in the form of cards.",
    },
    group: {
      "zh-CN": "反馈",
      "en-US": "Feedback",
    },
    groupOrder: 4,
    cover:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*pJrtTaf-bWAAAAAAAAAAAAAADgCCAQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*6ySvTqb7XhkAAAAAAAAAAAAADgCCAQ/original",
  },
  {
    slug: "notification",
    path: "/components/notification",
    title: "Notification",
    subtitle: {
      "zh-CN": "系统通知",
    },
    description: {
      "zh-CN": "封装浏览器原生 Notification API，推送系统级通知。",
      "en-US":
        "A wrapper around the browser's native Notification API for pushing system-level notifications.",
    },
    group: {
      "zh-CN": "通用",
      "en-US": "Common",
    },
    groupOrder: 0,
    cover:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*NVKORa7BCVwAAAAAAAAAAAAADrJ8AQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*YC4ERpGAddoAAAAAAAAAAAAADrJ8AQ/original",
  },
  {
    slug: "sender",
    path: "/components/sender",
    title: "Sender",
    subtitle: {
      "zh-CN": "输入框",
    },
    description: {
      "zh-CN": "用于聊天的输入框组件。",
      "en-US": "A input component for chat.",
    },
    group: {
      "zh-CN": "表达",
      "en-US": "Expression",
    },
    groupOrder: 2,
    cover:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*OwTOS6wqFIsAAAAAAAAAAAAADgCCAQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*cOfrS4fVkOMAAAAAAAAAAAAADgCCAQ/original",
  },
  {
    slug: "think",
    path: "/components/think",
    title: "Think",
    subtitle: {
      "zh-CN": "思考",
    },
    description: {
      "zh-CN": "用于展示 AI 深度思考过程的可折叠面板。",
      "en-US": "A collapsible panel for displaying AI deep thinking processes.",
    },
    group: {
      "zh-CN": "反馈",
      "en-US": "Feedback",
    },
    groupOrder: 4,
    cover:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*NVKORa7BCVwAAAAAAAAAAAAADrJ8AQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*YC4ERpGAddoAAAAAAAAAAAAADrJ8AQ/original",
  },
  {
    slug: "thought-chain",
    path: "/components/thought-chain",
    title: "ThoughtChain",
    subtitle: {
      "zh-CN": "思维链",
    },
    description: {
      "zh-CN": "用于展示 AI Agent 的思维链路和工具调用过程。",
      "en-US":
        "Visualize and track AI Agent's call chain and tool invocations.",
    },
    group: {
      "zh-CN": "反馈",
      "en-US": "Feedback",
    },
    groupOrder: 4,
    cover:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*NVKORa7BCVwAAAAAAAAAAAAADrJ8AQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*YC4ERpGAddoAAAAAAAAAAAAADrJ8AQ/original",
  },
  {
    slug: "x-provider",
    path: "/components/x-provider",
    title: "XProvider",
    subtitle: {
      "zh-CN": "全局化配置",
    },
    description: {
      "zh-CN": "为组件提供统一的全局化配置。",
      "en-US": "Provide a uniform configuration support for x components.",
    },
    group: {
      "zh-CN": "其他",
      "en-US": "Others",
    },
    groupOrder: 5,
    cover:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*NVKORa7BCVwAAAAAAAAAAAAADrJ8AQ/original",
    coverDark:
      "https://mdn.alipayobjects.com/huamei_7uahnr/afts/img/A*YC4ERpGAddoAAAAAAAAAAAAADrJ8AQ/originaloriginal",
  },
];
