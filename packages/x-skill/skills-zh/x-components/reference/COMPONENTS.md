# 组件指南

所有示例均使用 Vue 3 SFC 语法。回调属性使用 `onXxx` 形式（`:on-submit`、`:on-change`），与 `@antdv-next/x` 的组件 API 一致。

## Bubble

**用途**：展示单条对话消息 —— AI 回复或用户消息。

**关键决策**：渲染多条消息时使用 `BubbleList`；`Bubble` 只用于独立的单条消息。

```vue
<script setup lang="ts">
import { Bubble } from "@antdv-next/x";
</script>

<template>
  <!-- 基础用法 -->
  <Bubble content="Hello!" />

  <!-- 带头像、头部、底部 -->
  <Bubble content="Hello!" placement="start">
    <template #avatar>
      <a-avatar icon="user" />
    </template>
    <template #header>
      <span>Assistant</span>
    </template>
  </Bubble>

  <!-- 流式模式：最后一个 chunk 时 streaming=false -->
  <Bubble :content="streamContent" :streaming="!isDone" />
</template>
```

**关键属性**：

| 属性            | 用途                                                                             |
| --------------- | -------------------------------------------------------------------------------- |
| `placement`     | `'start'`（左，AI，默认）或 `'end'`（右，用户）                                  |
| `content`       | 消息内容（`string`、`number`、`VNode` 或对象）                                   |
| `streaming`     | 流式期间为 `true`，最后一个 chunk 为 `false`                                     |
| `typing`        | 打字动画 —— `false` 关闭，或 `{ effect: 'typing' \| 'fade-in', step, interval }` |
| `loading`       | 显示加载骨架                                                                     |
| `variant`       | `'filled'`（默认）\| `'outlined'` \| `'shadow'` \| `'borderless'`                |
| `shape`         | `'default'` \| `'round'` \| `'corner'`                                           |
| `contentRender` | 自定义 `content` 渲染 —— 用于 Markdown 或图表组件                                |
| `editable`      | 启用行内内容编辑                                                                 |

**插槽**：`content`、`loading`、`header`、`footer`、`avatar`、`extra`。优先级：`content` 插槽 > `contentRender` > `content` 属性。

## BubbleList

**用途**：首选的多消息组件。负责滚动锚定、自动滚动和按角色的默认属性。

```vue
<script setup lang="ts">
import { BubbleList } from "@antdv-next/x";
import type { BubbleItemType } from "@antdv-next/x";
import { computed } from "vue";

const props = defineProps<{
  messages: { id: string; role: string; content: string; loading?: boolean }[];
}>();

const items = computed<BubbleItemType[]>(() =>
  props.messages.map(msg => ({
    key: msg.id,
    role: msg.role,
    content: msg.content,
    loading: msg.loading,
  })),
);

// 保持 role 映射稳定：定义在组件外或常量中。
const role = {
  assistant: { placement: "start" },
  user: { placement: "end" },
} as const;
</script>

<template>
  <BubbleList :items="items" :role="role" auto-scroll />
</template>
```

**关键属性**：

| 属性         | 用途                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| `items`      | `BubbleItemType[]` —— 每项必须包含 `key`、`role`，以及任意 `Bubble` 属性 |
| `role`       | 角色名 → 该角色默认属性的映射                                            |
| `autoScroll` | 新消息时自动滚动到底部（默认 `true`）                                    |

`BubbleList` 通过 ref 暴露 `scrollTo({ key, top, behavior, block })`。

## Sender

**用途**：聊天输入框 —— 文本输入、发送、语音输入和扩展插槽。

```vue
<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");
const loading = ref(false);

const onSubmit = (message: string) => {
  value.value = "";
  loading.value = true;
  // 发送消息...
};

const onCancel = () => {
  loading.value = false;
};
</script>

<template>
  <Sender
    v-model:value="value"
    :loading="loading"
    :on-submit="onSubmit"
    :on-cancel="onCancel"
    placeholder="Ask anything..."
  />
</template>
```

