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

## API

### Props

| Property                 | Description                             | Type                        | Default         |
| ------------------------ | --------------------------------------- | --------------------------- | --------------- |
| content                  | Markdown content to render              | `string`                    | -               |
| components               | Map HTML nodes to custom Vue components | `Record<string, Component>` | -               |
| streaming                | Streaming behavior config               | `StreamingOption`           | -               |
| config                   | Marked parse config                     | `MarkedConfig`              | `{ gfm: true }` |
| className                | Extra CSS class for root container      | `string`                    | -               |
| style                    | Inline styles for root container        | `Record<string, string>`    | -               |
| paragraphTag             | HTML tag for paragraphs                 | `string`                    | `'p'`           |
| openLinksInNewTab        | Add `target="_blank"` to all links      | `boolean`                   | `true`          |
| protectCustomTagNewlines | Preserve newlines inside custom tags    | `boolean`                   | `true`          |
| escapeRawHtml            | Escape raw HTML as plain text           | `boolean`                   | `false`         |
| debug                    | Enable debug mode                       | `boolean`                   | `false`         |

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

Import theme styles and set the theme class on the root:

```vue
<script setup>
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
