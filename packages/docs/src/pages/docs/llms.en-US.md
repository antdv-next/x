---
group:
  title: AI
  order: 1
order: 1
title: LLMs.txt
tag: New
---

This guide explains how to use Antdv Next X `LLMs.txt` documents in AI tools such as Cursor, Windsurf, Claude Code, and Gemini CLI, so the model can better understand components, Markdown rendering, SDK capabilities, and recommended usage patterns.

## What is LLMs.txt?

[LLMs.txt](https://llmstxt.org/) is a documentation entry format designed for large language models. It organizes site documentation into a structure that is easier for models to consume, helping AI tools find the right pages faster instead of crawling the whole site blindly.

For Antdv Next X, this usually brings a few direct benefits:

- Reduces the chance of AI generating non-existent APIs or incorrect prop names
- Improves the accuracy of component examples, Markdown rendering examples, and SDK usage examples
- Helps AI stay closer to the official capability boundaries when explaining code, writing docs, or generating pages

## Available Resources

Antdv Next X currently provides the following LLM-oriented documentation endpoints:

- [llms.txt](https://x.antdv-next.com/llms.txt): the main documentation index, recommended as the default entry point
- [llms-full.txt](https://x.antdv-next.com/llms-full.txt): full aggregated documentation in English, useful for larger context windows
- [llms-full-cn.txt](https://x.antdv-next.com/llms-full-cn.txt): full aggregated documentation in Chinese, useful for Chinese prompts and output
- [llms-semantic.md](https://x.antdv-next.com/llms-semantic.md): semantic English documentation
- [llms-semantic-cn.md](https://x.antdv-next.com/llms-semantic-cn.md): semantic Chinese documentation

In most cases, start with `llms.txt`. If your AI tool supports longer context or you want richer semantic detail, then move to `llms-full-*` or `llms-semantic*`.

## Good Use Cases

You can use Antdv Next X `LLMs.txt` in scenarios like these:

- Generating chat UIs built with `@antdv-next/x`
- Generating streaming Markdown pages built with `@antdv-next/x-markdown`
- Generating request flow, conversation state, and streaming interaction code built with `@antdv-next/x-sdk`
- Asking AI to verify recommended usage for a component, plugin, or SDK hook
- Giving your team a shared product-level context so AI output is more consistent

## How To Use It In AI Tools

### Cursor

In Cursor, you can add `LLMs.txt` through `@Docs`. After that, Cursor is more likely to reference the correct Antdv Next X documentation when generating or completing code.

[See Cursor @Docs documentation](https://docs.cursor.com/zh/context/@-symbols/@-docs)

### Windsurf

In Windsurf, you can reference external docs with `@`, or add `LLMs.txt` into rules and memory configuration so the model prioritizes Antdv Next X docs when generating UI or SDK code.

[See Windsurf Memories documentation](https://docs.windsurf.com/windsurf/cascade/memories)

### Claude Code

In Claude Code, you can add `LLMs.txt` or `llms-full.txt` to Docs / Context Files. This helps Claude Code reference official docs more reliably when explaining code, refactoring pages, or generating component examples.

[See Claude Code Docs configuration](https://code.claude.com/docs)

### Gemini CLI

In Gemini CLI, you can pass `LLMs.txt` through `--context` or configure it in project settings, so the model can reference Antdv Next X documentation while answering questions or generating code.

[See Gemini CLI documentation](https://ai.google.dev/gemini-api/docs)

### Other AI Tools With External Knowledge Support

If a tool supports:

- external documentation sources
- project knowledge bases
- context files
- URL-based doc references

it can usually work with the endpoints above directly.

## Recommended Setup

If you mainly work in English, a good default setup is:

```text
https://x.antdv-next.com/llms.txt
https://x.antdv-next.com/llms-full.txt
```

If you want the model to start with a lightweight index and only go deeper when needed, this order usually works best:

1. Start with `llms.txt`
2. Add `llms-full.txt` when you need fuller documentation
3. Try `llms-semantic.md` if your tool works better with semantic Markdown sources

## Usage Tips

- If AI generates invalid props, events, or slots, retry with `LLMs.txt` attached explicitly
- If you are working on SDK-related features, provide both the page requirement and `LLMs.txt`
- If you are generating demos or documentation examples, tell the model whether you are working in `components`, `markdown`, or `sdk`
- If you have internal product conventions, combining them with `LLMs.txt` usually gives more stable results

## A Simple Prompt Example

For example, you can prompt your AI tool like this:

```text
Please use https://x.antdv-next.com/llms.txt and build a chat page with a welcome section, message list, input box, and streaming Markdown replies using Antdv Next X.
```

If you need richer context, you can also add:

```text
Also reference https://x.antdv-next.com/llms-full.txt
```

This usually helps the model understand Antdv Next X capabilities and recommended combinations much more accurately.
