export type LocaleKey = "zh-CN" | "en-US";

export interface SdkMenuMetaItem {
  slug: string;
  title: Record<LocaleKey, string>;
  group: Record<LocaleKey, string>;
  groupOrder: number;
  order: number;
}

export const sdkMenuMeta: SdkMenuMetaItem[] = [
  {
    slug: "use-x-chat",
    title: {
      "zh-CN": "useXChat",
      "en-US": "useXChat",
    },
    group: {
      "zh-CN": "数据流",
      "en-US": "Data Flow",
    },
    groupOrder: 1,
    order: 1,
  },
  {
    slug: "use-x-conversations",
    title: {
      "zh-CN": "useXConversations",
      "en-US": "useXConversations",
    },
    group: {
      "zh-CN": "数据流",
      "en-US": "Data Flow",
    },
    groupOrder: 1,
    order: 2,
  },
  {
    slug: "x-request",
    title: {
      "zh-CN": "XRequest",
      "en-US": "XRequest",
    },
    group: {
      "zh-CN": "工具",
      "en-US": "Utilities",
    },
    groupOrder: 4,
    order: 1,
  },
  {
    slug: "x-stream",
    title: {
      "zh-CN": "XStream",
      "en-US": "XStream",
    },
    group: {
      "zh-CN": "工具",
      "en-US": "Utilities",
    },
    groupOrder: 4,
    order: 2,
  },
  {
    slug: "chat-provider",
    title: {
      "zh-CN": "Chat Provider",
      "en-US": "Chat Provider",
    },
    group: {
      "zh-CN": "数据提供",
      "en-US": "Data Provider",
    },
    groupOrder: 3,
    order: 1,
  },
  {
    slug: "chat-provider-open-ai",
    title: {
      "zh-CN": "OpenAIChatProvider",
      "en-US": "OpenAIChatProvider",
    },
    group: {
      "zh-CN": "数据提供",
      "en-US": "Data Provider",
    },
    groupOrder: 3,
    order: 2,
  },
  {
    slug: "chat-provider-deepseek",
    title: {
      "zh-CN": "DeepSeekChatProvider",
      "en-US": "DeepSeekChatProvider",
    },
    group: {
      "zh-CN": "数据提供",
      "en-US": "Data Provider",
    },
    groupOrder: 3,
    order: 3,
  },
  {
    slug: "chat-provider-custom",
    title: {
      "zh-CN": "Custom Chat Provider",
      "en-US": "Custom Chat Provider",
    },
    group: {
      "zh-CN": "数据提供",
      "en-US": "Data Provider",
    },
    groupOrder: 3,
    order: 4,
  },
];
