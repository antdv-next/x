---
title: Code Examples
order: 2
---

## When to Use

Use this page for a quick setup to render LLM Markdown output, then scale to streaming, component mapping, and syntax extension.

## Code Examples

<!-- prettier-ignore -->
<demo src="./demo/basic.vue">Basic Rendering</demo>
<demo src="./streaming/demo/combined.vue">Streaming Rendering</demo>
<demo src="./demo/code-highlighter.vue">Component Extension</demo>
<demo src="./demo/custom-plugin.vue">Plugin Extension</demo>
<demo src="./demo/escape-raw-html.vue">Security & Links</demo>

## API

| Property                 | Description                             | Type                        | Default         |
| ------------------------ | --------------------------------------- | --------------------------- | --------------- |
| content                  | Markdown content to render              | `string`                    | `''`            |
| components               | Map HTML nodes to custom Vue components | `Record<string, Component>` | `{}`            |
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

| Field                          | Description                                    | Type                                                             | Default |
| ------------------------------ | ---------------------------------------------- | ---------------------------------------------------------------- | ------- |
| hasNextChunk                   | Whether more chunks are expected               | `boolean`                                                        | `false` |
| enableAnimation                | Whether to enable fade-in animation            | `boolean`                                                        | `true`  |
| animationConfig                | Animation options                              | `AnimationConfig`                                                | -       |
| tail                           | Enable tail indicator                          | `boolean \| TailConfig`                                          | `false` |
| incompleteMarkdownComponentMap | Map incomplete fragments to loading components | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>` | -       |

### TailConfig

| Property  | Description                                          | Type        | Default |
| --------- | ---------------------------------------------------- | ----------- | ------- |
| content   | Content to display as tail                           | `string`    | `'▋'`   |
| component | Custom tail component, takes precedence over content | `Component` | -       |

### AnimationConfig

| Property     | Description         | Type     | Default      |
| ------------ | ------------------- | -------- | ------------ |
| fadeDuration | Duration in ms      | `number` | `300`        |
| easing       | CSS easing function | `string` | `'ease-out'` |
