# Streaming Guide

## When to Use

Use streaming mode when the Markdown content is appended chunk-by-chunk and may temporarily contain incomplete syntax.

Typical examples:

- partial links like `[docs](https://example`
- partial tables
- unfinished code fences
- a tail cursor while the assistant is still generating

## Recommended: the boolean preset

Pass your own "is the answer still streaming" flag straight to `streaming`. `true` switches on the preset (`incremental`, `incompleteMarkdown: 'complete'`, `typewriter`, and sentence-based fade-in); `false` renders the final content at once.

```vue
<script setup>
import { ref } from "vue";
import { XMarkdown } from "@antdv-next/x-markdown";

const content = ref("");
const isStreaming = ref(true);
</script>

<template>
  <XMarkdown :content="content" :streaming="isStreaming" />
</template>
```

The preset leaves the tail cursor off because it is a visual choice for the app to make. Add `tail: true` in the object form if you want it.

## Object form

Use an object when you need to control individual options:

```vue
<template>
  <XMarkdown
    :content="content"
    :streaming="{
      hasNextChunk,
      enableAnimation: true,
      tail: true,
    }"
  />
</template>
```

`hasNextChunk` must reflect reality:

- `true` while more chunks are expected
- `false` for the final chunk so cached incomplete fragments flush into the final render

## Performance: incremental sections

`incremental` splits the document at top-level headings while streaming. Only the last, still-growing section is re-parsed, sanitized, and rendered per chunk; finished sections are reused as-is.

```vue
<XMarkdown
  :content="content"
  :streaming="{ hasNextChunk, incremental: true }"
/>
```

A boundary is placed only before a column-0 ATX heading and only when the renderer's own marked instance reads that line as a new top-level block. The splitter lexes the current section with the same `config` (extension plugins included), so it never splits inside fenced code, an HTML block, a list, a blockquote, or indented code. Raw blocks (`<pre>`, comments, `<?`, `<!`, `<![CDATA[`) and `$$` / `\[` math are held out until they close. Splitting is disabled when a link reference or footnote definition appears, or when a custom component tag spans the boundary.

A case where no boundary is placed is deliberate: refusing only gives up incremental reuse, while an over-eager boundary would change the rendered DOM.

## Incomplete syntax handling

Use `incompleteMarkdown` to choose how half-written syntax is shown:

- `placeholder` (default): hold it back, or show the placeholder component from `incompleteMarkdownComponentMap`
- `complete`: show half-written emphasis, inline code, link text, and list items as finished text right away; images, HTML, and tables still follow `placeholder`

```vue
<XMarkdown
  :content="content"
  :streaming="{
    hasNextChunk,
    incompleteMarkdown: 'complete',
  }"
/>
```

Use `incompleteMarkdownComponentMap` when unfinished fragments should show custom loading UI instead of broken Markdown. An explicit entry always wins over `incompleteMarkdown: 'complete'`.

```vue
<XMarkdown
  :content="content"
  :streaming="{
    hasNextChunk,
    incompleteMarkdownComponentMap: {
      link: 'link-loading',
      table: 'table-loading',
    },
  }"
  :components="{
    'link-loading': LinkSkeleton,
    'table-loading': TableSkeleton,
  }"
/>
```

## Typewriter

`typewriter` reveals newly arrived content at a steady pace that follows the chunk cadence instead of showing whole blocks at once. What is shown is always a prefix of `content`, and everything is revealed when `hasNextChunk` becomes `false`.

```vue
<XMarkdown
  :content="content"
  :streaming="{
    hasNextChunk,
    typewriter: {
      unit: 'sentence',
      minCps: 24,
      maxCps: 3000,
    },
  }"
/>
```

With `unit: 'char'`, `pauseMs` adds a pause after each delimiter. With `unit: 'sentence'`, `maxSentenceChars` holds back at most that many characters before falling back to character-by-character reveal, so long URLs and one-line JSON do not stay invisible.

When combining `typewriter` with fade-in animation, use `animationConfig: { splitBy: 'sentence' }`; otherwise every few characters revealed per frame becomes its own fade-in node.

## Loading vs Done

Custom components receive `streamStatus`:

- `loading`: syntax may still be incomplete
- `done`: final content is available

Use this to delay expensive parsing or API calls until the syntax is complete.

## Chat-Oriented Guidance

- Prefer `:streaming="isStreaming"` over hand-maintaining `hasNextChunk`.
- Use a tail indicator only while the assistant is still generating.
- Keep placeholder components lightweight.
- If a component depends on a closed block or fenced payload, wait for `streamStatus === 'done'`.
- For long answers, enable `incremental`; finished sections stop re-rendering entirely.

## Debugging Checklist

- Final chunk still looks incomplete: with the object form, confirm `hasNextChunk` becomes `false`.
- Placeholder never disappears: confirm the mapped tag name exists in `components`.
- Sections do not split: check whether the heading is indented, inside an open block, or whether the document contains a link reference / footnote definition — all are deliberate refusals.
- Performance looks unstable: enable `incremental`, disable animation and placeholder components first, then add them back selectively.