**关键属性**：

| 属性                                      | 用途                                                 |
| ----------------------------------------- | ---------------------------------------------------- |
| `value`（v-model）                        | 受控输入值                                           |
| `loading`                                 | 显示取消按钮而不是发送按钮                           |
| `onSubmit`                                | 用户发送时调用（回车或按钮）                         |
| `onChange`                                | 每次输入时调用                                       |
| `onCancel`                                | 用户取消加载中的发送时调用                           |
| `submitType`                              | `'enter'`（默认）\| `'shiftEnter'` —— 触发发送的方式 |
| `allowSpeech`                             | 启用语音输入（`boolean` 或 `SpeechConfig`）          |
| `header` / `prefix` / `footer` / `suffix` | 布局插槽或属性                                       |
| `autoSize`                                | `boolean \| { minRows, maxRows }`                    |
| `disabled` / `readOnly`                   | 禁止输入                                             |

**Sender ref**：`focus()`、`blur()`、`insert()`、`clear()`、`getValue()`、`nativeElement`。

## SenderHeader + Attachments

**用途**：`SenderHeader` 是输入框上方的可展开面板；`Attachments` 管理其中的文件列表。

```vue
<script setup lang="ts">
import { Attachments, Sender, SenderHeader } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");
const open = ref(true);
const items = ref<any[]>([]);

const onChange = ({ fileList }: { fileList: any[] }) => {
  items.value = fileList;
};
</script>

<template>
  <Sender v-model:value="value" :on-submit="() => (items = [])">
    <template #header>
      <SenderHeader
        title="Attachments"
        :open="open"
        :on-open-change="v => (open = v)"
      >
        <Attachments
          v-model:items="items"
          overflow="scrollX"
          :on-change="onChange"
          :get-drop-container="() => undefined"
        />
      </SenderHeader>
    </template>
    <template #prefix>
      <a-button @click="open = !open">Attach</a-button>
    </template>
  </Sender>
</template>
```

**Attachments 关键属性**：

| 属性                                | 用途                                   |
| ----------------------------------- | -------------------------------------- |
| `items`（v-model）                  | 受控附件列表                           |
| `overflow`                          | `'wrap'` \| `'scrollX'` \| `'scrollY'` |
| `placeholder`                       | 列表为空时显示的内容                   |
| `getDropContainer`                  | 配置拖放区域元素                       |
| `maxCount`                          | 最大文件数                             |
| `accept` / `multiple` / `directory` | 文件选择器约束                         |

**Attachments ref**：`select({ accept, multiple })`、`upload(file)`、`nativeElement`、`fileNativeElement`。

## Conversations

**用途**：用于在多个会话之间切换的侧边栏列表。

```vue
<script setup lang="ts">
import { Conversations } from "@antdv-next/x";
import { ref } from "vue";

const activeKey = ref<string | number>("1");
const items = [
  { key: "1", label: "Chat with Assistant", group: "Today" },
  { key: "2", label: "Code Review", group: "Today" },
];

const creation = { label: "New Chat", onClick: () => {} };

const menu = (conversation: any) => ({
  items: [
    { key: "rename", label: "Rename" },
    { key: "delete", label: "Delete", danger: true },
  ],
  onClick: ({ key }: { key: string }) => {
    if (key === "delete") console.log("delete", conversation.key);
  },
});
</script>

<template>
  <Conversations
    :items="items"
    :active-key="activeKey"
    :on-active-change="key => (activeKey = key)"
    groupable
    :creation="creation"
    :menu="menu"
  />
</template>
```

**关键属性**：`items`、`activeKey` / `onActiveChange`、`groupable`、`creation`、`menu`、`shortcutKeys`、`labelRender` / `iconRender`（属性或插槽）。

## Welcome + Prompts

