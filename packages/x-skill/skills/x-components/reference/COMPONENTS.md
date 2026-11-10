# Component Guide

All examples use Vue 3 SFC syntax. Declared callback props use the `:on-xxx` form (`:on-submit`); emit-only events use `@event-name` (`@item-click`, `@change`, `@selected-file-change`, `@expand`). The `:on-xxx` form does not register emit-only listeners.

## Bubble

**Purpose**: Display a single chat message — AI reply or user message.

**Key decision**: Use `BubbleList` when rendering multiple messages. Use `Bubble` only for a standalone single message.

```vue
<script setup lang="ts">
import { Bubble } from "@antdv-next/x";
</script>

<template>
  <!-- Basic -->
  <Bubble content="Hello!" />

  <!-- With avatar, header, footer -->
  <Bubble content="Hello!" placement="start">
    <template #avatar>
      <a-avatar icon="user" />
    </template>
    <template #header>
      <span>Assistant</span>
    </template>
  </Bubble>

  <!-- Streaming mode: streaming=false on the final chunk -->
  <Bubble :content="streamContent" :streaming="!isDone" />
</template>
```

**Key props**:

| Prop            | Purpose                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| `placement`     | `'start'` (left, AI, default) or `'end'` (right, user)                                        |
| `content`       | Message content (`string`, `number`, `VNode`, or object)                                      |
| `streaming`     | `true` while streaming, `false` on last chunk                                                 |
| `typing`        | Typing animation — `false` to disable, or `{ effect: 'typing' \| 'fade-in', step, interval }` |
| `loading`       | Show loading skeleton                                                                         |
| `variant`       | `'filled'` (default) \| `'outlined'` \| `'shadow'` \| `'borderless'`                          |
| `shape`         | `'default'` \| `'round'` \| `'corner'`                                                        |
| `contentRender` | Custom renderer for `content` — use for Markdown or chart components                          |
| `editable`      | Enable inline content editing                                                                 |

**Slots**: `content`, `loading`, `header`, `footer`, `avatar`, `extra`. Slot priority: `content` slot > `contentRender` > `content` prop.

## BubbleList

**Purpose**: The preferred multi-message component. Handles scroll anchoring, auto-scroll, and role-based defaults.

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

// Keep the role map stable: define it outside the component or in a constant.
const role = {
  assistant: { placement: "start" },
  user: { placement: "end" },
} as const;
</script>

<template>
  <BubbleList :items="items" :role="role" auto-scroll />
</template>
```

**Key props**:

| Prop         | Purpose                                                                      |
| ------------ | ---------------------------------------------------------------------------- |
| `items`      | `BubbleItemType[]` — each item requires `key`, `role`, and any `Bubble` prop |
| `role`       | Map of role name → default props for that role                               |
| `autoScroll` | Auto-scroll to bottom on new messages (default `true`)                       |

`BubbleList` exposes `scrollTo({ key, top, behavior, block })` via its ref.

## Sender

**Purpose**: Chat input box — text entry, submit, voice input, and extension slots.

```vue
<script setup lang="ts">
import { Sender } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");
const loading = ref(false);

