---
title: CodeHighlighter
subtitle: 代码高亮
description: 用于 AI 对话场景中展示代码块，提供语法高亮、行号显示、主题切换、代码复制等功能。
---

## 何时使用

- AI 助手返回的代码展示
- 技术文档中的代码示例
- 聊天消息中的代码片段

## 代码演示

<demo src="./demo/basic.vue">基本用法</demo>

<demo src="./demo/theme.vue">主题切换</demo>

<demo src="./demo/line-numbers.vue">行号控制</demo>

<demo src="./demo/copyable.vue">复制功能</demo>

## API

### 属性

| 属性            | 说明                 | 类型                                                                                         | 默认值    |
| --------------- | -------------------- | -------------------------------------------------------------------------------------------- | --------- |
| content         | 代码内容             | `string`                                                                                     | -         |
| language        | 代码语言类型         | `string`                                                                                     | `'text'`  |
| showLineNumbers | 是否显示行号         | `boolean`                                                                                    | `true`    |
| showLanguage    | 是否显示语言标识     | `boolean`                                                                                    | `true`    |
| showThemeToggle | 是否显示主题切换按钮 | `boolean`                                                                                    | `true`    |
| showCopyButton  | 是否显示复制按钮     | `boolean`                                                                                    | `true`    |
| theme           | 主题模式             | `'light' \| 'dark'`                                                                          | `'light'` |
| startLineNumber | 起始行号             | `number`                                                                                     | `1`       |
| classes         | 自定义类名           | `Partial<Record<'root' \| 'header' \| 'headerTitle' \| 'code' \| 'content', string>>`        | -         |
| styles          | 自定义样式           | `Partial<Record<'root' \| 'header' \| 'headerTitle' \| 'code' \| 'content', CSSProperties>>` | -         |

### 事件

| 事件         | 说明           | 回调参数                             |
| ------------ | -------------- | ------------------------------------ |
| copy         | 复制成功回调   | `(content: string) => void`          |
| update:theme | 主题切换时触发 | `(theme: 'light' \| 'dark') => void` |

### Ref

| 属性          | 说明              | 类型             |
| ------------- | ----------------- | ---------------- |
| nativeElement | 获取原生 DOM 元素 | `HTMLDivElement` |

## 语义化 DOM

<demo src="./demo/semantic.vue" simplify>CodeHighlighter 语义结构</demo>

## 设计令牌

### Component Token

| 名称           | 说明         | 类型     | 默认值                   |
| -------------- | ------------ | -------- | ------------------------ |
| codeFontFamily | 代码字体     | `string` | `'Fira Code', monospace` |
| codeFontSize   | 代码字体大小 | `number` | `13`                     |