**用途**：首条消息之前的引导页。

```vue
<script setup lang="ts">
import { Prompts, Welcome } from "@antdv-next/x";

const prompts = [
  { key: "1", label: "Search the web" },
  { key: "2", label: "Write code" },
  { key: "3", label: "Summarize a document" },
];
</script>

<template>
  <Welcome
    title="Hello, I'm your AI Assistant"
    description="Ask me anything, or pick a suggestion below."
    variant="borderless"
  />
  <Prompts
    title="What would you like to explore?"
    :items="prompts"
    wrap
    :on-item-click="info => console.log(info.data.label)"
  />
</template>
```

**Welcome 属性**：`icon`、`title`、`description`、`extra`、`variant`（`'filled'` 默认 \| `'borderless'`）；同名插槽优先。

**Prompts 属性**：`items`、`title`、`wrap`、`vertical`、`fadeIn`、`fadeInLeft`、`onItemClick`；条目字段：`key`、`label`、`description`、`icon`、`disabled`、`children`。

## Think

**用途**：可折叠的「深度思考」区块 —— 用于暴露推理过程的模型。

```vue
<script setup lang="ts">
import { Think } from "@antdv-next/x";
import { ref } from "vue";

const expanded = ref(false);
</script>

<template>
  <Think
    v-model:expanded="expanded"
    title="Thinking..."
    :loading="isStreaming"
    :blink="isStreaming"
    :default-expanded="false"
  >
    {{ reasoningContent }}
  </Think>
</template>
```

**ThinkProps**：`title`、`loading`（`boolean` 或自定义节点）、`expanded` / `defaultExpanded` / `onExpand`、`blink`、`destroyOnHidden`、`icon`；内容使用默认插槽。

## Think / ThoughtChain

### ThoughtChain

**用途**：可视化多步骤的 Agent 推理链 —— 工具调用、搜索、子任务。

```vue
<script setup lang="ts">
import { ThoughtChain } from "@antdv-next/x";

const steps = [
  {
    key: "1",
    title: "Search the web",
    description: 'query: "Vue composables"',
    status: "success",
    content: "Search results...",
    collapsible: true,
  },
  { key: "2", title: "Generating answer", status: "loading", blink: true },
];
</script>

<template>
  <ThoughtChain :items="steps" />
</template>
```

**ThoughtChainItemType**：`key`、`title`、`description`、`content`、`footer`、`status`（`'loading' | 'success' | 'error' | 'abort'`）、`icon`（`false` 隐藏）、`collapsible`、`blink`、`destroyOnHidden`。

**ThoughtChain 属性**：`items`、`expandedKeys`（v-model）/ `defaultExpandedKeys` / `onExpand`、`line`（`boolean | 'solid' | 'dashed' | 'dotted'`）。

## Actions

**用途**：AI 消息下方的反馈/操作按钮 —— 复制、点赞/点踩、重试、音频。

```vue
<script setup lang="ts">
import { Actions, ActionsCopy, ActionsFeedback } from "@antdv-next/x";
import { h, ref } from "vue";

const feedback = ref<"like" | "dislike" | "default">("default");

const items = [
  {
    key: "copy",
    actionRender: () => h(ActionsCopy, { text: "message content" }),
  },
  {
    key: "feedback",
    actionRender: () =>
      h(ActionsFeedback, {
        value: feedback.value,
        onChange: (value: typeof feedback.value) => (feedback.value = value),
      }),
  },
  {
    key: "retry",
    label: "Retry",
    onItemClick: () => console.log("retry"),
  },
  {
    key: "more",
    label: "More",
    subItems: [
      { key: "edit", label: "Edit" },
      { key: "delete", label: "Delete", danger: true },
    ],
  },
];
</script>

<template>
  <Actions :items="items" variant="borderless" />
</template>
```

**内置子组件**：

