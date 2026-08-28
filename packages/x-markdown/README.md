# @antdv-next/x-markdown

Vue 3 streaming-friendly, highly extensible, and high-performance Markdown renderer.

## ✨ Features

Built on [`marked`](https://github.com/markedjs/marked) as the base Markdown renderer.

- 🚀 Built for speed
- 🤖 Streaming-friendly, a Markdown rendering solution for LLM/AI
- ⬇️ Low-level compiler for parsing Markdown without long-term caching
- ⚖️ Lightweight while implementing all supported Markdown styles
- 🔐 Secure by default, no XSS attacks via DOMPurify
- 🎨 Customizable components - replace any Markdown element with your own Vue components
- 🔧 Rich plugin ecosystem
- 😊 Compatible - 100% CommonMark compliant, 100% GFM compliant

## Compatibility

| <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" /> Edge | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" /> Firefox | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" /> Chrome | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" /> Safari | <img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" /> Opera |
| --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| >= 92                                                                                                                                         | >= 90                                                                                                                                                     | >= 92                                                                                                                                                 | >= 15.4                                                                                                                                               | >= 78                                                                                                                                             |

## Supported Markdown Specifications

- [Markdown 1.0.0](https://daringfireball.net/projects/markdown/)
- [CommonMark](https://github.com/commonmark/commonmark-spec/wiki/Markdown-Flavors)
- [GitHub Flavored Markdown (GFM)](https://github.github.com/gfm/)

## 📦 Installation

```bash
npm install @antdv-next/x-markdown
```

```bash
yarn add @antdv-next/x-markdown
```

```bash
pnpm add @antdv-next/x-markdown
```

## Example

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = `
# Hello World

### Welcome to XMarkdown!

- Item 1
- Item 2
- Item 3
`;
</script>

<template>
  <XMarkdown :content="content" />
</template>
```

### Streaming Example

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = ref("");
const streaming = ref({
  hasNextChunk: true,
  enableAnimation: true,
  tail: true,
});

// Simulate streaming
function onChunk(chunk) {
  content.value += chunk;
}
</script>

<template>
  <XMarkdown :content="content" :streaming="streaming" />
</template>
```

## Styles

Breaking change: `@antdv-next/x-markdown` no longer imports styles automatically. Import the base styles manually, plus one optional theme stylesheet:

```ts
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
```

## API

### Props

| Property                 | Description                                         | Type                                      | Default         |
| ------------------------ | --------------------------------------------------- | ----------------------------------------- | --------------- |
| content                  | Markdown content to render                          | `string`                                  | -               |
| components               | Map HTML nodes to custom Vue components             | `Record<string, Component>`               | -               |
| componentsProps          | Extra props passed to custom components by tag name | `Record<string, Record<string, unknown>>` | -               |
| streaming                | Streaming behavior config                           | `StreamingOption`                         | -               |
| config                   | Marked parse config                                 | `MarkedConfig`                            | `{ gfm: true }` |
| className                | Extra CSS class for root container                  | `string`                                  | -               |
| style                    | Inline styles for root container                    | `Record<string, string>`                  | -               |
| paragraphTag             | HTML tag for paragraphs                             | `string`                                  | `'p'`           |
| openLinksInNewTab        | Add `target="_blank"` to all links                  | `boolean`                                 | `true`          |
| protectCustomTagNewlines | Preserve newlines inside custom tags                | `boolean`                                 | `true`          |
| escapeRawHtml            | Escape raw HTML as plain text                       | `boolean`                                 | `false`         |
| debug                    | Enable debug mode                                   | `boolean`                                 | `false`         |

### Passing extra props to custom components

Custom components often need business data (theme, callbacks, etc.). Passing it via an inline wrapper function creates a new component on every render and forces the subtree to be re-created, losing internal state and hurting performance in streaming scenarios. Use `componentsProps` to pass extra props while keeping component references stable:

```vue
<script setup>
import { computed, ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";

const theme = ref("dark");
const components = { "custom-chart": CustomChart };
// Keep the reference stable — an inline object literal invalidates the render
// cache and re-parses the whole tree on every render.
const componentsProps = computed(() => ({
  "custom-chart": { theme: theme.value, onSelect },
}));
</script>

<template>
  <XMarkdown :components="components" :componentsProps="componentsProps" />
</template>
```

`componentsProps` is keyed by tag name. Its props are merged with the parsed HTML attributes and passed to the component:

- On conflict `componentsProps` wins — a `title` in `componentsProps` overrides `title="..."` from the HTML.
- `class` / `className` is the exception: both sides are concatenated, with the `componentsProps` class name first (merged into `class`).
- Internally computed props — `streamStatus`, `domNode`, `children` (plus `lang` and `block` for `code`) — cannot be overridden and are ignored if present in `componentsProps`.

When `componentsProps` changes, the component receives a normal props update without being remounted. Like `components`, it takes part in the render cache, so passing an inline object literal invalidates that cache on every render and re-parses the whole tree — keep the reference stable (e.g. with `computed`) as shown above.

### StreamingOption

| Field                          | Description                                    | Type                                 | Default |
| ------------------------------ | ---------------------------------------------- | ------------------------------------ | ------- |
| hasNextChunk                   | Whether more chunks are expected               | `boolean`                            | `false` |
| enableAnimation                | Enable fade-in animation                       | `boolean`                            | `true`  |
| animationConfig                | Animation options                              | `AnimationConfig`                    | -       |
| tail                           | Enable tail indicator                          | `boolean \| TailConfig`              | `false` |
| incompleteMarkdownComponentMap | Map incomplete fragments to loading components | `Partial<Record<TokenType, string>>` | -       |

### AnimationConfig

| Property     | Description         | Type     | Default      |
| ------------ | ------------------- | -------- | ------------ |
| fadeDuration | Duration in ms      | `number` | `300`        |
| easing       | CSS easing function | `string` | `'ease-out'` |

### TailConfig

| Property  | Description                | Type        | Default |
| --------- | -------------------------- | ----------- | ------- |
| content   | Content to display as tail | `string`    | `'▋'`   |
| component | Custom tail component      | `Component` | -       |

## Themes

Import base styles, theme styles, and set the theme class on the root:

```vue
<script setup>
import "@antdv-next/x-markdown/themes/index.css";
import "@antdv-next/x-markdown/themes/light.css";
</script>

<template>
  <XMarkdown class="x-markdown-light" content="# Hello" />
</template>
```

Available themes:

- `light.css` - Light theme
- `dark.css` - Dark theme

## Plugins

Rich plugins available. See documentation for details.
