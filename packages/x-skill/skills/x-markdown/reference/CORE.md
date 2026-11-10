# Core Guide

## Package Boundaries

| Need                                  | Package                  |
| ------------------------------------- | ------------------------ |
| Render message content as Markdown    | `@antdv-next/x-markdown` |
| Build chat UI containers              | `@antdv-next/x`          |
| Manage provider/request/message state | `@antdv-next/x-sdk`      |

## Install and Minimal Render

```bash
npm install @antdv-next/x-markdown
```

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `
# Hello

- item 1
- item 2
`;
</script>

<template>
  <XMarkdown :content="content" class="x-markdown-light" />
</template>
```

`themes/index.css` contains the default tag styles; `themes/light.css` or `themes/dark.css` provides the theme variables. Import both when you want the built-in typography.

## Safe Defaults

- Use `content`; there is no `children` prop.
- Start with plain Markdown before adding plugins or custom components.
- `openLinksInNewTab` is `true` by default.
- `protectCustomTagNewlines` is `true` by default; turn it off only when your custom tag parsing intentionally relies on blank lines.
- Raw HTML is sanitized internally with DOMPurify; there is no `dompurifyConfig` prop. Use `escapeRawHtml` when raw HTML should remain visible as text.
- For streaming content, prefer the boolean preset: `:streaming="isStreaming"`.

## Common Integration Patterns

### Basic content block

```vue
<XMarkdown :content="message" class="x-markdown-light" />
```

### Chat message rendering

Render plain text or Markdown from message data after `useXChat` has already produced the message list.

```vue
<XMarkdown
  :content="message.message.content"
  :open-links-in-new-tab="true"
  escape-raw-html
/>
```

### Minimal checklist

- Confirm the content is actually Markdown, not a structured component schema.
- Keep rendering concerns out of Provider classes.
- Keep transport concerns out of `XMarkdown`.
- Add themes and custom components only after basic rendering works.

## When to Read Other References

- Read [STREAMING.md](STREAMING.md) when content arrives incrementally from an LLM.
- Read [EXTENSIONS.md](EXTENSIONS.md) when you need custom tags, code blocks, plugins, or themes.
- Read `API.md` for the full prop tables and defaults.