| 组件              | 用途                                      |
| ----------------- | ----------------------------------------- |
| `ActionsCopy`     | 复制到剪贴板按钮 —— 属性 `text`           |
| `ActionsFeedback` | 点赞/点踩切换 —— 属性 `value`、`onChange` |
| `ActionsAudio`    | 播放/加载/错误音频按钮 —— 属性 `status`   |
| `ActionsItem`     | 带 `status`、`label` 的通用条目           |

**Actions 属性**：`items`、`onClick`、`variant`（`'borderless'` 默认 \| `'outlined'` \| `'filled'`）、`fadeIn`、`fadeInLeft`。

## Sources

**用途**：展示 AI 回答中引用的来源（URL）。

```vue
<script setup lang="ts">
import { Sources } from "@antdv-next/x";

const items = [
  {
    key: "1",
    title: "Vue Docs",
    url: "https://vuejs.org",
    description: "Official docs",
  },
  { key: "2", title: "MDN", url: "https://developer.mozilla.org" },
];
</script>

<template>
  <Sources
    title="References"
    :items="items"
    :default-expanded="true"
    :on-click="item => item.url && window.open(item.url)"
  />
</template>
```

**SourcesProps**：`items`、`title`、`expanded`（v-model）/ `defaultExpanded`、`inline`、`activeKey`、`popoverOverlayWidth`、`onClick`、`expandIconPosition`（`'start'` 默认 \| `'end'`）。条目字段：`key`、`title`、`url`、`icon`、`description`。

## Suggestion

**用途**：斜杠命令或触发式建议弹层，通常包裹 `Sender`。

```vue
<script setup lang="ts">
import { Sender, Suggestion } from "@antdv-next/x";
import type { SuggestionItem } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");
const items: SuggestionItem[] = [
  { value: "/search", label: "/search — Search the web" },
  { value: "/help", label: "/help — Show commands" },
];

const onSelect = (selected: string) => {
  value.value = `${selected} `;
};

const onChange = (next: string, onTrigger: (info?: any | false) => void) => {
  value.value = next;
  if (next.endsWith("/")) onTrigger({});
  else onTrigger(false);
};
</script>

<template>
  <Suggestion :items="items" @select="onSelect">
    <template #default="{ onTrigger, onKeyDown }">
      <Sender
        v-model:value="value"
        :on-change="next => onChange(next, onTrigger)"
        :on-key-down="onKeyDown"
      />
    </template>
  </Suggestion>
</template>
```

**SuggestionProps**：`items`（数组或 `(info?) => SuggestionItem[]`）、`open`（v-model）、`block`、`onSelect`（事件）。默认作用域插槽暴露 `{ onTrigger, onKeyDown, open }`；调用 `onTrigger(false)` 关闭。

## FileCard / FileCardList

**用途**：在气泡中展示文件附件卡片（发送/接收的文件）。

```vue
<script setup lang="ts">
import { FileCard, FileCardList } from "@antdv-next/x";

const file = {
  uid: "1",
  name: "report.pdf",
  byte: 1024000,
  type: "pdf",
  src: "/files/report.pdf",
};
</script>

<template>
  <FileCard v-bind="file" />
  <FileCardList
    :items="[file]"
    removable
    :on-remove="item => console.log(item)"
  />
</template>
```

**FileCard 属性**：`name`、`byte`、`size`（`'small'` \| `'default'`）、`description`、`loading`、`type`、`src`、`mask`、`icon`（预置名称或 VNode）、`imageProps` / `videoProps` / `audioProps`、`onClick`。

**FileCardList 属性**：`items`、`size`、`removable`、`onRemove`、`extension`、`overflow`（`'scrollX'` \| `'scrollY'` \| `'wrap'`）。

## CodeHighlighter

**用途**：气泡或消息中的语法高亮代码块。

```vue
<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";
</script>

<template>
  <CodeHighlighter language="typescript" content="const x = 1;" />
</template>
```

