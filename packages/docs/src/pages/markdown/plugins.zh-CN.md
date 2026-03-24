---
group:
  title: 插件集
  order: 6
title: 总览
order: 1
---

使用插件化方案可以让 `@antdv-next/x-markdown` 支持更多扩展能力，比如：公式、自定义语法、业务标签等。

## 插件扩展方式

### 1. 语法预处理（推荐）

在渲染前先将扩展语法转换为标准 Markdown 或自定义标签，再交给 `XMarkdown` 渲染。

```ts
const transformed = computed(() =>
  raw.value.replace(/:::note\n([\s\S]*?)\n:::/g, '<x-note text="$1"></x-note>'),
);
```

### 2. 组件映射

通过 `components` 将自定义标签映射成 Vue 组件，统一承接渲染逻辑。

```vue
<XMarkdown :content="content" :components="components" />
```

## 插件文档

- [公式（LaTeX）](/markdown/plugin-latex)
- [自定义插件](/markdown/custom-plugin)
