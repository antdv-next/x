---
group:
  title: Plugins
  order: 6
title: Overview
order: 1
---

Plugin-style extension enables `@antdv-next/x-markdown` to support more capabilities, such as formulas, custom syntax, and domain-specific tags.

## Extension Strategies

### 1. Syntax Preprocessing (Recommended)

Transform extended syntax into standard Markdown or custom tags before rendering.

```ts
const transformed = computed(() =>
  raw.value.replace(/:::note\n([\s\S]*?)\n:::/g, '<x-note text="$1"></x-note>'),
);
```

### 2. Component Mapping

Map custom tags to Vue components via `components` and centralize rendering behavior.

```vue
<XMarkdown :content="content" :components="components" />
```

## Plugin Docs

- [Latex](/markdown/plugin-latex-en)
- [Custom Plugins](/markdown/custom-plugin-en)