**属性**：`content`、`language`、`showLineNumbers`、`showLanguage`、`showThemeToggle`、`showCopyButton`、`theme`、`startLineNumber`。内置语言：`typescript`/`ts`、`javascript`/`js`、`python`/`py`、`json`、`html`、`css`。

> 提示：从 Markdown 渲染代码时，优先使用 `@antdv-next/x-markdown` 自定义代码块组件映射。使用 `setupCodeHighlighter` 注册额外的 Shiki 语言。

## Mermaid

**用途**：在聊天消息中渲染 Mermaid 图表。

```vue
<script setup lang="ts">
import { Mermaid } from "@antdv-next/x";
</script>

<template>
  <Mermaid
    content="graph TD
  A --> B
  B --> C"
  />
</template>
```

> 提示：可放在 Bubble 的 `content` 插槽、`contentRender` 中，或作为 `language="mermaid"` 的 Markdown 代码块组件。默认头部操作包括缩放、下载和复制。

## Folder

**用途**：展示带可选实时预览的层级文件/文件夹树 —— 适用于 AI 编程助手场景。

```vue
<script setup lang="ts">
import { Folder } from "@antdv-next/x";
import type { FolderTreeData } from "@antdv-next/x";

const treeData: FolderTreeData[] = [
  {
    title: "src",
    path: "src",
    children: [
      { title: "index.ts", path: "src/index.ts", content: "export default {}" },
      {
        title: "App.vue",
        path: "src/App.vue",
        content: "<template><div /></template>",
      },
    ],
  },
];

const fileContentService = {
  loadFileContent: async (filePath: string) => {
    const res = await fetch(`/api/file?path=${filePath}`);
    return res.text();
  },
};
</script>

<template>
  <Folder
    :tree-data="treeData"
    :file-content-service="fileContentService"
    default-expand-all
    :on-selected-file-change="file => console.log(file.path, file.content)"
  />
</template>
```

**关键属性**：`treeData`、`selectedFile`（v-model，路径数组）/ `defaultSelectedFile`、`expandedPaths`（v-model）/ `defaultExpandedPaths`、`defaultExpandAll`（默认 `true`）、`fileContentService`、`previewRender`、`directoryTitle`、`directoryIcons`、`selectable`、`emptyRender`。

## XProvider

**用途**：全局配置包裹组件 —— 替代 `antdv-next` 的 `ConfigProvider`。

```vue
<script setup lang="ts">
import { XProvider } from "@antdv-next/x";
import zhCN from "antdv-next/dist/locale/zh_CN";
</script>

<template>
  <XProvider
    :locale="zhCN"
    :theme="{ token: { colorPrimary: '#1677ff' } }"
    direction="ltr"
  >
    <App />
  </XProvider>
</template>
```

- 完整继承 `antdv-next` 的 `ConfigProvider` —— 其所有配置属性均有效。
- 额外提供 x 专属组件配置：`actions`、`attachments`、`bubble`、`codeHighlighter`、`conversations`、`fileCard`、`mermaid`、`prompts`、`sender`、`sources`、`suggestion`、`think`、`thoughtChain`、`welcome`。
- 在应用根部放置**一次**即可。

## Notification

**用途**：命令式**系统**通知（浏览器 Notification API），不是页面内的消息提示。

```ts
import { Notification } from "@antdv-next/x";

Notification.open({
  title: "Connection lost",
  body: "Reconnecting...",
  duration: 5,
});

await Notification.requestPermission();
```

`Notification` 是 `XNotification` 的默认实例。它在浏览器原生 `NotificationOptions` 基础上扩展了 `title`、`duration`、`onClick`、`onClose`、`onError`、`onShow`。`useNotification()` 返回 `[{ permission }, { open, close, requestPermission }]` 供组合式用法。

> 需要操作系统/浏览器通知权限。浏览器不支持 Notification API 时调用为空操作。
