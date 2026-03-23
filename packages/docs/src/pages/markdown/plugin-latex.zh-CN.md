---
group:
  title: 插件集
  order: 6
title: 公式
order: 2
---

## 何时使用

当你需要在 Markdown 中展示数学公式或公式占位组件时使用。

## 代码演示

<demo src="./demo/latex-basic.vue">LaTeX 基础示例</demo>

## 建议实践

1. 在预处理阶段把公式语法（如 `$...$`、`$$...$$`）转成自定义标签。
2. 在 `components` 中映射为你的公式组件（KaTeX/MathJax 等）。
3. 流式场景下建议在 `streamStatus === 'done'` 后再做重计算，避免频繁重渲染。
