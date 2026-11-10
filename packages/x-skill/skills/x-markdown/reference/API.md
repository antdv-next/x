# API Reference

## XMarkdownProps

| Property                 | Description                                                                                                                         | Type                                      | Default         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | --------------- |
| content                  | Markdown content to render. There is no `children` prop; use `content`                                                              | `string`                                  | `''`            |
| components               | Map HTML nodes to custom Vue components                                                                                             | `Record<string, Component>`               | `{}`            |
| componentsProps          | Extra props passed to `components` by tag name; keeps component references stable and avoids remounts from inline closures          | `Record<string, Record<string, unknown>>` | -               |
| streaming                | Streaming behavior. A boolean enables the preset (`true` = still streaming, `false` = ended); pass an object for per-option control | `boolean \| StreamingOption`              | -               |
| config                   | Marked parse config, applied last and may override built-in renderers                                                               | `MarkedConfig`                            | `{ gfm: true }` |
| className                | Extra CSS class for the root container                                                                                              | `string`                                  | -               |
| style                    | Inline styles for the root container                                                                                                | `Record<string, string>`                  | -               |
| paragraphTag             | HTML tag for paragraphs (avoids validation issues when custom components contain block elements)                                    | `string`                                  | `'p'`           |
| openLinksInNewTab        | Add `target="_blank"` to all links so they open in a new tab                                                                        | `boolean`                                 | `true`          |
| protectCustomTagNewlines | Whether to preserve newlines inside custom tags                                                                                     | `boolean`                                 | `true`          |
| escapeRawHtml            | Escape raw HTML in Markdown as plain text instead of parsing it as real HTML                                                        | `boolean`                                 | `false`         |
| debug                    | Enable the development-only performance overlay                                                                                     | `boolean`                                 | `false`         |

> The current version has no `dompurifyConfig`, `rootClassName`, `prefixCls`, or `children` prop. Raw HTML is sanitized internally with DOMPurify; use `escapeRawHtml` when it should remain visible as text.

### MarkedConfig

```ts
interface MarkedConfig {
  breaks?: boolean;
  gfm?: boolean;
  extensions?: TokenizerAndRendererExtension[] | null;
}
```

### StreamingOption

| Field                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Type                                                                   | Default         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------- |
| hasNextChunk                   | Whether more chunks are expected. Set `false` for the final chunk so cached incomplete fragments flush into the final render                                                                                                                                                                                                                                                                                                                                  | `boolean`                                                              | `false`         |
| incremental                    | Split the document at headings while streaming so only the last, still-growing section is re-parsed and re-rendered per chunk. Pass an object for `minSectionChars` and `keepSectionsOnEnd`. Splitting is refused (deliberately) inside fenced code, HTML blocks, lists, blockquotes, indented code, raw blocks, and `$$` / `\[` math; it is disabled when a link reference or footnote definition appears, or when a custom component tag spans the boundary | `boolean \| { minSectionChars?: number; keepSectionsOnEnd?: boolean }` | `false`         |
| enableAnimation                | Enable fade-in animation for block elements                                                                                                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                              | `true`          |
| animationConfig                | Animation options                                                                                                                                                                                                                                                                                                                                                                                                                                             | `AnimationConfig`                                                      | -               |
| tail                           | Enable the tail indicator (`true` uses `▋`; pass an object to customize it)                                                                                                                                                                                                                                                                                                                                                                                   | `boolean \| TailConfig`                                                | `false`         |
| incompleteMarkdownComponentMap | Map incomplete Markdown fragments to custom loading components. An explicit entry always wins over `incompleteMarkdown: 'complete'`                                                                                                                                                                                                                                                                                                                           | `Partial<Record<Exclude<StreamCacheTokenType, 'text'>, string>>`       | `{}`            |
| incompleteMarkdown             | How half-written syntax is shown: `placeholder` holds it back or shows the mapped placeholder component; `complete` shows half-written emphasis, inline code, link text, and list items as finished text while images, HTML, and tables stay in placeholder mode                                                                                                                                                                                              | `'placeholder' \| 'complete'`                                          | `'placeholder'` |
| typewriter                     | Typewriter effect: reveal newly arrived content at a steady pace that follows the chunk cadence instead of showing it in blocks. What is shown is always a prefix of `content`; everything is revealed at once when `hasNextChunk` becomes `false`                                                                                                                                                                                                            | `boolean \| TypewriterConfig`                                          | `false`         |

