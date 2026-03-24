---
group:
  title: 插件集
  order: 6
title: 公式
order: 2
---

## 何时使用

Markdown 中需要渲染公式。

## 代码演示

<demo src="./demo/latex-basic.vue">LaTeX 基础示例</demo>

## API

| 属性              | 说明                                                                                                         | 类型                                             | 默认值                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ---------------------- |
| replaceAlignStart | 是否将公式中的 align* 替换为 aligned，[katex not support align*](https://github.com/KaTeX/KaTeX/issues/1007) | `boolean`                                        | `true`                 |
| katexOptions      | Katex 配置                                                                                                   | [`KatexOptions`](https://katex.org/docs/options) | `{ output: 'mathml' }` |
