# 组合模式

## 模式 1：完整聊天页

AI 聊天应用的标准布局：侧边栏、消息区、输入框。

```vue
<script setup lang="ts">
import {
  BubbleList,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  XProvider,
} from "@antdv-next/x";
import type { BubbleItemType } from "@antdv-next/x";
import { computed, ref } from "vue";

const messages = ref<BubbleItemType[]>([]);
const value = ref("");
const loading = ref(false);
const activeKey = ref("1");

const conversations = [
  { key: "1", label: "Chat with Assistant", group: "Today" },
  { key: "2", label: "Code Review", group: "Today" },
];

const prompts = [
  { key: "1", label: "Explain quantum computing" },
  { key: "2", label: "Write a Python script" },
];

// 保持该对象稳定 —— 只定义一次，不要放在渲染函数中。
const role = {
  assistant: { placement: "start" },
  user: { placement: "end" },
} as const;

const isEmpty = computed(() => messages.value.length === 0);

const onSubmit = (content: string) => {
  messages.value.push({ key: Date.now(), role: "user", content });
  value.value = "";
  loading.value = true;
  // 分发到数据层（useXChat 或自定义请求）。
};
</script>

<template>
  <XProvider>
    <div style="display: flex; height: 100vh">
      <!-- 侧边栏 -->
      <Conversations
        style="width: 240px; border-right: 1px solid #f0f0f0"
        :items="conversations"
        :active-key="activeKey"
        :on-active-change="key => (activeKey = key)"
        groupable
        :creation="{ label: 'New Chat', onClick: () => {} }"
      />

      <!-- 主区域 -->
      <div
        style="display: flex; flex: 1; flex-direction: column; overflow: hidden"
      >
        <template v-if="isEmpty">
          <div
            style="display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 16px"
          >
            <Welcome
              title="Hello! How can I help?"
              description="Choose a suggestion or type your own question."
              variant="borderless"
            />
            <Prompts
              :items="prompts"
              wrap
              @item-click="info => (value = String(info.data.label))"
            />
          </div>
        </template>
        <BubbleList
          v-else
          :items="messages"
          :role="role"
          auto-scroll
          style="flex: 1; overflow: auto; padding: 16px"
        />

        <!-- 输入框 -->
        <Sender
          v-model:value="value"
          style="padding: 16px"
          :loading="loading"
          :on-submit="onSubmit"
          :on-cancel="() => (loading = false)"
        />
      </div>
    </div>
  </XProvider>
</template>
```

---

## 模式 2：带消息操作的气泡

在每条 AI 消息下方添加复制、反馈和重试。通过角色配置中的 `footer` 字段，让操作只出现在 assistant 气泡上。

```vue
<script setup lang="ts">
import {
  Actions,
  ActionsCopy,
  ActionsFeedback,
  BubbleList,
} from "@antdv-next/x";
import type { BubbleItemType, BubbleListProps } from "@antdv-next/x";
import { h, ref } from "vue";

type RoleMap = NonNullable<BubbleListProps["role"]>;

const items = ref<BubbleItemType[]>([]);
const feedback = ref<"like" | "dislike" | "default">("default");

const handleRetry = () => {
  // 重新发送最后一条用户消息
};

// 只定义一次 —— 不要在每次渲染时重建该对象。
const role: RoleMap = {
  assistant: {
    placement: "start",
    footer: content =>
      h(Actions, {
        items: [
          {
            key: "copy",
            actionRender: () => h(ActionsCopy, { text: String(content) }),
          },
          {
            key: "feedback",
            actionRender: () =>
              h(ActionsFeedback, {
                value: feedback.value,
                onChange: (value: typeof feedback.value) =>
                  (feedback.value = value),
              }),
          },
          { key: "retry", label: "Retry", onItemClick: handleRetry },
        ],
        variant: "borderless",
        fadeIn: true,
      }),
  },
  user: { placement: "end" },
};
</script>

<template>
  <BubbleList :items="items" :role="role" />
</template>
```

---

## 模式 3：流式气泡

将 `BubbleList` 连接到 `@antdv-next/x-sdk` 的 `useXChat`。

```vue
<script setup lang="ts">
import { BubbleList, Sender } from "@antdv-next/x";
import type { BubbleItemType } from "@antdv-next/x";
import { DeepSeekChatProvider, useXChat, XRequest } from "@antdv-next/x-sdk";
import { computed, ref } from "vue";

const provider = new DeepSeekChatProvider({
  request: XRequest("https://api.deepseek.com/v1/chat/completions", {
    manual: true,
  }),
});

const { parsedMessages, onRequest, isRequesting, abort } = useXChat({
  provider,
});

const value = ref("");

const role = {
  assistant: { placement: "start" },
  user: { placement: "end" },
} as const;

const bubbleItems = computed<BubbleItemType[]>(() =>
  parsedMessages.value.map(msg => {
    const content = msg.message?.content ?? "";
    const isStreaming = msg.status === "loading" || msg.status === "updating";
    return {
      key: msg.id,
      role: msg.message?.role === "user" ? "user" : "assistant",
      content,
      // 生成期间 streaming=true，完成后为 false
      streaming: isStreaming,
      loading: isStreaming && !content,
    };
  }),
);

const onSubmit = (content: string) => {
  onRequest({ messages: [{ role: "user", content }] });
  value.value = "";
};
</script>

<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <BubbleList
      :items="bubbleItems"
      :role="role"
      auto-scroll
      style="flex: 1; overflow: auto"
    />
    <Sender
      v-model:value="value"
      :loading="isRequesting"
      :on-submit="onSubmit"
      :on-cancel="abort"
    />
  </div>
</template>
```

