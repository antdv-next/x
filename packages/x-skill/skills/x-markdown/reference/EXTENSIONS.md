# Extensions Guide

## Components

`components` is the main extension point. Use it to map Markdown or custom HTML tags to Vue components.

```vue
<script setup>
import { Mermaid, Sources, Think } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";

const components = {
  mermaid: Mermaid,
  think: Think,
  sources: Sources,
};
</script>

<template>
  <XMarkdown :content="content" :components="components" />
</template>
```

### Passing extra props

Use `componentsProps` to pass fixed props by tag name. This keeps the `components` references stable and avoids remounting components when the extra props change.

```vue
<XMarkdown
  :content="content"
  :components="components"
  :components-props="{
    mermaid: { theme: 'dark' },
    'my-chart': { height: 320 },
  }"
/>
```

### Rules for component mappings

- Keep the `components` and `componentsProps` objects stable across renders (module constants or `computed`).
- Use `streamStatus` to separate temporary loading UI from final rendering.
- If a custom component contains block children, consider `paragraphTag` to avoid invalid nested markup.
- Keep custom tags semantically clear and avoid ambiguous mixed Markdown/HTML blocks.

## Plugins

Built-in plugins are imported from `@antdv-next/x-markdown/plugins/...` and wired through `config`.

```vue
<script setup>
import Latex from "@antdv-next/x-markdown/plugins/Latex";
import { XMarkdown } from "@antdv-next/x-markdown";

const config = {
  extensions: Latex(),
};
</script>

<template>
  <XMarkdown :content="content" :config="config" />
</template>
```

Use a plugin when the syntax extension belongs in parsing, not when it is only a visual replacement of a rendered node.

## Themes

Start from a built-in theme stylesheet. Import the base styles and one theme:

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import { XMarkdown } from "@antdv-next/x-markdown";
</script>

<template>
  <XMarkdown class="x-markdown-light" :content="content" />
</template>
```

For customization:

1. Keep the built-in theme class.
2. Add one custom class.
3. Override only the CSS variables you actually need.

## Custom Tag Guidance

- Keep custom tag blocks well formed.
- Avoid stray blank lines inside custom HTML blocks unless the syntax is intentional.
- If newlines inside custom tags matter, review `protectCustomTagNewlines` (default `true`).

## Pick the Right Tool

- Use `components` for replacing rendered nodes with Vue components.
- Use plugins for parsing new syntax.
- Use themes for typography, spacing, and color.
- Use `escapeRawHtml` for safety, not for visual customization. There is no `dompurifyConfig` prop.
