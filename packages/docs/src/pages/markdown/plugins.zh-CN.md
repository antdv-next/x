---
group:
  title: 插件集
  order: 6
title: 总览
order: 1
---

`x-markdown` 当前版本没有独立发布内置插件包，但可以通过以下方式实现“插件化扩展”：

1. 通过 `components` 把标签映射到业务组件
2. 在传给 `XMarkdown` 前预处理 Markdown 文本
3. 结合 `streaming.incompleteMarkdownComponentMap` 做加载占位

## 扩展路径

- [公式（LaTeX）](./plugin-latex)
- [自定义插件流程](./custom-plugin)

## 推荐实践

- 扩展逻辑尽量做成纯函数，便于复用和测试。
- 预处理只做语法层转换，渲染逻辑放在组件中。
- 流式场景下优先保证可读性，再做复杂美化。
