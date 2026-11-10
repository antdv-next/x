# Composition Patterns

## Pattern 1: Full Chat Page

The standard layout for an AI chat application: sidebar, message area, and input.

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

// Keep this object stable — define once, outside the render function.
const role = {
  assistant: { placement: "start" },
  user: { placement: "end" },
} as const;

const isEmpty = computed(() => messages.value.length === 0);

const onSubmit = (content: string) => {
  messages.value.push({ key: Date.now(), role: "user", content });
  value.value = "";
  loading.value = true;
  // Dispatch to the data layer (useXChat or a custom request).
};
</script>

<template>
  <XProvider>
    <div style="display: flex; height: 100vh">
      <!-- Sidebar -->
      <Conversations
        style="width: 240px; border-right: 1px solid #f0f0f0"
        :items="conversations"
        :active-key="activeKey"
        :on-active-change="key => (activeKey = key)"
        groupable
        :creation="{ label: 'New Chat', onClick: () => {} }"
      />

      <!-- Main area -->
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

        <!-- Input -->
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

## Pattern 2: Bubble with Message Actions

Add copy, feedback, and retry below each assistant message. Use the `footer` field in the role config so the actions only appear for assistant bubbles.

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
  // re-send the last user message
};

// Defined once — do not rebuild this object on every render.
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

## Pattern 3: Streaming Bubble

Connect `BubbleList` to `useXChat` from `@antdv-next/x-sdk`.

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
      // streaming=true while generating, false once done
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

`provider` shape depends on your API — see the `x-chat-provider` skill.

---

## Pattern 4: Reasoning / Thinking Display

Show a model's chain-of-thought before the final answer.

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
  <!-- Single collapsible think block -->
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

  <!-- Multi-step tool-call chain -->
  <ThoughtChain :items="steps" />
</template>
```

---

## Pattern 5: File Attachments in Sender

Allow users to attach files to their messages.

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
  console.log(payload); // send payload...
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

## Pattern 6: Suggestion / Slash Commands

Trigger a suggestion popup when the user types `/`.

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

## Pattern 7: Source Citations

Show which documents were referenced in an AI answer.

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

// Suppose each item carries citations in extraInfo.sources
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

## Anti-patterns to Avoid

| Anti-pattern                                     | Why it's wrong                               | Fix                                            |
| ------------------------------------------------ | -------------------------------------------- | ---------------------------------------------- |
| `v-for` over `Bubble`                            | Loses scroll anchoring and auto-scroll       | Use `BubbleList`                               |
| Inline `role` object in the template             | Recreated on every render, resets animations | Define it once in `script setup` or a constant |
| Leaving `streaming` `true` after the stream ends | Content never reaches its done state         | Set `streaming: false` on the final chunk      |
| Raw HTML in `content`                            | XSS risk, no sanitization                    | Use `contentRender` with `XMarkdown`           |
| Multiple nested `XProvider`                      | Theme/locale conflicts                       | Single root `XProvider`                        |
| Using `onChange` as the submit handler           | Fires on every keystroke                     | Use `onSubmit` for the send action             |
| Creating `items` in the template                 | New array each render → scroll jank          | Keep `items` in a `ref` / `computed`           |
