---
title: Streaming Rendering
order: 4
---

Handle **LLM streamed Markdown** output: syntax completion and caching, animation, and tail suffix.

## Examples

<demo src="./demo/streaming-preset.vue" description="Left: no streaming handling. Right: :streaming=&quot;isStreaming&quot;. Try the slow pace to see the difference">Streaming Preset Comparison</demo>
<demo src="./demo/streaming-format.vue">Syntax Processing</demo>
<demo src="./demo/streaming-animation.vue">Rendering Controls</demo>

## API

### streaming

`streaming` accepts a boolean or an object. A boolean enables the preset: `true` means the stream is in progress (same as `hasNextChunk: true`) and switches on `incremental`, `incompleteMarkdown: 'complete'` and `typewriter`; `false` means the stream has ended and the final content is rendered at once. Pass your existing `isStreaming` flag straight through: `<XMarkdown :content="content" :streaming="isStreaming" />`. Pass an object to control each option individually — the object form's behavior and defaults are unchanged.

| Parameter                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Type                                                                   | Default                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------- |
| hasNextChunk                   | Whether more chunks are coming                                                                                                                                                                                                                                                                                                                                                                                                                                      | `boolean`                                                              | `false`                                        |
| incremental                    | Splits the document at headings so only the last, still-growing section is re-parsed and re-rendered per chunk. Pass an object for `minSectionChars` (shorter sections merge into the next) and `keepSectionsOnEnd` (default `true`: sections are kept when the stream ends so mounted custom components are not remounted; `false`: re-render the whole document at once when the stream ends — turn it off when using marked extensions with document-wide state) | `boolean \| { minSectionChars?: number; keepSectionsOnEnd?: boolean }` | `false`                                        |
| incompleteMarkdown             | How half-written syntax is shown: `placeholder` holds it back or shows the placeholder component; `complete` shows half-written emphasis, inline code, link text and list items as finished text right away                                                                                                                                                                                                                                                         | `'placeholder' \| 'complete'`                                          | `'placeholder'`                                |
| incompleteMarkdownComponentMap | Component mapping for incomplete syntax; an explicit entry always wins over `complete`                                                                                                                                                                                                                                                                                                                                                                              | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>`       | `{}`                                           |
| typewriter                     | Typewriter effect: newly arrived content is revealed at a steady pace following the chunk cadence instead of appearing in blocks                                                                                                                                                                                                                                                                                                                                    | `boolean \| TypewriterConfig`                                          | `false`                                        |
| enableAnimation                | Enable fade-in animation                                                                                                                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                              | `true`                                         |
| animationConfig                | Animation config                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `AnimationConfig`                                                      | `{ fadeDuration: 200, easing: 'ease-in-out' }` |
| tail                           | Enable tail indicator                                                                                                                                                                                                                                                                                                                                                                                                                                               | `boolean \| TailConfig`                                                | `false`                                        |

> `incremental` only splits before column-0 ATX headings; `#` lines inside fenced code (including fences nested in list items and blockquotes), HTML blocks (`<div>`, `<pre>`, `<script>`, comments, …) and `$$` math are not headings — the splitter tracks the same container and interruption rules the parser does. Splitting is disabled once a link reference or footnote definition appears, or when a custom component tag spans the boundary. The `$$` math model follows the bundled Latex plugin: without that plugin registered, `$$`-delimited text is plain markdown, so avoid `incremental` when such text wraps code fences. Sections render as siblings inside the same root element, so the DOM is identical to the whole-document render.

### TypewriterConfig

| Property         | Description                                                                                                                                                                                                                              | Type                   | Default                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------- |
| unit             | Reveal unit. `char` reveals character by character; `sentence` reveals up to the next delimiter at once (delimiters inside fenced or inline code do not count, a newline always does)                                                    | `'char' \| 'sentence'` | `'char'`                                  |
| delimiters       | Sentence delimiters                                                                                                                                                                                                                      | `string[]`             | `['。', '！', '？', '.', '!', '?', '\n']` |
| minCps           | Minimum reveal speed in characters per second; the speed adapts to the chunk cadence                                                                                                                                                     | `number`               | `24`                                      |
| maxCps           | Maximum reveal speed in characters per second                                                                                                                                                                                            | `number`               | `3000`                                    |
| pauseMs          | With `unit: 'char'`, the pause in milliseconds after revealing a delimiter                                                                                                                                                               | `number`               | `0`                                       |
| maxSentenceChars | With `unit: 'sentence'`, the longest run since the previous delimiter that is held back; beyond it text is revealed character by character until the next delimiter appears, so a long URL or one-line JSON blob does not stay invisible | `number`               | `120`                                     |