const onSubmit = (message: string) => {
  value.value = "";
  loading.value = true;
  // send message...
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

**Key props**:

| Prop                                      | Purpose                                                      |
| ----------------------------------------- | ------------------------------------------------------------ |
| `value` (v-model)                         | Controlled input value                                       |
| `loading`                                 | Show cancel button instead of send                           |
| `onSubmit`                                | Called when user sends (Enter or button)                     |
| `onChange`                                | Called on every keystroke                                    |
| `onCancel`                                | Called when user cancels a loading send                      |
| `submitType`                              | `'enter'` (default) \| `'shiftEnter'` — what triggers submit |
| `allowSpeech`                             | Enable voice input (`boolean` or `SpeechConfig`)             |
| `header` / `prefix` / `footer` / `suffix` | Layout slots or props                                        |
| `autoSize`                                | `boolean \| { minRows, maxRows }`                            |
| `disabled` / `readOnly`                   | Prevent input                                                |

**Sender ref**: `focus()`, `blur()`, `insert()`, `clear()`, `getValue()`, `nativeElement`.

## SenderHeader + Attachments

**Purpose**: `SenderHeader` is the expandable panel above the input; `Attachments` manages the file list inside it.

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
          @change="onChange"
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

**Attachments key props**:

| Prop                                | Purpose                                |
| ----------------------------------- | -------------------------------------- |
| `items` (v-model)                   | Controlled attachment list             |
| `overflow`                          | `'wrap'` \| `'scrollX'` \| `'scrollY'` |
| `placeholder`                       | Shown when the list is empty           |
| `getDropContainer`                  | Configure the drop zone element        |
| `maxCount`                          | Max files                              |
| `accept` / `multiple` / `directory` | File picker constraints                |

**Attachments ref**: `select({ accept, multiple })`, `upload(file)`, `nativeElement`, `fileNativeElement`.

## Conversations

**Purpose**: Sidebar list for switching between multiple chat sessions.

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

**Key props**: `items`, `activeKey` / `onActiveChange`, `groupable`, `creation`, `menu`, `shortcutKeys`, `labelRender` / `iconRender` (props or slots).

## Welcome + Prompts

**Purpose**: Onboarding screen shown before the first message.

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
    @item-click="info => console.log(info.data.label)"
  />
</template>
```

**Welcome props**: `icon`, `title`, `description`, `extra`, `variant` (`'filled'` default \| `'borderless'`); matching slots take precedence.

**Prompts props**: `items`, `title`, `wrap`, `vertical`, `fadeIn`, `fadeInLeft`, `onItemClick`; item fields: `key`, `label`, `description`, `icon`, `disabled`, `children`.

## Think

**Purpose**: Collapsible "deep thinking" block — for models that expose a reasoning step.

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

**ThinkProps**: `title`, `loading` (`boolean` or custom node), `expanded` / `defaultExpanded`, `blink`, `destroyOnHidden`, `icon`; default slot for content. Events: `update:expanded`, `expand`.

## Think / ThoughtChain

### ThoughtChain

**Purpose**: Visualize a multi-step agent reasoning chain — tool calls, searches, sub-tasks.

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

**ThoughtChainItemType**: `key`, `title`, `description`, `content`, `footer`, `status` (`'loading' | 'success' | 'error' | 'abort'`), `icon` (`false` to hide), `collapsible`, `blink`, `destroyOnHidden`.

**ThoughtChain props**: `items`, `expandedKeys` (v-model) / `defaultExpandedKeys`, `line` (`boolean | 'solid' | 'dashed' | 'dotted'`). Events: `update:expandedKeys`, `expand`.

## Actions

**Purpose**: Feedback/control buttons below an AI message — copy, thumbs up/down, retry, audio.

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

**Built-in sub-components**:

| Component         | Purpose                                                                      |
| ----------------- | ---------------------------------------------------------------------------- |
| `ActionsCopy`     | Copy-to-clipboard button — prop `text`                                       |
| `ActionsFeedback` | Like/dislike toggle — props `value`, `onChange`                              |
| `ActionsAudio`    | Play/loading/error audio button — prop `status`                              |
| `ActionsItem`     | Generic item with `status`, `label`, `defaultIcon` (required), `runningIcon` |

**Actions props**: `items`, `onClick`, `variant` (`'borderless'` default \| `'outlined'` \| `'filled'`), `fadeIn`, `fadeInLeft`.

## Sources

**Purpose**: Show reference citations (URLs) used in an AI answer.

```vue
<script setup lang="ts">
import { Sources } from "@antdv-next/x";
import type { SourcesProps } from "@antdv-next/x";

type SourceItem = NonNullable<SourcesProps["items"]>[number];

const items: SourceItem[] = [
  {
    key: "1",
    title: "Vue Docs",
    url: "https://vuejs.org",
    description: "Official docs",
  },
  { key: "2", title: "MDN", url: "https://developer.mozilla.org" },
];

const openSource = (item: SourceItem) => {
  if (item.url) window.open(item.url);
};
</script>

<template>
  <Sources
    title="References"
    :items="items"
    :default-expanded="true"
    :on-click="openSource"
  />
</template>
```

**SourcesProps**: `items`, `title`, `expanded` (v-model) / `defaultExpanded`, `inline`, `activeKey`, `popoverOverlayWidth`, `onClick`, `expandIconPosition` (`'start'` default \| `'end'`). Item fields: `key`, `title`, `url`, `icon`, `description`.

## Suggestion

**Purpose**: Slash-command or trigger-based suggestion popup, typically wrapping the `Sender`.

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

**SuggestionProps**: `items` (array or `(info?) => SuggestionItem[]`), `open` (v-model), `block`, `onSelect` (event). Default scoped slot exposes `{ onTrigger, onKeyDown, open }`; call `onTrigger(false)` to close.

## FileCard / FileCardList

**Purpose**: Display a file attachment card in a bubble (sent/received file).

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

**FileCard props**: `name`, `byte`, `size` (`'small'` \| `'default'`), `description`, `loading`, `type`, `src`, `mask`, `icon` (preset name or VNode), `imageProps` / `videoProps` / `audioProps`, `onClick`.

**FileCardList props**: `items`, `size`, `removable`, `onRemove`, `extension`, `overflow` (`'scrollX'` \| `'scrollY'` \| `'wrap'`).

## CodeHighlighter

**Purpose**: Syntax-highlighted code block in a bubble or message.

```vue
<script setup lang="ts">
import { CodeHighlighter } from "@antdv-next/x";
</script>

<template>
  <CodeHighlighter language="typescript" content="const x = 1;" />
</template>
```

**Props**: `content`, `language`, `showLineNumbers`, `showLanguage`, `showThemeToggle`, `showCopyButton`, `theme`, `startLineNumber`. Built-in languages: `typescript`/`ts`, `javascript`/`js`, `python`/`py`, `json`, `html`, `css`.

> Tip: When rendering code from Markdown, prefer `@antdv-next/x-markdown` with a custom code block component mapping. Register extra Shiki languages with `setupCodeHighlighter`.

## Mermaid

**Purpose**: Render Mermaid diagrams inside chat messages.

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

> Tip: Use inside a Bubble `content` slot, `contentRender`, or as a Markdown code block component for `language="mermaid"`. Default header actions include zoom, download, and copy.

## Folder

**Purpose**: Display a hierarchical file/folder tree with optional live preview — useful in AI coding assistant scenarios.

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
    @selected-file-change="file => console.log(file.path, file.content)"
  />
</template>
```

**Key props**: `treeData`, `selectedFile` (v-model) / `defaultSelectedFile`, `expandedPaths` (v-model) / `defaultExpandedPaths`, `defaultExpandAll` (default `true`), `fileContentService`, `previewRender`, `directoryTitle`, `directoryIcons`, `selectable`, `emptyRender`.

## XProvider

**Purpose**: Global configuration wrapper — replaces `antdv-next`'s `ConfigProvider`.

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

- Fully extends `antdv-next`'s `ConfigProvider` — all its config props are valid.
- Adds x-specific component config: `actions`, `attachments`, `bubble`, `codeHighlighter`, `conversations`, `fileCard`, `mermaid`, `prompts`, `sender`, `sources`, `suggestion`, `think`, `thoughtChain`, `welcome`.
- Place **once at the app root**.

## Notification

**Purpose**: Imperative **system** notifications (browser Notification API), not in-page message toasts.

```ts
import { Notification } from "@antdv-next/x";

Notification.open({
  title: "Connection lost",
  body: "Reconnecting...",
  duration: 5,
});

await Notification.requestPermission();
```

`Notification` is the default `XNotification` instance. It extends the browser's native `NotificationOptions` with `title`, `duration`, `onClick`, `onClose`, `onError`, `onShow`. `Notification.useNotification()` returns `[{ permission }, { open, close, requestPermission }]` for composable usage.

> Requires OS/browser notification permission. Calls are no-ops when the browser does not support the Notification API.
