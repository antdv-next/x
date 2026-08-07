---
title: CodeHighlighter
subtitle: Code Highlighter
description: Display code blocks in AI conversation scenarios with syntax highlighting, line numbers, theme switching, and copy functionality.
---

## When to Use

- Code returned by AI assistants
- Code examples in technical documentation
- Code snippets in chat messages

## Language Support

The component ships with six built-in languages loaded on demand: `typescript` (`ts`), `javascript` (`js`), `python` (`py`), `json`, `html`, and `css`. Other languages safely fall back to plain text.

To support more languages, inject a custom loader via `setupCodeHighlighter` and `import` only the language modules you need (avoids pulling in the full language bundle). The custom loader resolves languages first; when it returns `null`, the component falls back to the default whitelist.

Because the custom loader imports Shiki language modules from application code, declare `shiki` as a direct application dependency:

<InstallDependencies npm='npm install shiki' yarn='yarn add shiki' pnpm='pnpm add shiki' bun='bun add shiki'></InstallDependencies>

Configure the loader before the first `CodeHighlighter` render, typically before `app.mount()`:

```ts
import { setupCodeHighlighter } from "@antdv-next/x";
import type { LanguageInput } from "shiki";

// Load extra languages on demand - only the ones you ship are bundled
setupCodeHighlighter({
  loadLanguage: async lang => {
    const loaders: Record<string, () => Promise<{ default: LanguageInput }>> = {
      go: () => import("shiki/dist/langs/go.mjs"),
      rust: () => import("shiki/dist/langs/rust.mjs"),
      java: () => import("shiki/dist/langs/java.mjs"),
    };
    const loader = loaders[lang];
    return loader ? (await loader()).default : null;
  },
});
```

## Examples

<demo src="./demo/basic.vue">Basic Usage</demo>

<demo src="./demo/lazy-language.vue">Lazy Language Loading</demo>

<demo src="./demo/theme.vue">Theme Switching</demo>

<demo src="./demo/line-numbers.vue">Line Numbers</demo>

<demo src="./demo/copyable.vue">Copy Functionality</demo>

<demo src="./demo/custom-header.vue">Custom Header</demo>

## API

### Props

| Property        | Description                                                                           | Type                                                                                         | Default   |
| --------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------- |
| content         | Code content                                                                          | `string`                                                                                     | -         |
| language        | Code language; loads the default whitelist or languages registered by the user loader | `string`                                                                                     | `'text'`  |
| showLineNumbers | Whether to show line numbers                                                          | `boolean`                                                                                    | `true`    |
| showLanguage    | Whether to show language label                                                        | `boolean`                                                                                    | `true`    |
| showThemeToggle | Whether to show theme toggle button                                                   | `boolean`                                                                                    | `false`   |
| showCopyButton  | Whether to show copy button                                                           | `boolean`                                                                                    | `true`    |
| theme           | Theme mode                                                                            | `'light' \| 'dark'`                                                                          | `'light'` |
| startLineNumber | Starting line number                                                                  | `number`                                                                                     | `1`       |
| classes         | Custom class names                                                                    | `Partial<Record<'root' \| 'header' \| 'headerTitle' \| 'code' \| 'content', string>>`        | -         |
| styles          | Custom styles                                                                         | `Partial<Record<'root' \| 'header' \| 'headerTitle' \| 'code' \| 'content', CSSProperties>>` | -         |

### Events

| Event        | Description                  | Callback Parameters                  |
| ------------ | ---------------------------- | ------------------------------------ |
| copy         | Callback when code is copied | `(content: string) => void`          |
| update:theme | Emitted when theme changes   | `(theme: 'light' \| 'dark') => void` |

### Slots

| Slot     | Description                                                        | Type                                     |
| -------- | ------------------------------------------------------------------ | ---------------------------------------- |
| `header` | Custom header area, exposing language, theme and copy capabilities | `(scope: HeaderSlotScope) => VNodeChild` |

`header` slot scope `HeaderSlotScope`:

| Parameter     | Description                 | Type                |
| ------------- | --------------------------- | ------------------- |
| `language`    | Current code language       | `string`            |
| `theme`       | Current theme mode          | `'light' \| 'dark'` |
| `copied`      | Whether in the copied state | `boolean`           |
| `copy`        | Copy the code content       | `() => void`        |
| `toggleTheme` | Toggle the theme mode       | `() => void`        |

When the `header` slot is provided, it fully replaces the default header (language label, theme toggle and copy button).

### Ref

| Property      | Description            | Type             |
| ------------- | ---------------------- | ---------------- |
| nativeElement | Get native DOM element | `HTMLDivElement` |

### Extending Languages

| Function             | Description                                                                    | Params                                                               |
| -------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| setupCodeHighlighter | Inject a custom language loader; falls back to the default whitelist on `null` | `{ loadLanguage: (lang: string) => Promise<LanguageInput \| null> }` |

`loadLanguage` receives the language name and returns a Shiki language registration or `null`. The component falls back to plain text when neither the user loader nor the default whitelist can resolve the language. Calling this function again replaces the previous user loader and allows previously failed languages to retry.

## Semantic DOM

<demo src="./demo/semantic.vue" simplify>CodeHighlighter Semantic DOM</demo>

## Design Tokens

### Component Token

| Name                    | Description                                             | Type     | Default                  |
| ----------------------- | ------------------------------------------------------- | -------- | ------------------------ |
| codeFontFamily          | Code font family                                        | `string` | `'Fira Code', monospace` |
| codeFontSize            | Code font size                                          | `number` | `14`                     |
| codeColor               | Code text color in light theme (unhighlighted fallback) | `string` | `#393a34`                |
| codeColorDark           | Code text color in dark theme (unhighlighted fallback)  | `string` | `#dbd7caee`              |
| codeBg                  | Background of the code area and gutter in light theme   | `string` | `#fafafa`                |
| codeBgDark              | Background of the code area and gutter in dark theme    | `string` | `#1e1e1e`                |
| codeHeaderBg            | Header background in light theme                        | `string` | `#f0f0f0`                |
| codeHeaderBgDark        | Header background in dark theme                         | `string` | `#252526`                |
| codeBorderColor         | Header and gutter divider color in light theme          | `string` | `#f0f0f0`                |
| codeBorderColorDark     | Header and gutter divider color in dark theme           | `string` | `#3e3e42`                |
| codeLangColor           | Language label color in light theme                     | `string` | `rgba(0, 0, 0, 0.65)`    |
| codeLangColorDark       | Language label color in dark theme                      | `string` | `#cccccc`                |
| codeLineNumberColor     | Line number color in light theme                        | `string` | `rgba(0, 0, 0, 0.25)`    |
| codeLineNumberColorDark | Line number color in dark theme                         | `string` | `#858585`                |
| codeBtnColor            | Header action button color in light theme               | `string` | `rgba(0, 0, 0, 0.65)`    |
| codeBtnColorDark        | Header action button color in dark theme                | `string` | `#ffffff`                |
| codeBtnHoverBg          | Header action button hover background in light theme    | `string` | `rgba(0, 0, 0, 0.06)`    |
| codeBtnHoverBgDark      | Header action button hover background in dark theme     | `string` | `#3e3e42`                |

## Design Token

<ComponentTokenTable component="CodeHighlighter"></ComponentTokenTable>

See [Customize Theme](https://www.antdv-next.com/docs/vue/customize-theme) to learn how to use Design Token.