> What is shown is always a prefix of `content`, and a cut never lands inside an emoji (including multi-code-point sequences like 👨‍👩‍👧‍👦, 🇨🇳, 👍🏽, ❤️) or an accented character. Everything is revealed at once when `hasNextChunk` becomes `false`.

### TailConfig

| Property  | Description                                          | Type        | Default |
| --------- | ---------------------------------------------------- | ----------- | ------- |
| content   | Content to display as tail                           | `string`    | `'▋'`   |
| component | Custom tail component, takes precedence over content | `Component` | -       |

### AnimationConfig

| Property         | Description                                                                                                                                                                                                                                 | Type                    | Default                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| fadeDuration     | Duration in ms                                                                                                                                                                                                                              | `number`                | `200`                                     |
| easing           | CSS easing function                                                                                                                                                                                                                         | `string`                | `'ease-in-out'`                           |
| splitBy          | Fade-in unit. `chunk` fades each newly arrived text run in on its own; `sentence` merges arriving text into the current sentence and only starts the next fade-in unit at a delimiter. Pick `sentence` when used together with `typewriter` | `'chunk' \| 'sentence'` | `'chunk'`                                 |
| delimiters       | Sentence delimiters when `splitBy` is `sentence`                                                                                                                                                                                            | `string[]`              | `['。', '！', '？', '.', '!', '?', '\n']` |
| maxSentenceChars | With `splitBy: 'sentence'`, the most characters one fade-in unit may hold; text arriving beyond that starts a new unit                                                                                                                      | `number`                | `120`                                     |

> The tail displays `▋` by default. You can customize the character via `content`, or pass a custom Vue component via `component` for animations, delayed display, and other effects.
>
> ```ts
> // Custom tail component example
> import { defineComponent, h, ref } from "vue";
>
> const DelayedTail = defineComponent({
>   props: { content: String },
>   setup(props) {
>     const visible = ref(false);
>     setTimeout(() => {
>       visible.value = true;
>     }, 2000);
>
>     return () => (visible.value ? h("span", props.content) : null);
>   },
> });
> ```

### debug

| Property | Description                                 | Type      | Default |
| -------- | ------------------------------------------- | --------- | ------- |
| debug    | Whether to enable performance monitor panel | `boolean` | `false` |

> ⚠️ **debug** is for development only. Disable in production to avoid overhead and information leakage.

## Supported Incomplete Types

| TokenType     | Example                  |
| ------------- | ------------------------ |
| `link`        | `[text](https://example` |
| `image`       | `![alt](https://img...`  |
| `emphasis`    | `**text`                 |
| `inline-code` | `` `npm install ``       |
| `table`       | `\| col1 \| col2 \|`     |
| `html`        | `<div class="`           |

## Minimal Setup

```vue
<script setup>
import { XMarkdown } from "@antdv-next/x-markdown";
import { ref } from "vue";

const content = ref("");
const streaming = ref({
  hasNextChunk: true,
  enableAnimation: true,
  tail: true,
  incompleteMarkdownComponentMap: {
    link: "link-loading",
    image: "image-loading",
  },
});
</script>

<template>
  <XMarkdown
    :content="content"
    :streaming="streaming"
    :components="components"
  />
</template>
```

## Custom Component Re-renders

Every parse hands custom components a fresh `domNode`, and Vue has neither a `React.memo`-style props comparator nor a way to skip updates for components with slots — so custom components re-rendering on every chunk during streaming is expected behavior. The right ways to control the cost:

- **`incremental` (recommended)**: finished sections never re-render as a whole; only the last, still-growing section takes part in each chunk's parse and render, and container components (`table`, custom tags) benefit too;
- **Move expensive work out of the render path**: take `XCodeHighlighter` — re-highlighting is driven by `watch(content / language / theme)`, so unchanged text never re-tokenizes, and the re-render itself is just a vnode rebuild with negligible cost;
- Keep `components`, `config`, `streaming` and similar objects stable outside the component (module constants or `computed`); inline literals keep changing the parser configuration.

## FAQ

### Can `hasNextChunk` always be `true`?

Not recommended. Switch it to `false` after the last chunk arrives, otherwise incomplete syntax stays in its placeholder state. With the boolean form, passing `isStreaming` straight to `streaming` takes care of this.