#### Boolean preset

`streaming={true}` expands to a frozen preset equivalent to:

```ts
{
  hasNextChunk: true,
  incremental: true,
  incompleteMarkdown: "complete",
  typewriter: true,
  animationConfig: { splitBy: "sentence" },
}
```

`streaming={false}` is the same preset with `hasNextChunk: false`, so passing an `isStreaming` flag straight through is the recommended setup for LLM output.

#### `incremental` object

| Property          | Description                                                                                                                                                                                                                                       | Type      | Default |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------- |
| minSectionChars   | Sections shorter than this are merged into the next section                                                                                                                                                                                       | `number`  | -       |
| keepSectionsOnEnd | Keep the sections when the stream ends so mounted custom components are not remounted. Set to `false` to re-render the whole document at once; turn it off when using marked extensions with document-wide state (e.g. heading id de-duplication) | `boolean` | `true`  |

### TypewriterConfig

| Property         | Description                                                                                                                                                                                                                              | Type                   | Default                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------- |
| unit             | Reveal unit. `char` reveals character by character; `sentence` reveals up to the next delimiter at once (delimiters inside fenced or inline code do not count, a newline always does)                                                    | `'char' \| 'sentence'` | `'char'`                                  |
| delimiters       | Sentence delimiters                                                                                                                                                                                                                      | `string[]`             | `['。', '！', '？', '.', '!', '?', '\n']` |
| minCps           | Minimum reveal speed in characters per second; the speed adapts to the chunk cadence                                                                                                                                                     | `number`               | `24`                                      |
| maxCps           | Maximum reveal speed in characters per second                                                                                                                                                                                            | `number`               | `3000`                                    |
| pauseMs          | With `unit: 'char'`, the pause in milliseconds after revealing a delimiter                                                                                                                                                               | `number`               | `0`                                       |
| maxSentenceChars | With `unit: 'sentence'`, the longest run since the previous delimiter that is held back; beyond it text is revealed character by character until the next delimiter appears, so a long URL or one-line JSON blob does not stay invisible | `number`               | `120`                                     |

### AnimationConfig

| Property         | Description                                                                                                                                                                                                                                 | Type                    | Default                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----------------------------------------- |
| fadeDuration     | Duration in ms                                                                                                                                                                                                                              | `number`                | `200`                                     |
| easing           | CSS easing function                                                                                                                                                                                                                         | `string`                | `'ease-in-out'`                           |
| splitBy          | Fade-in unit. `chunk` fades each newly arrived text run in on its own; `sentence` merges arriving text into the current sentence and only starts the next fade-in unit at a delimiter. Pick `sentence` when used together with `typewriter` | `'chunk' \| 'sentence'` | `'chunk'`                                 |
| delimiters       | Sentence delimiters when `splitBy` is `sentence`                                                                                                                                                                                            | `string[]`              | `['。', '！', '？', '.', '!', '?', '\n']` |
| maxSentenceChars | With `splitBy: 'sentence'`, the most characters one fade-in unit may hold; text arriving beyond it starts a new unit                                                                                                                        | `number`                | `120`                                     |

### TailConfig

| Property  | Description                                            | Type        | Default |
| --------- | ------------------------------------------------------ | ----------- | ------- |
| content   | Content to display as tail                             | `string`    | `'▋'`   |
| component | Custom tail component, takes precedence over `content` | `Component` | -       |

### StreamCacheTokenType

`text | link | image | html | emphasis | list | table | inline-code`.

`incompleteMarkdownComponentMap` accepts every type except `text`.

## Related Docs

- [Component Extension](EXTENSIONS.md)
- [Streaming](STREAMING.md)
