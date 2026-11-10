---
name: x-components
version: 0.0.3
description: Use when building AI chat UIs with @antdv-next/x components — covers Bubble, BubbleList, Sender, Conversations, Prompts, ThoughtChain, Actions, Welcome, Attachments, Sources, Suggestion, Think, FileCard, CodeHighlighter, Mermaid, Folder, XProvider, and Notification.
---

# 🎯 Skill Positioning

**This skill covers all UI components in `@antdv-next/x`** — the Vue 3 component library for building AI-driven chat interfaces based on the RICH interaction paradigm.

It covers component selection, API usage, composition patterns, and common anti-patterns.

> **Prerequisite**: This skill handles UI only. For data flow and streaming, see `use-x-chat`, `x-chat-provider`, `x-request` skills.

## Table of Contents

- [📦 Package Overview](#-package-overview)
- [🗂️ Component Groups](#️-component-groups)
- [🚀 Quick Start Decision Guide](#-quick-start-decision-guide)
- [🛠 Recommended Workflow](#-recommended-workflow)
- [🚨 Development Rules](#-development-rules)
- [🤝 Skill Collaboration](#-skill-collaboration)
- [🔗 Reference Resources](#-reference-resources)

# 📦 Package Overview

| Package                  | Responsibility                                              |
| ------------------------ | ----------------------------------------------------------- |
| `@antdv-next/x`          | All UI components in this skill                             |
| `@antdv-next/x-sdk`      | Data providers, request, streaming state — not covered here |
| `@antdv-next/x-markdown` | Markdown rendering inside Bubble — see `x-markdown` skill   |

```bash
npm install @antdv-next/x
```

> `@antdv-next/x` extends `antdv-next`. If you already use `ConfigProvider` from `antdv-next`, replace it with `XProvider` at the app root.

# 🗂️ Component Groups

Based on the RICH interaction paradigm:

| Stage            | Components                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| **General**      | `Bubble`, `BubbleList`, `Conversations`, `Notification`                  |
| **Wake**         | `Welcome`, `Prompts`                                                     |
| **Express**      | `Sender`, `SenderHeader`, `Attachments`, `Suggestion`                    |
| **Confirmation** | `Think`, `ThoughtChain`                                                  |
| **Feedback**     | `Actions`, `FileCard`, `Sources`, `CodeHighlighter`, `Mermaid`, `Folder` |
| **Global**       | `XProvider`                                                              |

Vue exports are flat, not namespaced. Use `BubbleList` (not `Bubble.List`), `SenderHeader` (not `Sender.Header`), `ActionsCopy` / `ActionsFeedback` / `ActionsAudio` / `ActionsItem` (not `Actions.Copy`), and `FileCardList` (not `FileCard.List`).

# 🚀 Quick Start Decision Guide

| If you need to...                | Read first                                                                                      |
| -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Render a chat message bubble     | [COMPONENTS.md → Bubble](reference/COMPONENTS.md#bubble)                                        |
| Render a message list            | [COMPONENTS.md → BubbleList](reference/COMPONENTS.md#bubblelist)                                |
| Build a chat input box           | [COMPONENTS.md → Sender](reference/COMPONENTS.md#sender)                                        |
| List and switch conversations    | [COMPONENTS.md → Conversations](reference/COMPONENTS.md#conversations)                          |
| Show AI thinking process         | [COMPONENTS.md → Think / ThoughtChain](reference/COMPONENTS.md#think--thoughtchain)             |
| Add action buttons below a reply | [COMPONENTS.md → Actions](reference/COMPONENTS.md#actions)                                      |
| Build a welcome / onboarding UI  | [COMPONENTS.md → Welcome + Prompts](reference/COMPONENTS.md#welcome--prompts)                   |
| Show file attachments in input   | [COMPONENTS.md → SenderHeader + Attachments](reference/COMPONENTS.md#senderheader--attachments) |
| Show source citations            | [COMPONENTS.md → Sources](reference/COMPONENTS.md#sources)                                      |
| Add quick command suggestions    | [COMPONENTS.md → Suggestion](reference/COMPONENTS.md#suggestion)                                |
| Display a file tree              | [COMPONENTS.md → Folder](reference/COMPONENTS.md#folder)                                        |
| Wire a complete chat page        | [PATTERNS.md](reference/PATTERNS.md)                                                            |
| Look up a specific prop          | [API.md](reference/API.md)                                                                      |

# 🛠 Recommended Workflow

1. Pick components from [COMPONENTS.md](reference/COMPONENTS.md) for each interaction stage.
2. Use [PATTERNS.md](reference/PATTERNS.md) to compose full pages.
3. Wrap the app root with `XProvider` for locale, direction, theme, and shortcut keys.
4. Use [API.md](reference/API.md) for exact prop names — do not guess them.

## Minimal Full-Page Example

```vue
<script setup lang="ts">
import { BubbleList, Prompts, Sender, Welcome, XProvider } from "@antdv-next/x";
import { ref } from "vue";

const value = ref("");

const prompts = [
  { key: "1", label: "What can you do?" },
  { key: "2", label: "Write a Vue component" },
];

const messages = [
  { key: "1", role: "assistant", content: "Hello! How can I help?" },
];
</script>

<template>
  <XProvider>
    <Welcome title="Hello!" description="How can I help you?" />
    <Prompts
      :items="prompts"
      :on-item-click="info => console.log(info.data.label)"
    />
    <BubbleList :items="messages" />
    <Sender v-model:value="value" :on-submit="msg => console.log(msg)" />
  </XProvider>
</template>
```

# 🚨 Development Rules

- **Always use `XProvider` at the app root** — it supersedes `antdv-next`'s `ConfigProvider` and enables locale, direction, and x-specific shortcut keys.
- **Use `BubbleList`, not a manual `v-for` over `Bubble`** — `BubbleList` handles scroll anchoring, auto-scroll, and role-based layout; mapping `Bubble` manually loses these.
- **Keep `role`, `components`, and `componentsProps` stable** — define them outside the render function or in `computed`; inline object creation resets typing animations and scroll behavior.
- **Set `streaming` to `true` during stream, `false` on the final chunk** — leaving it `true` permanently breaks the done state.
- **`ThoughtChain` vs `Think`**: use `ThoughtChain` for multi-step tool/agent call chains; use `Think` for a collapsible single-block reasoning display.
- **Prefer the preset sub-components** `ActionsCopy`, `ActionsFeedback`, `ActionsAudio`, and `ActionsItem` over building custom equivalents. The legacy `Actions.Copy` namespace form is compatible but not preferred.
- **Sender `onSubmit` vs `onChange`**: `onSubmit` fires on the send button or Enter key; `onChange` fires on every keystroke — do not conflate them.
- **Never render `Mermaid` or `CodeHighlighter` inside a Bubble `content` string** — use the `content` slot, `contentRender`, or the Markdown `components` map instead.
- **Callback props use the `onXxx` form in templates** (`:on-submit`, `:on-change`, `:on-item-click`) matching the component API; `v-model:value` / `v-model:items` cover two-way bindings.

# 🤝 Skill Collaboration

| Scenario                   | Skill combination                                                              |
| -------------------------- | ------------------------------------------------------------------------------ |
| Full AI chat app           | `x-chat-provider` → `x-request` → `use-x-chat` → `x-components` → `x-markdown` |
| Just building UI structure | `x-components` only                                                            |
| Markdown in bubble replies | `x-components` + `x-markdown`                                                  |
| Streaming data flow only   | `use-x-chat` + `x-request`                                                     |
| Structured card responses  | `x-components` + `x-card`                                                      |

# 🔗 Reference Resources

- [COMPONENTS.md](reference/COMPONENTS.md) — Component-by-component guide with usage, key props, and Vue examples
- [PATTERNS.md](reference/PATTERNS.md) — Full-page composition patterns and integration recipes
- [API.md](reference/API.md) — Consolidated prop, event, and slot reference for all 17 component families

## Official Documentation

- [Components Overview](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/index.en-US.md)
- [Bubble](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/bubble/index.en-US.md)
- [Sender](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/sender/index.en-US.md)
- [Conversations](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/conversations/index.en-US.md)
- [ThoughtChain](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/thought-chain/index.en-US.md)
- [Actions](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/actions/index.en-US.md)
- [Welcome](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/welcome/index.en-US.md)
- [Prompts](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/prompts/index.en-US.md)
- [Attachments](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/attachments/index.en-US.md)
- [Sources](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/sources/index.en-US.md)
- [Suggestion](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/suggestion/index.en-US.md)
- [Think](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/think/index.en-US.md)
- [Folder](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/folder/index.en-US.md)
- [XProvider](https://github.com/antdv-next/x/blob/main/packages/docs/src/pages/components/x-provider/index.en-US.md)