`provider` 的形态取决于你的 API —— 参考 `x-chat-provider` 技能。

---

## 模式 4：推理 / 思考过程展示

在最终回答之前展示模型的思维链。

```vue
<script setup lang="ts">
import { Bubble, ThoughtChain, Think } from "@antdv-next/x";
import { ref } from "vue";

const reasoning = ref("");
const answer = ref("");
const isStreaming = ref(false);

const steps = ref([
  {
    key: "1",
    title: "Search the web",
    description: 'query: "Vue composables"',
    status: "success",
    content: "Search results...",
    collapsible: true,
  },
  { key: "2", title: "Generating answer", status: "loading", blink: true },
]);
</script>

<template>
  <!-- 单块可折叠思考区域 -->
  <Bubble placement="start" content="" :loading="isStreaming && !answer">
    <template #content>
      <Think
        v-if="reasoning"
        title="Thinking..."
        :loading="isStreaming"
        :blink="isStreaming"
        :default-expanded="false"
      >
        {{ reasoning }}
      </Think>
      <div v-if="answer">{{ answer }}</div>
    </template>
  </Bubble>

  <!-- 多步骤工具调用链 -->
  <ThoughtChain :items="steps" />
</template>
```

---

## 模式 5：Sender 中的文件附件

允许用户随消息附加文件。

```vue
<script setup lang="ts">
import { Attachments, Sender, SenderHeader } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");
const files = ref<any[]>([]);
const open = ref(false);
const attachmentsRef = ref();

const onSubmit = (message: string) => {
  const payload = { message, files: files.value };
  files.value = [];
  console.log(payload); // 发送 payload...
};
</script>

<template>
  <Sender v-model:value="value" :on-submit="onSubmit">
    <template #header>
      <SenderHeader
        v-if="files.length"
        :open="open"
        :on-open-change="v => (open = v)"
      >
        <Attachments
          ref="attachmentsRef"
          v-model:items="files"
          overflow="scrollX"
        />
      </SenderHeader>
    </template>
    <template #prefix>
      <a-button @click="attachmentsRef?.select({ multiple: true })">
        Attach
      </a-button>
    </template>
  </Sender>
</template>
```

---

## 模式 6：建议 / 斜杠命令

用户输入 `/` 时触发建议弹层。

```vue
<script setup lang="ts">
import { Sender, Suggestion } from "@antdv-next/x";
import type { SuggestionItem } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");

const commands: SuggestionItem[] = [
  { value: "/search", label: "/search — Search the web" },
  { value: "/summarize", label: "/summarize — Summarize text" },
  { value: "/code", label: "/code — Generate code" },
];

const onSelect = (selected: string) => {
  value.value = `${selected} `;
};

const onChange = (next: string, onTrigger: (info?: any | false) => void) => {
  value.value = next;
  onTrigger(next.endsWith("/") ? {} : false);
};
</script>

<template>
  <Suggestion :items="commands" @select="onSelect">
    <template #default="{ onTrigger, onKeyDown }">
      <Sender
        v-model:value="value"
        :on-change="next => onChange(next, onTrigger)"
        :on-key-down="onKeyDown"
        :on-submit="msg => console.log(msg)"
      />
    </template>
  </Suggestion>
</template>
```

---

## 模式 7：来源引用

展示 AI 回答中引用的文档。

```vue
<script setup lang="ts">
import { BubbleList, Sources } from "@antdv-next/x";
import type {
  BubbleItemType,
  BubbleListProps,
  SourcesProps,
} from "@antdv-next/x";
import { h, ref } from "vue";

type RoleMap = NonNullable<BubbleListProps["role"]>;
type SourceItem = NonNullable<SourcesProps["items"]>[number];

const items = ref<BubbleItemType[]>([]);

// 假设每条 item 在 extraInfo.sources 中携带引用
const role: RoleMap = {
  assistant: {
    placement: "start",
    footer: (_content, info) => {
      const sources = (info.extraInfo?.sources ?? []) as SourceItem[];
      if (!sources.length) return null;
      return h(Sources, {
        title: "Sources",
        items: sources,
        defaultExpanded: false,
        onClick: (item: SourceItem) => item.url && window.open(item.url),
      });
    },
  },
  user: { placement: "end" },
};
</script>

<template>
  <BubbleList :items="items" :role="role" />
</template>
```

---

## 应避免的反模式

| 反模式                               | 为什么错                      | 修复                                   |
| ------------------------------------ | ----------------------------- | -------------------------------------- |
| 用 `v-for` 渲染 `Bubble`             | 丢失滚动锚定和自动滚动        | 使用 `BubbleList`                      |
| 在模板中内联 `role` 对象             | 每次渲染都重建，重置动画      | 在 `script setup` 或常量中定义一次     |
| 流结束后仍保持 `streaming` 为 `true` | 内容永远无法进入完成态        | 最后一个 chunk 设置 `streaming: false` |
| 在 `content` 中放原始 HTML           | XSS 风险，无净化              | 使用 `contentRender` + `XMarkdown`     |
| 嵌套多个 `XProvider`                 | 主题/locale 冲突              | 只在根部放一个 `XProvider`             |
| 用 `onChange` 当提交处理器           | 每次击键都会触发              | 发送动作使用 `onSubmit`                |
| 在模板中创建 `items`                 | 每次渲染都是新数组 → 滚动抖动 | 用 `ref` / `computed` 保存 `items`     |
