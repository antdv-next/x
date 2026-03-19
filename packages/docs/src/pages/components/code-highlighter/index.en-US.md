---
title: CodeHighlighter
subtitle: Code Highlighter
description: Display code blocks in AI conversation scenarios with syntax highlighting, line numbers, theme switching, and copy functionality.
---

## When to Use

- Code returned by AI assistants
- Code examples in technical documentation
- Code snippets in chat messages

## Examples

<demo src="./demo/basic.vue">Basic Usage</demo>

<demo src="./demo/theme.vue">Theme Switching</demo>

<demo src="./demo/line-numbers.vue">Line Numbers</demo>

<demo src="./demo/copyable.vue">Copy Functionality</demo>

## API

### Props

| Property        | Description                         | Type                                                                                         | Default   |
| --------------- | ----------------------------------- | -------------------------------------------------------------------------------------------- | --------- |
| content         | Code content                        | `string`                                                                                     | -         |
| language        | Code language                       | `string`                                                                                     | `'text'`  |
| showLineNumbers | Whether to show line numbers        | `boolean`                                                                                    | `true`    |
| showLanguage    | Whether to show language label      | `boolean`                                                                                    | `true`    |
| showThemeToggle | Whether to show theme toggle button | `boolean`                                                                                    | `true`    |
| showCopyButton  | Whether to show copy button         | `boolean`                                                                                    | `true`    |
| theme           | Theme mode                          | `'light' \| 'dark'`                                                                          | `'light'` |
| startLineNumber | Starting line number                | `number`                                                                                     | `1`       |
| classes         | Custom class names                  | `Partial<Record<'root' \| 'header' \| 'headerTitle' \| 'code' \| 'content', string>>`        | -         |
| styles          | Custom styles                       | `Partial<Record<'root' \| 'header' \| 'headerTitle' \| 'code' \| 'content', CSSProperties>>` | -         |

### Events

| Event        | Description                  | Callback Parameters                  |
| ------------ | ---------------------------- | ------------------------------------ |
| copy         | Callback when code is copied | `(content: string) => void`          |
| update:theme | Emitted when theme changes   | `(theme: 'light' \| 'dark') => void` |

### Ref

| Property      | Description            | Type             |
| ------------- | ---------------------- | ---------------- |
| nativeElement | Get native DOM element | `HTMLDivElement` |

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>CodeHighlighter Semantic DOM</demo>

## Design Tokens

### Component Token

| Name           | Description      | Type     | Default                  |
| -------------- | ---------------- | -------- | ------------------------ |
| codeFontFamily | Code font family | `string` | `'Fira Code', monospace` |
| codeFontSize   | Code font size   | `number` | `13`                     |
